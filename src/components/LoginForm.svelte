<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    import '../styles/components/LoginForm.css';
    
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

<form on:submit={handleSubmit} id="login-form">
    <h1>Anmelden</h1>
    
    {#if errorMessage}
        <div class="notification is-error">
            {errorMessage}
        </div>
    {/if}
    
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
        label={isLoading ? "Login..." : "Login"} 
        type="primary" 
        disabled={isLoading}
        interaction={{ type: 'submit' }}
    />
</form>

<ul class="text-center is-text-small list-none">
    <li><a href="/forgot-password">Passwort vergessen?</a></li>
    <li><a href="/register">Registrieren</a></li>
</ul>