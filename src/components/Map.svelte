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
    import Buttons from './Buttons.svelte';
    import Button from './Button.svelte';

    import "../styles/components/Map.css";

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
        return L.divIcon({ className: 'cluster-icon', html: '<b>' + cluster.getChildCount() + '</b>' });
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
            let button = L.DomUtil.create('button', 'zoom-button');
            button.innerHTML = renderIcon('PlusIcon', 4);

            button.addEventListener('click', () => {
                map.zoomIn();
            });

            return button;
        };
        zoomOutControl.onAdd = function () {
            let button = L.DomUtil.create('button', 'zoom-button');
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
                    className: 'location-marker',
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
                        className: 'location-marker',
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
                className: 'position-marker',
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
            let button = L.DomUtil.create('button', 'city-selection-button');
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
    <div class="map-container">
        <div id="map" class="map-element"></div>
    </div>
{:else}
    <div class="map-wrapper">
        <div id="map" class="map-element"></div>

        <!-- City Selection Modal -->
        <div class="city-selection-modal-overlay {citySelectionModalOpen ? 'open' : ''}">
            <div class="city-selection-modal width-xs">
                <header class="modal-header">
                    <h3>Für welche Stadt interessierst du dich?</h3>
                    <Button
                        on:click={closeCitySelectionModal}
                        interaction={{ type: 'button' }}
                        type="primary"
                        icon={{ name: 'XIcon', only: 'true' }}
                    />
                </header>
                
                <div class="search-container">
                    <Input
                        bind:value={searchInput}
                        on:input={searchCity}
                        placeholder="Stadt suchen..."
                    />
                    
                    <ul class="options {searchResults.length > 0 ? 'open' : ''}">
                        {#each searchResults as result}
                            <li>
                                <button 
                                    type="button"
                                    class="option"
                                    on:click={() => selectCity(result)}
                                >
                                    {result.name}
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>
                
                {#if cities.length > 0}
                    <Buttons direction="column" align="stretch" justify="start">
                        {#each cities as city}
                            <Button 
                                on:click={() => selectPredefinedCity(city)}
                                label={city}
                                interaction={{ type: 'button' }}
                                type="secondary"
                            />
                        {/each}
                    </Buttons>
                {/if}
                
                <Buttons direction="column" align="stretch" justify="start">
                    <Button 
                        on:click={closeCitySelectionModal}
                        label="Standort verwenden"
                        interaction={{ type: 'button' }}
                        type="primary"
                        icon={{ name: 'MapPinIcon', position: 'right' }}
                    />
                </Buttons>
            </div>
        </div>

        <div id="location-modal"
            class="location-modal"
            class:active={modalOpen}>
            <header class="modal-header">
                {#if activeLocation}
                    <hgroup class="location-header">
                        <h2 class="location-title">{activeLocation.title}</h2>
                        <address class="location-address">{ activeLocation.address }</address>
                    </hgroup>
                {/if}
                <Button
                    on:click={closeModal}
                    interaction={{ type: 'button' }}
                    type="primary"
                    icon={{ name: 'XIcon', only: 'true' }}
                />
            </header>
            <div class="modal-content">
                {#if activeLocationEvents}
                    {#if activeLocationEvents && activeLocationEvents.length > 0}
                        <h3>Kommende Events</h3>
                        <ul class="events-list">
                        {#each activeLocationEvents as event}
                            <li>
                                <LocationEvent name={event.title} slug={event.slug} image={event.featured_media} date={event.date} />
                            </li>
                        {/each}
                        </ul>
                    {:else}
                        <p class="notification is-info">Keine Events gefunden.</p>
                    {/if}
                {:else}
                    <p class="notification is-info">Einen Moment, Informationen zur Location werden geladen...</p>
                {/if}
            </div>
        </div>
    </div>
{/if}