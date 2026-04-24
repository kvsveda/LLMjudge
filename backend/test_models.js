require('dotenv').config();
const axios = require('axios');

async function test() {
  // openrouter
  try {
     const res = await axios.get('https://openrouter.ai/api/v1/models');
     const r = res.data.data;
     console.log("Haiku models:", r.filter(m => m.id.toLowerCase().includes('haiku')).map(m => m.id));
     console.log("Llama models:", r.filter(m => m.id.toLowerCase().includes('llama-3.1-8b') || m.id.toLowerCase().includes('llama-3-8b')).map(m => m.id));
  } catch (e) { console.error("OR error", e.message); }

  // gemini
  try {
     const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
     console.log("Gemini models:", res.data.models.filter(m => m.name.includes('flash')).map(m => m.name));
  } catch (e) { console.error("Gemini error", e.response?.data || e.message); }
}
test();
