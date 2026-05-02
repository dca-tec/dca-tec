import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Email Route
  app.post("/api/send-email", async (req, res) => {
    const { name, email, company, subject, message, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.umbler.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"DCA TEC" <${process.env.SMTP_USER}>`,
        to: source?.includes('Proposta') ? email : (process.env.EMAIL_TO || process.env.SMTP_USER),
        subject: subject || `Novo Lead: ${name} - ${source || 'Site'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid #00ffe0; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #00ffe0; margin-top: 0;">${source?.includes('Proposta') ? '📄 Proposta Comercial' : '🚀 Novo Lead Recebido'}</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            ${company ? `<p><strong>Empresa/CNPJ:</strong> ${company}</p>` : ''}
            <p><strong>Origem/Contexto:</strong> ${source || 'Site'}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Mensagem:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic; white-space: pre-wrap;">
              ${message || "Sem mensagem adicional."}
            </div>
            <p style="font-size: 11px; color: #aaa; margin-top: 25px; text-align: center;">
              Este e-mail foi gerado automaticamente pelo sistema DCA TEC.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "E-mail enviado!" });
    } catch (error: any) {
      console.error("Erro no SMTP:", error);
      res.status(500).json({ error: "Erro ao enviar e-mail.", details: error.message });
    }
  });

  // AI Proxy Route
  app.post("/api/optimize-proposal", async (req, res) => {
    try {
      const { companyName, valuation, terms } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
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
      
      console.log("DEBUG: Raw AI Response Length:", responseText?.length);
      
      if (!responseText || responseText.trim() === "") {
        console.error("AI Error: Empty response received");
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
        console.error("Failed to parse AI response. Raw start:", responseText.substring(0, 500));
        throw new Error("Erro de formatação na resposta da IA. Por favor, tente clicar em 'Otimizar' novamente.");
      }

      res.json(structuredData);
    } catch (error: any) {
      console.error("AI Server Error Detail:", error);
      res.status(500).json({ error: error.message || "Falha ao processar M&A com IA." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
