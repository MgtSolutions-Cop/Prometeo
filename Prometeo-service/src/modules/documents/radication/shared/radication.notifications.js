import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("EMAIL_USER/EMAIL_PASS no configurados — notificaciones deshabilitadas");
}

const transporter = nodemailer.createTransport({
  host: "mail.mgdbitforge.cloud",
  port: 465,
  secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

export async function sendEntryNotification(emailPayload) {
  if (!EMAIL_USER || !EMAIL_PASS) return Promise.reject(new Error("Email no configurado"));
  if (!emailPayload.to)            return Promise.resolve();

  const htmlTemplate = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;border:1px solid #262626;border-radius:12px;overflow:hidden;background:#0a0a0a;">
      <div style="padding:30px;text-align:center;border-bottom:1px solid #262626;">
        <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:2px;">PROMETEO</h1>
        <p style="color:#ef4444;margin:8px 0 0;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Gestión Documental</p>
      </div>
      <div style="padding:30px 40px;color:#d4d4d4;">
        <h2 style="color:#fff;font-size:20px;margin-top:0;">Confirmación de Radicado</h2>
        <p style="font-size:15px;color:#a3a3a3;">Le informamos que su comunicación ha sido ingresada exitosamente:</p>
        <div style="background:#171717;border-left:4px solid #ef4444;padding:20px;margin:30px 0;border-radius:0 8px 8px 0;">
          <p style="margin:0 0 12px;font-size:15px;">
            <strong style="color:#fff;">No. de Radicado:</strong>
            <span style="color:#ef4444;font-size:18px;font-weight:bold;margin-left:5px;">${emailPayload.radicationNumber}</span>
          </p>
          <p style="margin:0 0 12px;font-size:15px;"><strong style="color:#fff;">Asunto:</strong> <span style="color:#d4d4d4;margin-left:5px;">${emailPayload.subjectDoc}</span></p>
          <p style="margin:0;font-size:15px;"><strong style="color:#fff;">Remitente:</strong> <span style="color:#d4d4d4;margin-left:5px;">${emailPayload.remitente}</span></p>
        </div>
        <p style="font-size:13px;color:#737373;">Este es un mensaje automático. Por favor, no responda a esta dirección.</p>
      </div>
      <div style="background:#050505;padding:25px;text-align:center;font-size:12px;color:#737373;border-top:1px solid #262626;">
        <p style="margin:0 0 5px;"><strong style="color:#a3a3a3;">MGD Bitforge</strong></p>
        <p style="margin:0;">&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
    </div>`;

  return transporter.sendMail({
    from: `"Prometeo SGD" <${EMAIL_USER}>`,
    to: emailPayload.to,
    subject: emailPayload.subject,
    html: htmlTemplate
  });
}