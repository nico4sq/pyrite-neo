import { db, Users, eq } from 'astro:db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../utils/email.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'E-Mail-Adresse erforderlich'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Benutzer anhand der E-Mail suchen
    const users = await db.select().from(Users).where(eq(Users.email, email));
    
    // Sicherheitsmaßnahme: Immer erfolgreiche Antwort zurückgeben,
    // auch wenn kein Benutzer gefunden wurde, um keine Informationen preiszugeben
    if (users.length === 0) {
      return new Response(JSON.stringify({
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = users[0];
    
    // Reset-Token generieren
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token-Ablaufzeit (1 Stunde)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);
    
    // Token in der Datenbank speichern
    await db.update(Users)
      .set({
        resetToken,
        resetTokenExpiry: tokenExpiry
      })
      .where(eq(Users.id, user.id));
    
    // E-Mail senden
    await sendPasswordResetEmail(email, resetToken, user.username);
    
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}