<script>
    import { onMount } from "svelte";
    import * as FeatherIcons from "svelte-feather-icons";
    import { fetchEvents } from "../api/wordpress";
    import EventCard from "./EventCard.svelte";
    import Button from "./Button.svelte";
  
    import "../styles/components/Events.css";
  
    export let pagination = false;
    export let currentPage = 1;
    export let paginationRange = [];
  
    let events = [];
    let pages = [];
    const perPage = 9;
  
    onMount(async () => {
      if (pagination) {
        events = await fetchEvents(perPage, currentPage);
  
        const totalEvents = await fetchEvents();
        const totalPages = Math.ceil(totalEvents.length / perPage);
  
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        events = await fetchEvents(perPage - 1);
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
  
  <ul class="layout-grid">
    {#each events as event}
      <li>
        <EventCard
          id={event.id}
          title={event.title}
          href={`/event/${event.slug}`}
          featured_media={event.featured_media}
          genre={event.genre}
          date={event.date}
          city={event.city}
        />
      </li>
    {/each}
  
    {#if !pagination}
      <li class="link-tile">
        <a href="/eventfinder"><span class="sr-only">Zum Eventfinder</span></a>
        <p>Nichts für dich dabei?</p>
        <p class="is-heading-level-5">Zum Eventfinder</p>
        <FeatherIcons.ArrowRightIcon />
      </li>
    {/if}
  </ul>
  
  {#if pagination && pages.length > 0}
    <nav class="pagination">
      <Button
        label=""
        disabled={currentPage === 1}
        interaction={{ type: "link", target: currentPage === 1 ? null : "/events/1" }}
        icon={{ name: "ChevronsLeftIcon", only: true }}
        customClasses={["pagination-button"]}
      />
      <Button
        label=""
        disabled={currentPage === 1}
        interaction={{ type: "link", target: currentPage === 1 ? null : `/events/${currentPage - 1}` }}
        icon={{ name: "ChevronLeftIcon", only: true }}
        customClasses={["pagination-button"]}
      />
  
      {#if currentPage > 2 && pages.length > 3}
        <span class="pagination-ellipsis"><FeatherIcons.MoreHorizontalIcon class="icon" /></span>
      {/if}
  
      {#each paginationRange as pageNumber}
        {#if pageNumber === currentPage}
          <span class="pagination-link active">
            {pageNumber}
          </span>
        {:else}
          <a
            href={`/events/${pageNumber}`}
            class="pagination-link"
          >
            {pageNumber}
          </a>
        {/if}
      {/each}
  
      {#if currentPage < pages.length - 1 && pages.length > 3}
        <span class="pagination-ellipsis"><FeatherIcons.MoreHorizontalIcon class="icon" /></span>
      {/if}
  
      <Button
        label=""
        disabled={currentPage === pages.length}
        interaction={{ type: "link", target: currentPage === pages.length ? null : `/events/${currentPage + 1}` }}
        icon={{ name: "ChevronRightIcon", only: true }}
        customClasses={["pagination-button"]}
      />
      <Button
        label=""
        disabled={currentPage === pages.length}
        interaction={{ type: "link", target: currentPage === pages.length ? null : `/events/${pages.length}` }}
        icon={{ name: "ChevronsRightIcon", only: true }}
        customClasses={["pagination-button"]}
      />
    </nav>
  {/if}