<script>
    import '../styles/components/Buttons.css';

    export let direction = 'row';
    export let align = 'center';
    export let justify = 'start';
</script>

<div class="pyrite-buttons align-{align} justify-{justify} direction-{direction}">
    <slot/>
</div>