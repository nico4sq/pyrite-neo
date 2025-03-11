import nodemailer from 'nodemailer';

// Im Produktivsystem würden wir einen richtigen SMTP-Server verwenden
let transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
} else {
  console.log('E-Mail-Service im Entwicklungsmodus - E-Mails werden nur geloggt');
  
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('------------ TEST EMAIL ------------');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Text:', mailOptions.text);
      console.log('Verification Link:', mailOptions.text.match(/https?:\/\/[^\s]+/g));
      console.log('-----------------------------------');
      
      return {
        messageId: 'test-message-id'
      };
    }
  };
}

export async function sendVerificationEmail(to, token, username) {
    try {
      console.log(`[EMAIL] Attempting to send verification email to: ${to}`);
      
      const baseUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
      const verificationUrl = `${baseUrl}/api/register?token=${token}`;
      
      console.log(`[EMAIL] Using verification URL: ${verificationUrl}`);
      console.log(`[EMAIL] Using mail config: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`);
      
      const info = await transporter.sendMail({
        from: '"Pyrite Team" <account@pyrite-events.de>',
        to,
        subject: 'Bestätige deine E-Mail-Adresse',
        text: `Hallo ${username},\n\nBitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst: ${verificationUrl}\n\nDer Link ist 24 Stunden gültig.\n\nViele Grüße,\nDein Pyrite-Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">EventFinder - E-Mail-Bestätigung</h2>
            <p>Hallo <strong>${username}</strong>,</p>
            <p>Vielen Dank für deine Registrierung bei EventFinder! Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">E-Mail bestätigen</a>
            </p>
            <p>Oder kopiere den folgenden Link in deinen Browser:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            <p>Der Link ist 24 Stunden gültig.</p>
            <p>Viele Grüße,<br>Dein Pyrite-Team</p>
          </div>
        `,
      });
      
      console.log(`[EMAIL] Message sent successfully: ${info.messageId}`);
      return info;
      
    } catch (error) {
      console.error('[EMAIL] Failed to send verification email:', error);
      // Werfe den Fehler nicht erneut, damit der Registrierungsprozess fortsetzt
      // aber logge ihn für Debugging-Zwecke
      return { error: error.message, sent: false };
    }
  }

export async function sendVerificationEmail(to, token, username) {
    const baseUrl = process.env.PUBLIC_SITE_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://www.pyrite-events.de' : 'http://localhost:4321');
  const verificationUrl = `${baseUrl}/api/register?token=${token}`;
  
  const info = await transporter.sendMail({
    from: '"Pyrite Team" <account@pyrite-events.de>',
    to,
    subject: 'Bestätige deine E-Mail-Adresse',
    text: `Hallo ${username},\n\nBitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst: ${verificationUrl}\n\nDer Link ist 24 Stunden gültig.\n\nViele Grüße,\nDein Pyrite-Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">EventFinder - E-Mail-Bestätigung</h2>
        <p>Hallo <strong>${username}</strong>,</p>
        <p>Vielen Dank für deine Registrierung bei EventFinder! Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">E-Mail bestätigen</a>
        </p>
        <p>Oder kopiere den folgenden Link in deinen Browser:</p>
        <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p>Der Link ist 24 Stunden gültig.</p>
        <p>Viele Grüße,<br>Dein Pyrite-Team</p>
      </div>
    `,
  });

  return info;
}