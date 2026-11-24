import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('your_openai_api_key'));

export const openaiClient = isConfigured
  ? new OpenAI({ apiKey: apiKey.trim() })
  : null;

export const OPENAI_CONFIG = {
  isConfigured,
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  fallbackModel: 'gpt-4o-mini',
};

/**
 * Sanitizes input text before dispatching to external LLMs.
 * Masks credit card numbers, token secrets, and sensitive credentials.
 */
export function sanitizeForAi(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Mask potential credit cards (13-19 digits)
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_PAYMENT_CARD]')
    // Mask API keys / tokens (sk-..., bearer, etc.)
    .replace(/(?:sk-[a-zA-Z0-9]{20,}|bearer\s+[a-zA-Z0-9_\-\.]{20,})/gi, '[REDACTED_API_SECRET]')
    // Mask passwords in query or text
    .replace(/(?:password|secret|passphrase)\s*[:=]\s*\S+/gi, 'password=[REDACTED]');
}
