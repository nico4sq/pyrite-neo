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
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                successMessage = 'Registrierung erfolgreich!';
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            errorMessage = error.message || 'Registrierung fehlgeschlagen';
        }
    }
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-4 w-sm mx-auto">
    <h1 class="text-3xl font-bold font-barlow uppercase">Registrieren</h1>

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
                <li class={passwordErrors.length ? "text-lime-600" : "text-neutral-600"}>
                    min. 8 Zeichen
                </li>
                <li class={passwordErrors.uppercase ? "text-lime-600" : "text-neutral-600"}>
                    min. 1 Großbuchstabe
                </li>
                <li class={passwordErrors.lowercase ? "text-lime-600" : "text-neutral-600"}>
                    min. 1 Kleinbuchstabe
                </li>
                <li class={passwordErrors.number ? "text-lime-600" : "text-neutral-600"}>
                    min. 1 Zahl
                </li>
                <li class={passwordErrors.special ? "text-lime-600" : "text-neutral-600"}>
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