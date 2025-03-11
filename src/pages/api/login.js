import { loginUser } from '../../utils/auth';

export const prerender = false;

export async function POST({ request }) {    
    try {
        // Prüfe ob der Request einen Body hat
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Request must be JSON');
        }
        
        // JSON-Body parsen
        let body;
        try {
            body = await request.json();
        } catch (error) {
            console.error('Failed to parse request body:', error);
            throw new Error('Invalid JSON in request body');
        }
        
        // E-Mail statt Benutzername verwenden
        const { email, password } = body;
        
        if (!email || !password) {
            throw new Error('E-Mail und Passwort werden benötigt');
        }
        
        // Führe die loginUser-Funktion aus, gebe die E-Mail statt des Benutzernamens weiter
        // Behalte dieselbe Funktion bei, aber verwende die E-Mail als Identifier
        const { user, token } = await loginUser(email, password);
                
        return new Response(JSON.stringify({
            success: true,
            user: {
                id: user.id,
                username: user.username, // Benutzername ist immer noch Teil der Antwort
                email: user.email
                // Kein Passwort zurückgeben!
            },
            token: token // Füge den Token zur Antwort hinzu
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                // Optional: Setze ein Cookie für den Token
                'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400`
            }
        });
    } catch (error) {
        console.error('Error in login API handler:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Anmeldung fehlgeschlagen'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}