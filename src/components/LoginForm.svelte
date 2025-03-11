<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";
    
    // E-Mail statt Username verwenden
    let email = '';
    let password = '';
    let errorMessage = '';
    let isLoading = false;
    
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!email || !password) {
            errorMessage = 'Bitte füllen Sie alle Felder aus';
            return;
        }
        
        errorMessage = '';
        isLoading = true;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Login war erfolgreich
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Zur Startseite oder Dashboard weiterleiten
                window.location.href = '/';
            } else {
                // Fehler anzeigen
                errorMessage = data.error || 'Anmeldung fehlgeschlagen';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage = 'Bei der Anmeldung ist ein Fehler aufgetreten';
        } finally {
            isLoading = false;
        }
    }
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-4">
    <h1 class="text-3xl font-bold font-barlow uppercase mb-6">Anmelden</h1>
    
    {#if errorMessage}
        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm mb-4">
            {errorMessage}
        </div>
    {/if}
    
    <!-- E-Mail-Input statt Username -->
    <Input 
        label="E-Mail-Adresse" 
        id="email" 
        type="email" 
        bind:value={email} 
        required 
        autocomplete="email"
    />
    
    <Input 
        label="Passwort" 
        id="password" 
        type="password" 
        bind:value={password} 
        required 
        autocomplete="current-password"
    />
    
    <Button 
        label={isLoading ? "Wird angemeldet..." : "Anmelden"} 
        type="primary" 
        disabled={isLoading}
        interaction={{ type: 'submit' }}
    />
    
    <div class="mt-4 flex flex-col gap-2 items-center text-sm text-gray-600 dark:text-gray-400">
        <a href="/forgot-password" class="hover:underline">Passwort vergessen?</a>
        <span>Noch kein Konto? <a href="/register" class="text-indigo-600 dark:text-indigo-400 hover:underline">Registrieren</a></span>
    </div>
</form>