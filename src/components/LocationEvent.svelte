<script>
    import { CalendarIcon } from 'svelte-feather-icons';

    import '../styles/components/LocationEvent.css';

    export let name;
    export let slug;
    export let image;
    export let date;
</script>

<article class="location-event-item">
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
            <li class="meta-chip" aria-label="Datum"><CalendarIcon />{date}</li>
        </ul>
    </div>  
</article>