// src/modules/documents/radication/radication.notifications.js
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
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS 
  }
});

// La función recibe el emailPayload que le manda el controlador
export async function sendEntryNotification(emailPayload) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return Promise.reject(new Error("Email no configurado"));
  }
  if (!emailPayload.to) {
    return Promise.resolve();
  }

  // Plantilla HTML Corporativa
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #262626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); background-color: #0a0a0a;">
  
  <div style="padding: 30px; text-align: center; border-bottom: 1px solid #262626;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">PROMETEO</h1>
    <p style="color: #ef4444; margin: 8px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Gestión Documental</p>
  </div>

  <div style="padding: 30px 40px; color: #d4d4d4;">
    <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">Confirmación de Radicado</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3;">Hola,</p>
    <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3;">Le informamos que su comunicación ha sido ingresada exitosamente en nuestro sistema con los siguientes detalles:</p>

    <div style="background-color: #171717; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 12px 0; font-size: 15px;">
        <strong style="color: #ffffff;">No. de Radicado:</strong> 
        <span style="color: #ef4444; font-size: 18px; font-weight: bold; margin-left: 5px;">${emailPayload.radicationNumber}</span>
      </p>
      <p style="margin: 0 0 12px 0; font-size: 15px;">
        <strong style="color: #ffffff;">Asunto:</strong> <span style="color: #d4d4d4; margin-left: 5px;">${emailPayload.asunto}</span>
      </p>
      <p style="margin: 0; font-size: 15px;">
        <strong style="color: #ffffff;">Remitente:</strong> <span style="color: #d4d4d4; margin-left: 5px;">${emailPayload.remitente}</span>
      </p>
    </div>

    <p style="font-size: 13px; color: #737373; line-height: 1.5; margin-top: 40px;">
      Este es un mensaje automático generado por la plataforma. Por favor, no responda a esta dirección de correo.
    </p>
  </div>

  <div style="background-color: #050505; padding: 25px; text-align: center; font-size: 12px; color: #737373; border-top: 1px solid #262626;">
    <p style="margin: 0 0 5px 0;"><strong style="color: #a3a3a3;">MGD Bitforge</strong></p>
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
  </div>
  
</div>
  `;

  const mailOptions = {
    from: `"Prometeo SGD" <${EMAIL_USER}>`,
    to: emailPayload.to,
    subject: emailPayload.subject,
    html: htmlTemplate
  };

  return transporter.sendMail(mailOptions);
}