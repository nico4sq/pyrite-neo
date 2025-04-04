import ics from 'ics';

export function stripHtml(html)
{
    return html.replace(/<[^>]*>?/gm, '');
}

export function decodeHtml(html)
{
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

export function addLoadingState(element)
{
    element.classList.add('is--loading');
}

export function removeLoadingState(element)
{
    element.classList.remove('is--loading');
}

export function generateICS(data) {
    const { title, description, location, startDate, endDate } = data;
    const event = {
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
        end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
        title,
        description,
        location
    };

    return new Promise((resolve, reject) => {
        ics.createEvent(event, (error, value) => {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
}

export async function downloadICS(eventData) {
    try {
        const icsContent = await generateICS(eventData);
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${eventData.title}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Fehler beim Generieren der ICS-Datei:', error);
    }
}

import { mount } from 'svelte';
import * as FeatherIcons from 'svelte-feather-icons';

export function renderIcon(iconName, size = 5) {
    const iconContainer = document.createElement('span');

    mount(FeatherIcons[iconName], {
        target: iconContainer
    });

    return iconContainer.innerHTML;
}

export function formatDate(date) {
    if (typeof date === 'string') {
        if (date.includes('.')) {
            date = date.split('.').reverse().join('-');
        }
    }

    return date;
}

export function responsiveImage(src, width, height) {
    return `//wsrv.nl/?url=${src}?w=${width}&h=${height}&fit=inside&q=75&output=webp`;
  }

export function responsiveImageSource(src) {
const sizes = [
    { width: 600, height: 400 },
    { width: 1200, height: 800 },
    { width: 1800, height: 1200 },
    { width: 2400, height: 1600 }
];

return sizes
    .map(({ width, height }) => {
    const url = responsiveImage(src, width, height);
    return `${url} ${width}w`;
    })
    .join(', ');
}