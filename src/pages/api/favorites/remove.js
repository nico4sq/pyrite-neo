import { db, Favorites, Users, eq, and } from 'astro:db';
import jwt from 'jsonwebtoken';

export const prerender = false;

export async function DELETE({ request }) {
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
    
    // Request-Body extrahieren
    const body = await request.json();
    const { postId } = body;
    
    if (!postId) {
      return new Response(JSON.stringify({
        error: 'postId is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Favorit löschen
    await db.delete(Favorites)
      .where(
        and(
          eq(Favorites.userId, decoded.id),
          eq(Favorites.postId, parseInt(postId))
        )
      );
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Favorite removed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error removing favorite:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}