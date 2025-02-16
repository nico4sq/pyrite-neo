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
    let events = [];

    async function loadAllEvents() {
        return await fetchEventsWithMetaQueries();
    }

    onMount(async () => {
        addLoadingState(document.getElementById("events-list"));

        events = await loadAllEvents();
        cities = await fetchCities();

        removeLoadingState(document.getElementById("events-list"));
    });

    async function handleFilterChange(event) {
        events = [];
        addLoadingState(document.getElementById("events-list"));

        let locations = await fetchLocationsWithMetaQueries([
            { key: "address_city", value: event.target.value }
        ]);

        events = await fetchEventsByLocationIds(
            locations.map((location) => location.id)
        );

        removeLoadingState(document.getElementById("events-list"));
    }    
</script>

<form id="events-filter">
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
</form>

<div id="events-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {#each events as event}
        <EventCard
            title={event.title}
            href={`/event/${event.slug}`}
            featured_media={event.featured_media}
            date={event.date}
            genre={event.taxonomies}
            city={event.location.meta.address_city}
        />
    {/each}
</div>
