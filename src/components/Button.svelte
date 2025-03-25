<script>
  import 'svelte-feather-icons';
  import IconWrapper from './IconWrapper.svelte';
  import '../styles/components/Button.css';

  export let customClasses = '';
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

  // Reaktive Variable für die Klassen des Buttons
  $: buttonClasses = updateButtonClasses();

  function updateButtonClasses() {
    let classes = 'pyrite-button ' + customClasses;   

    if (!label || icon.only) {
      classes += ' icon-only';
    }

    if (type === 'primary') {
      classes += ' type-primary';
    } else if (type === 'secondary') {
      classes += ' type-secondary';
    } else {
      classes += ' type-tertiary';
    }

    if (disabled) {
      classes += ' is-disabled';
    }
    
    return classes;
  }

  // Funktion zum Öffnen eines Modals
  function handleModal() {
    if (interaction.type === 'modal' && interaction.target) {
      const targetElement = document.getElementById(interaction.target);
      if (targetElement) {
        targetElement.classList.add('open');
        
        // Optional: Event-Handler für Schließen-Button hinzufügen
        const closeButton = targetElement.querySelector('[data-close]');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            targetElement.classList.remove('open');
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
        targetElement.classList.remove('open');
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
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}
  </a>
{:else if interaction.type === 'button'}
  <button 
    class={buttonClasses}
    on:click
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'submit'}
  <button 
    type="submit" 
    class={buttonClasses}
    on:click
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'modal'}
  <button 
    class={buttonClasses}
    on:click={handleModal}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}
  </button>
{:else if interaction.type === 'close'}
  <button 
    class={buttonClasses}
    on:click={closeModal}
  >
    {#if icon.position === 'left'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}

    {#if icon.only && label}
      <span class="sr-only">{label}</span>
    {/if}

    {#if !icon.only && label}
      {label}
    {/if}

    {#if icon.position === 'right'}
      <IconWrapper name={icon.name} size="18" class="w-4 h-4 transition" />
    {/if}
  </button>
{/if}