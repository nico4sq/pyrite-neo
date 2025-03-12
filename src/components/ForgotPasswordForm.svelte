<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";
    
    let email = '';
    let errorMessage = '';
    let successMessage = '';
    let isSubmitting = false;
    
    async function handleSubmit(event) {
      event.preventDefault();
      
      // Einfache Validierung
      if (!email) {
        errorMessage = 'Bitte gib deine E-Mail-Adresse ein';
        return;
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein';
        return;
      }
      
      errorMessage = '';
      isSubmitting = true;
      
      try {
        const response = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          successMessage = 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet.';
          email = '';
        } else {
          errorMessage = data.error || 'Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.';
        }
      } catch (error) {
        console.error('Error:', error);
        errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.';
      } finally {
        isSubmitting = false;
      }
    }
  </script>
  
  <div class="flex flex-col gap-4">
    <h1 class="text-3xl font-bold font-barlow uppercase mb-6">Passwort zurücksetzen</h1>
    
    {#if successMessage}
      <div class="border-1 border-lime-600 dark:border-lime-300 bg-lime-600/20 dark:bg-lime-300/20 text-lime-600 dark:text-lime-300 p-3 rounded-md text-sm mb-6">
        {successMessage}
      </div>
      <p class="mt-4 text-center">
        <a href="/login" class="text-indigo-600 dark:text-indigo-400 hover:underline">Zurück zum Login</a>
      </p>
    {:else}
      <p class="mb-6 text-neutral-600 dark:text-neutral-400">
        Gib deine E-Mail-Adresse ein, und wir senden dir einen Link zum Zurücksetzen deines Passworts.
      </p>
      
      {#if errorMessage}
        <div class="border-1 border-orange-600 dark:border-orange-300 bg-orange-600/20 dark:bg-orange-300/20 text-orange-600 dark:text-orange-300 p-3 rounded-md text-sm mb-4">
          {errorMessage}
        </div>
      {/if}
      
      <form on:submit={handleSubmit} class="flex flex-col gap-4">
        <Input 
          label="E-Mail-Adresse" 
          id="email" 
          type="email" 
          bind:value={email} 
          required 
          autocomplete="email"
        />
        
        <Button 
          label={isSubmitting ? "Wird gesendet..." : "Link anfordern"} 
          type="primary" 
          disabled={isSubmitting}
          interaction={{ type: 'submit' }}
        />
        
        <div class="mt-4 text-center">
          <a href="/login" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Zurück zum Login</a>
        </div>
      </form>
    {/if}
  </div>