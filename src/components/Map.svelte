<script>    
    import * as L from 'leaflet';

    import 'leaflet-control-geocoder';
    import 'leaflet-gesture-handling';
    import 'leaflet.markercluster/dist/leaflet.markercluster.js';
    
    import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet/dist/leaflet.css';

    import * as FeatherIcon from 'svelte-feather-icons';
    import '../styles/global.css';

    import { renderIcon, addLoadingState, removeLoadingState } from '../functions/helpers';
    import { fetchLocationById, fetchLocationEvents, fetchLocations } from '../api/wordpress';
    import { onMount } from 'svelte';
    import LocationEvent from './LocationEvent.svelte';
    import { transform } from 'typescript';

    export let single;

    let map;
    let mapElement;
    let activeLocation = null;
    let activeLocationEvents = null;
    let cities = [];
    let selectedCity = '';
    let modalOpen = false;
    let geocoder;

    let markerLayer = L.markerClusterGroup({
        maxClusterRadius: 100,
        iconCreateFunction: function(cluster) {
        return L.divIcon({ className: 'w-8! h-8! aspect-1 rounded-full bg-yellow-400 text-yellow-800 flex! items-center justify-center', html: '<b>' + cluster.getChildCount() + '</b>' });
    }});
    let positionLayer = L.layerGroup();

    onMount(async () => {
        mapElement = document.getElementById('map');
        geocoder = L.Control.Geocoder.nominatim();

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
                if (!acc.includes(location.city)) {
                    acc.push(location.city);
                }
                return acc;
            }, []);
        }

        markerLayer.addTo(map);


        if (single) {
            map.setView(markerLayer.getBounds().getCenter(), 14);
        } else {
            map.fitBounds(markerLayer.getBounds());
        }
        
        if (!single) {
            addPositionControl();
        }
    });

    function closeModal() {
        modalOpen = false;
        activeLocation = null;
        activeLocationEvents = null;
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
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            })
        });

        positionLayer.clearLayers();

        marker.addTo(positionLayer);
        positionLayer.addTo(map);
    }

    function addPositionControl() {
        let control = L.control({ position: 'bottomright' });

        control.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-rose-200 text-rose-800 rounded-lg p-2 shadow-md cursor-pointer! hover:bg-rose-300 hover:text-rose-900 transition!');
            button.innerHTML = renderIcon('MapPinIcon', 4);

            button.addEventListener('click', () => {
                button.classList.add('animate-pulse');
                detectUserLocation().then(() => {
                    button.classList.remove('animate-pulse');
                }).catch(() => {
                    button.classList.remove('animate-pulse');
                });
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
    <div class="w-full h-dvh -mt-16 pt-16 relative">
        <div id="map" class="size-full bg-transparent!"></div>

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