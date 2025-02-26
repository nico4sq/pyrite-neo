<script>
    import { onMount } from "svelte";

    import EventCardSmall from "./EventCardSmall.svelte";
    import Input from "./Input.svelte";
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
    let events = false;
    let selectedCity = "";
    let selectedGenre = "";
    let selectedDates = {};

    onMount(async () => {
        cities = await fetchCities();
        genres = await fetchGenres();
        events = await fetchEvents();
    });

    async function handleFilterChange() {
        events = false;

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

        if (selectedDates.from) {
            metaQueries.push({ key: "info_date", value: selectedDates.from, compare: ">=", type: "DATE" });
        }

        if (selectedDates.to) {
            metaQueries.push({ key: "info_date", value: selectedDates.to, compare: "<=", type: "DATE" });
        }

        events = await fetchEvents(null, null, metaQueries, taxQueries);
    }
</script>

<form id="events-filter" class="flex flex-col md:flex-row flex-wrap gap-4 lg:gap-6 w-full mb-6">

    <Input
        type="daterange"
        id="date"
        label="Datumsbereich"
        floating={true}
        placeholder="Zeitraum wählen"
        bind:value={selectedDates}
        on:change={handleFilterChange}
    />

    <Input
        type="select"
        id="cities"
        label="Städte"
        floating={true}
        options={[
            { value: "", label: "Alle Städte" },
            ...cities.map((city) => {
            return {
                value: city.name,
                label: city.name
            };
            })
        ]}
        bind:value={selectedCity}
        on:change={handleFilterChange}
    />

    <Input
        type="select"
        id="genres"
        label="Genres"
        floating={true}
        options={[
            { value: "", label: "Alle Genres" },
            ...genres.map((genre) => {
            return {
                value: genre.id,
                label: genre.name
            };
            })
        ]}
        bind:value={selectedGenre}
        on:change={handleFilterChange}
    />
</form>

<ul id="events-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {#if events !== false}
        {#if events.length > 0}
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
        {:else}
            <li class="w-full">
                <p class="text-center text-lg font-bold">Keine Events gefunden</p>
            </li>
        {/if}
    {:else}
        <li class="w-full">
            <p class="text-xs rounded-lg py-4 flex gap-4 text-balance"><span class="flex items-center justify-center rounded-full w-4 h-4 animate-ping bg-yellow-400/40 before:bg-yellow-400 before:rounded-full before:w-2 before:h-2"></span>Gib uns eine Sekunde Zeit, um Events für dich zu laden...</p>
        </li>
    {/if}
</ul>