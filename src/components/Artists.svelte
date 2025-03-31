<script>
    import { onMount } from "svelte";
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchArtists } from "../api/wordpress";
    import ArtistCard from "./ArtistCard.svelte";
    import Button from "./Button.svelte";

    import "../styles/components/Artists.css";

    export let pagination = false;
    export let currentPage = 1;
    export let paginationRange = [];

    let artists = [];
    let pages = [];
    const perPage = 9;

    onMount(async () => {
        if (pagination) {
            artists = await fetchArtists(perPage, currentPage);

            const totalArtists = await fetchArtists();
            const totalPages = Math.ceil(totalArtists.length / perPage);

            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            artists = await fetchArtists(perPage - 1);
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

<ul class="artists-list">
    {#each artists as artist}
        <li class="artist-item">
            <ArtistCard
                id={artist.id}
                title={artist.title}
                href={`/artist/${artist.slug}`}
                featured_media={artist.featured_media}
            />
        </li>
    {/each}
</ul>

{#if pagination && pages.length > 0}
    <nav class="pagination">
        <Button
            label=""
            type="primary"
            disabled={currentPage === 1}
            interaction={{
                type: "link",
                target: currentPage === 1 ? null : "/artists/1"
            }}
            icon={{ name: "ChevronsLeftIcon", only: true }}
            customClasses={["pagination-button"]}
        />
        <Button
            label=""
            type="primary"
            disabled={currentPage === 1}
            interaction={{
                type: "link",
                target: currentPage === 1 ? null : `/artists/${currentPage - 1}`
            }}
            icon={{ name: "ChevronLeftIcon", only: true }}
            customClasses={["pagination-button"]}
        />

        {#each paginationRange as pageNumber}
            {#if pageNumber === currentPage}
                <span class="pagination-link active">
                    {pageNumber}
                </span>
            {:else}
                <a href={`/artists/${pageNumber}`} class="pagination-link">
                    {pageNumber}
                </a>
            {/if}
        {/each}

        <Button
            label=""
            type="primary"
            disabled={currentPage === pages.length}
            interaction={{
                type: "link",
                target:
                    currentPage === pages.length
                        ? null
                        : `/artists/${currentPage + 1}`
            }}
            icon={{ name: "ChevronRightIcon", only: true }}
            customClasses={["pagination-button"]}
        />
        <Button
            label=""
            type="primary"
            disabled={currentPage === pages.length}
            interaction={{
                type: "link",
                target:
                    currentPage === pages.length
                        ? null
                        : `/artists/${pages.length}`
            }}
            icon={{ name: "ChevronsRightIcon", only: true }}
            customClasses={["pagination-button"]}
        />
    </nav>
{/if}
