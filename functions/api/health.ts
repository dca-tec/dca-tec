export const onRequest: PagesFunction = async (context) => {
  return new Response(JSON.stringify({
    status: "ok",
    aiConfigured: !!context.env.GEMINI_API_KEY,
    environment: context.env.NODE_ENV || 'production'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
