<script>
  import { onMount } from "svelte";
  import Button from "./Button.svelte";

  import '../styles/components/FavoriteButton.css';

  export let postId;

  // Zustand
  let user = null;
  let isFavorite = false;
  let isLoading = false;
  let isProcessing = false;
  let isAuthenticated = false;
  let customClasses = 'favorite-button';

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
        updateCustomClasses();
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
        updateCustomClasses();
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Favoritenstatus:', error);
      isFavorite = false;
      updateCustomClasses();
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
        updateCustomClasses();
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

  function updateCustomClasses() {
    customClasses = `favorite-button ${isFavorite ? 'is-favorite' : ''}`;
  }
</script>

{#if isAuthenticated && user}
  {#if isFavorite}
    <Button
      type="tertiary"
      label="Von Favoriten entfernen"
      icon={{ name: 'BookmarkIcon', only: true }}
      interaction={{ type: 'button'}}
      customClasses={'favorite-button is-favorite'}
      on:click={toggleFavorite} 
    />
  {:else}
    <Button
      type="tertiary"
      label="Zu Favoriten hinzufügen"
      icon={{ name: 'BookmarkIcon', only: true }}
      interaction={{ type: 'button'}}
      customClasses={'favorite-button'}
      on:click={toggleFavorite} 
    />
  {/if}
{/if}