<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    import '../styles/components/RegisterForm.css';

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

<form on:submit={handleSubmit} id="register-form">
    <h1>Registrieren</h1>

    {#if errorMessage}
        <div class="notification is-error">
            {errorMessage}
        </div>
    {/if}

    {#if successMessage}
        <div class="notification is-success">
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
            <div class="form-notifications">
                <p class="form-notification is-error">{usernameError}</p>
            </div>
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
            <div class="form-notifications">
                <p class="form-notification is-error">{emailError}</p>
            </div> 
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
        <ul class="form-notifications">
            <li class="form-notification {passwordErrors.length ? "is-success" : "is-error"}">
                min. 8 Zeichen
            </li>
            <li class="form-notification {passwordErrors.uppercase ? "is-success" : "is-error"}">
                min. 1 Großbuchstabe
            </li>
            <li class="form-notification {passwordErrors.lowercase ? "is-success" : "is-error"}">
                min. 1 Kleinbuchstabe
            </li>
            <li class="form-notification {passwordErrors.number ? "is-success" : "is-error"}">
                min. 1 Zahl
            </li>
            <li class="form-notification {passwordErrors.special ? "is-success" : "is-error"}">
                min. 1 Sonderzeichen
            </li>
        </ul>
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
            <div class="form-notifications">
                <p class="form-notification is-error">{passwordConfirmError}</p>
            </div>
        {/if}
    </div>
    
    <Button 
        label="Registrieren" 
        type="primary" 
        interaction={{ type: 'submit' }}
    />
</form>