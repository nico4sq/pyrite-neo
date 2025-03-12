<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    let username = '';
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let errorMessage = '';
    let successMessage = '';
    
    let usernameError = '';
    let emailError = '';
    let passwordErrors = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    };
    let passwordConfirmError = '';
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    function checkPasswordRequirements(pwd) {
        return {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd)
        };
    }

    $: {
        if (password) validatePassword();
        if (passwordConfirm) validatePasswordConfirm();
        if (username) validateUsername();
        if (email) validateEmail();
    }

    function validateUsername() {
        usernameError = username.length < 3 ? 'Benutzername muss mindestens 3 Zeichen haben' : false;
        isFormValid();
    }
    
    function validateEmail() {
        emailError = !emailPattern.test(email) ? 'Bitte eine gültige E-Mail-Adresse eingeben' : false;
        isFormValid();
    }
    
    function validatePassword() {
        passwordErrors = checkPasswordRequirements(password);
        isFormValid();
    }
    
    function validatePasswordConfirm() {
        passwordConfirmError = password !== passwordConfirm ? 'Passwörter stimmen nicht überein' : false;
    }
    
    function isFormValid() {
        const usernameValid = (username && username.length >= 3 && !usernameError) ? true : false;
        const emailValid = (email && emailPattern.test(email) && !emailError) ? true : false;
        const passwordValid = Object.values(passwordErrors).every(val => val === true);
        const passwordConfirmValid = (passwordConfirm && passwordConfirm === password) ? true : false;

        let formValid = usernameValid && emailValid && passwordValid && passwordConfirmValid;
        
        return formValid;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        
        validateUsername();
        validateEmail();
        validatePassword();
        validatePasswordConfirm();
        
        if (!isFormValid()) {
            errorMessage = 'Bitte überprüfen Sie Ihre Eingaben';
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Erfolgreiche Registrierung, aber Account noch nicht aktiviert
                successMessage = 'Registrierung erfolgreich! Bitte überprüfe deine E-Mail, um dein Konto zu aktivieren.';
                
                // Felder zurücksetzen
                username = '';
                email = '';
                password = '';
                passwordConfirm = '';
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            errorMessage = error.message || 'Registrierung fehlgeschlagen';
        }
    }
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-4 w-md mx-auto">
    <h1 class="text-3xl font-bold font-barlow uppercase mb-6">Registrieren</h1>

    {#if errorMessage}
        <div class="border-1 border-orange-600 dark:border-orange-300 bg-orange-600/20 dark:bg-orange-300/20 text-orange-600 dark:text-orange-300 p-3 rounded-md text-sm">
            {errorMessage}
        </div>
    {/if}

    {#if successMessage}
        <div class="border-1 border-lime-600 dark:border-lime-300 bg-lime-600/20 dark:bg-lime-300/20 text-lime-600 dark:text-lime-300 p-3 rounded-md text-sm">
            {successMessage}
        </div>
    {/if}
    
    <div class="form-group">
        <Input 
            label="Benutzername" 
            id="username" 
            type="text" 
            bind:value={username} 
            on:input={validateUsername}
            on:blur={validateUsername}
            required 
        />
        {#if usernameError}
            <p class="text-neutral-600 text-xs mt-1">{usernameError}</p>
        {/if}
    </div>
    
    <div class="form-group">
        <Input 
            label="E-Mail" 
            id="email" 
            type="email" 
            bind:value={email} 
            on:input={validateEmail}
            on:blur={validateEmail}
            required 
        />
        {#if emailError}
            <p class="text-neutral-600 text-xs mt-1">{emailError}</p>
        {/if}
    </div>
    
    <div class="form-group">
        <Input 
            label="Passwort" 
            id="password" 
            type="password" 
            bind:value={password} 
            on:input={validatePassword}
            on:blur={() => {
                validatePassword();
                validatePasswordConfirm();
            }}
            required 
        />
        <div class="mt-2">
            <ul class="text-xs list-none flex gap-x-3 gap-y-1 flex-wrap">
                <li class={passwordErrors.length ? "text-lime-300" : "text-neutral-600"}>
                    min. 8 Zeichen
                </li>
                <li class={passwordErrors.uppercase ? "text-lime-300" : "text-neutral-600"}>
                    min. 1 Großbuchstabe
                </li>
                <li class={passwordErrors.lowercase ? "text-lime-300" : "text-neutral-600"}>
                    min. 1 Kleinbuchstabe
                </li>
                <li class={passwordErrors.number ? "text-lime-300" : "text-neutral-600"}>
                    min. 1 Zahl
                </li>
                <li class={passwordErrors.special ? "text-lime-300" : "text-neutral-600"}>
                    min. 1 Sonderzeichen
                </li>
            </ul>
        </div>
    </div>
    
    <div class="form-group">
        <Input 
            label="Passwort wiederholen" 
            id="passwordConfirm" 
            type="password" 
            bind:value={passwordConfirm} 
            on:input={validatePasswordConfirm}
            on:blur={validatePasswordConfirm}
            required 
        />
        {#if passwordConfirmError}
            <p class="text-neutral-600 text-xs mt-1">{passwordConfirmError}</p>
        {/if}
    </div>
    
    <Button 
        label="Registrieren" 
        type="primary" 
        interaction={{ type: 'submit' }}
    />
</form>