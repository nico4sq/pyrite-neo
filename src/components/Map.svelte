<script>    
    import * as L from 'leaflet';
    import LeafletGestureHandling from 'leaflet-gesture-handling';
    import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
    import 'leaflet.markercluster/dist/leaflet.markercluster.js';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet/dist/leaflet.css';

    import * as FeatherIcon from 'svelte-feather-icons';

    import { renderIcon, addLoadingState, removeLoadingState } from '../functions/helpers';
    import { fetchLocationById, fetchLocationEvents, fetchLocationsWithMetaQueries } from '../api/wordpress';
    import { onMount } from 'svelte';
    import { on } from 'svelte/events';
    import LocationEvent from './LocationEvent.svelte';

    let map;
    let dialog = document.getElementById('location-modal');
    let activeLocation = null;
    let activeLocationEvents = null;

    let markerLayer = L.markerClusterGroup({
        maxClusterRadius: 100,
        iconCreateFunction: function(cluster) {
		return L.divIcon({ className: 'w-8! h-8! aspect-1 rounded-full bg-yellow-400 text-yellow-800 flex! items-center justify-center', html: '<b>' + cluster.getChildCount() + '</b>' });
	}});
    let positionLayer = L.layerGroup();

    onMount(async () => {
        let locations = await fetchLocationsWithMetaQueries();

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
            
            markerLayer.addLayer(marker);
        });

        markerLayer.addTo(map);

        addPositionControl();
    });

    function closeModal() {
        let modal = document.getElementById('location-modal'); 
        modal.open ? modal.close() : null;

        activeLocation = null;
        activeLocationEvents = null;
    }

    async function openModal() {
        let modal = document.getElementById('location-modal'); 
        let modalContent = document.getElementById('location-modal-content');

        addLoadingState(modalContent);
        modal.open ? null : modal.showModal();

        let locationId = this.options.feature.locationId;

        activeLocation = await fetchLocationById(locationId);
        activeLocationEvents = await fetchLocationEvents(locationId);

        removeLoadingState(modalContent);
        console.log(activeLocation);
        console.log(activeLocationEvents);
        
          
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

    function createMap(container) {
        let m = L.map(container, {
            center: [51.07, 13.75],
            zoom: 14, 
            preferCanvas: true,
            zoomControl: false,
            attributionControl: false,
            gestureHandling: true
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(m);

        let zoomInControl = L.control({ position: 'topright' });
        let zoomOutControl = L.control({ position: 'topright' });
        zoomInControl.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-white text-stone-950 rounded-lg p-2 shadow-md cursor-pointer! hover:bg-stone-300 transition!');
            button.innerHTML = renderIcon('PlusIcon', 4);

            button.addEventListener('click', () => {
                m.zoomIn();
            });

            return button;
        };
        zoomOutControl.onAdd = function () {
            let button = L.DomUtil.create('button', 'relative z-10 pointer-events-auto flex items-center justify-center w-10! h-10! bg-white text-stone-950 rounded-lg p-2 shadow-md cursor-pointer! hover:bg-stone-300 transition!');
            button.innerHTML = renderIcon('MinusIcon', 4);

            button.addEventListener('click', () => {
                m.zoomOut();
            });

            return button;
        };

        zoomInControl.addTo(m);
        zoomOutControl.addTo(m);

        return m;
    }

    function mapAction(container) {
        map = createMap(container);
        return {
        destroy: () => {
            map.remove();
        },
    };
  }

</script>

<div class="w-full h-screen -mt-16 pt-16">
    <div id="map" class="size-full bg-transparent!" use:mapAction></div>
</div>

<dialog id="location-modal" class="text-white">
    <div class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-5000 flex items-center justify-center">
        <div class="relative bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 pr-16 w-9/10 max-w-3xl max-h-[75dvh] overflow-y-scroll">
            <div id="location-modal-content" class="flex flex-col gap-6">
                {#if activeLocation && activeLocationEvents}
                    <hgroup class="flex flex-col gap-1">
                        <p class="text-2xl font-barlow uppercase font-bold text-stone-950 dark:text-stone-200">{activeLocation.title}</p>
                        <address class="not-italic">{ activeLocation.address }</address>
                    </hgroup>
            
                    {#if activeLocationEvents && activeLocationEvents.length > 0}
                        <h3 class="text-lg font-barlow uppercase font-bold text-stone-950 dark:text-stone-200">Kommende Events</h3>
                        <ul>
                        {#each activeLocationEvents as event}
                            <li>
                                <LocationEvent name={event.title} slug={event.slug} image={event.featured_media} date={event.date} />
                            </li>
                        {/each}
                        </ul>
                    {:else}
                        <p class="text-xs">Keine Events gefunden.</p>
                    {/if}
                {/if}
            </div>
            <button on:click={closeModal} class="flex items-center justify-center absolute top-2 right-2 w-10 h-10 bg-yellow-400 text-stone-950 font-barlow font-bold uppercase text-sm py-1 px-2 rounded-lg cursor-pointer"><FeatherIcon.XIcon class="w-4 h-4"/></button>
        </div>
    </div>
</dialog>
