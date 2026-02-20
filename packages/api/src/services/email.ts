import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${process.env.PRIMARY_COLOR || '#3b82f6'};
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
  });
}

export async function sendWelcomeEmail(name: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 30px; background: #f8fafc; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido, ${name}!</h1>
          </div>
          <div class="content">
            <p>Gracias por registrarte en nuestra plataforma.</p>
            <p>Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a explorar todas nuestras funcionalidades.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🚀 ¡Bienvenido a la plataforma!',
    html,
  });
}

export async function sendPendingApprovalEmail(name: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 30px; background: #fffcf0; border-radius: 0 0 8px 8px; border: 1px solid #fde68a; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Registro Recibido</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Gracias por registrarte. Tu solicitud ha sido recibida correctamente.</p>
            <p>Debido a que nuestra plataforma se encuentra en modo de acceso controlado, <strong>un administrador debe revisar y aprobar tu cuenta</strong> antes de que puedas iniciar sesión.</p>
            <p>Recibirás otro correo electrónico en cuanto tu acceso sea habilitado.</p>
            <p>Gracias por tu paciencia.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '⏳ Tu registro está pendiente de aprobación',
    html,
  });
}