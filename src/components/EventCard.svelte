<script>
  import { ImageIcon, MusicIcon, MapPinIcon } from 'svelte-feather-icons';
  import FavoriteButton from './FavoriteButton.svelte';

  import '../styles/components/EventCard.css';

  export let id;
  export let title;
  export let href;
  export let featured_media;
  export let genre = [];
  export let date;
  export let city;
</script>

<article data-id={id} class="pyrite-card type-event fade-in">
  <figure>
    {#if featured_media}
      <img width="600" height="400" src={featured_media} alt={title} />
    {/if}

    {#if href}
      <a href={href}><span class="sr-only">{ title }</span></a>
    {/if}
    
    <!-- Nutze die FavoriteButton-Komponente -->
    <FavoriteButton postId={id} />
  </figure>

  <header>
    <hgroup>
      <p>{date}</p>
      <h2 class="is-heading-level-5">{title}</h2>
    </hgroup>
  </header>

  <ul class="meta-chips">
    {#each city as item}
      <li class="meta-chip city" aria-label="Stadt"><MapPinIcon />{item}</li>
    {/each}
    {#each genre as item}
      <li class="meta-chip genre" aria-label="Genre"><MusicIcon />{item}</li>
    {/each}
  </ul>
</article>