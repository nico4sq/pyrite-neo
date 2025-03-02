<script>
    import * as FeatherIcons from 'svelte-feather-icons';

    export let name;
    export let slug;
    export let image;
    export let date;
</script>

<article class="relative group flex gap-4 items-start not-last:mb-6">
    <a href={`/event/${slug}`} class="absolute inset-0 z-10"><span class="sr-only">{name}</span></a>
    <figure class="flex items-center justify-center aspect-1/1 object-cover overflow-clip w-16 min-w-16 rounded-full bg-slate-600 group-hover:scale-110 transition-transform">
        {#if image}
            <img width="48" height="48" class="size-full h-full object-cover object-center" src={image} alt="" />
        {:else}
            <FeatherIcons.CalendarIcon class="w-4 h-4 aspect-1 text-slate-600" />
        {/if}
    </figure>
    <div class="pt-1">
        <p class="font-bold text-sm text-slate-950 dark:text-white">{ name }</p>
        <ul class="gap-2 empty:hidden flex flex-wrap mt-1">
            <li aria-label="Stadt" class="text-xs border border-slate-600 dark:border-slate-300 bg-slate-600/20 dark:bg-slate-300/20 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 flex items-center gap-2"><FeatherIcons.CalendarIcon class="w-3 h-3 aspect-1 dark:text-slate-300" />{date}</li>
        </ul>
    </div>  
</article>