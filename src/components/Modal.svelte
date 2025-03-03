<script>
    import Button from './Button.svelte';

    export let id = '';
    export let title = '';
    export let classes = [];
    export let position = 'right';

    $: id = id || 'modal';
    $: title = title || 'Modal';
    
    let baseClasses = [
        'fixed',
        'z-10000',
        'transform',
        'transition-transform',
        'duration-300',
        ,
        ...classes
    ];

    $: positionClasses = getPositionClasses(position);
    
    $: allClasses = [...baseClasses, ...positionClasses].join(' ');

    function getPositionClasses(pos) {
        switch(pos) {
            case 'top':
                return ['top-0', 'left-0', 'right-0', 'bottom-auto', '-translate-y-full', 'h-full', 'max-h-[50vh]', 'translate-y-[-100%]'];
            case 'bottom':
                return ['bottom-0', 'left-0', 'right-0', 'top-auto', 'translate-y-full', 'h-full', 'max-h-[50vh]'];
            case 'left':
                return ['top-0', 'left-0', 'bottom-0', 'right-auto', '-translate-x-full', 'w-auto', 'max-w-[90vw]', 'min-w-[20rem]'];
            case 'right':
                return ['top-0', 'right-0', 'bottom-0', 'translate-x-full', 'left-auto', 'w-auto', 'max-w-[90vw]', 'min-w-[20rem]'];
            default:
                return ['inset-0', 'scale-0'];
        }
    }
</script>

<div
    id={id}
    class={allClasses}
    role="dialog"
    aria-modal="true"
    aria-labelledby={`${id}-title`}
    aria-describedby={`${id}-description`}
>
    <div class="bg-slate-200 dark:bg-neutral-900 shadow-xl px-6 py-2 size-full">
        <header class="flex items-center justify-end mb-4">
            {#if title}
                <h2 id={`${id}-title`} class="sr-only">{title}</h2>
            {/if}

            <Button
                type="primary"
                label="Schließen"
                interaction={{ type: 'close', target: id }}
                icon={{ name: 'XIcon', only: true }}
            />
        </header>
        <div id={`${id}-description`}>
            <slot />
        </div>
    </div>
</div>