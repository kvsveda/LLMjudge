const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '.env');
const envResult = dotenv.config({ path: envPath, override: true });
const fileEnv = envResult.parsed || {};

function getOpenRouterApiKey() {
  return (
    fileEnv.MY_OPENROUTER_API_KEY ||
    fileEnv.OPENROUTER_API_KEY ||
    process.env.MY_OPENROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    ''
  );
}

module.exports = {
  fileEnv,
  getOpenRouterApiKey,
};
