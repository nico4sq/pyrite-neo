<script>
  import { onMount } from "svelte";
  import { BookmarkIcon, ImageIcon, MusicIcon, MapPinIcon } from "svelte-feather-icons";
  import FavoriteButton from './FavoriteButton.svelte';

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

<article class="fade-in group relative w-full flex flex-col bg-white dark:bg-neutral-800 text-slate-950 dark:text-white rounded-3xl overflow-clip outline-transparent has-[a:hover]:bg-slate-100 dark:has-[a:hover]:bg-slate-700 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-white transition">
  {#if href}
    <a href={href} class="absolute inset-0"><span class="sr-only">{title}</span></a>
  {/if}
  
  <FavoriteButton postId={id} />
  
  <header>
    <hgroup class="flex flex-col p-6 gap-2 h-full">
      <p class="text-sm font-bold text-indigo-600 dark:text-indigo-300">{date}</p>
      <h2 class="text-xl font-barlow uppercase leading-[1.2] line-clamp-2 font-bold text-neutral-900 dark:text-white">{title}</h2>
    </hgroup>
  </header>

  <ul class="p-6 pt-0 gap-2 empty:hidden flex flex-wrap mt-auto">
    {#if Array.isArray(city) && city.length > 0}
      {#each city as item}
        <li aria-label="Stadt" class="text-xs border border-indigo-600 dark:border-indigo-300 bg-indigo-600/10 dark:bg-indigo-300/20 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-1 flex items-center gap-2"><MapPinIcon class="w-3 h-3 aspect-1 text-indigo-600 dark:text-indigo-300" />{item}</li>
      {/each}
    {/if}
    {#if Array.isArray(genre) && genre.length > 0}
      {#each genre as item}
        <li aria-label="Genre" class="text-xs border border-slate-500 dark:border-slate-300 bg-slate-500/10 dark:bg-slate-300/20 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 flex items-center gap-2"><MusicIcon class="w-3 h-3 aspect-1 text-slate-500 dark:text-slate-300" />{item}</li>
      {/each}
    {/if}
  </ul>
</article>