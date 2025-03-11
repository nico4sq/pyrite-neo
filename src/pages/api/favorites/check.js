import { db, Favorites, Users, eq, and } from 'astro:db';
import jwt from 'jsonwebtoken';

export const prerender = false;

export async function GET({ request }) {
  try {
    // Token aus dem Authorization-Header extrahieren
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Token validieren
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // URL-Parameter extrahieren
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');
    
    if (!postId) {
      return new Response(JSON.stringify({
        error: 'postId parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prüfen, ob der Post in den Favoriten des Benutzers ist
    const favorites = await db.select()
      .from(Favorites)
      .where(
        and(
          eq(Favorites.userId, decoded.id),
          eq(Favorites.postId, parseInt(postId))
        )
      );
    
    return new Response(JSON.stringify({
      isFavorite: favorites.length > 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error checking favorite status:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}