<script>
    import { onMount } from "svelte";
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchLocations } from "../api/wordpress";
    import LocationCard from "./LocationCard.svelte";
    import Button from "./Button.svelte";

    import "../styles/components/Locations.css";

    export let pagination = false;
    export let currentPage = 1;
    export let paginationRange = [];

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

        paginationRange = getPaginationRange();
    });

    function getPaginationRange() {
        const totalPages = pages.length;
        if (totalPages <= 3) {
            return pages;
        }

        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage === 1) {
            endPage = Math.min(totalPages, 3);
        } else if (currentPage === totalPages) {
            startPage = Math.max(1, totalPages - 2);
        }

        return pages.slice(startPage - 1, endPage);
    }
</script>

<ul class="locations-list">
    {#each locations as location}
        <li class="location-item">
            <LocationCard
                id={location.id}
                title={location.title}
                href={`/location/${location.slug}`}
                featured_media={location.featured_media}
            />
        </li>
    {/each}
</ul>

{#if pagination && pages.length > 0}
    <nav class="pagination">
        <Button
            label=""
            disabled={currentPage === 1}
            interaction={{
                type: "link",
                target: currentPage === 1 ? null : "/locations/1"
            }}
            icon={{ name: "ChevronsLeftIcon", only: true }}
            customClasses={["pagination-button"]}
        />
        <Button
            label=""
            disabled={currentPage === 1}
            interaction={{
                type: "link",
                target:
                    currentPage === 1 ? null : `/locations/${currentPage - 1}`
            }}
            icon={{ name: "ChevronLeftIcon", only: true }}
            customClasses={["pagination-button"]}
        />

        {#if currentPage > 2 && pages.length > 3}
            <span class="pagination-ellipsis"
                ><FeatherIcons.MoreHorizontalIcon class="icon" /></span
            >
        {/if}

        {#each paginationRange as pageNumber}
            {#if pageNumber === currentPage}
                <span class="pagination-link active">
                    {pageNumber}
                </span>
            {:else}
                <a href={`/locations/${pageNumber}`} class="pagination-link">
                    {pageNumber}
                </a>
            {/if}
        {/each}

        {#if currentPage < pages.length - 1 && pages.length > 3}
            <span class="pagination-ellipsis"
                ><FeatherIcons.MoreHorizontalIcon class="icon" /></span
            >
        {/if}

        <Button
            label=""
            disabled={currentPage === pages.length}
            interaction={{
                type: "link",
                target:
                    currentPage === pages.length
                        ? null
                        : `/locations/${currentPage + 1}`
            }}
            icon={{ name: "ChevronRightIcon", only: true }}
            customClasses={["pagination-button"]}
        />
        <Button
            label=""
            disabled={currentPage === pages.length}
            interaction={{
                type: "link",
                target:
                    currentPage === pages.length
                        ? null
                        : `/locations/${pages.length}`
            }}
            icon={{ name: "ChevronsRightIcon", only: true }}
            customClasses={["pagination-button"]}
        />
    </nav>
{/if}
