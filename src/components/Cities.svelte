<script>
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchCities } from "../api/wordpress";

    import "../styles/components/Cities.css";
    import "../styles/components/LinkTile.css";

    import { onMount } from "svelte";
    let cities = [];

    onMount(async () => {
        cities = await fetchCities();
    });
</script>

<ul class="pyrite-cities">
    {#each cities as city}
        <li class="city-item fade-in">
            <a href={`/city/${city.slug}`}
                ><span class="sr-only">{city.name}</span></a
            >
            <p>{city.name}</p>
            <FeatherIcons.MapIcon />
        </li>
    {/each}

    <li class="link-tile is-small fade-in">
        <a href="/eventfinder"><span class="sr-only">Zum Eventfinder</span></a>
        <p>Eventfinder</p>
        <FeatherIcons.ArrowRightIcon />
    </li>
</ul>
