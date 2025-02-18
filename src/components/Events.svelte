<script>
    import { onMount } from "svelte";

    import EventCard from "./EventCard.svelte";
    import {
        fetchEventsWithMetaQueries,
        fetchLocationsWithMetaQueries,
        fetchEventsByLocationIds,
        fetchCities
    } from "../api/wordpress";

    import { addLoadingState, removeLoadingState } from "../functions/helpers";

    let cities = [];
    let allEvents = [];

    onMount(async () => {
        addLoadingState(document.getElementById("allEvents-list"));

        allEvents = await fetchEventsWithMetaQueries();
        cities = await fetchCities();
        
        removeLoadingState(document.getElementById("allEvents-list"));
    });

    async function handleFilterChange(event) {
        allEvents = [];
        addLoadingState(document.getElementById("allEvents-list"));

        let locations = await fetchLocationsWithMetaQueries([
            { key: "city", value: event.target.value }
        ]);

        allEvents = await fetchEventsByLocationIds(
            locations.map((location) => location.id)
        );

        removeLoadingState(document.getElementById("allEvents-list"));
    }    
</script>

<form id="allEvents-filter">
    {#if cities.length > 0}
        <label for="cities" class="flex flex-col gap-3"
            ><strong class="font-barlow uppercase text-sm sr-only">Städte</strong>
            <select
                id="cities"
                name="cities"
                on:change={handleFilterChange}
                class="p-2 outline outline-neutral-950 border-r-8 border-r-transparent dark:outline-white rounded-lg cursor-pointer"
            >
                <option value="">Alle Städte</option>
                {#each cities as city}
                    <option value={city}>{city}</option>
                {/each}
            </select>
        </label>
    {/if}
</form>

<div id="allEvents-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {#each allEvents as event}
        <EventCard
            title={event.title}
            href={`/event/${event.slug}`}
            featured_media={event.featured_media}
            date={event.date}
            genre={event.taxonomies}
            city={event.location.city}
        />
    {/each}
</div>
