<script>    
    import * as L from 'leaflet';
    import LeafletGestureHandling from 'leaflet-gesture-handling';
    import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
    import 'leaflet/dist/leaflet.css';

    import { renderIcon } from '../functions/helpers';
    import { fetchLocationsWithMetaQueries } from '../api/wordpress';
    import { onMount } from 'svelte';

    let map;
    let markerLayer = L.layerGroup();

    onMount(async () => {
        let locations = await fetchLocationsWithMetaQueries();

        locations.forEach((location) => {
            L.marker([location.coordinates.lat, location.coordinates.lng], {
                icon: L.divIcon({
                    className: 'rounded-full bg-amber-600 text-white flex! items-center justify-center',
                    html: renderIcon('MapPinIcon', 4),
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                })
            }).addTo(markerLayer);
        });

        markerLayer.addTo(map);

        addPositionControl();
    });
    
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
                className: 'rounded-full bg-amber-300 text-stone-950 flex! items-center justify-center',
                html: renderIcon('HomeIcon', 4),
                iconSize: [28, 28],
                iconAnchor: [14, 28]
            })
        });

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                layer.remove();
            }
        });

        marker.addTo(map);
    }

    function addPositionControl() {
        let control = L.control({ position: 'bottomright' });

        control.onAdd = function () {
            let button = L.DomUtil.create('button', 'bg-white text-stone-950 rounded-full p-2 shadow-md');
            button.innerHTML = renderIcon('MapPinIcon', 4);

            button.addEventListener('click', () => {
                detectUserLocation();
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
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'png'
        }).addTo(m);

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

<div id="map" class="w-full h-dvh bg-transparent!" use:mapAction></div>