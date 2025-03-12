import { db, Users, eq } from 'astro:db';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Token und Passwort erforderlich'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Benutzer mit diesem Token finden
    const users = await db.select().from(Users).where(eq(Users.resetToken, token));
    
    if (users.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Ungültiger oder abgelaufener Token'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = users[0];
    
    // Prüfen, ob der Token abgelaufen ist
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Der Token ist abgelaufen. Bitte fordere einen neuen Link an.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validierung des Passworts
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Das Passwort erfüllt nicht alle Anforderungen'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Neues Passwort hashen
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Passwort aktualisieren und Token löschen
    await db.update(Users)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(Users.id, user.id));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Passwort erfolgreich zurückgesetzt'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}