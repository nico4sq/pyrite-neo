<script>
    import { onMount } from 'svelte';
    import * as dvb from "dvbjs"; 

    export let longitude;
    export let latitude;

    let monitorData = [];
    let linesData = [];

    async function getNearestStops(lng, lat, limit = 5) {
        const data = await dvb.findAddress(lng, lat);

        return data.stops.map((stop) => {
            return {
                name: stop.name,
                id: stop.id
            };
        }).slice(0, limit);
    }

    async function getStopID(name) {
        const data = await dvb.findStop(name);
        let stopID = data[0].id;
        return stopID || null;
    }

    async function getLines(id) {
        const data = await dvb.lines(id);
        
        return data || [];
    }

    async function getMonitor(id, limit = 5) {
        const data = await dvb.monitor(id);

        return data.map((line) => {
            return line;
        }).slice(0, limit);
    }

    async function getRoute(start, destination) {
        const data = await dvb.route(start, destination);

        return data || [];
    }

    async function getPublicTransportMonitor(lng, lat) {
        const nearestStops = await getNearestStops(lng, lat, 1);
        let arrivalsData = [];

        for (const stop of nearestStops) {
            // const lines = await getLines(stop.id);
            const arrivals = await getMonitor(stop.id, 5);

            arrivalsData.push({
                name: stop.name,
                arrivals: arrivals
            });
        }

        return arrivalsData;
    }   

    async function getPublicTransportLines(lng, lat) {
        const nearestStops = await getNearestStops(lng, lat, 1);
        const lines = await getLines(nearestStops[0].id);
        // const lines = await getLines("27011074");

        console.log(lines);
        

        return lines;
    }

    onMount(async () => {
        latitude = Number(latitude) || 51.050407;
        longitude = Number(longitude) || 13.737262;
        
        monitorData = await getPublicTransportMonitor(longitude, latitude);
        linesData = await getPublicTransportLines(longitude, latitude);
    });
</script>

<!-- Hier kannst du die Daten in deiner Komponente verwenden -->
{#if monitorData.length > 0}
    <div class="list-none flex flex-col gap-4">
        {#each monitorData as stop}
            <div class="p-2 flex justify-between items-end bg-indigo-300 text-stone-950 leading-1.1 rounded-xl gap-4">
                <div class="flex flex-col font-barlow font-bold uppercase">
                    <span class="text-xs">Haltestelle</span>
                    <span class="text-lg whitespace-nowrap">{stop.name}</span>
                </div>
                {#if linesData.length > 0}
                    <ul class="list-none flex flex-wrap-reverse items-end justify-end gap-2">
                        {#each linesData as line}
                            <li>
                                <button class="relative group text-xs border border-stone-950 text-stone-950 rounded-md px-2 py-1 flex items-center gap-2">
                                    <span class="font-bold">{line.name}</span>
                                    <div class="absolute flex flex-col w-[12rem] text-left bottom-full left-1/2 -translate-x-1/2 translate-y-2 mb-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0 transition bg-neutral-200 text-stone-950 text-xs p-2 rounded-lg shadow-lg z-2 pointer-events-none">
                                        <strong class="font-barlow font-bold uppercase mb-1">Richtungen</strong>
                                        <ul class="pl-4">
                                            {#each line.directions as direction}
                                                <li class="list-disc">{direction}</li>
                                            {/each}
                                        </ul>
                                    </div>
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
            <table class="tabular-nums">
                <thead class="text-xs font-barlow font-bold uppercase text-left">
                    <tr>
                        <th class="px-2 py-1">Linie</th>
                        <th class="px-2 py-1">Richtung</th>
                        <th class="px-2 py-1 text-right">Abfahrt</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    {#each stop.arrivals as arrival}
                        <tr>
                            <td class="px-2 py-1 border-t-white/10 border-t-1 font-bold">{arrival.line}</td>
                            <td class="px-2 py-1 border-t-white/10 border-t-1">{arrival.direction}</td>
                            <td class="px-2 py-1 border-t-white/10 border-t-1 text-right">{arrival.arrivalTimeRelative <= 0 ? 'jetzt' : arrival.arrivalTimeRelative + ' min'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/each}
    </div>
{:else}
    <p class="w-fit text-xs border border-slate-600 dark:border-neutral-300 bg-slate-600/20 dark:bg-neutral-300/20 text-slate-600 dark:text-neutral-300 rounded-lg px-2 py-1 flex items-center gap-2">Lade ÖPNV-Daten...</p>
{/if}