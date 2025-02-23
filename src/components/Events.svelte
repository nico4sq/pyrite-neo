<script>
    import { onMount } from "svelte";

    import EventCard from "./EventCard.svelte";
    import {
        fetchEvents,
        fetchLocations,
        fetchEventsByLocationIds,
        fetchCities
    } from "../api/wordpress";

    import { addLoadingState, removeLoadingState } from "../functions/helpers";

    let cities = [];
    let allEvents = [];

    onMount(async () => {
        addLoadingState(document.getElementById("events-list"));
        addLoadingState(document.getElementById("cities-filter"));

        allEvents = await fetchEvents();
        removeLoadingState(document.getElementById("events-list"));

        cities = await fetchCities();
        removeLoadingState(document.getElementById("cities-filter"));
    });

    async function handleFilterChange(event) {
        allEvents = [];
        addLoadingState(document.getElementById("events-list"));

        let locations = await fetchLocations([
            { key: "address_city", value: event.target.value }
        ]);        

        allEvents = await fetchEventsByLocationIds(
            locations.map((location) => location.id)
        );

        removeLoadingState(document.getElementById("events-list"));
    }    
</script>

<form id="events-filter" class="flex flex-row gap-4 lg:gap-6 w-full mb-6">
    <label id="cities-filter" for="cities" class="fade-in flex flex-col gap-3 w-48">
        {#if cities.length > 0}
        <strong class="font-barlow uppercase text-sm sr-only">Städte</strong>
        <select
            id="cities"
            name="cities"
            on:change={handleFilterChange}
            class="p-2 border-1 border-white rounded-lg cursor-pointer">
            <option value="">Alle Städte</option>
            {#each cities as city}
                <option value={city.name}>{city.name}</option>
            {/each}
        </select>
        {/if} 
    </label>
</form>

<ul id="events-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {#each allEvents as event}
        <li class="flex items-stretch h-full">
            <EventCard
                title={event.title}
                href={`/event/${event.slug}`}
                featured_media={event.featured_media}
                date={event.date}
                genre={event.taxonomies}
                city={event.location.city}
            />
        </li>
    {/each}
</ul>
