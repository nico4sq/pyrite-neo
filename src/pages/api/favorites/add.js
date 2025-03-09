import { db, Favorites } from 'astro:db';
import { validateToken } from '../../../utils/auth';

export const prerender = false;

export async function POST({ request }) {
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
        
        // Request-Body parsen
        const body = await request.json();
        const { eventId } = body;
        
        if (!eventId) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // User-ID aus dem Token verwenden
        const userId = validation.user.id;
        
        // Prüfen, ob der Favorit bereits existiert
        const existingFavorite = await db.select()
            .from(Favorites)
            .where({ userId, eventId })
            .limit(1)
            .get();
        
        if (existingFavorite) {
            return new Response(JSON.stringify({
                message: 'Event is already a favorite'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Neuen Favoriten erstellen
        await db.insert(Favorites).values({
            userId,
            eventId,
            createdAt: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Favorite added successfully'
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        
        return new Response(JSON.stringify({
            error: 'Failed to add favorite'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}