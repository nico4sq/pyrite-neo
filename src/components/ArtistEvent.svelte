<script>
    import { CalendarIcon, MapPinIcon } from 'svelte-feather-icons';

    import '../styles/components/ArtistEvent.css';

    export let name;
    export let slug;
    export let image;
    export let date;
    export let city;
</script>

<article class="artist-event-item">
    <a href={`/event/${slug}`}><span class="sr-only">{name}</span></a>
    <figure>
        {#if image}
            <img width="48" height="48" src={image} alt="" />
        {:else}
            <CalendarIcon />
        {/if}
    </figure>
    <div>
        <p>{ name }</p>
        <ul class="meta-chips">
            {#if city}
                <li class="meta-chip" aria-label="Stadt"><MapPinIcon />{city}</li>
            {/if}
            <li class="meta-chip" aria-label="Datum"><CalendarIcon />{date}</li>
        </ul>
    </div>  
</article>