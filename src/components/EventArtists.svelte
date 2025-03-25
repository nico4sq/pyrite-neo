<script>
    import Artist from "./Artist.svelte";
    import '../styles/components/EventArtists.css';

    export let artists = [];
</script>

{#if artists.length > 0}
    <ul class="event-artists">
        {#each artists as artist}
            <li>
                <Artist
                    title={artist.title}
                    href={`/artist/${artist.slug}`}
                    featured_media={artist.featured_media}
                />
            </li>
        {/each}
    </ul>
{:else}
    <p class="text-xs">Keine Künstler gefunden.</p>
{/if}