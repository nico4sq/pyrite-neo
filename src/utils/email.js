import nodemailer from 'nodemailer';

let transporter;

/**
 * SMTP-Konfiguration basierend auf Umgebungsvariablen erstellen
 */
function getSmtpConfig() {
  const host = import.meta.env.MAIL_HOST;
  const user = import.meta.env.MAIL_USER;
  const pass = import.meta.env.MAIL_PASSWORD;
  const port = parseInt(import.meta.env.MAIL_PORT || '587');
  const secure = import.meta.env.MAIL_SECURE === 'true' || port === 465;
  
  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: true
    }
  };
}

/**
 * Mock-Transporter für Entwicklungsumgebung
 */
function createMockTransporter() {
  return {
    sendMail: async (mailOptions) => {
      console.log(`[EMAIL] Mock email sent to: ${mailOptions.to}, subject: ${mailOptions.subject}`);
      return { messageId: 'mock-message-id', mock: true };
    },
    verify: async () => true
  };
}

/**
 * Transporter basierend auf Umgebung initialisieren
 */
function initializeTransporter() {
  const hasSmtpConfig = 
    import.meta.env.MAIL_HOST && 
    import.meta.env.MAIL_USER && 
    import.meta.env.MAIL_PASSWORD;
    
  if (hasSmtpConfig) {
    try {
      // Echten SMTP-Transporter erstellen
      const config = getSmtpConfig();
      transporter = nodemailer.createTransport(config);
    } catch (error) {
      console.error('[EMAIL] Failed to create SMTP transporter:', error);
      transporter = createMockTransporter();
    }
  } else {
    // Fallback für Entwicklungsumgebung
    transporter = createMockTransporter();
  }
}

// Transporter beim Import initialisieren
initializeTransporter();

/**
 * E-Mail zur Verifizierung der E-Mail-Adresse senden
 * 
 * @param {string} to - Empfänger-E-Mail
 * @param {string} token - Verifizierungstoken
 * @param {string} username - Benutzername
 * @returns {Promise<Object>} - Ergebnis des E-Mail-Versands
 */
export async function sendVerificationEmail(to, token, username) {
    try {
        const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
        const verificationUrl = `${baseUrl}/api/register?token=${token}`;

        const info = await transporter.sendMail({
            from: '"Pyrite Team" <account@pyrite-events.de>',
            to,
            subject: 'Bestätige deine E-Mail-Adresse',
            text: `Hallo ${username},\n\nBitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst: ${verificationUrl}\n\nDer Link ist 24 Stunden gültig.\n\nViele Grüße,\nDein Pyrite-Team`,
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Pyrite - E-Mail-Bestätigung</h2>
            <p>Hallo <strong>${username}</strong>,</p>
            <p>Vielen Dank für deine Registrierung bei Pyrite! Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
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
    } catch (error) {
        // Bei SSL-Fehler eine alternative Konfiguration versuchen
        if (error.code === 'ESOCKET' && error.library === 'SSL routines') {
            try {
                // Alternative Konfiguration mit anderem Port und SSL-Einstellung
                const currentConfig = transporter.options;
                const altPort = currentConfig.port === 465 ? 587 : 465;
                const altSecure = !currentConfig.secure;
                
                const altTransporter = nodemailer.createTransport({
                    host: currentConfig.host,
                    port: altPort,
                    secure: altSecure,
                    auth: currentConfig.auth,
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                
                // Mit der alternativen Konfiguration erneut versuchen
                const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
                const verificationUrl = `${baseUrl}/api/register?token=${token}`;
                
                const info = await altTransporter.sendMail({
                    from: '"Pyrite Team" <account@pyrite-events.de>',
                    to,
                    subject: 'Bestätige deine E-Mail-Adresse',
                    text: `Hallo ${username},\n\nBitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst: ${verificationUrl}\n\nDer Link ist 24 Stunden gültig.\n\nViele Grüße,\nDein Pyrite-Team`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Pyrite - E-Mail-Bestätigung</h2>
                        <p>Hallo <strong>${username}</strong>,</p>
                        <p>Vielen Dank für deine Registrierung bei Pyrite! Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
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
                
                // Haupttransporter aktualisieren, da die alternative Konfiguration funktioniert hat
                transporter = altTransporter;
                
                return info;
            } catch (altError) {
                throw error; // Original-Fehler zurückwerfen, wenn alternative Konfiguration auch fehlschlägt
            }
        }
        
        // Für die Produktion: Fehler weiterwerfen für ordnungsgemäßes Error-Handling
        throw error;
    }
}

/**
 * E-Mail zum Zurücksetzen des Passworts senden
 * 
 * @param {string} to - Empfänger-E-Mail
 * @param {string} token - Reset-Token
 * @param {string} username - Benutzername
 * @returns {Promise<Object>} - Ergebnis des E-Mail-Versands
 */
export async function sendPasswordResetEmail(to, token, username) {
    try {
        const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        const info = await transporter.sendMail({
            from: '"Pyrite Team" <account@pyrite-events.de>',
            to,
            subject: 'Passwort zurücksetzen',
            text: `Hallo ${username},\n\nDu hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Link, um ein neues Passwort zu erstellen: ${resetUrl}\n\nDer Link ist 1 Stunde gültig.\n\nWenn du keine Anfrage zum Zurücksetzen des Passworts gestellt hast, kannst du diese E-Mail ignorieren.\n\nViele Grüße,\nDein Pyrite-Team`,
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Pyrite - Passwort zurücksetzen</h2>
            <p>Hallo <strong>${username}</strong>,</p>
            <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Button, um ein neues Passwort zu erstellen:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Passwort zurücksetzen</a>
            </p>
            <p>Oder kopiere den folgenden Link in deinen Browser:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            <p>Der Link ist 1 Stunde gültig.</p>
            <p>Wenn du keine Anfrage zum Zurücksetzen des Passworts gestellt hast, kannst du diese E-Mail ignorieren.</p>
            <p>Viele Grüße,<br>Dein Pyrite-Team</p>
          </div>
        `,
        });

        return info;
    } catch (error) {
        // Bei SSL-Fehler eine alternative Konfiguration versuchen (gleiche Logik wie oben)
        if (error.code === 'ESOCKET' && error.library === 'SSL routines') {
            // Gleicher Code wie in sendVerificationEmail für alternative Konfiguration
            
            try {
                const currentConfig = transporter.options;
                const altPort = currentConfig.port === 465 ? 587 : 465;
                const altSecure = !currentConfig.secure;
                
                const altTransporter = nodemailer.createTransport({
                    host: currentConfig.host,
                    port: altPort,
                    secure: altSecure,
                    auth: currentConfig.auth,
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                
                const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
                const resetUrl = `${baseUrl}/reset-password?token=${token}`;
                
                const info = await altTransporter.sendMail({
                    from: '"Pyrite Team" <account@pyrite-events.de>',
                    to,
                    subject: 'Passwort zurücksetzen',
                    text: `Hallo ${username},\n\nDu hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Link, um ein neues Passwort zu erstellen: ${resetUrl}\n\nDer Link ist 1 Stunde gültig.\n\nWenn du keine Anfrage zum Zurücksetzen des Passworts gestellt hast, kannst du diese E-Mail ignorieren.\n\nViele Grüße,\nDein Pyrite-Team`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Pyrite - Passwort zurücksetzen</h2>
                        <p>Hallo <strong>${username}</strong>,</p>
                        <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den folgenden Button, um ein neues Passwort zu erstellen:</p>
                        <p style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Passwort zurücksetzen</a>
                        </p>
                        <p>Oder kopiere den folgenden Link in deinen Browser:</p>
                        <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
                          <a href="${resetUrl}">${resetUrl}</a>
                        </p>
                        <p>Der Link ist 1 Stunde gültig.</p>
                        <p>Wenn du keine Anfrage zum Zurücksetzen des Passworts gestellt hast, kannst du diese E-Mail ignorieren.</p>
                        <p>Viele Grüße,<br>Dein Pyrite-Team</p>
                      </div>
                    `,
                });

                transporter = altTransporter;
            } catch (altError) {
                throw error;
            }
        } 
    }
}