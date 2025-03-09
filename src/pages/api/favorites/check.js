import { db, Favorites } from 'astro:db';
import { validateToken } from '../../../utils/auth';

export const prerender = false;

export async function GET({ request, url }) {
    try {
        // Token aus dem Authorization-Header extrahieren
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Token validieren
        const validation = validateToken(token);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // User-ID aus dem validierten Token extrahieren
        const userId = validation.user.id;
        
        // Event-ID aus den Query-Parametern abrufen
        const eventId = url.searchParams.get('eventId');
        
        if (!eventId) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Überprüfen, ob das Event bereits favorisiert ist
        const favorite = await db.select()
            .from(Favorites)
            .where({ userId, eventId })
            .limit(1)
            .get();
        
        return new Response(JSON.stringify({
            isFavorite: Boolean(favorite)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        
        return new Response(JSON.stringify({
            error: 'Failed to check favorite status'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}