<script>
    import { ImageIcon, MusicIcon } from 'svelte-feather-icons';
  
    export let title;
    export let href;
    export let featured_media;
    export let genre = [];
    export let date;
  </script>
  
  <article class="fade-in group relative flex flex-col bg-white dark:bg-neutral-800 text-stone-950 dark:text-white rounded-3xl overflow-clip">
    <figure class="relative aspect-3/2 size-full overflow-clip bg-neutral-600 flex items-center justify-center">
      {#if featured_media}
        <img width="600" height="400" src={featured_media} alt={title} class="group-has-[a:hover]:scale-110 transition aspect-3/2 size-full object-cover object-center" />
      {:else}
        <ImageIcon class="w-4 h-4 aspect-1 text-neutral-700" />
      {/if}

      {#if href}
        <a href={href} class="absolute inset-0"><span class="sr-only">{ title }</span></a>
      {/if}
    </figure>
  
      <header>
        <hgroup class="flex flex-col p-6 gap-2 h-full">
          <p class="text-sm font-bold text-yellow-300">{date}</p>
          <h2 class="text-2xl font-barlow uppercase leading-none font-bold">{title}</h2>
        </hgroup>
      </header>

      <ul class="p-6 pt-0 gap-2 empty:hidden flex flex-wrap">
        {#each genre as item}
          <li class="text-xs bg-neutral-600 text-white rounded-md px-2 py-1 flex gap-2"><MusicIcon class="w-4 h-4 aspect-1 text-neutral-400" />{item.name}</li>
        {/each}
      </ul>
  </article>