<script>
    import * as FeatherIcons from 'svelte-feather-icons';
    import AirDatepicker from 'air-datepicker';
    import localeDe from 'air-datepicker/locale/de';
    import { onMount } from 'svelte';
    import { formatDate } from '../functions/helpers';
    import { on } from 'svelte/events';

    export let type = 'text';
    export let id = '';
    export let label = '';
    export let floating = false;
    export let placeholder = '';
    export let value = '';
    export let options = [];

    let datepicker;

    onMount(() => {
        if (type === 'daterange') {
            let closeButton = {
                content: 'Schließen',
                onClick: (dp) => {
                    dp.hide();
                }
            }
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
                    document.getElementById(id).dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    });

    function handleSelect(optionValue, elementId) {
        let input = document.getElementById(elementId);
        let parent = input.closest('label');

        input.value = optionValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));

        parent.querySelectorAll('*').forEach(el => el.blur());
    }
</script>

{#if type === 'text' || type === 'email' || type === 'password'}
    <label on:change for={id} class="flex flex-col gap-1">
        <strong class:list={"pl-1 font-barlow uppercase text-sm"} class:sr-only={floating}>{label}</strong>
        <input type={type} name={id} id={id} class="py-2 px-4 rounded-lg bg-neutral-800 border-1 border-neutral-600 focus:outline-none focus:border-white" placeholder={placeholder}>
    </label>
{/if}

{#if type === 'daterange'}
    <label on:change for={id} class="flex flex-col gap-1">
        <strong class:list={"pl-1 font-barlow uppercase text-sm"} class:sr-only={floating}>{label}</strong>
        <div class="flex flex-col relative">
            <input type="text" name={id} id={id} class="py-2 pl-4 pr-12 min-w-3xs rounded-lg bg-neutral-800 border-1 border-neutral-600 cursor-pointer focus:outline-none focus:border-white" placeholder={placeholder} readonly>
            <FeatherIcons.CalendarIcon class="absolute top-0 right-4 bottom-0 w-4 h-full text-neutral-600 pointer-events-none" />
        </div>
</label>
{/if}

{#if type === 'checkbox'}
    <label on:change for={id} class="group flex items-center gap-3 cursor-pointer select-none">
        <FeatherIcons.CheckIcon class="box-content! w-4 h-4 p-1 rounded-lg bg-neutral-800 border-1 border-neutral-600 text-transparent group-has-checked:bg-yellow-400 group-has-checked:text-stone-950 group-has-checked:border-yellow-400 group-has-focus:border-white transition" />
        <input type={type} name={id} id={id} class="rounded-lg bg-neutral-800 border-1 border-neutral-600 absolute opacity-0 focus:outline-none focus:border-white">
        <span class="leading-none">{label}</span>
    </label>
{/if}

{#if type === 'textarea'}
    <label on:change for={id} class="group flex flex-col gap-1 cursor-pointer select-none">
        <strong class="pl-1 font-barlow uppercase text-sm">{label}</strong>
        <textarea name={id} id={id} class="py-2 px-4 rounded-lg bg-neutral-800 border-1 border-neutral-600 focus:outline-none focus:border-white" placeholder={placeholder}></textarea>
    </label>
{/if}

{#if type === 'select'}
    <label on:change for={id} class="group relative flex flex-col gap-1 cursor-pointer">
        <strong class:list={"pl-1 font-barlow uppercase text-sm"} class:sr-only={floating}>{label}</strong>
        <div class="flex flex-col relative">
            <select name={id} id={id} bind:value={value} class="py-2 pl-4 pr-12 rounded-lg bg-neutral-800 border-1 border-neutral-600 cursor-pointer appearance-none focus:outline-none focus:border-white">
                {#each options as option}
                    <option class="hidden" value={option.value}>{option.label}</option>
                {/each}
            </select>
            <FeatherIcons.ChevronDownIcon class="absolute top-0 right-4 bottom-0 w-4 h-full text-neutral-600 pointer-events-none" />
        </div>
        <ul class="absolute top-full mt-2 z-10 left-0 w-full bg-neutral-800 border-1 border-neutral-600 rounded-lg overflow-hidden transition-all duration-200 opacity-0 pointer-events-none group-has-focus:opacity-100 group-has-focus:pointer-events-auto">
            {#each options as option}
                <li>
                    <button type="button" class="block w-full py-2 px-4 text-left hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none cursor-pointer transition" on:click={() => handleSelect(option.value, id)}>{option.label}</button>
                </li>
            {/each}
        </ul>
    </label>
{/if}