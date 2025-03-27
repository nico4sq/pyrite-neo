<script>
    import { onMount } from 'svelte';
    import Button from './Button.svelte';
    import Buttons from './Buttons.svelte';

    import '../styles/components/ProfileCard.css';
    
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

    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        user = null;
        window.location.href = '/';
    }
</script>

{#if user}
    <div class="pyrite-profile-card box fade-in">
        <span class="avatar">{user.username.charAt(0).toUpperCase()}</span>
        <div class="text-content">
            <h2>{user.username}</h2>
            {#if user.email}
                <p>{user.email}</p>
            {/if}
            {#if user.created_at}
                <p>Mitglied seit {new Date(user.created_at).toLocaleDateString()}</p>
            {/if}
            <Buttons direction="row" align="center" justify="start">                
                <Button 
                    label="Logout" 
                    type="secondary" 
                    interaction={{ type: 'button' }}
                    icon ={{ name: 'LogOutIcon', position: 'right' }}
                    on:click={logout}
                />
            </Buttons>
        </div>
    </div>
{:else}
    <div class="pyrite-profile-card box fade-in">   
        <div class="text-content">     
            <h2>Du bist nicht angemeldet</h2>
            <p>Um dein Profil zu sehen und unsere Dienste zu nutzen, melde dich bitte an oder erstelle ein Konto.</p>
            
            <Buttons direction="row" align="center" justify="start">
                <Button 
                    label="Login" 
                    type="primary" 
                    interaction={{ type: 'link', target: '/login' }}
                    icon={{ name: 'LogInIcon', position: 'right' }}
                />
                
                <Button 
                    label="Registrieren" 
                    type="secondary" 
                    interaction={{ type: 'link', target: '/register' }}
                    icon={{ name: 'UserPlusIcon', position: 'right' }}
                />
            </Buttons>
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