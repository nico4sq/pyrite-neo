<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    let username = '';
    let password = '';
    let errorMessage = '';
    let successMessage = '';
    let isLoading = false;

    async function handleSubmit(event) {
        event.preventDefault();
        isLoading = true;
        errorMessage = '';
        
        try {
            console.log('Login attempt for user:', username);
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`Anmeldung fehlgeschlagen: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Login successful!');
                
                // Optional: Session-Token im localStorage speichern, falls von der API gesendet
                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                }
                
                // Optional: Benutzerdaten speichern
                if (result.user) {
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                }
                
                // Erfolgsbenachrichtigung
                successMessage = 'Anmeldung erfolgreich!';
                
                // Zur Startseite weiterleiten
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler bei der Anmeldung');
            }
        } catch (error) {
            console.error("Error during login:", error);
            errorMessage = error.message || 'Anmeldung fehlgeschlagen';
        } finally {
            isLoading = false;
        }
    }
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-4 w-sm mx-auto">
    <h1 class="text-3xl font-bold font-barlow uppercase">Anmelden</h1>
    
    {#if errorMessage}
        <div class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
            {errorMessage}
        </div>
    {/if}

    {#if successMessage}
        <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
            {successMessage}
        </div>
    {/if}
    
    <div class="form-group">
        <Input 
            label="Benutzername" 
            id="username" 
            type="text" 
            bind:value={username}
            required 
            disabled={isLoading}
        />
    </div>
    
    <div class="form-group">
        <Input 
            label="Passwort" 
            id="password" 
            type="password" 
            bind:value={password}
            required 
            disabled={isLoading}
        />
    </div>
    
    <Button 
        label={isLoading ? "Anmelde..." : "Anmelden"} 
        type="primary" 
        interaction={{ type: 'submit' }}
        disabled={isLoading}
    />
    
    <div class="text-center mt-3">
        <a href="/register" class="text-sm text-blue-600 hover:underline">
            Noch kein Konto? Hier registrieren
        </a>
    </div>
</form>