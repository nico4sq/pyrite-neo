<script>
    import * as FeatherIcons from 'svelte-feather-icons';
    import { onMount } from 'svelte';
  
    export let label;
    export let href;
    export let type;
    export let icon;
  
    let classesButton = [
      'group',
      'py-2',
      'transition-all',
      'rounded-lg',
      'uppercase',
      'font-barlow',
      'font-bold',
      'flex',
      'flex-auto',
      'justify-center',
      'cursor-pointer',
      'items-center',
      'leading-1.05',
      'active:scale-95',
    ];
  
    let classesIcon = [
      'transition-all',
      'w-5',
      'h-5'
    ];
  
    onMount(() => {
      if (label === null) {
        classesButton.push('px-3');
  
        if (type === 'primary') {
          classesButton.push('border-1', 'border-indigo-400', 'bg-indigo-400', 'hover:bg-indigo-500', 'text-slate-950');
        } else if (type === 'secondary') {
          classesButton.push('border-1', 'border-slate-950', 'dark:border-white', 'hover:border-indigo-400', 'dark:hover:border-indigo-400', 'text-slate-950', 'dark:text-white');
        } else {
          classesButton.push('text-white');
        }
      } else {
        classesButton.push('px-4');
  
        if (icon) {
          classesButton.push('hover:pr-3', 'hover:gap-3', 'gap-2');
        }
  
        if (type === 'primary') {
          classesButton.push('border-1', 'border-indigo-400', 'bg-indigo-400', 'hover:bg-indigo-500', 'text-slate-950');
        } else if (type === 'secondary') {
          classesButton.push('border-1', 'border-slate-950', 'dark:border-white', 'hover:border-indigo-600', 'dark:hover:border-indigo-400', 'text-slate-950', 'dark:text-white');
        } else {
          classesButton.push('text-white');
        }
      }
    });
  </script>
  
  <a href={href} class={classesButton.join(' ')}>
    {#if label}
      {label}
    {/if}
    {#if icon}
        <FeatherIcons.ArrowRightIcon />
    {/if}
  </a>