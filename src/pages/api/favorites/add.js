import { db, Favorites, eq, and } from 'astro:db';
import jwt from 'jsonwebtoken';

export const prerender = false;

export async function POST({ request }) {
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
      decoded = jwt.verify(token, import.meta.env.JWT_SECRET);
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
    
    // Prüfen, ob der Favorit bereits existiert, um Duplikate zu vermeiden
    const existingFavorite = await db.select()
      .from(Favorites)
      .where(
        and(
          eq(Favorites.userId, decoded.id),
          eq(Favorites.postId, parseInt(postId))
        )
      );
    
    if (existingFavorite.length > 0) {
      return new Response(JSON.stringify({
        message: 'Already favorited'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Favorit hinzufügen
    const now = new Date();
    await db.insert(Favorites).values({
      userId: decoded.id,
      postId: parseInt(postId),
      createdAt: now
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
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}