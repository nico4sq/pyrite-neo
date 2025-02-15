<script>
    import Artist from "./Artist.svelte";

    export let artists = [];
</script>

{#if artists.length > 0}
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
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