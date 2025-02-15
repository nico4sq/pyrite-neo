<script>
    import * as FeatherIcons from 'svelte-feather-icons';

    export let title;
    export let href;
    export let featured_media;
    export let address;
</script>

<article class="relative group flex items-center gap-4">
    <a href={href} class="absolute inset-0 z-10"><span class="sr-only">{title}</span></a>
    <figure class="aspect-1/1 object-cover overflow-clip w-12 rounded-full bg-neutral-600 group-hover:scale-110 transition-transform flex items-center justify-center">
        {#if featured_media} 
            <img width="48" height="48" src={featured_media} alt={title} class="size-full h-full object-cover object-center" />
        {:else}
            <FeatherIcons.HomeIcon class="w-4 h-4 aspect-1 text-neutral-700" />
        {/if}
    </figure>
    <header>
        <hgroup class="flex flex-col">
            <p class="font-bold">{title}</p>
            <p class="text-sm">{address}</p>
        </hgroup>
    </header>
</article>