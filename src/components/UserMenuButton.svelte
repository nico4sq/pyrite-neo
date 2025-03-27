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
</script>

{#if isLoading}
    <!-- Ladeindikator -->
    <div class="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-700 animate-pulse"></div>
{:else if user}
    <Button 
        label={user.username} 
        type="secondary"
        icon={{ name: "UserIcon", position: "left" }} 
        interaction={{ type: 'link', target: '/profile' }}
    />
{:else}
    <!-- Nicht angemeldet: Login-Button -->
    <Button 
        label="Login" 
        type="secondary"
        icon={{ name: "LogInIcon", position: "right" }} 
        interaction={{ type: 'link', target: '/login' }}
    />
{/if}