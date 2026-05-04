import nodemailer from 'nodemailer';

export const onRequestPost: PagesFunction<{
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_TO: string;
}> = async (context) => {
  try {
    const request = context.request;
    const body: any = await request.json();
    const { name, email, company, subject, message, source } = body;

    // Validação básica
    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Nome e e-mail são obrigatórios." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configuração do Transporter (Umbler SMTP)
    const transporter = nodemailer.createTransport({
      host: context.env.SMTP_HOST || "smtp.umbler.com",
      port: Number(context.env.SMTP_PORT) || 587,
      secure: context.env.SMTP_PORT === "465",
      auth: {
        user: context.env.SMTP_USER,
        pass: context.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"DCA TEC" <${context.env.SMTP_USER}>`,
      to: source.includes('Proposta') ? email : context.env.EMAIL_TO,
      subject: subject || `Novo Lead: ${name} - ${source}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 2px solid #00ffe0; border-radius: 12px; max-width: 600px;">
          <h2 style="color: #00ffe0; margin-top: 0;">${source.includes('Proposta') ? '📄 Proposta Comercial' : '🚀 Novo Lead Recebido'}</h2>
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
    
    return new Response(JSON.stringify({ success: true, message: "E-mail enviado via Cloudflare!" }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Erro no envio de e-mail:", error);
    return new Response(JSON.stringify({ error: "Erro ao enviar e-mail.", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
