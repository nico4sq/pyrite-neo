<script>
    import { onMount } from 'svelte';
    import Button from './Button.svelte';
    
    let user = null;
    let isLoading = true;
    
    onMount(() => {
        try {
            // Prüfe, ob Benutzerdaten im localStorage vorhanden sind
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                user = JSON.parse(storedUser);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        } finally {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <div class="bg-slate-100 dark:bg-neutral-800 rounded-lg p-6 animate-pulse flex flex-col gap-6">
        <div class="h-24 w-24 bg-slate-300 dark:bg-neutral-700 rounded-full mx-auto"></div>
        <div class="h-6 bg-slate-300 dark:bg-neutral-700 rounded mt-4 w-1/3 mx-auto"></div>
        <div class="h-4 bg-slate-300 dark:bg-neutral-700 rounded mt-2 w-2/3 mx-auto"></div>
        <div class="mt-6 space-y-2">
            <div class="h-4 bg-slate-300 dark:bg-neutral-700 rounded"></div>
            <div class="h-4 bg-slate-300 dark:bg-neutral-700 rounded"></div>
        </div>
    </div>
{:else if user}
    <div class="bg-white dark:bg-neutral-800 rounded-3xl p-6 flex flex-col gap-6">
        <div class="flex items-center gap-6">
            <div class="w-24 h-24 rounded-full color-teal-300 text-stone-950 flex items-center justify-center text-5xl font-bold font-barlow uppercase">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
                <h2 class="text-xl font-bold text-stone-950 dark:text-white">{user.username}</h2>
                {#if user.email}
                    <p class="text-stone-950 dark:text-white">{user.email}</p>
                {/if}
                {#if user.created_at}
                    <p class="text-xs text-slate-500 dark:text-neutral-500 mt-1">
                        Mitglied seit {new Date(user.created_at).toLocaleDateString()}
                    </p>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div class="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Du bist nicht angemeldet</h2>
        <p class="text-slate-600 dark:text-slate-300 mb-6">
            Um dein Profil zu sehen und unsere Dienste zu nutzen, melde dich bitte an oder erstelle ein Konto.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
                label="Anmelden" 
                type="primary" 
                interaction={{ type: 'link', target: '/login' }}
            />
            
            <Button 
                label="Registrieren" 
                type="secondary" 
                interaction={{ type: 'link', target: '/register' }}
            />
        </div>
    </div>
{/if}

<style>
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .animate-pulse {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>