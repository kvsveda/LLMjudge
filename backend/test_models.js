require('./config/loadEnv');
const axios = require('axios');

async function test() {
  // openrouter
  try {
     const res = await axios.get('https://openrouter.ai/api/v1/models');
     const r = res.data.data;
     console.log("Haiku models:", r.filter(m => m.id.toLowerCase().includes('haiku')).map(m => m.id));
     console.log("Gemini models:", r.filter(m => m.id.toLowerCase().includes('gemini')).map(m => m.id).slice(0, 20));
     console.log("Llama models:", r.filter(m => m.id.toLowerCase().includes('llama-3.1-8b') || m.id.toLowerCase().includes('llama-3-8b')).map(m => m.id));
  } catch (e) { console.error("OR error", e.message); }
}
test();
