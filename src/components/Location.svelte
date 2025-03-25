<script>
    import * as FeatherIcons from 'svelte-feather-icons';

    import '../styles/components/Location.css';

    export let title;
    export let href;
    export let featured_media;
    export let address;
</script>

<article class="location-item">
    <a href={href}><span class="sr-only">{title}</span></a>
    <figure>
        {#if featured_media} 
            <img width="64" height="64" src={featured_media} alt={title} />
        {:else}
            <FeatherIcons.HomeIcon />
        {/if}
    </figure>
    <header>
        <hgroup>
            <p>{title}</p>
            <p>{address}</p>
        </hgroup>
    </header>
</article>