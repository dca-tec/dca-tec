import { GoogleGenerativeAI } from "@google/generative-ai";

export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  try {
    const request = context.request;
    const { companyName, valuation, terms } = await request.json() as any;
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured on the server." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      }
    });

    const prompt = `
      Analise os dados de M&A abaixo e retorne um objeto JSON puro (sem markdown) estruturado para um portal de investidor.
      
      DADOS DE ENTRADA:
      Empresa: ${companyName || 'Empresa não informada'}
      Valuation: ${valuation || 'Não informado'}
      Termos brutos: ${terms || 'Não informado'}

      ESTRUTURA DO JSON DESEJADA:
      {
        "valuationSummary": "Resumo conciso do valor",
        "installments": "Descrição clara do fluxo de pagamento/termos",
        "niche": "Nicho da empresa (ex: Varejo, Tecnologia, Engenharia)",
        "sections": [
          {
            "title": "Título estratégico",
            "content": "Parágrafo explicativo focado em valor e sinergia",
            "items": ["Ponto positivo 1", "Ponto positivo 2", "Ponto positivo 3"],
            "icon": "Um destes: ShieldCheck, Activity, Zap, TrendingUp, Target, Users, DollarSign, FileText, Search"
          }
        ]
      }

      REGRAS:
      1. Retorne APENAS o JSON.
      2. Mínimo de 3 seções no array.
      3. Foco em linguagem executiva e estratégica.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    if (!responseText || responseText.trim() === "") {
      throw new Error("O servidor de IA retornou uma resposta vazia.");
    }

    let cleanJson = responseText.trim();
    if (cleanJson.includes("```")) {
      cleanJson = cleanJson.replace(/```json\n?|\n?```/g, "").trim();
    }

    // Validação básica de JSON antes de retornar
    JSON.parse(cleanJson);

    return new Response(cleanJson, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Falha ao processar M&A com IA." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
