<script>
    import { onMount } from 'svelte';
    import Button from './Button.svelte';

    // Status
    let user = null;
    let isLoading = true;
    let isMenuOpen = false; // Neuer Status für das Dropdown-Menü
    
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

        // Event-Listener für Klicks außerhalb des Menüs
        document.addEventListener('click', handleOutsideClick);
        
        // Cleanup beim Komponenten-Abbau
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    });
    
    // Menü ein-/ausschalten
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
    
    // Menü schließen wenn außerhalb geklickt wird
    function handleOutsideClick(event) {
        const menuButton = document.getElementById('user-menu-button');
        const menu = document.getElementById('user-menu-dropdown');
        
        if (menuButton && menu && isMenuOpen && 
            !menuButton.contains(event.target) && 
            !menu.contains(event.target)) {
            isMenuOpen = false;
        }
    }
    
    // Logout-Funktion
    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        user = null;
        isMenuOpen = false; // Menü schließen
        // Optional: Zur Login-Seite weiterleiten
        window.location.href = '/login';
    }
    
    // Optionen für das Dropdown-Menü
    const userMenuOptions = [
        { label: 'Mein Profil', action: () => window.location.href = '/profile' },
        { label: 'Abmelden', action: logout, className: 'text-orange-600 dark:text-orange-400' }
    ];
    
    function handleMenuSelect(action) {
        action();
        isMenuOpen = false;
    }
</script>

{#if isLoading}
    <!-- Ladeindikator -->
    <div class="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-700 animate-pulse"></div>
{:else if user}
    <!-- Angemeldeter Benutzer -->
    <div class="relative group">
        <button 
            id="user-menu-button"
            on:click={toggleMenu}
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition cursor-pointer border-1 border-neutral-700"
            class:border-indigo-300!={isMenuOpen}
            aria-label="Benutzermenü"
            aria-expanded={isMenuOpen}
            aria-controls="user-menu-dropdown"
        >
            <!-- Profil-Icon/Initialen -->
            <div class="w-7 h-7 rounded-full bg-indigo-300 text-stone-950 flex items-center justify-center font-barlow font-bold">
                {user.username.charAt(0).toUpperCase()}
            </div>
            
            <!-- Benutzername -->
            <span class="text-slate-800 dark:text-white text-sm">
                {user.username}
            </span>
        </button>
        
        <!-- Dropdown-Menü (adaptiertes Styling) -->
        <ul 
            id="user-menu-dropdown"
            class="absolute bottom-full md:top-full md:bottom-unset mb-4 md:mb-0 md:mt-4 z-10 right-0 w-48 bg-neutral-800 border border-neutral-600 rounded-lg overflow-hidden transition-all duration-200 {isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}"
        >
            {#each userMenuOptions as option}
                <li>
                    <button 
                        type="button" 
                        class="block w-full py-2 px-4 text-left hover:bg-slate-700 focus:bg-slate-700 focus:outline-none cursor-pointer transition {option.className || 'text-white'}" 
                        on:click={() => handleMenuSelect(option.action)}
                    >
                        {option.label}
                    </button>
                </li>
            {/each}
        </ul>
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