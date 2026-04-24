// ============================================================
//  controllers/analysisController.js
//  Core: sends prompt to 3 models simultaneously, then judges
// ============================================================
const axios = require('axios');
const { connectDb, History } = require('../config/database');

// ── Gemini client ─────────────────────────────────────────────
const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  timeout: 60000,
});

// ── OpenRouter client shared for non-Google models ─────────────
const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.YOUR_SITE_NAME || 'LLMJudge',
  },
  timeout: 60000,
});

async function callOpenAI(modelEnvName, prompt, systemPrompt, retryCount = 0) {
  const start = Date.now();
  const model = modelEnvName.startsWith('openai/') ? modelEnvName : `openai/${modelEnvName}`;
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await openRouterClient.post('/chat/completions', {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const latency = Date.now() - start;
    const content = response.data?.choices?.[0]?.message?.content || '';
    return { success: true, content, latency };
  } catch (err) {
    if (err.response?.status === 429 && retryCount < 3) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callOpenAI(modelEnvName, prompt, systemPrompt, retryCount + 1);
    }
    const latency = Date.now() - start;
    return { success: false, content: '', error: 'OpenRouter (OpenAI) Error: ' + err.message, latency };
  }
}

async function callAnthropic(modelEnvName, prompt, systemPrompt, retryCount = 0) {
  const start = Date.now();
  const model = modelEnvName.startsWith('anthropic/') ? modelEnvName : `anthropic/${modelEnvName}`;
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await openRouterClient.post('/chat/completions', {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const latency = Date.now() - start;
    const content = response.data?.choices?.[0]?.message?.content || '';
    return { success: true, content, latency };
  } catch (err) {
    if (err.response?.status === 429 && retryCount < 3) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callAnthropic(modelEnvName, prompt, systemPrompt, retryCount + 1);
    }
    const latency = Date.now() - start;
    return { success: false, content: '', error: 'OpenRouter (Anthropic) Error: ' + err.message, latency };
  }
}

async function callXAI(modelEnvName, prompt, systemPrompt, retryCount = 0) {
  const start = Date.now();
  const model = modelEnvName.startsWith('x-ai/') ? modelEnvName : `x-ai/${modelEnvName}`;
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await openRouterClient.post('/chat/completions', {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const latency = Date.now() - start;
    const content = response.data?.choices?.[0]?.message?.content || '';
    return { success: true, content, latency };
  } catch (err) {
    if (err.response?.status === 429 && retryCount < 3) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callXAI(modelEnvName, prompt, systemPrompt, retryCount + 1);
    }
    const latency = Date.now() - start;
    return { success: false, content: '', error: 'OpenRouter (xAI) Error: ' + err.message, latency };
  }
}

// ── Call Gemini via OpenRouter ───────────────────────────────────
async function callGoogleAPI(modelEnvName, prompt, systemPrompt, retryCount = 0) {
  const start = Date.now();
  let googleModel = 'google/gemini-3.1-flash-lite-preview'; // fallback
  if (modelEnvName.includes('gpt')) googleModel = 'google/gemini-2.5-pro';
  if (modelEnvName.includes('claude')) googleModel = 'google/gemini-2.0-flash';
  if (modelEnvName.includes('grok')) googleModel = 'google/gemini-2.5-flash';
  if (modelEnvName.includes('gemini')) googleModel = 'google/gemini-3.1-flash-lite-preview';

  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await openRouterClient.post('/chat/completions', {
      model: googleModel,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      reasoning: { effort: "minimal" },
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const latency = Date.now() - start;
    const content = response.data?.choices?.[0]?.message?.content || '';
    return { success: true, content, latency };
  } catch (err) {
    if (err.response?.status === 429 && retryCount < 3) {
      console.warn(`[429] Rate limit hit for ${googleModel}. Retrying in ${2000 * (retryCount + 1)}ms...`);
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callGoogleAPI(modelEnvName, prompt, systemPrompt, retryCount + 1);
    }
    const latency = Date.now() - start;
    return { success: false, content: '', error: 'API Error: ' + err.message, latency };
  }
}

// ── Build judge prompt ────────────────────────────────────────
function buildJudgePrompt(userPrompt, results, mapping) {
  const modelA = results[mapping.modelA];
  const modelB = results[mapping.modelB];
  const modelC = results[mapping.modelC];

  return `You are an expert AI evaluator. A user submitted the following prompt to three different AI models. Your job is to analyze and judge each response entirely impartially, without bias toward any model identities.

=== USER PROMPT ===
${userPrompt}

=== MODEL A RESPONSE (latency: ${modelA.latency}ms) ===
${modelA.content || '[No response / Error: ' + modelA.error + ']'}

=== MODEL B RESPONSE (latency: ${modelB.latency}ms) ===
${modelB.content || '[No response / Error: ' + modelB.error + ']'}

=== MODEL C RESPONSE (latency: ${modelC.latency}ms) ===
${modelC.content || '[No response / Error: ' + modelC.error + ']'}

=== YOUR EVALUATION TASK ===
Evaluate all three responses and return a structured JSON object (no markdown, no code fences — raw JSON only) with the following exact format:

{
  "scores": {
    "modelA": {
      "correctness": <0-10>,
      "clarity": <0-10>,
      "complexity_handling": <0-10>,
      "overall": <0-10>
    },
    "modelB": {
      "correctness": <0-10>,
      "clarity": <0-10>,
      "complexity_handling": <0-10>,
      "overall": <0-10>
    },
    "modelC": {
      "correctness": <0-10>,
      "clarity": <0-10>,
      "complexity_handling": <0-10>,
      "overall": <0-10>
    }
  },
  "latency": {
    "modelA": ${modelA.latency},
    "modelB": ${modelB.latency},
    "modelC": ${modelC.latency}
  },
  "winner": "<modelA|modelB|modelC>",
  "verdict": "<2-3 sentence explanation of which model performed best and why>",
  "individual_analysis": {
    "modelA": "<2-3 sentence analysis of Model A response strengths and weaknesses>",
    "modelB": "<2-3 sentence analysis of Model B response strengths and weaknesses>",
    "modelC": "<2-3 sentence analysis of Model C response strengths and weaknesses>"
  },
  "recommendation": "<One clear sentence on which model to use for this type of prompt>"
}`;
}

// ── Parse judge output safely ─────────────────────────────────
function parseJudgeOutput(raw, mapping) {
  const invMapping = {
    [mapping.modelA]: 'modelA',
    [mapping.modelB]: 'modelB',
    [mapping.modelC]: 'modelC'
  };

  try {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('No JSON object found in output');
    }
    const jsonStr = raw.substring(firstBrace, lastBrace + 1);

    // Some Llama models might output invalid escaping or unclosed strings, but standard JSON.parse handles most valid cases.
    const parsedData = JSON.parse(jsonStr);

    const getScore = (key) => parsedData.scores?.[invMapping[key]] || parsedData.scores?.[key] || { correctness: 0, clarity: 0, complexity_handling: 0, overall: 0 };
    const getLatency = (key) => parsedData.latency?.[invMapping[key]] || 0;
    const getIndividual = (key) => parsedData.individual_analysis?.[invMapping[key]] || parsedData.individual_analysis?.[key] || 'N/A';

    return {
      success: true,
      data: {
        winner: mapping[parsedData.winner] || parsedData.winner,
        verdict: parsedData.verdict,
        scores: {
          gpt: getScore('gpt'),
          gemini: getScore('gemini'),
          claude: getScore('claude')
        },
        latency: {
          gpt: getLatency('gpt'),
          gemini: getLatency('gemini'),
          claude: getLatency('claude')
        },
        individual_analysis: {
          gpt: getIndividual('gpt'),
          gemini: getIndividual('gemini'),
          claude: getIndividual('claude')
        },
        recommendation: parsedData.recommendation
      }
    };
  } catch (err) {
    // Fallback: return raw text as verdict, but populate nested objects to prevent UI crashes 
    return {
      success: false,
      data: {
        winner: 'unknown',
        verdict: raw,
        scores: {
          gpt: { correctness: 0, clarity: 0, complexity_handling: 0, overall: 0 },
          gemini: { correctness: 0, clarity: 0, complexity_handling: 0, overall: 0 },
          claude: { correctness: 0, clarity: 0, complexity_handling: 0, overall: 0 }
        },
        latency: { gpt: 0, gemini: 0, claude: 0 },
        individual_analysis: { gpt: 'N/A', gemini: 'N/A', claude: 'N/A' },
        recommendation: 'Could not parse structured output from judge. See raw output above.',
      },
    };
  }
}

// ── Main controller ───────────────────────────────────────────
exports.runAnalysis = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A prompt string is required.' });
  }
  if (prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Prompt is too short. Please enter at least 5 characters.' });
  }
  if (prompt.length > 4000) {
    return res.status(400).json({ error: 'Prompt is too long. Maximum 4000 characters.' });
  }

  console.log(`[Analysis] User: ${req.user.email} | Prompt: "${prompt.slice(0, 60)}..."`);

  // ── Step 1: Run 3 models simultaneously ──────────────────
  const [gptResult, geminiResult, claudeResult] = await Promise.all([
    callOpenAI(process.env.GPT_MODEL, prompt, 'You are ChatGPT, a large language model trained by OpenAI. Only identify as ChatGPT.'),
    callGoogleAPI(process.env.GEMINI_MODEL, prompt, 'You are Gemini, a large language model trained by Google. Only identify as Gemini.'),
    callAnthropic(process.env.CLAUDE_MODEL, prompt, 'You are Claude, a large language model trained by Anthropic. Only identify as Claude.'),
  ]);

  const modelResults = {
    gpt: gptResult,
    gemini: geminiResult,
    claude: claudeResult,
  };

  console.log(`[Analysis] Latencies — GPT: ${gptResult.latency}ms | Gemini: ${geminiResult.latency}ms | Claude: ${claudeResult.latency}ms`);

  // ── Step 2: Send to Llama judge ───────────────────────────
  // Shuffle model order to completely eliminate positional bias
  const keys = ['gpt', 'gemini', 'claude'];
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const mapping = {
    modelA: keys[0],
    modelB: keys[1],
    modelC: keys[2],
  };

  const judgePrompt = buildJudgePrompt(prompt, modelResults, mapping);
  const judgeResult = await callXAI(
    process.env.LLAMA_MODEL,
    judgePrompt,
    'You are a strict evaluator. Read carefully and output a JSON.'
  );

  let judgeData = null;
  if (judgeResult.success && judgeResult.content) {
    const parsed = parseJudgeOutput(judgeResult.content, mapping);
    judgeData = parsed.data;
  } else {
    judgeData = {
      winner: 'unknown',
      verdict: judgeResult.error || 'Judge model did not respond.',
      scores: {},
      latency: { gpt: gptResult.latency, gemini: geminiResult.latency, claude: claudeResult.latency },
      individual_analysis: {},
      recommendation: 'Judge unavailable.',
    };
  }

  // ── Save to history ───────────────────────────────────────
  try {
    await connectDb();
    await History.create({
      userId: req.user.id,
      prompt: prompt.trim(),
      modelsData: modelResults,
      judgeData: judgeData,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to save history:', err);
    // Continue anyway so we don't drop the response to user
  }

  // ── Step 3: Return full analysis ──────────────────────────
  res.json({
    prompt: prompt.trim(),
    timestamp: new Date().toISOString(),
    models: {
      gpt: {
        name: 'ChatGPT',
        modelId: process.env.GPT_MODEL,
        content: gptResult.content,
        latency: gptResult.latency,
        success: gptResult.success,
        error: gptResult.error || null,
      },
      gemini: {
        name: 'Gemini',
        modelId: process.env.GEMINI_MODEL || 'google/gemini-3.1-flash-lite-preview',
        content: geminiResult.content,
        latency: geminiResult.latency,
        success: geminiResult.success,
        error: geminiResult.error || null,
      },
      claude: {
        name: 'Claude',
        modelId: process.env.CLAUDE_MODEL,
        content: claudeResult.content,
        latency: claudeResult.latency,
        success: claudeResult.success,
        error: claudeResult.error || null,
      },
    },
    judge: {
      name: 'AI Judge',
      modelId: process.env.LLAMA_MODEL,
      latency: judgeResult.latency,
      ...judgeData,
    },
  });
};

// ── Fetch history ─────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    await connectDb();
    const history = await History.find({ userId: req.user.id })
      .sort({ _id: -1 })
      .lean();

    const formattedHistory = history.map(item => ({
      id: item._id.toString(),
      userId: item.userId,
      prompt: item.prompt,
      modelsData: item.modelsData,
      judgeData: item.judgeData,
      createdAt: item.createdAt,
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};
