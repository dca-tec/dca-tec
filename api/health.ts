import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  return response.status(200).json({
    status: "ok",
    aiConfigured: !!process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV
  });
}
