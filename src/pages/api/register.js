import { registerUser } from '../../utils/auth';

// Stelle sicher, dass die API-Route serverseitig ausgeführt wird
export const prerender = false;

export async function POST({ request }) {
    console.log('Request received');
    
    try {
        // Debugging: Zeige alle Header
        console.log('Headers:', Object.fromEntries([...request.headers]));
        
        // Prüfe ob der Request einen Body hat
        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Request must be JSON');
        }
        
        // Versuche den JSON-Body zu parsen mit mehr Fehlerinformationen
        let body;
        try {
            body = await request.json();
        } catch (error) {
            console.error('Failed to parse request body:', error);
            const text = await request.text();
            console.log('Raw request body:', text);
            throw new Error('Invalid JSON in request body');
        }
        
        const { username, email, password } = body;
        
        if (!username || !email || !password) {
            throw new Error('Missing required fields');
        }
        
        console.log('Parsed request:', { username, email, password });
        
        const user = await registerUser(username, email, password);
        console.log('User registered:', user);
        
        return new Response(JSON.stringify({
            success: true,
            user
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in API handler:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}