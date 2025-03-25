<script>
    import Location from "./Location.svelte";

    export let location = [];
</script>

{#if location}
    <Location
        title={location.title}
        href={`/location/${location.slug}`}
        featured_media={location.featured_media}
        address={location.address}
    />
{:else}
    <p class="notification is-info">Keine Location gefunden.</p>
{/if}