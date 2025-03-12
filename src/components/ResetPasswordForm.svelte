<script>
    import { onMount } from "svelte";
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

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

    function validatePassword() {
        passwordErrors = checkPasswordRequirements(password);
        return Object.values(passwordErrors).every(Boolean);
    }

    function validatePasswordConfirm() {
        return password === passwordConfirm;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        // Validierung
        if (!validatePassword()) {
            errorMessage = "Das Passwort erfüllt nicht alle Anforderungen.";
            return;
        }

        if (!validatePasswordConfirm()) {
            errorMessage = "Die Passwörter stimmen nicht überein.";
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

<div class="flex flex-col gap-4">
    <h1 class="text-3xl font-bold font-barlow uppercase mb-6">
        Neues Passwort festlegen
    </h1>

    {#if successMessage}
        <div
            class="border-1 border-lime-600 dark:border-lime-300 bg-lime-600/20 dark:bg-lime-300/20 text-lime-600 dark:text-lime-300 p-3 rounded-md text-sm mb-6"
        >
            {successMessage}
        </div>
        <div class="mt-4 text-center">
            <a
                href="/login"
                class="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
                Zum Login
            </a>
        </div>
    {:else if !isValid}
        <div
            class="border-1 border-orange-600 dark:border-orange-300 bg-orange-600/20 dark:bg-orange-300/20 text-orange-600 dark:text-orange-300 p-3 rounded-md text-sm mb-6"
        >
            {errorMessage}
        </div>
        <div class="mt-4 text-center">
            <a
                href="/forgot-password"
                class="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
                Neuen Reset-Link anfordern
            </a>
        </div>
    {:else}
        <p class="mb-6 text-neutral-600 dark:text-neutral-400">
            Bitte gib dein neues Passwort ein.
        </p>

        {#if errorMessage}
            <div
                class="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-md text-sm mb-4"
            >
                {errorMessage}
            </div>
        {/if}

        <form on:submit={handleSubmit} class="flex flex-col gap-4">
            <div class="mb-2">
                <Input
                    label="Neues Passwort"
                    id="password"
                    type="password"
                    bind:value={password}
                    on:input={validatePassword}
                    required
                    autocomplete="new-password"
                />

                <div class="mt-2">
                    <ul
                        class="text-xs list-none flex gap-x-3 gap-y-1 flex-wrap"
                    >
                        <li
                            class={passwordErrors.length
                                ? "text-lime-600"
                                : "text-neutral-600"}
                        >
                            min. 8 Zeichen
                        </li>
                        <li
                            class={passwordErrors.uppercase
                                ? "text-lime-600"
                                : "text-neutral-600"}
                        >
                            min. 1 Großbuchstabe
                        </li>
                        <li
                            class={passwordErrors.lowercase
                                ? "text-lime-600"
                                : "text-neutral-600"}
                        >
                            min. 1 Kleinbuchstabe
                        </li>
                        <li
                            class={passwordErrors.number
                                ? "text-lime-600"
                                : "text-neutral-600"}
                        >
                            min. 1 Zahl
                        </li>
                        <li
                            class={passwordErrors.special
                                ? "text-lime-600"
                                : "text-neutral-600"}
                        >
                            min. 1 Sonderzeichen
                        </li>
                    </ul>
                </div>
            </div>

            <Input
                label="Passwort bestätigen"
                id="passwordConfirm"
                type="password"
                bind:value={passwordConfirm}
                error={passwordConfirm && password !== passwordConfirm
                    ? "Passwörter stimmen nicht überein"
                    : ""}
                required
                autocomplete="new-password"
            />

            <Button
                label={isSubmitting
                    ? "Wird gespeichert..."
                    : "Passwort speichern"}
                type="primary"
                disabled={isSubmitting}
                interaction={{ type: "submit" }}
            />
        </form>
    {/if}
</div>
