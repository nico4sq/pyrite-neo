<script>
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchGenres } from "../api/wordpress";

    import "../styles/components/Genres.css";
    import "../styles/components/LinkTile.css";

    import { onMount } from "svelte";
    let genres = [];

    onMount(async () => {
        genres = await fetchGenres();
    });
</script>

<ul class="pyrite-genres">
    {#each genres as genre}
        <li class="genre-item fade-in">
            <a href={`/genre/${genre.slug}`}
                ><span class="sr-only">{genre.name}</span></a
            >
            <p>{genre.name}</p>
            <FeatherIcons.DiscIcon />
        </li>
    {/each}

    <li class="link-tile is-small fade-in">
        <a href="/eventfinder"><span class="sr-only">Zum Eventfinder</span></a>
        <p>Eventfinder</p>
        <FeatherIcons.ArrowRightIcon />
    </li>
</ul>
