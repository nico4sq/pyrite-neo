module.exports = {
    content: [
      './src/**/*.{html,js,svelte,ts}', // Passe dies an deine Dateistruktur an
    ],
    safelist: [
       {pattern: /fc-./},
    ],
  };