<script>
    import { Calendar } from "@fullcalendar/core";
    import dayGridPlugin from "@fullcalendar/daygrid";
    import timeGridPlugin from "@fullcalendar/timegrid";
    import listPlugin from "@fullcalendar/list";
    import deLocale from "@fullcalendar/core/locales/de";

    import { fetchEventById } from "../api/wordpress";

    import "../styles/global.css";

    import { onMount } from "svelte";

    onMount(() => async () => {
        let userId = 2; // Beispiel-Nutzer-ID

        async function getUserFavoriteEvents(userId) {
            const response = await fetch(
                `/api/favorites/get?user_id=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`
                    }
                }
            );
            const data = await response.json();
            const ids = data.eventIds;

            let events = await Promise.all(
                ids.map(async (id) => {
                    let event = await fetchEventById(id);
                    return event;
                })
            );
            
            return events;
        }

        let calendarEl = document.getElementById("calendar");
        let calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin],
            initialView: "dayGridMonth",
            height: "auto",
            stickyHeaderDates: false,
            locale: deLocale,
            headerToolbar: {
                left: "prev",
                center: "title",
                right: "next"
            },
            eventTimeFormat: {
                hour: "numeric",
                minute: "2-digit",
                meridiem: false
            },
            dayMaxEvents: 1,
            eventTextColor: "var(--color-stone-950)",
            eventBackgroundColor: "var(--)",
            eventBorderColor: "var(--)"
        });
        calendar.render();

        // getUserFavoriteEvents(userId)
        //     .then((events) => {  

                
        //     })
        //     .catch((error) => {
        //         console.error(
        //             "Fehler beim Abrufen der favorisierten Events:",
        //             error
        //         );
        //     });
        

    });
</script>

<div id="calendar"></div>
