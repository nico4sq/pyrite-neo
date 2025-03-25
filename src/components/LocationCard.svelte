<script>
    import "../styles/components/LocationCard.css";

    export let id;
    export let title;
    export let href;
    export let featured_media;

    import { onMount } from "svelte";
    import { fetchLocationEventsNumber } from "../api/wordpress";

    let upcomingEventsCount = false;

    onMount(async () => {
        try {
            upcomingEventsCount = await fetchLocationEventsNumber(id);
        } catch (error) {
            console.error("Error fetching artist events:", error);

            upcomingEventsCount = 0;
        }
    });
</script>

<article class="pyrite-card type-location fade-in">
    <figure>
        {#if featured_media}
            <img width="600" height="400" src={featured_media} alt={title} />
        {/if}

        {#if href}
            <a {href}><span class="sr-only">{title}</span></a>
        {/if}
    </figure>

    <header>
        <hgroup>
            <h2 class="is-heading-level-5">{title}</h2>
        </hgroup>
    </header>

    <ul class="meta-chips">
        {#if upcomingEventsCount === false}
            <li class="meta-chip loading">Lade Events...</li>
        {:else if upcomingEventsCount === 0}
            <li class="meta-chip none">Keine Events</li>
        {:else if upcomingEventsCount === 1}
            <li class="meta-chip found">{upcomingEventsCount} Event</li>
        {:else}
            <li class="meta-chip found">{upcomingEventsCount} Events</li>
        {/if}
    </ul>
</article>
