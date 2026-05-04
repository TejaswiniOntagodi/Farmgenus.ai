const express = require('express');
const router  = express.Router();

// Fallback farming knowledge (works WITHOUT internet/API)
const kb = {
  tomato:     'Tomato tips: Plant in well-drained loamy soil (pH 6-7). Water 2-3x/week. Use NPK 10-10-10. Watch for early blight.',
  rice:       'Rice guide: Maintain 5cm water level. Apply Urea in 3 splits. Best temp 20-35°C.',
  wheat:      'Wheat guide: Sow Oct-Nov. Ideal temp 15-20°C. Apply DAP at sowing + Urea top dressing.',
  fertilizer: 'Fertilizer guide: Urea (46-0-0) for growth, DAP (18-46-0) for roots, MOP for fruit quality.',
  pest:       'Pest control: Use Neem oil spray weekly. Yellow sticky traps for whiteflies. Spray early morning.',
  water:      'Watering tips: Water early morning. Check soil 2 inches deep. Drip irrigation saves 50% water.',
  soil:       'Soil health: Test pH annually (ideal 6-7). Add compost every season. Crop rotation prevents depletion.',
  scheme:     'Govt schemes: PM-KISAN (₹6000/yr), Kisan Credit Card, Fasal Bima Yojana, Soil Health Card.',
  default:    'Good question! Test soil before planting. Use certified seeds. Monitor weather. Contact local Kisan Sewa Kendra for expert advice.'
};

function getFallbackResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('tomato'))                          return kb.tomato;
  if (m.includes('rice') || m.includes('paddy'))    return kb.rice;
  if (m.includes('wheat'))                           return kb.wheat;
  if (m.includes('fertilizer') || m.includes('urea')) return kb.fertilizer;
  if (m.includes('pest') || m.includes('insect'))   return kb.pest;
  if (m.includes('water') || m.includes('irrigat')) return kb.water;
  if (m.includes('soil'))                            return kb.soil;
  if (m.includes('scheme') || m.includes('government')) return kb.scheme;
  return kb.default;
}

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const session = sessionId || Math.random().toString(36).substring(2) + Date.now();
    let reply     = '';
    let source    = 'local'; // 'gemini' or 'local'

    // ── Try Gemini AI first ──
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are FarmGenius AI, an expert agricultural assistant for Indian farmers.
Answer the following farming question in simple, practical language.
Keep the answer under 150 words. Use bullet points if listing steps.
Focus on Indian farming conditions, crops, and government schemes.
If the question is not about farming, politely redirect to farming topics.

Farmer's question: ${message}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
            })
          }
        );

        const geminiData = await geminiRes.json();

        if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply  = geminiData.candidates[0].content.parts[0].text;
          source = 'gemini';
        } else {
          reply = getFallbackResponse(message);
        }

      } catch (geminiError) {
        console.log('Gemini error, using fallback:', geminiError.message);
        reply = getFallbackResponse(message);
      }
    } else {
      // No API key — use local knowledge base
      reply = getFallbackResponse(message);
    }

    res.json({
      success: true,
      sessionId: session,
      reply,
      source // tells frontend if it came from AI or local
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', async (req, res) => {
  res.json({ success: true, messages: [] });
});

module.exports = router;