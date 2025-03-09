import { db, eq, Users } from 'astro:db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Secret Key - sollte in einer .env-Datei gespeichert werden
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Modifikation der auth.js
export async function registerUser(username, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    try {
        const user = await db.insert(Users).values({ 
            username: username, 
            email: email, 
            password: hashedPassword,
            created_at: new Date()
        });
        
        // Stelle sicher, dass ein serialisierbares Objekt zurückgegeben wird
        return {
            username,
            email,
            id: user.id || 'unknown'
        };
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw new Error('Failed to register user: ' + (error.message || 'Unknown error'));
    }
}

export async function loginUser(username, password) {
    try {
        // Konvertiere username zu String, um sicherzustellen, dass es ein gültiger Typ ist
        const usernameString = String(username);
        
        // Suche nach dem Benutzer in der Datenbank
        const user = await db.select().from(Users).where(eq(Users.username, usernameString)).limit(1);
        
        if (!user || user.length === 0) {
            throw new Error('Ungültiger Benutzername oder Passwort');
        }
        
        // Benutzer gefunden, vergleiche nun das Passwort
        const storedUser = user[0];
        
        // Überprüfe das Passwort
        const passwordMatch = await bcrypt.compare(password, storedUser.password);
        
        if (!passwordMatch) {
            throw new Error('Ungültiger Benutzername oder Passwort');
        }
        
        // Generiere JWT Token
        const token = jwt.sign(
            { 
                id: storedUser.id,
                username: storedUser.username,
                email: storedUser.email
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' } // Token läuft nach 24 Stunden ab
        );
        
        // Benutzer gefunden, Passwort stimmt überein, Token generiert
        return {
            user: {
                id: storedUser.id,
                username: storedUser.username,
                email: storedUser.email
            },
            token
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Token validieren
export function validateToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, user: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}