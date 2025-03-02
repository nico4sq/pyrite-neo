<script>
    import { ImageIcon, MusicIcon, MapPinIcon } from 'svelte-feather-icons';
  
    export let title;
    export let href;
    export let genre = [];
    export let date;
    export let city;
  </script>
  
  <article class="fade-in group relative w-full flex flex-col bg-white dark:bg-neutral-800 text-slate-950 dark:text-white rounded-3xl overflow-clip outline-transparent has-[a:hover]:bg-slate-100 dark:has-[a:hover]:bg-slate-700 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-white transition"> 
      <a href={href} class="absolute inset-0"><span class="sr-only">{title}</span></a>
      <header>
        <hgroup class="flex flex-col p-6 gap-2 h-full">
          <p class="text-sm font-bold text-indigo-600 dark:text-indigo-300">{date}</p>
          <h2 class="text-xl font-barlow uppercase leading-[1.2] line-clamp-2 font-bold text-neutral-900 dark:text-white">{title}</h2>
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