<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";
    
    let email = '';
    let errorMessage = '';
    let successMessage = '';
    let isSubmitting = false;
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    function validateEmail() {
        return emailPattern.test(email);
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateEmail()) {
            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
            return;
        }
        
        errorMessage = '';
        isSubmitting = true;
        
        try {
            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                successMessage = data.message || 'Verifikationslink wurde erneut versendet';
                email = '';
            } else {
                errorMessage = data.error || 'Ein Fehler ist aufgetreten';
            }
        } catch (error) {
            errorMessage = 'Verbindungsfehler: Bitte versuchen Sie es später erneut';
            console.error(error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold font-barlow uppercase">Verifikations-E-Mail anfordern</h1>
    
    <p class="text-neutral-600 dark:text-neutral-400">
        Gib deine E-Mail-Adresse ein, mit der du dich registriert hast, und wir senden dir einen neuen Bestätigungslink.
    </p>
    
    {#if errorMessage}
        <div class="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-md text-sm">
            {errorMessage}
        </div>
    {/if}
    
    {#if successMessage}
        <div class="bg-lime-50 border border-lime-200 text-lime-800 p-3 rounded-md text-sm">
            {successMessage}
        </div>
    {:else}
        <form on:submit={handleSubmit} class="flex flex-col gap-4">
            <Input 
                label="E-Mail" 
                id="email" 
                type="email" 
                bind:value={email} 
                required 
            />
            
            <Button 
                label={isSubmitting ? "Wird gesendet..." : "Link anfordern"} 
                type="primary" 
                disabled={isSubmitting}
                interaction={{ type: 'submit' }}
            />
        </form>
    {/if}
    
    <div class="flex justify-center mt-4">
        <Button 
            label="Zurück zum Login" 
            type="text" 
            interaction={{ type: 'link', target: '/login' }}
        />
    </div>
</div>