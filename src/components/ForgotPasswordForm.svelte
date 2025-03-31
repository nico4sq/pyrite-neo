<script>
    import Input from "./Input.svelte";
    import Button from "./Button.svelte";

    import "../styles/components/ForgotPasswordForm.css";

    let email = "";
    let errorMessage = "";
    let successMessage = "";
    let isSubmitting = false;

    async function handleSubmit(event) {
        event.preventDefault();

        // Einfache Validierung
        if (!email) {
            errorMessage = "Bitte gib deine E-Mail-Adresse ein";
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            errorMessage = "Bitte gib eine gültige E-Mail-Adresse ein";
            return;
        }

        errorMessage = "";
        isSubmitting = true;

        try {
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                successMessage =
                    "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet.";
                email = "";
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

<form on:submit={handleSubmit} id="forgot-password-form">
    <h1>Passwort zurücksetzen</h1>

    {#if successMessage}
        <p class="notification is-success">
            {successMessage}
        </p>
    {/if}

    {#if errorMessage}
        <p class="notification is-error">
            {errorMessage}
        </p>
    {/if}

    <p>
        Gib deine E-Mail-Adresse ein, und wir senden dir einen Link zum
        Zurücksetzen deines Passworts.
    </p>

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
        interaction={{ type: "submit" }}
    />
</form>

<ul class="text-center is-text-small list-none">
    <li><a href="/login">Zurück zum Login</a></li>
</ul>
