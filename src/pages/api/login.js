import { loginUser } from '../../utils/auth';

export const prerender = false;

export async function POST({ request }) {
    console.log('Login request received');
    
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
        
        const { username, password } = body;
        
        if (!username || !password) {
            throw new Error('Benutzername und Passwort werden benötigt');
        }
        
        // Führe die loginUser-Funktion aus, bekomme Benutzer und Token zurück
        const { user, token } = await loginUser(username, password);
        
        console.log('User logged in:', { id: user.id, username: user.username });
        
        return new Response(JSON.stringify({
            success: true,
            user: {
                id: user.id,
                username: user.username,
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