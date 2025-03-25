<script>
    import { onMount } from "svelte";
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchArtists } from "../api/wordpress";
    import ArtistCard from "./ArtistCard.svelte";

    import "../styles/components/Artists.css";

    export let pagination = false;
    export let currentPage = 1;

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
    });
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

{#if pagination}
    <nav class="pagination">
        <a
            href="/artists/1"
            class="pagination-link"
            class:pointer-events-none={currentPage === 1}
            class:opacity-50={currentPage === 1}
        >
            <FeatherIcons.ChevronsLeftIcon class="icon" />
        </a>
        <a
            href={`/artists/${currentPage - 1}`}
            class="pagination-link"
            class:pointer-events-none={currentPage === 1}
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
                href={`/artists/${pageNumber}`}
                class="pagination-link"
                class:pointer-events-none={pageNumber === currentPage}
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
            href={`/artists/${currentPage + 1}`}
            class="pagination-link"
            class:pointer-events-none={currentPage === pages.length}
            class:opacity-50={currentPage === pages.length}
        >
            <FeatherIcons.ChevronRightIcon class="icon" />
        </a>
        <a
            href={`/artists/${pages.length}`}
            class="pagination-link"
            class:pointer-events-none={currentPage === pages.length}
            class:opacity-50={currentPage === pages.length}
        >
            <FeatherIcons.ChevronsRightIcon class="icon" />
        </a>
    </nav>
{/if}
