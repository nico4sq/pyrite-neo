<script>
    import * as FeatherIcons from 'svelte-feather-icons';
  
    export let id;
    export let title;
    export let href;
    export let featured_media;

    import { onMount } from 'svelte';
    import { fetchLocationEventsNumber } from '../api/wordpress';

    let upcomingEventsCount = false;

    onMount(async () => {
      try {
        upcomingEventsCount = await fetchLocationEventsNumber(id);

      } catch (error) {
        console.error('Error fetching artist events:', error);

        upcomingEventsCount = 0;
      }
    });
  </script>
  
  <article class="fade-in group relative w-full flex flex-col bg-white dark:bg-neutral-800 text-slate-950 dark:text-white rounded-3xl overflow-clip outline-transparent has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-white transition">
    <figure class="relative aspect-3/2 w-full overflow-clip bg-slate-600 flex items-center justify-center">
      {#if featured_media}
        <img width="600" height="400" src={featured_media} alt={title} class="group-has-[a:hover]:scale-110 group-has-[a:focus]:scale-110 transition aspect-3/2 w-full object-cover object-center" />
      {:else}
        <FeatherIcons.ImageIcon class="w-8 h-8 aspect-1 text-slate-400" />
      {/if}

      {#if href}
        <a href={href} class="absolute inset-0"><span class="sr-only">{ title }</span></a>
      {/if}
    </figure>
  
      <header>
        <hgroup class="flex flex-col p-6 gap-2 h-full">
          <h2 class="text-2xl font-barlow uppercase leading-none font-bold">{title}</h2>
          {#if upcomingEventsCount === false}
            <p class="w-fit text-xs border border-slate-300 bg-slate-300/20 text-slate-300 rounded-lg px-2 py-1 flex items-center gap-2">Lade Events...</p>
          {:else if upcomingEventsCount === 0}
            <p class="w-fit text-xs border border-indigo-300 bg-indigo-300/20 text-indigo-300 rounded-lg px-2 py-1 flex items-center gap-2">Keine Events</p>
          {:else if upcomingEventsCount === 1}
            <p class="w-fit text-xs border border-lime-300 bg-lime-300/20 text-lime-300 rounded-lg px-2 py-1 flex items-center gap-2">{upcomingEventsCount} Event</p>
          {:else}
            <p class="w-fit text-xs border border-lime-300 bg-lime-300/20 text-lime-300 rounded-lg px-2 py-1 flex items-center gap-2">{upcomingEventsCount} Events</p>
          {/if}
        </hgroup>
      </header>
  </article>