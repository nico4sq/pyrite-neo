<script>
    let username = '';
    let email = '';
    let password = '';
    let password_repeat = '';

    import * as FeatherIcons from 'svelte-feather-icons';

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const text = await response.text();
            console.log('Response text:', text);

            try {
                const data = JSON.parse(text);
                console.log('Response data:', data);

                if (response.ok) {
                    window.location.href = '/login?register=success';
                } else {
                    window.location.href = '/login?register=failure';
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                window.location.href = '/login?register=failure';
            }
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/login?register=failure';
        }
    }

    async function validateForm() {
        const inputs = document.querySelectorAll('input');
        let valid = true;

        setTimeout(() => {
            inputs.forEach((input) => {
                if (input.dataset.valid === 'false') {
                    valid = false;
                }
            });

            if (valid) {
                this.closest('form').querySelector('button[type="submit"]').removeAttribute('disabled');
            } else {
                this.closest('form').querySelector('button[type="submit"]').setAttribute('disabled', 'disabled');
            }
        }, 50);

        return valid;
    }

    async function validateUsername() {
        setTimeout(() => {
            if (username.length < 3) {
                this.classList.add('border-red-500!');
                this.dataset.valid = 'false';
            } else {
                this.classList.remove('border-red-500!');
                this.dataset.valid = 'true';
            }
        }, 50);
    }

    async function validateEmail() {
        setTimeout(() => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.classList.add('border-red-500!');
                this.dataset.valid = 'false';
            } else {
                this.classList.remove('border-red-500!');
                this.dataset.valid = 'true';
            }
        }, 50);
    }

    async function validatePassword() {
        setTimeout(() => {
            if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                this.classList.add('border-red-500!');
                this.dataset.valid = 'false';
            } else {
                this.classList.remove('border-red-500!');
                this.dataset.valid = 'true';
            }
        }, 50);
    }

    async function validatePasswordRepeat() {
        setTimeout(() => {
            if (password !== this.value) {
                this.classList.add('border-red-500!');
                this.dataset.valid = 'false';
            } else {
                this.classList.remove('border-red-500!');
                this.dataset.valid = 'true';
            }
        }, 50);
    }
</script>

<form on:submit={handleSubmit} on:input={validateForm} class="w-xs mx-auto flex flex-col gap-6">
    <h1 class="text-3xl font-barlow uppercase font-bold">Registrierung</h1>

    <label for="username" class="group flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">Benutzername</strong>
        <input on:input={validateUsername} type="text" id="username" name="username" bind:value={username} class="p-2 border-1 border-neutral-950 dark:border-white rounded-lg" placeholder="Benutzername" data-valid="false"/>

        <p class="text-xs text-neutral-400 flex gap-2 px-2"><FeatherIcons.AlertCircleIcon class="text-xs w-3 h-3 mt-0.5 grow-0 shrink-0"/><span class="grow-0 shrink-1">Der Benutzername muss mindestens 3 Zeichen lang sein.</span></p>
    </label>

    <label for="email" class="flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">E-Mail</strong>
        <input on:input={validateEmail} type="email" id="email" name="email" bind:value={email} class="p-2 border-1 border-neutral-950 dark:border-white rounded-lg" placeholder="E-Mail" data-valid="false"/>
    </label>

    <label for="password" class="flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">Passwort</strong>
        <input on:input={validatePassword} type="password" id="password" name="password" bind:value={password} class="p-2 border-1 border-neutral-950 dark:border-white rounded-lg" placeholder="Passwort" data-valid="false"/>
    </label>

    <label for="password_repeat" class="group flex flex-col gap-3">
        <strong class="font-barlow uppercase text-sm sr-only">Passwort wiederholen</strong>
        <input on:input={validatePasswordRepeat} type="password" id="password_repeat" name="password_repeat" bind:value={password_repeat} class="w-full p-2 border-1 border-neutral-950  dark:border-white rounded-lg" placeholder="Passwort wiederholen" data-valid="false"/>

        <p class="text-xs text-neutral-400 flex gap-2 px-2"><FeatherIcons.AlertCircleIcon class="text-xs w-3 h-3 mt-0.5 grow-0 shrink-0"/><span class="grow-0 shrink-1">Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten.</span></p>
    </label>
    <button type="submit" class="border-1 border-yellow-400 bg-yellow-400 hover:bg-yellow-500 hover:border-yellow-500 text-stone-950 font-barlow uppercase font-bold py-2 px-4 rounded-md cursor-pointer transition disabled:bg-neutral-600 disabled:text-neutral-400 disabled:border-neutral-600" disabled>Registrieren</button>
</form>