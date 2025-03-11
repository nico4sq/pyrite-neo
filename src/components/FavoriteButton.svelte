<script>
    import { onMount } from "svelte";
    import { BookmarkIcon } from "svelte-feather-icons";
  
    export let postId;
  
    // Zustand
    let user = null;
    let isFavorite = false;
    let isLoading = false;
    let isProcessing = false;
    let isAuthenticated = false;
    
    onMount(async () => {
      try {
        // Token und Benutzerdaten aus localStorage abrufen
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');
        
        // Prüfen, ob beides vorhanden ist
        if (token && storedUser) {
          user = JSON.parse(storedUser);
          isAuthenticated = true;
          
          // Erst nach erfolgreicher Authentifizierung den Favoritenstatus prüfen
          await checkFavoriteStatus(token);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
        isAuthenticated = false;
      }
    });
    
    async function checkFavoriteStatus(token) {
      if (!isAuthenticated || !token) return;
      
      isLoading = true;
      try {
        // Token explizit übergeben
        const response = await fetch(`/api/favorites/check?postId=${encodeURIComponent(postId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          isFavorite = data.isFavorite === true;
        } else if (response.status === 401) {
          // Nicht authentifiziert oder abgelaufenes Token
          console.error('Nicht autorisiert. Token möglicherweise abgelaufen.');
          isAuthenticated = false;
          // Optional: Token löschen, da es ungültig ist
          localStorage.removeItem('authToken');
        } else {
          const errorData = await response.json();
          console.error('Fehler bei der Favoriten-Prüfung:', errorData);
          isFavorite = false;
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des Favoritenstatus:', error);
        isFavorite = false;
      } finally {
        isLoading = false;
      }
    }
    
    async function toggleFavorite(e) {
      e.stopPropagation();
      e.preventDefault();
      
      // Frischen Token holen, falls er aktualisiert wurde
      const token = localStorage.getItem('authToken');
      
      if (!isAuthenticated || !token || isProcessing) return;
      
      isProcessing = true;
      try {
        const method = isFavorite ? 'DELETE' : 'POST';
        const url = isFavorite ? `/api/favorites/remove` : `/api/favorites/add`;
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            postId
          })
        });
        
        if (response.ok) {
          isFavorite = !isFavorite;
        } else if (response.status === 401) {
          // Nicht authentifiziert oder abgelaufenes Token
          console.error('Nicht autorisiert. Token möglicherweise abgelaufen.');
          isAuthenticated = false;
          localStorage.removeItem('authToken');
          // Optional: Benutzer zum Login weiterleiten
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
          console.error('Fehler beim Aktualisieren des Favoriten:', errorData);
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Favoriten:', error);
      } finally {
        isProcessing = false;
      }
    }
</script>

{#if isAuthenticated && user}
  <button 
    on:click={toggleFavorite} 
    class="absolute top-3 right-3 z-10 bg-white dark:bg-neutral-700 rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer hover:scale-110 transition-all"
    aria-label={isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    disabled={isProcessing || isLoading}
  >
    {#if isLoading || isProcessing}
      <div class="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
    {:else}
      <BookmarkIcon 
        class="w-5 h-5 {isFavorite ? 'text-indigo-300 fill-current' : 'text-neutral-500 dark:text-neutral-300'}" 
      />
    {/if}
  </button>
{/if}