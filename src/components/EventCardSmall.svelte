<script>
    import { ImageIcon, MusicIcon, MapPinIcon } from 'svelte-feather-icons';
  
    export let title;
    export let href;
    export let genre = [];
    export let date;
    export let city;
  </script>
  
  <article class="fade-in group relative w-full flex flex-col bg-white dark:bg-neutral-800 text-stone-950 dark:text-white rounded-3xl overflow-clip outline-transparent has-[a:hover]:bg-neutral-700 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-white transition"> 
      <a href={href} class="absolute inset-0"><span class="sr-only">{title}</span></a>
      <header>
        <hgroup class="flex flex-col p-6 gap-2 h-full">
          <p class="text-sm font-bold text-yellow-300">{date}</p>
          <h2 class="text-2xl font-barlow uppercase leading-none font-bold">{title}</h2>
        </hgroup>
      </header>

      <ul class="p-6 pt-0 gap-2 empty:hidden flex flex-wrap mt-auto">
        {#if city}
          <li aria-label="Stadt" class="text-xs border border-yellow-300 bg-yellow-300/20 text-yellow-300 rounded-lg px-2 py-1 flex items-center gap-2"><MapPinIcon class="w-3 h-3 aspect-1 text-yellow-300" />{city}</li>
        {/if}
        {#each genre as item}
          <li aria-label="Genre" class="text-xs border border-neutral-300 bg-neutral-300/20 text-neutral-300 rounded-lg px-2 py-1 flex items-center gap-2"><MusicIcon class="w-3 h-3 aspect-1 text-neutral-300" />{item.name}</li>
        {/each}
      </ul>
  </article>