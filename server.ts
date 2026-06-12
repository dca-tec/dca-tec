import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
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

      const isClientTarget = source?.includes('Proposta') || source?.includes('Agendamento') || source?.includes('Triagem') || source?.includes('Reunião');
      const recipientList: string[] = [];

      if (process.env.EMAIL_TO) {
        recipientList.push(process.env.EMAIL_TO);
      }

      if (isClientTarget && email && email !== "nao_informado@dca.com" && email.includes('@')) {
        recipientList.push(email);
      }

      if (recipientList.length === 0 && process.env.SMTP_USER) {
        recipientList.push(process.env.SMTP_USER);
      }

      const toField = recipientList.join(', ');

      const mailOptions = {
        from: `"DCA TEC" <${process.env.SMTP_USER}>`,
        to: toField,
        subject: subject || `Novo Lead: ${name} - ${source || 'Site'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid #00ffe0; border-radius: 12px; max-width: 600px;">
            <h2 style="color: #00ffe0; margin-top: 0;">${isClientTarget ? '📅 Confirmação / Proposta' : '🚀 Novo Lead Recebido'}</h2>
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

  // AI Proxy Route - Triage and Reception Agent
  app.post("/api/triage-agent", async (req, res) => {
    const { messages, currentCollectedData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Função interna para o Fallback Determinístico Inteligente (Usado se não houver chave ou se a chamada da API do Gemini falhar)
    const runFallbackAgent = () => {
      const lastUserMsg = (messages[messages.length - 1]?.content || "").trim();
      let updatedData = {
        name: currentCollectedData?.name || null,
        contact: currentCollectedData?.contact || null,
        location: currentCollectedData?.location || null,
        summary: currentCollectedData?.summary || null,
        department: currentCollectedData?.department || null
      };
      
      let nextResponse = "";
      let scheduleFlag = false;

      // 1. Coleta e classificação da dor / necessidade
      if (!updatedData.summary) {
        updatedData.summary = lastUserMsg;
        
        // Identificar Departamento com base no conteúdo
        const contentLower = lastUserMsg.toLowerCase();
        let dep = "Outros";
        if (contentLower.includes("tribut") || contentLower.includes("imposto") || contentLower.includes("fiscal") || contentLower.includes("bi") || contentLower.includes("lucro")) {
          dep = "Consultoria Tributária";
        } else if (contentLower.includes("franquia") || contentLower.includes("expans") || contentLower.includes("negocio") || contentLower.includes("venda") || contentLower.includes("m&a")) {
          dep = "Expansão de Negócios";
        } else if (contentLower.includes("tecnolog") || contentLower.includes("sistem") || contentLower.includes("automat") || contentLower.includes("software") || contentLower.includes("computador") || contentLower.includes("site")) {
          dep = "Tecnologia/Automação";
        }
        updatedData.department = dep;

        nextResponse = `Compreendi perfeitamente sua necessidade relacionada a ${dep}. Para que eu possa direcionar você ao especialista ideal, com quem tenho o prazer de falar?`;
      } 
      // 2. Coleta de Nome
      else if (!updatedData.name) {
        updatedData.name = lastUserMsg;
        nextResponse = `${updatedData.name}, para gerarmos o seu protocolo de atendimento e verificar a disponibilidade do consultor da sua região, qual é a sua cidade e o seu melhor telefone ou e-mail?`;
      } 
      // 3. Coleta de Contato e Localidade
      else if (!updatedData.contact || !updatedData.location) {
        // Tenta separar se ele enviou ambos (ex: "São Paulo, 11999999999")
        if (lastUserMsg.includes(",") || lastUserMsg.includes("-") || lastUserMsg.includes("/")) {
          const parts = lastUserMsg.split(/[,\-\/]/);
          updatedData.location = parts[0].trim();
          updatedData.contact = parts[1].trim();
        } else {
          // Se for e-mail ou número de telefone, preenche o contato
          if (lastUserMsg.includes("@") || lastUserMsg.match(/\d{8,}/)) {
            updatedData.contact = lastUserMsg;
          } else {
            updatedData.location = lastUserMsg;
          }
        }

        // Se faltar um deles, pergunta especificamente
        if (!updatedData.location) {
          nextResponse = `Excelente, registrei seu contato. Qual é a sua cidade e estado para localizarmos o especialista ideal?`;
        } else if (!updatedData.contact || updatedData.contact === "A coletar") {
          nextResponse = `Entendido, você está em ${updatedData.location}. Qual é o seu e-mail ou telefone WhatsApp para contato direto?`;
        } else {
          scheduleFlag = true;
          nextResponse = `Perfeito, ${updatedData.name}. Vou agendar agora mesmo uma conversa rápida com o nosso especialista em ${updatedData.department || "sua área de interesse"}. Um momento enquanto consulto a agenda...`;
        }
      } 
      // 4. Fluxo final de Agendamento
      else {
        scheduleFlag = true;
        nextResponse = `Perfeito, ${updatedData.name}. Vou agendar agora mesmo uma conversa rápida com o nosso especialista responsável. Um momento enquanto consulto a agenda...`;
      }

      return {
        response: nextResponse,
        collectedData: updatedData,
        shouldSchedule: scheduleFlag
      };
    };

    // Caso não tenha a chave de API cadastrada, executa o assistente nativo de forma responsiva e transparente
    if (!apiKey) {
      console.warn("[TRIAGE] GEMINI_API_KEY não configurada. Executando assistente nativo Premium.");
      return res.json(runFallbackAgent());
    }

    try {
      // Utilizando o SDK GoogleGenerativeAI clássico e gemini-1.5-flash para máxima estabilidade e compatibilidade
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        },
        systemInstruction: `
Você é o Agente de Triagem e Recepção do Grupo DCA TEC.
Seu objetivo exclusivo é realizar o primeiro atendimento de leads de forma ágil, educada e altamente profissional, qualificando a necessidade do cliente, coletando dados básicos e preparando o terreno para o agendamento de uma reunião com os nossos especialistas (Closers).

Você NÃO deve tentar vender, dar consultoria técnica ou resolver o problema do cliente. Sua função é rotear o atendimento com precisão e fluidez. O tom de voz deve refletir um padrão premium: seja direto, sofisticado, prestativo e utilize uma linguagem clara e de alto nível.

DIRETRIZES DE ATENDIMENTO:
1. Acolhimento: Cumprimente o usuário e pergunte como pode ajudar hoje.
2. Coleta Natural: Colete as informações necessárias em formato de conversa, uma de cada vez, sem parecer um formulário robótico.
3. Foco na Triagem: Identifique qual é a "dor" do cliente para direcioná-lo ao departamento correto (ex: Consultoria Tributária, Expansão de Negócios, Tecnologia/Automação).
4. Transição: Assim que coletar os dados básicos (Nome completo, Telefone/E-mail, Localidade, Necessidade), avise que um especialista no assunto assumirá o caso e inicie o protocolo de agendamento (marcando shouldSchedule como true).

DADOS OBRIGATÓRIOS A COLETAR:
Antes de propor o agendamento, você DEVE tentar extrair (ou manter se já fornecido) cada um destes campos:
- Nome completo (name)
- Telefone (WhatsApp) ou E-mail (contact)
- Localidade (Cidade/Estado) (location)
- Resumo da Necessidade (para definir o Departamento) (summary)

No objeto collectedData, você DEVE retornar o acumulado dos dados extraídos até o momento (mesclando os recebidos com os novos extraídos nesta mensagem do Usuário). Se um dado ainda não tiver sido dito, retorne-o como null ou "".

FLUXO DA CONVERSA:
Passo 1: "Olá! Sou o assistente virtual do Grupo DCA TEC. Como posso ajudar a otimizar os seus negócios hoje?"
Passo 2: Após o usuário explicar a necessidade, valide o entendimento e peça o nome: "Compreendi. Para que eu direcione você ao especialista ideal em [Departamento Identificado], com quem tenho o prazer de falar?"
Passo 3: Peça o contato e a localidade de forma justificada: "[Nome], para gerarmos o seu protocolo de atendimento e verificar a disponibilidade do consultor da sua região, qual é a sua cidade e o seu melhor telefone ou e-mail?"
Passo 4: Confirmação e Gatilho: "Perfeito, [Nome]. Vou agendar agora mesmo uma conversa rápida com o nosso especialista responsável. Um momento enquanto consulto a agenda..." -> Se os dados estiverem disponíveis, envie essa resposta de transição e defina shouldSchedule como true.

REGRAS ESTRITAS:
- NUNCA invente informações sobre os serviços da DCA TEC.
- Se o usuário fizer perguntas complexas, responda: "Essa é uma excelente pergunta que o nosso especialista em [Área] poderá responder com precisão técnica durante o atendimento."
- Mantenha respostas curtas e objetivas (máximo de 3 linhas por interação).
- Assim que o agendamento for acionado, encerre a sua participação cordial.
- Use obrigatoriamente RESPOSTA no formato JSON contendo estes exatos campos:
{
  "response": "texto da resposta do agente (curta, direta, elegante, até 3 linhas)",
  "collectedData": {
    "name": "Nome extraído ou atualizado (ex: João Silva)",
    "contact": "E-mail ou Telefone extraído (ex: 11999999999 ou joao@ex.com)",
    "location": "Cidade e Estado extraídos (ex: São Paulo - SP)",
    "summary": "Resumo da necessidade/dor extraído (ex: Otimização tributária nas exportações)",
    "department": "Departamento identificado: 'Consultoria Tributária', 'Expansão de Negócios', 'Tecnologia/Automação' ou 'Outros'"
  },
  "shouldSchedule": true ou false
}
`
      });

      // Formatar histórico para o Gemini
      const historyText = messages
        .map((m: any) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`)
        .join("\n");

      const prompt = `
Histórico da Conversa:
${historyText}

Dados Coletados no Momento:
${JSON.stringify(currentCollectedData || {})}

Gere a resposta adequada no formato JSON estruturado seguindo as diretrizes e regras estritas do papel.
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let cleanJson = responseText ? responseText.trim() : "";
      if (cleanJson.includes("```")) {
        cleanJson = cleanJson.replace(/```json\n?|\n?```/g, "").trim();
      }

      let structuredData;
      try {
        structuredData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn("Parse JSON falhou, tentando regex fallback. RAW:", cleanJson);
        const nameMatch = cleanJson.match(/"name":\s*"([^"]*)"/);
        const contactMatch = cleanJson.match(/"contact":\s*"([^"]*)"/);
        const locationMatch = cleanJson.match(/"location":\s*"([^"]*)"/);
        const summaryMatch = cleanJson.match(/"summary":\s*"([^"]*)"/);
        const depMatch = cleanJson.match(/"department":\s*"([^"]*)"/);
        const respMatch = cleanJson.match(/"response":\s*"([^"]*)"/);

        structuredData = {
          response: respMatch ? respMatch[1] : `Compreendo perfeitamente o seu interesse. Para que eu registre sua solicitação, poderia me informar seu nome completo?`,
          collectedData: {
            name: nameMatch ? nameMatch[1] : currentCollectedData?.name || null,
            contact: contactMatch ? contactMatch[1] : currentCollectedData?.contact || null,
            location: locationMatch ? locationMatch[1] : currentCollectedData?.location || null,
            summary: summaryMatch ? summaryMatch[1] : currentCollectedData?.summary || null,
            department: depMatch ? depMatch[1] : currentCollectedData?.department || null,
          }  ,
          shouldSchedule: cleanJson.includes('"shouldSchedule": true')
        };
      }

      res.json(structuredData);
    } catch (err: any) {
      console.error("Triage Route Error - falling back to native:", err);
      res.json(runFallbackAgent());
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
