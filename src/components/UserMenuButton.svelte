<script>
    import { onMount } from 'svelte';
    import Button from './Button.svelte';

    // Status
    let user = null;
    let isLoading = true;
    
    // Prüft beim Laden, ob der Benutzer angemeldet ist
    onMount(() => {
        try {
            // Versuche, Benutzerdaten und Token aus dem localStorage zu laden
            const storedUser = localStorage.getItem('currentUser');
            const token = localStorage.getItem('authToken');
            
            if (storedUser && token) {
                user = JSON.parse(storedUser);
            }
        } catch (error) {
            console.error('Fehler beim Laden des Benutzers:', error);
        } finally {
            isLoading = false;
        }
    });
    
    // Logout-Funktion
    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        user = null;
        // Optional: Zur Login-Seite weiterleiten
        window.location.href = '/login';
    }
</script>

{#if isLoading}
    <!-- Ladeindikator -->
    <div class="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-700 animate-pulse"></div>
{:else if user}
    <!-- Angemeldeter Benutzer -->
    <div class="relative group">
        <button 
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition cursor-pointer"
            aria-label="Benutzermenü"
            aria-expanded="false"
        >
            <!-- Profil-Icon/Initialen -->
            <div class="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">
                {user.username.charAt(0).toUpperCase()}
            </div>
            
            <!-- Benutzername -->
            <span class="text-slate-800 dark:text-white font-bold font-barlow uppercase">
                {user.username}
            </span>
        </button>
        
        <!-- Dropdown-Menü -->
        <div class="absolute right-0 top-full mt-0 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
            <a href="/profile" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700">
                Mein Profil
            </a>
            <a href="/settings" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700">
                Einstellungen
            </a>
            <button 
                on:click={logout}
                class="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-neutral-700"
            >
                Abmelden
            </button>
        </div>
    </div>
{:else}
    <!-- Nicht angemeldet: Login-Button -->
    <Button 
        label="Login" 
        type="secondary"
        icon={{ name: "UserIcon", position: "left" }} 
        interaction={{ type: 'link', target: '/login' }}
    />
{/if}

<style>
    /* Animation für den Ladeindikator */
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .animate-pulse {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>