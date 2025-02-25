<script>
    import { onMount } from "svelte";

    import EventCardSmall from "./EventCardSmall.svelte";
    import {
        fetchEvents,
        fetchLocations,
        fetchEventsByLocationIds,
        fetchCities,
        fetchGenres
    } from "../api/wordpress";

    import { addLoadingState, removeLoadingState } from "../functions/helpers";

    let cities = [];
    let genres = [];
    let events = [];
    let selectedCity = "";
    let selectedGenre = "";

    onMount(async () => {
        addLoadingState(document.getElementById("events-list"));
        addLoadingState(document.getElementById("cities-filter"));
        addLoadingState(document.getElementById("genres-filter"));

        events = await fetchEvents();
        removeLoadingState(document.getElementById("events-list"));

        cities = await fetchCities();
        removeLoadingState(document.getElementById("cities-filter"));

        genres = await fetchGenres();
        removeLoadingState(document.getElementById("genres-filter"));
    });

    async function handleFilterChange() {
        addLoadingState(document.getElementById("events-list"));

        let metaQueries = [];
        let taxQueries = [];

        if (selectedCity) {          
        
        let locations = await fetchLocations(null, null, [
                { key: "address_city", value: selectedCity }
            ]);
            if (locations.length > 0) {
                let subQueries = { relation: 'OR', queries: [] };
                locations.forEach((location) => {
                    subQueries.queries.push({ key: "location", value: location.id, compare: "IN" });
                });
                metaQueries.push(subQueries);
            }
        }

        if (selectedGenre) {
            taxQueries.push({ taxonomy: "genre", field: "term_id", terms: selectedGenre });
        }

        events = await fetchEvents(null, null, metaQueries, taxQueries);
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
            bind:value={selectedCity}
            on:change={handleFilterChange}
            class="p-2 outline-1 outline-white outline-offset-0! border-r-8 border-transparent rounded-lg cursor-pointer">
            <option value="">Alle Städte</option>
            {#each cities as city}
                <option value={city.name}>{city.name}</option>
            {/each}
        </select>
        {/if} 
    </label>

    <label id="genres-filter" for="genres" class="fade-in flex flex-col gap-3 w-48">
        {#if genres.length > 0}
        <strong class="font-barlow uppercase text-sm sr-only">Genres</strong>
        <select
            id="genres"
            name="genres"
            bind:value={selectedGenre}
            on:change={handleFilterChange}
            class="p-2 outline-1 outline-white outline-offset-0! border-r-8 border-transparent rounded-lg cursor-pointer">
            <option value="">Alle Genres</option>
            {#each genres as genre}
                <option value={genre.id}>{genre.name}</option>
            {/each}
        </select>
        {/if} 
    </label>
</form>

<ul id="events-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {#each events as event}
        <li class="flex items-stretch h-full">
            <EventCardSmall
                title={event.title}
                href={`/event/${event.slug}`}
                date={event.date}
                genre={event.taxonomies}
                city={event.location.city}
            />
        </li>
    {/each}
</ul>