<script>
    import * as FeatherIcons from 'svelte-feather-icons';
    import AirDatepicker from 'air-datepicker';
    import localeDe from 'air-datepicker/locale/de';
    import { onMount, tick } from 'svelte';
    import { formatDate } from '../functions/helpers';
    import '../styles/components/Input.css';

    export let type = 'text';
    export let id = '';
    export let label = '';
    export let floating = false;
    export let placeholder = '';
    export let value = '';
    export let options = [];

    let datepicker;
    let selectOpen = false;
    let selectedOptionValue = value;

    onMount(async () => {
        if (type === 'daterange') {
            await tick();
            let closeButton = {
                content: 'Schließen',
                onClick: (dp) => {
                    dp.hide();
                }
            }
            try {
                datepicker = new AirDatepicker(`#${id}`, {
                    locale: localeDe,
                    range: true,
                    dateFormat: 'dd.MM.yyyy',
                    buttons: ['clear', closeButton],
                    multipleDatesSeparator: " - ",
                    position: 'bottom center',
                    isMobile: true,
                    onSelect: ({ date }) => {
                        value = {
                            from: date[0] ? formatDate(date[0]) : null,
                            to: date[1] ? formatDate(date[1]) : null
                        };
                        const input = document.getElementById(id);
                        if (input) {
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                });
            } catch (error) {
                console.error('DatePicker konnte nicht initialisiert werden:', error);
            }
        }
    });

    function handleSelect(option) {
        let input = document.getElementById(id);
        value = option.value;
        selectedOptionValue = option.value;
        selectOpen = false;

        setTimeout(() => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, 0);
    }

    function toggleSelect() {
        selectOpen = !selectOpen;
    }

    function clickOutside(node) {
        if (typeof window === 'undefined') return { destroy() {} };

        const handleClick = (event) => {
            if (node && !node.contains(event.target)) {
                selectOpen = false;
            }
        };
        
        document.addEventListener('click', handleClick, true);
        
        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }
</script>

{#if type === 'text' || type === 'email' || type === 'password'}
    <label on:input on:change for={id} class="pyrite-input type-text">
        <strong class:sr-only={floating} class="label">{label}</strong>
        <input type={type} name={id} id={id} placeholder={placeholder} bind:value={value}>
    </label>
{/if}

{#if type === 'daterange'}
    <label on:input on:change for={id} class="pyrite-input type-text type-daterange">
        <strong class:sr-only={floating} class="label">{label}</strong>
        <div class="wrapper">
            <input type="text" name={id} id={id} placeholder={placeholder} readonly>
            <FeatherIcons.CalendarIcon class="icon calendar-icon" />
        </div>
    </label>
{/if}

{#if type === 'checkbox'}
    <label on:input on:change for={id} class="pyrite-input type-checkbox">
        <FeatherIcons.CheckIcon class="icon checkbox-icon" />
        <input type={type} name={id} id={id} class="checkbox-input">
        <span class="checkbox-label">{label}</span>
    </label>
{/if}

{#if type === 'textarea'}
    <label on:input on:change for={id} class="pyrite-input type-textarea">
        <strong class="label">{label}</strong>
        <textarea name={id} id={id} placeholder={placeholder}></textarea>
    </label>
{/if}

{#if type === 'select'}
    <div class="pyrite-input-container">
        <label on:input on:change for={id} class="pyrite-input type-select {selectOpen ? 'active' : ''}" use:clickOutside>
            <strong class:sr-only={floating} class="label">{label}</strong>
            <div class="wrapper">
                <input 
                    type="text" 
                    name={id} 
                    id={id} 
                    bind:value={value}
                    on:click|stopPropagation={toggleSelect} 
                    readonly 
                    placeholder={placeholder}
                >
                <FeatherIcons.ChevronDownIcon class="icon select-icon" />
            </div>
            <ul class="options modal {selectOpen ? 'open' : ''}">
                {#each options as option}
                    <li>
                        <button 
                            type="button" 
                            class="option {option.value === selectedOptionValue ? 'active' : ''}" 
                            on:click|stopPropagation={() => handleSelect(option)}
                        >
                            {option.label}
                        </button>
                    </li>
                {/each}
            </ul>
        </label>
    </div>
{/if}