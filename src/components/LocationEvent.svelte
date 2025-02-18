<script>
    import { Image } from 'astro:assets';
    import * as AstroFeather from 'astro-feather';

    export let name;
    export let slug;
    export let image;
    export let date;
</script>

<article class="relative group flex gap-4 items-center not-last:mb-6">
    <a href={`/event/${slug}`} class="absolute inset-0 z-10"><span class="sr-only">{name}</span></a>
    <figure class="aspect-1/1 object-cover overflow-clip w-12 min-w-12 rounded-full bg-neutral-600 group-hover:scale-110 transition-transform">
        {#if image}
            <img width="48" height="48" class="size-full h-full object-cover object-center" src={image} alt="" />
        {:else}
            <AstroFeather.CalendarIcon customClasses="w-4 h-4 aspect-1 text-neutral-700" />
        {/if}
    </figure>
    <div>
        <p class="text-xs pb-1">{ date }</p>
        <p class="font-bold">{ name }</p>
    </div>  
</article>