<script>
  import { onMount } from "svelte";
  import { MusicIcon, MapPinIcon } from "svelte-feather-icons";
  import FavoriteButton from './FavoriteButton.svelte';

  import '../styles/components/EventCard.css';

  export let id;
  export let title;
  export let href;
  export let genre = [];
  export let date;
  export let city = [];

  // Zustand
  let user = null;
  let isFavorite = false;
  let isLoading = false;
  let isProcessing = false;
  
  onMount(async () => {
    // Prüfe, ob der Benutzer angemeldet ist
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        user = JSON.parse(storedUser);
        // Prüfe, ob das Event bereits favorisiert ist
        await checkFavoriteStatus();
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    }
  });
  
  // Prüft den Favoritenstatus des Events
  async function checkFavoriteStatus() {
    if (!user) return;
    
    isLoading = true;
    try {
      console.log(`Checking favorite status for post ID: ${id}`);
      const token = localStorage.getItem('authToken');
      
      // Sicherstellen, dass ID als Parameter übergeben wird
      const response = await fetch(`/api/favorites/check?postId=${encodeURIComponent(id)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Favorite check response:`, data);
        isFavorite = data.isFavorite === true;
      } else {
        const errorData = await response.text();
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
  
  // Favorit hinzufügen oder entfernen
  async function toggleFavorite(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user || isProcessing) return;
    
    isProcessing = true;
    try {
      const token = localStorage.getItem('authToken');
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite ? `/api/favorites/remove` : `/api/favorites/add`;
      
      console.log(`Toggle favorite: ${method} to ${url} for post ID: ${id}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: id
        })
      });
      
      if (response.ok) {
        // Aktualisiere den Favoritenstatus
        isFavorite = !isFavorite;
        
        // Zeige ein kurzes Feedback an
        const feedbackText = isFavorite ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt';
        console.log(feedbackText);
      } else {
        const errorData = await response.text();
        console.error('Fehler beim Aktualisieren des Favoriten:', errorData);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Favoriten:', error);
    } finally {
      isProcessing = false;
    }
  }
</script>

<article class="pyrite-card type-event is-small fade-in">
  {#if href}
    <a href={href}><span class="sr-only">{title}</span></a>
  {/if}
  
  <FavoriteButton postId={id} />
  
  <header>
    <hgroup>
      <p>{date}</p>
      <h2 class="is-heading-level-5">{title}</h2>
    </hgroup>
  </header>

  <ul class="meta-chips">
    {#each city as item}
      <li class="meta-chip city" aria-label="Stadt"><MapPinIcon />{item}</li>
    {/each}
    {#each genre as item}
      <li class="meta-chip genre" aria-label="Genre"><MusicIcon />{item}</li>
    {/each}
  </ul>
</article>