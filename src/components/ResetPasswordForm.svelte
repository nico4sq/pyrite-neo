<script>
    import { onMount } from "svelte";
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    import "../styles/components/ResetPasswordForm.css";

    export let token = null;

    let password = "";
    let passwordConfirm = "";
    let errorMessage = "";
    let successMessage = "";
    let isSubmitting = false;
    let isValid = false;

    let passwordErrors = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    };
    let passwordConfirmError = '';

    onMount(() => {
        if (!token) {
            errorMessage =
                "Ungültiger oder fehlender Token. Bitte fordere einen neuen Link zum Zurücksetzen des Passworts an.";
        } else {
            isValid = true;
        }
    });

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
    }

    function validatePassword() {
        passwordErrors = checkPasswordRequirements(password);
        isFormValid();
    }
    
    function validatePasswordConfirm() {
        passwordConfirmError = password !== passwordConfirm ? 'Passwörter stimmen nicht überein' : false;
        isFormValid();
    }

    function isFormValid() {
        return (
            passwordErrors.length &&
            passwordErrors.uppercase &&
            passwordErrors.lowercase &&
            passwordErrors.number &&
            passwordErrors.special &&
            !passwordConfirmError
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!isFormValid()) {
            errorMessage = "Bitte überprüfe deine Eingaben.";
            return;
        }

        errorMessage = "";
        isSubmitting = true;

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                successMessage =
                    "Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.";
                password = "";
                passwordConfirm = "";
            } else {
                errorMessage =
                    data.error ||
                    "Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.";
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessage =
                "Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.";
        } finally {
            isSubmitting = false;
        }
    }
</script>

<form on:submit={handleSubmit} id="reset-password-form">
    <h1>Neues Passwort festlegen</h1>

    {#if successMessage}
        <p class="notification is-success">
            {successMessage}
        </p>
        <Button
            label="Zurück zur Anmeldung"
            type="link"
            href="/login"
            interaction={{ type: "link", target: "/login" }}
        />
    {:else if !isValid}
        <p class="notification is-error">
            {errorMessage}
        </p>
        <div class="mt-4 text-center">
            <a href="/forgot-password">Neuen Reset-Link anfordern</a>
        </div>
    {:else}
        <p>Bitte gib dein neues Passwort ein.</p>

        {#if errorMessage}
            <p class="notification is-error">
                {errorMessage}
            </p>
        {/if}

        <div class="form-group">
        <Input
            label="Neues Passwort"
            id="password"
            type="password"
            bind:value={password}
            on:input={validatePassword}
            on:blur={() => {
                validatePassword();
                validatePasswordConfirm();
            }}
            required
            autocomplete="new-password"
        />

        <ul class="form-notifications">
            <li
                class="form-notification {passwordErrors.length
                    ? 'is-success'
                    : 'is-error'}"
            >
                min. 8 Zeichen
            </li>
            <li
                class="form-notification {passwordErrors.uppercase
                    ? 'is-success'
                    : 'is-error'}"
            >
                min. 1 Großbuchstabe
            </li>
            <li
                class="form-notification {passwordErrors.lowercase
                    ? 'is-success'
                    : 'is-error'}"
            >
                min. 1 Kleinbuchstabe
            </li>
            <li
                class="form-notification {passwordErrors.number
                    ? 'is-success'
                    : 'is-error'}"
            >
                min. 1 Zahl
            </li>
            <li
                class="form-notification {passwordErrors.special
                    ? 'is-success'
                    : 'is-error'}"
            >
                min. 1 Sonderzeichen
            </li>
        </ul>
        </div>

        <div class="form-group">
            <Input
                label="Passwort bestätigen"
                id="passwordConfirm"
                type="password"
                bind:value={passwordConfirm}
                on:input={validatePasswordConfirm}
                on:blur={validatePasswordConfirm}
                required
                autocomplete="new-password"
            />
            {#if passwordConfirmError}
                <div class="form-notifications">
                    <p class="form-notification is-error">{passwordConfirmError}</p>
                </div>
            {/if}
        </div>

        <Button
            label={isSubmitting ? "Wird gespeichert..." : "Passwort speichern"}
            type="primary"
            disabled={isSubmitting}
            interaction={{ type: "submit" }}
        />
    {/if}
</form>
