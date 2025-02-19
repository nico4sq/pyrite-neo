<script>
  import { onMount } from 'svelte';
  import logo from '../assets/pyrite-logo.svg';

  let navigationLinks = [];
  let loggedIn = false;

  onMount(() => {
    navigationLinks = [
      {
        name: 'Home',
        href: '/'
      },
      {
        name: 'Events',
        href: '/events'
      },
      {
        name: 'Karte',
        href: '/map'
      }
    ];
  });

</script>

<header class="sticky w-full top-0 left-0 right-0 z-10000 dark:bg-neutral-900 bg-white shadow-lg py-4 h-16">
  <div class="w-9/10 max-w-6xl mx-auto flex justify-between items-center">
    <a href="/">
      <img src={ logo.src } alt="Pyrite logo" class="w-6 h-6 hover:scale-110 transition" />
    </a>
    <nav>
        <ul class="flex justify-between">
        {#each navigationLinks as link}
          <li>
            <a href={link.href} class="flex dark:text-white text-stone-950 hover:text-yellow-600 dark:hover:text-yellow-400 font-barlow font-bold uppercase text-sm py-1 px-2">
              {link.name}
            </a>
          </li>
        {/each}
        </ul>
    </nav>
  </div>
</header>