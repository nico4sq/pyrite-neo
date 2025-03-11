import { db, Users, eq } from 'astro:db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../utils/email.js';

export const prerender = false;

// Bestehender GET-Handler für E-Mail-Bestätigung
export async function GET({ request }) {
  // URL-Parameter extrahieren
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  try {
    if (!token) {
      throw new Error('Token nicht gefunden');
    }
    
    await verifyEmail(token);
    
    // Erfolgreich verifiziert, leite zur Login-Seite weiter
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/login?verified=true'
      }
    });
    
  } catch (error) {
    // Bei Fehler zur Fehlerseite weiterleiten
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `/email-verification-error?error=${encodeURIComponent(error.message)}`
      }
    });
  }
}

// Neuer POST-Handler für die Registrierung
export async function POST({ request }) {
  try {
    const { username, email, password } = await request.json();

    // Grundlegende Validierung
    if (!username || !email || !password) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Alle Felder müssen ausgefüllt sein'
          }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

    // Prüfen, ob Benutzer bereits existiert
    const existingEmails = await db.select().from(Users).where(eq(Users.email, email));
    if (existingEmails.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Diese E-Mail-Adresse wurde bereits registriert. Bitte verwende eine andere E-Mail oder logge dich ein.'
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Verifikations-Token generieren
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Token-Ablaufzeit (24 Stunden)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    // Benutzer in DB speichern
    const [user] = await db.insert(Users).values({
      username,
      email,
      passwordHash,
      emailVerified: false,
      verificationToken,
      tokenExpiry: tokenExpiry
    }).returning();

    // Bestätigungs-E-Mail senden
    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error('Fehler beim Senden der Bestätigungs-E-Mail:', emailError);
      // Wir geben trotzdem eine erfolgreiche Antwort zurück,
      // könnten aber auch einen Warnhinweis hinzufügen
    }

    // Erfolgreiche Antwort
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink.'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Ein Server-Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Funktion zur E-Mail-Verifizierung
async function verifyEmail(token) {
  if (!token) throw new Error('Kein Verifikationstoken angegeben');
  
  // Benutzer mit diesem Token finden
  const users = await db
    .select()
    .from(Users)
    .where(eq(Users.verificationToken, token));
  
  if (users.length === 0) {
    throw new Error('Ungültiger Verifikationstoken');
  }
  
  const user = users[0];
  
  // Prüfen, ob der Token abgelaufen ist
  const now = new Date();
  const expiry = new Date(user.tokenExpiry);
  
  if (now > expiry) {
    throw new Error('Verifikationstoken ist abgelaufen');
  }
  
  // Benutzer als verifiziert markieren und Token entfernen
  await db.update(Users)
    .set({ 
      emailVerified: true,
      verificationToken: null,
      tokenExpiry: null 
    })
    .where(eq(Users.id, user.id));
  
  return true;
}