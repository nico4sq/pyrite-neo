<script>
    import * as FeatherIcons from 'svelte-feather-icons';

    export let name;
    export let slug;
    export let image;
    export let date;
    export let city;
</script>

<article class="relative group flex gap-4 items-start not-last:mb-6">
    <a href={`/event/${slug}`} class="absolute inset-0 z-10"><span class="sr-only">{name}</span></a>
    <figure class="flex items-center justify-center aspect-1/1 object-cover overflow-clip w-16 min-w-16 rounded-full bg-neutral-600 group-hover:scale-110 transition-transform">
        {#if image}
            <img width="48" height="48" class="size-full h-full object-cover object-center" src={image} alt="" />
        {:else}
            <FeatherIcons.CalendarIcon class="w-4 h-4 aspect-1 text-neutral-700" />
        {/if}
    </figure>
    <div class="pt-1">
        <p class="font-bold">{ name }</p>
        <ul class="gap-2 empty:hidden flex flex-wrap mt-1">
            {#if city}
                <li aria-label="Stadt" class="text-xs border border-yellow-300 bg-yellow-300/20 text-yellow-300 rounded-lg px-2 py-1 flex items-center gap-2"><FeatherIcons.MapPinIcon class="w-3 h-3 aspect-1 text-yellow-300" />{city}</li>
            {/if}
            <li aria-label="Stadt" class="text-xs border border-neutral-300 bg-neutral-300/20 text-neutral-300 rounded-lg px-2 py-1 flex items-center gap-2"><FeatherIcons.CalendarIcon class="w-3 h-3 aspect-1 text-neutral-300" />{date}</li>
        </ul>
    </div>  
</article>