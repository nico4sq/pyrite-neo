<script>
    import { onMount } from 'svelte';
    import EventCardSmall from './EventCardSmall.svelte';
    import Button from './Button.svelte';
    import { getAuthToken } from '../utils/auth.js';
    
    // Anzahl der anzuzeigenden Favoriten pro Seite
    const PAGE_SIZE = 9;
    
    let favorites = [];
    let displayedFavorites = [];
    let loading = true;
    let loadingMore = false;
    let error = null;
    let page = 0;
    let hasMore = false;
    let authToken = '';
    
    onMount(async () => {
      // Auth-Token für API-Anfragen abrufen
      authToken = getAuthToken() || '';
      if (!authToken) {
        error = "Du musst angemeldet sein, um deine Favoriten zu sehen.";
        loading = false;
        return;
      }
      
      await loadFavorites();
    });
    
    async function loadFavorites(reset = false) {
      if (reset) {
        page = 0;
        favorites = [];
        displayedFavorites = [];
        loading = true;
      } else {
        loadingMore = true;
      }
      
      error = null;
      
      try {
        // API-Endpunkt zum Abrufen der Favoriten
        const response = await fetch('/api/favorites/check', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Beim Laden der Favoriten ist ein Fehler aufgetreten');
        }
        
        const data = await response.json();
        
        if (data.favorites) {
          // Alle Favoriten speichern
          favorites = data.favorites.map(fav => ({
            id: fav.id,
            postId: fav.postId,
            event: null // Wird später befüllt
          }));
          
          // Event-Details für jedes Favorit abrufen
          await Promise.all(favorites.map(async (favorite, index) => {
            try {
              const eventResponse = await fetch(`/api/posts/${favorite.postId}`);
              if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                favorites[index].event = eventData;
              }
            } catch (err) {
              console.error(`Error fetching event ${favorite.postId}:`, err);
            }
          }));
          
          // Nur Favoriten mit gültigen Events behalten
          favorites = favorites.filter(fav => fav.event);
          
          // Aktualisiere die angezeigten Favoriten basierend auf der Pagination
          const startIndex = 0;
          const endIndex = Math.min((page + 1) * PAGE_SIZE, favorites.length);
          displayedFavorites = favorites.slice(startIndex, endIndex);
          
          // Prüfe, ob weitere Favoriten verfügbar sind
          hasMore = favorites.length > displayedFavorites.length;
        } else {
          error = "Keine Favoriten gefunden";
        }
      } catch (err) {
        console.error('Error loading favorites:', err);
        error = err.message || 'Beim Laden der Favoriten ist ein Fehler aufgetreten';
      } finally {
        loading = false;
        loadingMore = false;
      }
    }
    
    function loadMoreFavorites() {
      page += 1;
      const startIndex = 0;
      const endIndex = Math.min((page + 1) * PAGE_SIZE, favorites.length);
      displayedFavorites = favorites.slice(startIndex, endIndex);
      hasMore = favorites.length > displayedFavorites.length;
    }
    
    // Funktion zum Entfernen eines Favoriten
    async function removeFavorite(postId) {
      try {
        const response = await fetch('/api/favorites/remove', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId })
        });
        
        if (response.ok) {
          // Favorit aus der lokalen Liste entfernen
          favorites = favorites.filter(fav => fav.postId !== postId);
          
          // Angezeigte Favoriten aktualisieren
          const startIndex = 0;
          const endIndex = Math.min((page + 1) * PAGE_SIZE, favorites.length);
          displayedFavorites = favorites.slice(startIndex, endIndex);
          
          // Prüfe, ob weitere Favoriten verfügbar sind
          hasMore = favorites.length > displayedFavorites.length;
        } else {
          console.error('Failed to remove favorite:', await response.text());
        }
      } catch (err) {
        console.error('Error removing favorite:', err);
      }
    }
  </script>
  
  <div class="w-full">
    <h2 class="text-2xl font-bold font-barlow uppercase mb-4">Meine Favoriten</h2>
    
    {#if loading && !loadingMore}
      <div class="flex justify-center py-8">
      </div>
    {:else if error}
      <div class="border-1 border-orange-600 dark:border-orange-300 bg-orange-600/20 dark:bg-orange-300/20 text-orange-600 dark:text-orange-300 p-3 rounded-md text-sm">
        {error}
      </div>
    {:else if displayedFavorites.length === 0}
      <p class="text-neutral-600 dark:text-neutral-400 py-6 text-center">
        Du hast noch keine Veranstaltungen als Favorit markiert.
      </p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each displayedFavorites as favorite (favorite.postId)}
          <div class="relative group">
            <EventCardSmall 
              event={favorite.event} 
              isFavorite={true}
            />
            <!-- Entfernen-Button -->
            <button
              class="absolute top-2 right-2 z-10 bg-white/60 dark:bg-black/60 p-1.5 rounded-full hover:bg-white dark:hover:bg-black transition text-red-500"
              aria-label="Von Favoriten entfernen"
              on:click={() => removeFavorite(favorite.postId)}
            >
              <!-- Herz-Icon (gefüllt) -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
      
      {#if hasMore}
        <div class="mt-6 flex justify-center">
          <Button 
            label={loadingMore ? "Wird geladen..." : "Mehr laden"} 
            type="secondary"
            icon={loadingMore ? "loading" : "plus"} 
            disabled={loadingMore}
            interaction={{ type: 'button', onClick: loadMoreFavorites }}
          />
        </div>
      {/if}
    {/if}
  </div>