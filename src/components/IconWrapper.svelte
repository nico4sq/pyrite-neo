<script>
    import * as FeatherIcons from 'svelte-feather-icons';
    
    export let name;
    export let size = '24';
    export let customClass = '';
    
    $: IconComponent = getIconComponent(name);
    
    function getIconComponent(iconName) {
      if (!iconName) return null;
      
      // Icons sind im Format "NameIcon" gespeichert
      const fullIconName = iconName.endsWith('Icon') ? iconName : `${iconName}Icon`;
      
      if (FeatherIcons[fullIconName]) {
        return FeatherIcons[fullIconName];
      }
      
      console.warn(`Icon "${iconName}" nicht gefunden.`);
      return null;
    }
  </script>
  
  {#if IconComponent}
    <svelte:component this={IconComponent} size={size} class={customClass} />
  {/if}