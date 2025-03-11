import { db, Users, eq } from 'astro:db';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../utils/email';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'E-Mail-Adresse ist erforderlich'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Benutzer in der Datenbank suchen
    const users = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email));
    
    if (users.length === 0) {
      // Aus Sicherheitsgründen vorgeben, dass alles geklappt hat
      return new Response(JSON.stringify({
        success: true,
        message: 'Wenn ein Konto mit dieser E-Mail existiert, wurde ein neuer Link verschickt'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = users[0];
    
    // Prüfen, ob die E-Mail bereits verifiziert ist
    if (user.emailVerified) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Diese E-Mail-Adresse ist bereits verifiziert'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Neuen Verifikations-Token generieren
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Token-Ablaufzeit (24 Stunden)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    
    // Token in der Datenbank aktualisieren
    await db.update(Users)
      .set({
        verificationToken,
        tokenExpiry: tokenExpiry
      })
      .where(eq(Users.id, user.id));
    
    // E-Mail senden
    await sendVerificationEmail(email, verificationToken, user.username);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Neuer Verifikationslink wurde versendet'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Fehler beim Versenden der E-Mail'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}