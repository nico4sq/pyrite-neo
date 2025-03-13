import { db, Users, eq } from 'astro:db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from './email.js';

// Token-Generierung für E-Mail-Verifikation
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function registerUser(username, email, password) {
  // Prüfen, ob Benutzer oder E-Mail bereits existieren
  const existingUser = await db
    .select()
    .from(Users)
    .where(eq(Users.username, username));
    
  if (existingUser.length > 0) {
    throw new Error('Benutzername bereits vergeben');
  }
  
  const existingEmail = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email));
    
  if (existingEmail.length > 0) {
    throw new Error('E-Mail-Adresse bereits registriert');
  }
  
  // Passwort hashen
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  // Verifikationstoken erstellen
  const verificationToken = generateVerificationToken();
  
  // Token-Ablaufzeit (24 Stunden)
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24);
  
  // Benutzer in Datenbank anlegen
  const [user] = await db.insert(Users).values({
    username,
    email,
    passwordHash,
    emailVerified: false,
    verificationToken,
    tokenExpiry: tokenExpiry.toISOString()
  }).returning();
  
  // E-Mail mit Verifikations-Link senden
  try {
    await sendVerificationEmail(email, verificationToken, username);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Trotz Fehler beim E-Mail-Versand Benutzer zurückgeben
    // In Produktionssystemen könnte hier ein Retry-Mechanismus stehen
  }
  
  // Vertrauliche Informationen entfernen
  const { passwordHash: _, verificationToken: __, tokenExpiry: ___, ...safeUserData } = user;
  
  return safeUserData;
}

export async function verifyEmail(token) {
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

export async function loginUser(email, password) {
    // Suche nach Benutzer per E-Mail
    const users = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email));
      
    if (users.length === 0) {
      throw new Error('Ungültige Anmeldedaten');
    }
    
    const user = users[0];
    
    // Prüfen, ob die E-Mail verifiziert wurde
    if (!user.emailVerified) {
      throw new Error('E-Mail-Adresse nicht bestätigt. Bitte überprüfen Sie Ihren Posteingang.');
    }
    
    // Passwort prüfen
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordValid) {
      throw new Error('Ungültige Anmeldedaten');
    }
    
    // JWT-Token generieren
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      import.meta.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Vertrauliche Informationen entfernen
    const { passwordHash, verificationToken, tokenExpiry, ...safeUserData } = user;
    
    return {
      user: safeUserData,
      token
    };
  }

// Verbesserte Token-Validierung
function validateToken(token) {
    try {
      return jwt.verify(token, import.meta.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn('Token expired');
      } else {
        console.error('Invalid token:', error.message);
      }
      return null;
    }
  }