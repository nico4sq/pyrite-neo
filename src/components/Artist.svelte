<script>
    import * as FeatherIcons from 'svelte-feather-icons';

    import '../styles/components/Artist.css';

    export let title;
    export let href;
    export let featured_media;
</script>

<article class="artist-item">
    <a href={href} class="absolute inset-0 z-10"><span class="sr-only">{title}</span></a>
    <figure class="aspect-1/1 object-cover overflow-clip w-16 min-w-16 rounded-full bg-neutral-700 group-hover:scale-110 transition-transform flex items-center justify-center">
        {#if featured_media} 
            <img width="64" height="64" src={featured_media} alt={title} class="size-full h-full object-cover object-center" />
        {:else}
            <FeatherIcons.MusicIcon class="w-4 h-4 aspect-1 text-neutral-600" />
        {/if}
    </figure>
    <p class="font-bold">{title}</p>
</article>
