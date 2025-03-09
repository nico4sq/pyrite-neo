<script>
  import { onMount } from 'svelte';
  import { ImageIcon, MusicIcon, MapPinIcon, HeartIcon } from 'svelte-feather-icons';

  export let id;
  export let title;
  export let href;
  export let featured_media;
  export let genre = [];
  export let date;
  export let city;
  
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/favorites/check?eventId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        isFavorite = data.isFavorite;
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Favoritenstatus:', error);
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
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: id,
          userId: user.id
        })
      });
      
      if (response.ok) {
        // Aktualisiere den Favoritenstatus
        isFavorite = !isFavorite;
        
        // Zeige ein kurzes Feedback an
        const feedbackText = isFavorite ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt';
        // Optional: Toast-Benachrichtigung anzeigen
        console.log(feedbackText);
      } else {
        console.error('Fehler beim Aktualisieren des Favoriten');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Favoriten:', error);
    } finally {
      isProcessing = false;
    }
  }
</script>

<article data-id={id} class="fade-in group relative w-full flex flex-col bg-slate-50 dark:bg-neutral-800 text-slate-950 dark:text-white rounded-3xl overflow-clip outline-transparent has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-indigo-400 dark:has-[a:focus-visible]:outline-white transition">
<figure class="relative aspect-3/2 w-full overflow-clip bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
  {#if featured_media}
    <img width="600" height="400" src={featured_media} alt={title} class="group-has-[a:hover]:scale-110 group-has-[a:focus]:scale-110 transition aspect-3/2 w-full object-cover object-center" />
  {:else}
    <ImageIcon class="w-4 h-4 aspect-1 text-slate-500 dark:text-slate-700" />
  {/if}

  {#if href}
    <a href={href} class="absolute inset-0"><span class="sr-only">{ title }</span></a>
  {/if}
  
  <!-- Herz-Icon zum Favorisieren (nur für angemeldete Benutzer) -->
  {#if user}
    <button 
      on:click={toggleFavorite} 
      class="absolute top-3 right-3 z-10 bg-white dark:bg-neutral-700 rounded-full p-2 shadow-md hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
      aria-label={isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      disabled={isProcessing}
    >
      <HeartIcon 
        class="w-5 h-5 {isFavorite ? 'text-red-500 fill-current' : 'text-neutral-500 dark:text-neutral-300'}" 
      />
    </button>
  {/if}
</figure>

<header>
  <hgroup class="flex flex-col p-6 gap-2 h-full">
    <p class="text-sm font-bold text-indigo-600 dark:text-indigo-300">{date}</p>
    <h2 class="text-2xl font-barlow uppercase leading-[1.2] line-clamp-2 font-bold text-neutral-900 dark:text-white">{title}</h2>
  </hgroup>
</header>

<ul class="p-6 pt-0 gap-2 empty:hidden flex flex-wrap mt-auto">
  {#each city as item}
    <li aria-label="Stadt" class="text-xs border border-indigo-600 dark:border-indigo-300 bg-indigo-600/10 dark:bg-indigo-300/20 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-1 flex items-center gap-2"><MapPinIcon class="w-3 h-3 aspect-1 text-indigo-600 dark:text-indigo-300" />{item}</li>
  {/each}
  {#each genre as item}
    <li aria-label="Genre" class="text-xs border border-slate-500 dark:border-slate-300 bg-slate-500/10 dark:bg-slate-300/20 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 flex items-center gap-2"><MusicIcon class="w-3 h-3 aspect-1 text-slate-500 dark:text-slate-300" />{item}</li>
  {/each}
</ul>
</article>

<style>
  /* Animation für Herz-Icon beim Favorisieren */
  button:not(:disabled):active svg {
    transform: scale(1.3);
    transition: transform 0.2s;
  }
  
  /* Verhindern, dass der Klick auf den Button auch den Link aktiviert */
  button {
    isolation: isolate;
  }
</style>