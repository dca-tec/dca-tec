import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Apenas aceita requisições POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, company, subject, message, source } = request.body;

  // Validação básica
  if (!name || !email) {
    return response.status(400).json({ error: "Nome e e-mail são obrigatórios." });
  }

  try {
    // Configuração do Transporter (Umbler SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.umbler.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Garante compatibilidade com SMTPs da Umbler
      }
    });

    const isClientTarget = source?.includes('Proposta') || source?.includes('Agendamento') || source?.includes('Triagem') || source?.includes('Reunião');
    const recipientList: string[] = [];

    // Priorizar e adicionar o e-mail de destino administrativo
    if (process.env.EMAIL_TO) {
      recipientList.push(process.env.EMAIL_TO);
    }

    // Se a origem pede notificação ao cliente de forma prioritária, e o e-mail for válido
    if (isClientTarget && email && email !== "nao_informado@dca.com" && email.includes('@')) {
      recipientList.push(email);
    }

    // Fallback absoluto se a lista estiver vazia
    if (recipientList.length === 0 && process.env.SMTP_USER) {
      recipientList.push(process.env.SMTP_USER);
    }

    const toField = recipientList.join(', ');

    const mailOptions = {
      from: `"DCA TEC" <${process.env.SMTP_USER}>`,
      to: toField,
      subject: subject || `Novo Lead: ${name} - ${source}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid #00ffe0; border-radius: 12px; max-width: 600px;">
          <h2 style="color: #00ffe0; margin-top: 0;">${isClientTarget ? '📅 Confirmação / Proposta' : '🚀 Novo Lead Recebido'}</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          ${company ? `<p><strong>Empresa/CNPJ:</strong> ${company}</p>` : ''}
          <p><strong>Origem/Contexto:</strong> ${source}</p>
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
    return response.status(200).json({ success: true, message: "E-mail enviado via Umbler!" });
  } catch (error: any) {
    console.error("Erro no SMTP da Umbler:", error);
    return response.status(500).json({ 
      error: "Erro ao enviar e-mail.", 
      details: error.message 
    });
  }
}
