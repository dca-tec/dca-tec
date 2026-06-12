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
      const contentLower = lastUserMsg.toLowerCase();

      let updatedData = {
        name: currentCollectedData?.name || null,
        contact: currentCollectedData?.contact || null,
        location: currentCollectedData?.location || null,
        summary: currentCollectedData?.summary || null,
        department: currentCollectedData?.department || null
      };

      // Definir saudações comuns e termos genéricos para filtragem robusta de nome em todas as etapas
      const splitWords = lastUserMsg.split(/\s+/);
      const isGreetingOrGeneric = splitWords.some(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-zÀ-ÖØ-öø-ÿ]/g, '');
        return ["oi", "ola", "olá", "hey", "heyy", "bom", "dia", "tarde", "noite", "tudo", "bem", "opa", "hello", "hi", "teste", "test", "sim", "nao", "não", "quero", "gostaria", "ajuda", "agendar", "marcar", "reunião", "reuniao", "info", "informação", "informacao", "dca", "dca tec"].includes(cleanWord);
      });

      // --- EXTRAÇÃO INTELIGENTE MULTI-FATOR ---
      
      // 1. Extração de Email
      const emailMatch = lastUserMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        const foundEmail = emailMatch[0].trim();
        if (!updatedData.contact) {
          updatedData.contact = foundEmail;
        } else if (!updatedData.contact.includes(foundEmail)) {
          updatedData.contact = `${updatedData.contact} / ${foundEmail}`;
        }
      }

      // 2. Extração de Telefone
      const phoneCandidates = lastUserMsg.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-.\s]?\d{4}/g);
      if (phoneCandidates) {
        const validPhones = phoneCandidates.filter(p => p.replace(/\D/g, '').length >= 8);
        if (validPhones.length > 0) {
          const foundPhone = validPhones[0].trim();
          if (!updatedData.contact) {
            updatedData.contact = foundPhone;
          } else if (!updatedData.contact.includes(foundPhone)) {
            updatedData.contact = `${foundPhone} / ${updatedData.contact}`;
          }
        }
      }

      // 3. Extração de Nome
      let matchedName = "";
      // Patterns robustos para identificar o nome
      const namePatterns = [
        /meu nome [ée]\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i,
        /me chamo\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i,
        /\bsou\s+o\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i,
        /\bsou\s+a\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i,
        /\bsou\s+(?!de\b|do\b|da\b|um\b|uma\b|novo\b|nova\b|cliente\b|programador\b|desenvolvedor\b)([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i
      ];

      for (const pattern of namePatterns) {
        const match = lastUserMsg.match(pattern);
        if (match && match[1]) {
          const rawCandidate = match[1].split(/(\ssou\s|\sde\s|\sem\s|\scom\s|\se\s|\sgostaria\s|\semail\s|\scontato\s|\smarcar\s|\sagendar\s|,|\.)/i)[0].trim();
          const cleanMatched = rawCandidate.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '').trim();
          // Certificar se a palavra em si não é uma saudação pura
          const isSingleGreeting = ["oi", "ola", "olá", "hey", "heyy", "bom", "dia", "tarde", "noite", "tudo", "bem", "opa", "hello", "hi", "teste", "test"].includes(cleanMatched.toLowerCase());
          if (cleanMatched.length > 2 && !isSingleGreeting) {
            matchedName = cleanMatched;
            break;
          }
        }
      }

      if (matchedName) {
        updatedData.name = matchedName.replace(/\b\w/g, c => c.toUpperCase());
      }

      // 4. Extração de Localidade (Cidade/Estado)
      let matchedLocation = "";
      const locMatch = lastUserMsg.match(/sou de\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,-]+)/i) ||
                       lastUserMsg.match(/estou em\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,-]+)/i) ||
                       lastUserMsg.match(/moro em\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,-]+)/i) ||
                       lastUserMsg.match(/falo de\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,-]+)/i) ||
                       lastUserMsg.match(/falando de\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,-]+)/i);
      if (locMatch && locMatch[1]) {
        matchedLocation = locMatch[1].split(/(\sgostaria\s|\se\s|\semail\s|\scontato\s|\smeu\s|e-mail|,|\.)/i)[0].trim();
        if (matchedLocation.length > 1) {
          updatedData.location = matchedLocation.replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      // Adicional: se a mensagem conter termos de cidades chave diretamente e não identificamos localidade
      if (!updatedData.location) {
        const floripaMatch = lastUserMsg.match(/florianopolis|floripa|sao paulo|são paulo|rio de janeiro|curitiba|porto alegre|belo horizonte/i);
        if (floripaMatch) {
          updatedData.location = floripaMatch[0].replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      // 5. Extração de Necessidade e Classificação de Departamento
      let dep = updatedData.department || "Outros";
      let summaryText = updatedData.summary;

      if (contentLower.includes("tribut") || contentLower.includes("imposto") || contentLower.includes("fiscal") || contentLower.includes("bi") || contentLower.includes("lucro") || contentLower.includes("recupera")) {
        dep = "Consultoria Tributária";
        summaryText = "Recuperação fiscal e tributária";
      } else if (contentLower.includes("franquia") || contentLower.includes("expans") || contentLower.includes("negoc") || contentLower.includes("venda") || contentLower.includes("m&a") || contentLower.includes("invest")) {
        dep = "Expansão de Negócios";
        summaryText = "Expansão comercial, M&A ou franquias";
      } else if (contentLower.includes("tecnolog") || contentLower.includes("sistem") || contentLower.includes("automat") || contentLower.includes("software") || contentLower.includes("computador") || contentLower.includes("site") || contentLower.includes("app")) {
        dep = "Tecnologia/Automação";
        summaryText = "Desenvolvimento de software e automação tecnológica";
      }

      if (!updatedData.summary) {
        updatedData.summary = summaryText || (lastUserMsg.length > 100 ? lastUserMsg.substring(0, 97) + "..." : lastUserMsg);
      }
      updatedData.department = dep;

      // Se ainda não identificamos o nome, mas o usuário mandou um texto curto de introdução
      if (!updatedData.name && splitWords.length <= 2) {
        const cleanMsg = lastUserMsg.trim().replace(/[^\w\sÀ-ÖØ-öø-ÿ]/g, '');
        const tempSplit = cleanMsg.split(/\s+/);
        // filtrar palavras que são saudações ou jargões comuns
        const filtered = tempSplit.filter(word => {
          const wLower = word.toLowerCase();
          return wLower.length > 2 && !["oi", "ola", "olá", "hey", "heyy", "bom", "dia", "tarde", "noite", "tudo", "bem", "opa", "hello", "hi", "teste", "test", "sim", "nao", "não", "quero", "gostaria", "ajuda", "agendar", "marcar", "reunião", "reuniao", "info", "informação", "informacao", "dca", "dca tec"].includes(wLower);
        });
        if (filtered.length === 1 && !emailMatch && !phoneCandidates) {
          updatedData.name = filtered[0].replace(/\b\w/g, c => c.toUpperCase());
        }
      }

      // --- DETERMINAÇÃO DO PRÓXIMO PASSO DE FORMA HUMANIZADA ---
      
      let nextResponse = "";
      let scheduleFlag = false;

      if (!updatedData.name) {
        const hasSpecificNeed = !["outros"].includes(dep.toLowerCase()) || (lastUserMsg.length > 15 && !isGreetingOrGeneric);
        if (hasSpecificNeed) {
          nextResponse = `Compreendi sua necessidade sobre ${updatedData.department}. Para que eu possa direcionar você ao especialista ideal do Grupo DCA TEC, com quem tenho o prazer de falar?`;
        } else {
          nextResponse = `Olá! Seja muito bem-vindo ao Grupo DCA TEC. Para darmos início ao direcionamento especializado, como se chama e como posso ajudar a sua empresa hoje?`;
        }
      } else if (!updatedData.contact) {
        nextResponse = `Muito prazer, ${updatedData.name}! Para agendarmos sua reunião técnica e enviar as confirmações por WhatsApp e e-mail, qual é o seu melhor e-mail ou telefone para contato direto?`;
      } else if (!updatedData.location) {
        nextResponse = `Certo, ${updatedData.name}! Registrei seu contato (${updatedData.contact}). De qual cidade e estado você fala para localizarmos o especialista ideal de sua região?`;
      } else {
        scheduleFlag = true;
        nextResponse = `Excelente, ${updatedData.name}! Registrei todos os seus dados com êxito:\n📍 Localidade: ${updatedData.location}\n📞 Contato: ${updatedData.contact}\n💼 Área: ${updatedData.department}\n\nVou abrir o calendário para pré-agendarmos a sua reunião estratégica agora mesmo. Por favor, selecione abaixo a data e horário da sua preferência:`;
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
Você é o Agente de Triagem e Recepção Inteligente do Grupo DCA TEC.
Seu objetivo é realizar o acolhimento de novos leads com extrema naturalidade, fluidez e profissionalismo supremo, qualificando a necessidade deles, coletando dados básicos e preparando o terreno para o agendamento de uma reunião técnica com nossos especialistas.

Você deve agir de forma realista e dialógica, não como um robô com respostas pré-programadas:
1. ATENDIMENTO HUMANIZADO, NATURAL E RESPONSIVO:
   - NUNCA use respostas prontas, repetitivas ou cumprimentos genéricos se o usuário já se apresentou. Por exemplo, se o usuário disser "oi sou diego, gostaria de agendar uma reunião", você deve responder de forma personalizada e direta (ex: "Muito prazer, Diego! Excelente iniciativa. Vou te direcionar ao nosso especialista certo...") ao invés de reenviar uma saudação genérica perguntando "com quem falo?".
   - Leia atentamente todo o histórico da conversa e as mensagens anteriores para manter o fio condutor e garantir uma interação orgânica e inteligente.

2. ESCLARECIMENTO DE DÚVIDAS SIMPLES SOBRE O GRUPO:
   - Se o usuário tiver dúvidas ou fizer perguntas simples sobre o Grupo DCA TEC (como "o que vocês fazem?", "quem é a DCA?", "vocês fazem sistemas?", "como funciona a consultoria tributária?"), responda de forma breve (máximo de 2-3 linhas), elegante e realista e, em seguida, transicione suavemente de volta ao fluxo de triagem/agendamento.
   - Informações Reais do Ecossistema Grupo DCA TEC para embasar suas respostas:
     * O Grupo DCA TEC é um ecossistema de inovação focado em engenharia de ponta, tecnologia de software e inteligência de negócios. É composto pelas divisões:
       - Tecnologia/Automação (DCA Kode): desenvolvimento sob demanda de softwares de alta performance, aplicativos móveis, plataformas digitais, BI e automações.
       - Consultoria Tributária / Fiscal: Recuperação de créditos tributários, otimização fiscal e planejamento para empresas.
       - Expansão de Negócios: Aceleração comercial, estruturação de Franquias, Fusões e Aquisições (M&A) e captação de investimentos.
       - Garage Tec: nossa incubadora de soluções disruptivas e startups.

3. TRIAGEM INTELIGENTE E TRANSIÇÃO:
   - Para agendar o atendimento estratégico, você precisa coletar e registrar de forma implícita ou explícita estes 4 blocos de dados no seu JSON de estado, se ainda não fornecidos:
     * Nome completo (name)
     * Telefone de contato ou E-mail corporativo (contact)
     * Localidade (Cidade e Estado para localizarmos o especialista de sua região) (location)
     * Resumo da necessidade (summary)
   - Use um tom executivo de assessor premium: seja elegante, prestativo e utilize linguagem corporativa de alto nível.
   - Assim que possuir ou deduzir esses dados essenciais, avise amigavelmente que prosseguirá para a abertura da nossa agenda virtual interativa para a escolha do horário perfeito, definindo 'shouldSchedule' como true.

REGRAS ESTRITAS DE EXTRAÇÃO DE NOME:
- NUNCA assuma que saudações simples (como "oi", "olá", "bom dia", "boa tarde", "hey", "tudo bem" ou o nome da própria empresa "DCA") são o nome do cliente. Se o nome não for informação explicita de forma clara e legível (ex: "Meu nome é João" ou "me chamo João" ou "sou o diego"), mantenha o campo 'name' como null. Nunca preencha 'name' com saudações ou palavras curtas genéricas.

REGRAS GERAIS:
- Se o usuário fizer perguntas técnicas profundas ou complexas, responda: "Excelente pergunta! Nosso consultor especializado da área poderá detalhar todos os aspectos de engenharia e regras dessa solução logo no início do nosso papo virtual. Para conectarmos você com ele..."
- Mantenha suas mensagens de diálogo (response) curtas e humanas (máximo de 3-4 linhas por interação).
- Use obrigatoriamente a RESPOSTA no formato JSON contendo estes exatos campos:
{
  "response": "sua resposta curta, fluida, natural, super humanizada e elegante",
  "collectedData": {
    "name": "Nome extraído ou atualizado (ex: João Silva)",
    "contact": "E-mail ou Telefone extraído (ex: 11999999999 ou joao@ex.com)",
    "location": "Cidade e Estado extraídos (ex: São Paulo - SP)",
    "summary": "Resumo da necessidade/dor extraído (ex: Desenvolvimento de aplicativo móvil de logística)",
    "department": "Departamento ideal: 'Consultoria Tributária', 'Expansão de Negócios', 'Tecnologia/Automação' ou 'Outros'"
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
