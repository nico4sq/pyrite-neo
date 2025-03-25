<script>
    import Button from './Button.svelte';
    import '../styles/components/Modal.css';

    export let id = '';
    export let title = '';
    export let classes = [];
    export let position = 'right';

    $: id = id || 'modal';
    $: title = title || 'Modal';
    
    let baseClasses = ['modal', ...classes];

    $: positionClasses = getPositionClasses(position);
    
    $: allClasses = [...baseClasses, ...positionClasses].join(' ');

    function getPositionClasses(pos) {
        switch(pos) {
            case 'top':
                return ['top'];
            case 'bottom':
                return ['bottom'];
            case 'left':
                return ['left'];
            case 'right':
                return ['right'];
            default:
                return ['center'];
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
    <div class="modal-content">
        <header class="modal-header">
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