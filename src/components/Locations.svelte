<script>
    import { onMount } from "svelte";
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchLocations } from "../api/wordpress";
    import LocationCard from "./LocationCard.svelte";

    import "../styles/components/Locations.css";

    export let pagination = false;
    export let currentPage = 1;

    let locations = [];
    let pages = [];
    const perPage = 9;

    onMount(async () => {
        if (pagination) {
            locations = await fetchLocations(perPage, currentPage);

            const totalLocations = await fetchLocations();
            const totalPages = Math.ceil(totalLocations.length / perPage);

            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            locations = await fetchLocations(perPage - 1);
        }
    });
</script>

<ul class="locations-list">
    {#each locations as location}
        <li>
            <LocationCard
                id={location.id}
                title={location.title}
                href={`/location/${location.slug}`}
                featured_media={location.featured_media}
            />
        </li>
    {/each}
</ul>

{#if pagination}
    <nav class="pagination">
        <a
            href="/locations/1"
            class="pagination-link"
            class:disabled={currentPage === 1}
            class:opacity-50={currentPage === 1}
        >
            <FeatherIcons.ChevronsLeftIcon class="icon" />
        </a>
        <a
            href={`/locations/${currentPage - 1}`}
            class="pagination-link"
            class:disabled={currentPage === 1}
            class:opacity-50={currentPage === 1}
        >
            <FeatherIcons.ChevronLeftIcon class="icon" />
        </a>

        {#each pages.slice(Math.max(0, currentPage - 2), Math.min(pages.length, currentPage + 1)) as pageNumber, index}
            {#if (pages.length > 2 && currentPage > 2 && index === 0) || (pages.length > 2 && currentPage === pages.length && index === 0)}
                <span class="pagination-ellipsis"
                    ><FeatherIcons.MoreHorizontalIcon class="icon" /></span
                >
            {/if}

            <a
                href={`/locations/${pageNumber}`}
                class="pagination-link"
                class:disabled={pageNumber === currentPage}
                class:bg-slate-800={pageNumber === currentPage}
            >
                {pageNumber}
            </a>

            {#if (currentPage < pages.length - 2 && index === 2) || (pages.length > 2 && currentPage === 1 && index === 1)}
                <span class="pagination-ellipsis"
                    ><FeatherIcons.MoreHorizontalIcon class="icon" /></span
                >
            {/if}
        {/each}

        <a
            href={`/locations/${currentPage + 1}`}
            class="pagination-link"
            class:disabled={currentPage === pages.length}
            class:opacity-50={currentPage === pages.length}
        >
            <FeatherIcons.ChevronRightIcon class="icon" />
        </a>
        <a
            href={`/locations/${pages.length}`}
            class="pagination-link"
            class:disabled={currentPage === pages.length}
            class:opacity-50={currentPage === pages.length}
        >
            <FeatherIcons.ChevronsRightIcon class="icon" />
        </a>
    </nav>
{/if}
