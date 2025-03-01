<script>
    import * as L from 'leaflet';

    import 'leaflet-gesture-handling';
    import 'leaflet.markercluster/dist/leaflet.markercluster.js';
    
    import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet/dist/leaflet.css';

    import * as FeatherIcon from 'svelte-feather-icons';
    import '../styles/global.css';

    import { renderIcon } from '../functions/helpers';
    import { fetchLocationById, fetchLocationEvents, fetchLocations } from '../api/wordpress';
    import { onMount } from 'svelte';
    import LocationEvent from './LocationEvent.svelte';
    import Input from './Input.svelte';

    export let single;

    let map;
    let mapElement;
    let activeLocation = null;
    let activeLocationEvents = null;
    let cities = [];
    let selectedCity = '';
    let modalOpen = false;
    let citySelectionModalOpen = true;
    let searchInput = '';
    let searchResults = [];
    let isSearching = false;
    let searchTimeout = null;

    let markerLayer = L.markerClusterGroup({
        maxClusterRadius: 100,
        iconCreateFunction: function(cluster) {
        return L.divIcon({ className: 'w-8! h-8! aspect-1 rounded-full bg-yellow-400 text-yellow-800 flex! items-center justify-center', html: '<b>' + cluster.getChildCount() + '</b>' });
    }});
    let positionLayer = L.layerGroup();

    onMount(async () => {
        mapElement = document.getElementById('map');

        map = L.map(mapElement, {
            preferCanvas: true,
            zoomControl: false,
            attributionControl: false,
            gestureHandling: true
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        let zoomInControl = L.control({ position: 'topright' });
        let zoomOutControl = L.control({ position: 'topright' });
        zoomInControl.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-white text-stone-950 rounded-lg p-2 shadow-md cursor-pointer! hover:bg-stone-300 transition!');
            button.innerHTML = renderIcon('PlusIcon', 4);

            button.addEventListener('click', () => {
                map.zoomIn();
            });

            return button;
        };
        zoomOutControl.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-white text-stone-950 rounded-lg p-2 shadow-md cursor-pointer! hover:bg-stone-300 transition!');
            button.innerHTML = renderIcon('MinusIcon', 4);

            button.addEventListener('click', () => {
                map.zoomOut();
            });

            return button;
        };

        zoomInControl.addTo(map);
        zoomOutControl.addTo(map);
        
        if (single) {
            let location = await fetchLocationById(single);
            let marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
                icon: L.divIcon({
                    className: 'before:size-full before:rounded-tl-3xl before:rounded-tr-3xl before:rounded-bl-3xl before:rounded-br-xs before:rotate-45 before:bg-yellow-400 before:size-xl after:w-2 after:h-2 after:bg-yellow-700 after:rounded-3xl after:flex after:absolute text-white flex! items-center justify-center',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                }),
                feature: {
                    locationId: location.id,
                }
            });
            
            markerLayer.addLayer(marker);
        } else {
            let locations = await fetchLocations();
            locations.forEach((location) => {
                let marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
                    icon: L.divIcon({
                        className: 'before:size-full before:rounded-tl-3xl before:rounded-tr-3xl before:rounded-bl-3xl before:rounded-br-xs before:rotate-45 before:bg-yellow-400 before:size-xl after:w-2 after:h-2 after:bg-yellow-700 after:rounded-3xl after:flex after:absolute text-white flex! items-center justify-center',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    }),
                    feature: {
                        locationId: location.id,
                    }
                });

                marker.on('click', openModal);
                marker.on('click', function() {
                    map.setView(marker.getLatLng(), 14, { animate: true });
                });
                
                markerLayer.addLayer(marker);
            });

            cities = locations.reduce((acc, location) => {
                if (location.city && !acc.includes(location.city)) {
                    acc.push(location.city);
                }
                return acc;
            }, []);

            cities.sort();
        }

        markerLayer.addTo(map);

        if (single) {
            map.setView(markerLayer.getBounds().getCenter(), 14);
        } else {
            map.fitBounds(markerLayer.getBounds());
        }
        
        if (!single) {
            addCitySelectionControl();
        }
    });

    function closeModal() {
        modalOpen = false;
        activeLocation = null;
        activeLocationEvents = null;
    }

    function closeCitySelectionModal() {
        citySelectionModalOpen = false;
    }

    function openCitySelectionModal() {
        citySelectionModalOpen = true;
    }

    async function searchCity() {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(async () => {
            if (!searchInput || searchInput.length < 2) {
                searchResults = [];
                return;
            }

            isSearching = true;
            
            try {            
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5&countrycodes=de`);
                const data = await response.json();
                
                searchResults = data.filter(item => 
                    item.addresstype === 'city' || 
                    item.addresstype === 'town' || 
                    item.addresstype === 'village'
                );
                
                isSearching = false;
            } catch (error) {
                console.error('Fehler bei der Stadt-Suche:', error);
                isSearching = false;
                searchResults = [];
            }
        }, 1000);
    }

    function selectCity(result) {
        map.setView([parseFloat(result.lat), parseFloat(result.lon)], 12, { animate: true });
        citySelectionModalOpen = false;
    }

    async function selectPredefinedCity(cityName) {
        try {            
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
            const data = await response.json();
                        
            if (data && data.length > 0) {
                const result = data[0];

                map.setView([parseFloat(result.lat), parseFloat(result.lon)], 12, { animate: true });
                citySelectionModalOpen = false;
            } else {
                console.error('Keine Ergebnisse mit API erhalten für:', cityName);
            }
        } catch (error) {
            console.error('Fehler bei API-Anfrage:', error);
        }
    }

    async function openModal() {
        modalOpen = true;
        activeLocation = null;
        activeLocationEvents = null;
        let locationId = this.options.feature.locationId;

        activeLocation = await fetchLocationById(locationId);
        activeLocationEvents = await fetchLocationEvents(locationId);
    }
    
    function detectUserLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    map.setView([position.coords.latitude, position.coords.longitude], 14, { animate: true });
                    setPositionMarker([position.coords.latitude, position.coords.longitude]);
                    citySelectionModalOpen = false;
                    resolve();
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    reject();
                }
            );
        });
    }

    function setPositionMarker(coords) {
        let marker = L.marker(coords, {
            icon: L.divIcon({
                className: 'before:size-full before:rounded-tl-3xl before:rounded-tr-3xl before:rounded-bl-3xl before:rounded-br-xs before:rotate-45 before:bg-rose-400 before:size-xl after:w-2 after:h-2 after:bg-rose-700 after:rounded-3xl after:flex after:absolute after:animate-pulse text-white flex! items-center justify-center',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            })
        });

        positionLayer.clearLayers();

        marker.addTo(positionLayer);
        positionLayer.addTo(map);
    }

    function addCitySelectionControl() {
        let control = L.control({ position: 'topright' });

        control.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800 rounded-lg p-2 shadow-md cursor-pointer! transition! ml-2');
            button.innerHTML = renderIcon('SearchIcon', 4);

            button.addEventListener('click', () => {
                openCitySelectionModal();
            });

            return button;
        };

        control.addTo(map);
    }
</script>

{#if single}
    <div class="w-full h-128 rounded-3xl overflow-clip">
        <div id="map" class="size-full bg-transparent!"></div>
    </div>
{:else}
    <div class="w-full h-dvh -mt-16 pt-16 relative overflow-hidden">
        <div id="map" class="size-full bg-transparent!"></div>

        <!-- City Selection Modal -->
        {#if citySelectionModalOpen}
        <div class="fixed inset-0 bg-black/70 z-6000 flex items-center justify-center">
            <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl w-96 max-w-[90%]">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-barlow font-bold uppercase text-stone-950 dark:text-stone-200 text-balance">Für welche Stadt interessierst du dich?</h3>
                    <button on:click={closeCitySelectionModal} class="flex items-center justify-center w-10 h-10 bg-yellow-400 text-stone-950 font-barlow font-bold uppercase text-sm py-1 px-2 rounded-lg cursor-pointer"><FeatherIcon.XIcon class="w-4 h-4"/></button>
                </div>
                
                <div class="relative mb-3">
                    <div class="relative">
                        <input 
                            type="text"
                            bind:value={searchInput}
                            on:input={searchCity}
                            placeholder="Stadt suchen..."
                            class="w-full py-2 pr-4 pl-10 rounded-lg bg-neutral-800 border-1 border-neutral-600 focus:outline-none focus:border-white"
                        />
                        <FeatherIcon.SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        {#if isSearching}
                            <span class="flex items-center absolute right-3 top-1/2 -translate-y-1/2 justify-center rounded-full w-4 h-4 animate-ping bg-yellow-400/40 before:bg-yellow-400 before:rounded-full before:w-2 before:h-2"></span>
                        {/if}
                    </div>
                    
                    {#if searchResults.length > 0}
                        <ul class="mt-2 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden absolute left-0 right-0 bg-neutral-900 shadow-xl">
                            {#each searchResults as result}
                                <li>
                                    <button 
                                        on:click={() => selectCity(result)}
                                        class="w-full text-left py-2 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-stone-950 dark:text-stone-200 transition cursor-pointer"
                                    >
                                        {result.name}
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
                
                {#if cities.length > 0}
                    <div>
                        <div class="grid grid-cols-2 gap-3 sm:grid-cols-2">
                            {#each cities as city}
                                <button 
                                    on:click={() => selectPredefinedCity(city)}
                                    class="text-center py-2 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-stone-950 dark:text-stone-200 transition cursor-pointer"
                                >
                                    {city}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
                
                <div class="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                    <button 
                        on:click={detectUserLocation}
                        class="w-full flex items-center justify-center py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 rounded-lg transition cursor-pointer"
                    >
                        <FeatherIcon.MapPinIcon class="w-4 h-4 mr-2" />
                        Meinen Standort verwenden
                    </button>
                </div>
            </div>
        </div>
        {/if}

        <!-- Location Details Modal -->
        <div id="location-modal"
            class="text-white absolute bottom-0 left-0 right-0 m-4 max-w-3xl h-80 lg:h-auto bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 overflow-y-auto z-5000 transition-transform duration-300 transform lg:top-16 lg:left-0 lg:bottom-0 lg:m-4 lg:mr-0 lg:w-sm lg:max-w-3xl"
            class:active={modalOpen}>
            <style>
                #location-modal {
                    transform: translate(0, calc(100% + 1rem));

                    @media (min-width: 64rem) {
                        transform: translate(calc((100% + 1rem) * -1), 0);
                    }
                }
                #location-modal.active {
                    transform: translate(0); 
                }
            </style>
            <div id="location-modal-content" class="flex flex-col gap-6">
                {#if activeLocation && activeLocationEvents}
                    <hgroup class="flex flex-col gap-1">
                        <p class="text-2xl font-barlow uppercase font-bold text-stone-950 dark:text-stone-200">{activeLocation.title}</p>
                        <address class="not-italic">{ activeLocation.address }</address>
                    </hgroup>
            
                    {#if activeLocationEvents && activeLocationEvents.length > 0}
                        <h3 class="text-lg font-barlow uppercase font-bold text-stone-950 dark:text-stone-200">Kommende Events</h3>
                        <ul class="flex flex-col gap-6">
                        {#each activeLocationEvents as event}
                            <li>
                                <LocationEvent name={event.title} slug={event.slug} image={event.featured_media} date={event.date} />
                            </li>
                        {/each}
                        </ul>
                    {:else}
                        <p class="text-xs">Keine Events gefunden.</p>
                    {/if}
                {:else}
                    <p class="text-xs rounded-lg py-4 flex gap-4 text-balance"><span class="flex items-center justify-center rounded-full w-4 h-4 aspect-square animate-ping bg-yellow-400/40 before:bg-yellow-400 before:rounded-full before:w-2 before:h-2"></span>Einen Moment, Informationen zur Location werden geladen...</p>
                {/if}
            </div>
            <button on:click={closeModal} class="flex items-center justify-center absolute top-2 right-2 w-10 h-10 bg-yellow-400 text-stone-950 font-barlow font-bold uppercase text-sm py-1 px-2 rounded-lg cursor-pointer"><FeatherIcon.XIcon class="w-4 h-4"/></button>
        </div>
    </div>
{/if}