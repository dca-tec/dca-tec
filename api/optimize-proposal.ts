import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { companyName, valuation, terms } = request.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return response.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
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
      throw new Error("O servidor de IA retornou uma resposta vazia. Tente novamente.");
    }

    // Pre-process: sometimes AI adds markdown even when forbidden
    let cleanJson = responseText.trim();
    if (cleanJson.includes("```")) {
      cleanJson = cleanJson.replace(/```json\n?|\n?```/g, "").trim();
    }

    // Try to parse 
    let structuredData;
    try {
      structuredData = JSON.parse(cleanJson);
    } catch (e) {
      throw new Error("Erro de formatação na resposta da IA. Por favor, tente clicar em 'Otimizar' novamente.");
    }

    return response.status(200).json(structuredData);
  } catch (error: any) {
    console.error("AI Server Error Detail:", error);
    return response.status(500).json({ error: error.message || "Falha ao processar M&A com IA." });
  }
}
