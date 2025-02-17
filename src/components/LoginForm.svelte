<script>
let username = '';
let password = '';

let params = new URLSearchParams();

import { onMount } from 'svelte';

onMount(() => {
    params = new URLSearchParams(window.location.search);

    if (params.get('logout') === 'success') {
        localStorage.removeItem('token');
    }
});

async function handleSubmit(event) {
  event.preventDefault();

  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (data.auth) {
    localStorage.setItem('token', data.token);
    window.location.href = '/';
  } else {
    window.location.href = '/login?login=failure';
  }
}
</script>

<form on:submit={ handleSubmit } class="w-xs mx-auto flex flex-col gap-6">
    <h1 class="text-3xl font-barlow uppercase font-bold">Login</h1>

    {#if params.get('register') === 'success'}
        <p class="p-2 border-1 border-lime-400 bg-lime-400/20 text-lime-400 text-xs rounded-md">Registrierung erfolgreich! Du kannst dich nun einloggen.</p>
    {/if}

    {#if params.get('register') === 'failure'}
        <p class="p-2 border-1 border-red-400 bg-red-400/20 text-red-400 text-xs rounded-md">Registrierung fehlgeschlagen. Bitte versuche es erneut.</p>
    {/if}

    {#if params.get('login') === 'failure'}
        <p class="p-2 border-1 border-red-400 bg-red-400/20 text-red-400 text-xs rounded-md">Login fehlgeschlagen. Bitte versuche es erneut.</p>
    {/if}

    {#if params.get('logout') === 'success'}
        <p class="p-2 border-1 border-lime-400 bg-lime-400/20 text-lime-400 text-xs rounded-md">Logout erfolgreich! Du bist nun ausgeloggt.</p>
    {/if}

    <label for="username" class="flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">Benutzername</strong>
        <input type="text" id="username" name="username" bind:value={username} class="p-2 outline outline-neutral-950 border-r-8 border-r-transparent dark:outline-white rounded-lg" placeholder="Benutzername" />
    </label>

    <label for="password" class="flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">Passwort</strong>
        <input type="password" id="password" name="password" bind:value={password} class="p-2 outline outline-neutral-950 border-r-8 border-r-transparent dark:outline-white rounded-lg" placeholder="Passwort" />
    </label>
    <button type="submit" class="border-1 border-yellow-400 bg-yellow-400 hover:bg-yellow-500 hover:border-yellow-500 text-stone-950 font-barlow uppercase font-bold py-2 px-4 rounded-md cursor-pointer transition">Login</button>
</form>