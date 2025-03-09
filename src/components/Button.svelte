<script>
  import 'svelte-feather-icons';
  import IconWrapper from './IconWrapper.svelte';

  export let label = '';
  export let type = 'primary';
  export let disabled = false;
  
  export let interaction = {
    type: 'link',
    target: '',
    external: false
  };
  
  $: interaction = {
    type: 'link',
    target: '',
    external: false,
    ...interaction
  };
  
  export let icon = {
    name: 'ArrowRightIcon',
    only: false,
    position: 'right'
  };
  
  $: icon = {
    name: 'ArrowRightIcon',
    only: false,
    position: 'right',
    ...icon
  };

  let classesButton = [
    'group',
    'flex', 
    'items-center', 
    'justify-center', 
    'cursor-pointer', 
    'leading-none', 
    'py-3', 
    'gap-3',
    'rounded-lg', 
    'font-barlow', 
    'uppercase', 
    'font-bold', 
    'transition'
  ];

  function updateButtonClasses() {
    const classes = [...classesButton];
    
    if (!label || icon.only) {
      classes.push('px-3');

      if (type === 'primary') {
        classes.push('border-1', 'border-indigo-400', 'bg-indigo-400', 'hover:bg-indigo-500', 'hover:border-indigo-500', 'text-slate-950');
      } else if (type === 'secondary') {
        classes.push('border-1', 'border-slate-950', 'dark:border-white', 'hover:border-indigo-400', 'dark:hover:border-indigo-400', 'text-slate-950', 'dark:text-white');
      } else {
        classes.push('text-white');
      }
    } else {
      classes.push('px-4');
      if (type === 'primary') {
        classes.push('border-1', 'border-indigo-400', 'bg-indigo-400', 'hover:bg-indigo-500', 'hover:border-indigo-500', 'text-slate-950');
      } else if (type === 'secondary') {
        classes.push('border-1', 'border-slate-950', 'dark:border-white', 'hover:border-indigo-600', 'dark:hover:border-indigo-400', 'text-slate-950', 'dark:text-white');
      } else {
        classes.push('text-white');
      }
    }

    if (disabled) {
      classes.push('opacity-50', 'pointer-events-none');
    }
    
    return classes;
  }

  $: buttonClasses = updateButtonClasses().join(' ');
  
  // Funktion zum Öffnen eines Modals
  function handleModal() {
    if (interaction.type === 'modal' && interaction.target) {
      const targetElement = document.getElementById(interaction.target);
      if (targetElement) {
        targetElement.classList.add('translate-0!');
        
        // Optional: Event-Handler für Schließen-Button hinzufügen
        const closeButton = targetElement.querySelector('[data-close]');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            targetElement.classList.remove('translate-0!');
          });
        }
      } else {
        console.warn(`Modal-Ziel mit ID "${interaction.target}" nicht gefunden.`);
      }
    }
  }

  function closeModal() {
    if (interaction.type === 'close' && interaction.target) {
      const targetElement = document.getElementById(interaction.target);
      if (targetElement) {
        targetElement.classList.remove('translate-0!');
      } else {
        console.warn(`Modal-Ziel mit ID "${interaction.target}" nicht gefunden.`);
      }
    }
  }
</script>

{#if interaction.type === 'link'}
  <a 
    href={interaction.target} 
    target={interaction.external ? "_blank" : "_self"} 
    rel={interaction.external ? "noopener noreferrer" : ""}
    class={buttonClasses}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}
  </a>
{:else if interaction.type === 'button'}
  <button 
    class={buttonClasses}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'submit'}
  <button 
    type="submit" 
    class={buttonClasses}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'modal'}
  <button 
    class={buttonClasses}
    on:click={handleModal}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'close'}
  <button 
    class={buttonClasses}
    on:click={closeModal}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="16" class="w-4 h-4 transition" />
    {/if}
  </button>
{/if}