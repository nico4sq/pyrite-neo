import { API_URL, CUSTOM_QUERY_URL } from '../functions/theme';
import { stripHtml } from "../functions/helpers";

import pkg from 'he';
const { decode } = pkg;

export async function fetchSingleArtist(id, slug) {
  let url;

  if (id) {
    url = `${API_URL}/artist/${id}`;
  } else if(slug) {
    url = `${API_URL}/artist?slug=${slug}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const featuredMedia = await fetch(`${API_URL}/media/` + data.featured_media);
    const media = await featuredMedia.json();

    return {
      id: data.id,
      title: decode(data.title.rendered),
      slug: data.slug,
      content: decode(stripHtml(data.content.rendered)),
      featured_media: media.source_url ? '//wsrv.nl/?url=' + media.source_url : undefined,
    };
  } catch (error) {
    console.error('Fehler:', error);
  }
}

export async function fetchSingleLocation(id, slug) {
  let url;

  if (id) {
    url = `${API_URL}/location/${id}`;
  } else if(slug) {
    url = `${API_URL}/location?slug=${slug}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const featuredMedia = await fetch(`${API_URL}/media/` + data.featured_media);
    const media = await featuredMedia.json(); 

    return {
      id: data.id,
      title: decode(data.title.rendered),
      slug: data.slug,
      content: decode(stripHtml(data.content.rendered)),
      featured_media: media.source_url ? '//wsrv.nl/?url=' + media.source_url : undefined,
      address: data.acf.address.street +  ' ' + data.acf.address.house_number + ', ' + data.acf.address.postal_code + ' ' + data.acf.address.city,
    };
  } catch (error) {
    console.error('Fehler:', error);
  }
}

export async function fetchEvents(limit = 100, orderby = 'date', order = 'desc') {
    const url = `${API_URL}/event?per_page=${limit}&orderby=${orderby}&order=${order}`;
    const posts = [];    
  
    try {
      const response = await fetch(url);
      const data = await response.json();

      for (let entry of data) {       
        let featuredMedia = await fetch(`${API_URL}/media/` + entry.featured_media);
        const media = await featuredMedia.json();

        let genres = await fetch(`${API_URL}/genre?post=` + entry.id);
        const genresData = await genres.json();

        let artists = [];
        let artistIds = entry.acf.artists;

        artistIds.forEach(async id => {
          let artist = await fetchSingleArtist(id);
          artists.push(artist);
        });

        let location = await fetchSingleLocation(entry.acf.location);

        posts.push({
          id: entry.id,
          title: entry.title.rendered,
          slug: entry.slug,
          content: decode(stripHtml(entry.content.rendered)),
          featured_media: media.source_url ? '//wsrv.nl/?url=' + media.source_url : undefined,
          genres: genresData.map(genre => genre.name),
          date: entry.acf.info.date.substring(6, 8) + '.' + entry.acf.info.date.substring(4, 6) + '.' + entry.acf.info.date.substring(0, 4),
          start: entry.acf.info.time_start.split(':').slice(0, 2).join(':'),
          doors: entry.acf.info.time_doors.split(':').slice(0, 2).join(':'),
          artists: artists || null,
          location: location || null,
        });
      }
      
    } catch (error) {
      console.error('Fehler:', error);
    }
  
    return posts;
}
  
export async function fetchArtists(limit = 100, orderby = 'title', order = 'asc') {
    const url = `${API_URL}/artist?per_page=${limit}&orderby=${orderby}&order=${order}`;
    const posts = [];
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      for (let entry of data) {
        let featuredMedia = await fetch(`${API_URL}/media/` + entry.featured_media);
        const media = await featuredMedia.json();
  
        posts.push({
          id: entry.id,
          title: decode(entry.title.rendered),
          slug: entry.slug,
          content: decode(stripHtml(entry.content.rendered)),
          featured_media: media.source_url ? '//wsrv.nl/?url=' + media.source_url : undefined,
        });
      }
    }
    catch (error) {
      console.error('Fehler:', error);
    }
  
  return posts;
}

export async function fetchLocations(limit = 100, orderby = 'title', order = 'asc') {
  const url = `${API_URL}/location?per_page=${limit}&orderby=${orderby}&order=${order}`;
  const posts = [];

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let entry of data) {
      let featuredMedia = await fetch(`${API_URL}/media/` + entry.featured_media);
      const media = await featuredMedia.json();

      posts.push({
        id: entry.id,
        title: decode(entry.title.rendered),
        slug: entry.slug,
        content: decode(stripHtml(entry.content.rendered)),
        featured_media: media.source_url ? '//wsrv.nl/?url=' + media.source_url : undefined,
        address: entry.acf.address.street +  ' ' + entry.acf.address.house_number + ', ' + entry.acf.address.postal_code + ' ' + entry.acf.address.city,
      });
    }
  } catch (error) {
    console.error('Fehler:', error);
  }
  
  return posts;
}

export async function fetchLocationEvents(locationId) {
  const url = `${CUSTOM_QUERY_URL}?meta_query[relation]=OR&meta_query[0][key]=location&meta_query[0][value]=${locationId}`;
  const posts = [];

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let id of data) {
      let entry = await fetchSingleEvent(id);
      posts.push(entry);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }
  
  return posts;
}

export async function fetchEventsWithMetaQueries(metaQueries = []) {
  const posts = [];
  let url = CUSTOM_QUERY_URL + '/events';

  if (metaQueries.length > 0) {
    const queryString = metaQueries.map((query, index) => {
      return `meta_query[${index}][key]=${query.key}&meta_query[${index}][value]=${query.value}`;
    }).join('&');
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let entry of data) {   
      entry.title = decode(entry.title);
      entry.tickets = entry.meta.links_tickets.toString();
      entry.date = entry.meta.info_date.toString().substring(6, 8) + '.' + entry.meta.info_date.toString().substring(4, 6) + '.' + entry.meta.info_date.toString().substring(0, 4);
      entry.start = entry.meta.info_time_start.toString().split(':').slice(0, 2).join(':');
      entry.doors = entry.meta.info_time_doors.toString().split(':').slice(0, 2).join(':');

      let location = await fetchLocationById(entry.meta.location);
      location.address = location.meta.address_street + ' ' + location.meta.address_house_number + ', ' + location.meta.address_postal_code + ' ' + location.meta.address_city;
      location.city = location.meta.address_city.toString();
      delete location.meta;
      entry.location = location;

      let artists = [];
      let artistIds = entry.meta.artists;
      artistIds.forEach(async id => {
        let artist = await fetchArtistById(id);
        delete artist.meta;
        
        artists.push(artist);
      });
      entry.artists = artists;

      delete entry.meta;

      posts.push(entry);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  return posts;
}

export async function fetchEventById(id) {
  let url = CUSTOM_QUERY_URL + '/events';

  if (id) {
    url += `?id=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Fehler:', error);
    return {};
  }
}

export async function fetchLocationsWithMetaQueries(metaQueries = []) {
  let url = CUSTOM_QUERY_URL + '/locations';

  if (metaQueries.length > 0) {
    const queryString = metaQueries.map((query, index) => {
      return `meta_query[${index}][key]=${query.key}&meta_query[${index}][value]=${query.value}`;
    }).join('&');
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler:', error);
    return [];
  }
}

export async function fetchLocationById(id) {
  let url = CUSTOM_QUERY_URL + '/locations';

  if (id) {
    url += `?id=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Fehler:', error);
    return {};
  }
}

export async function fetchArtistsWithMetaQueries(metaQueries = []) {
  let url = CUSTOM_QUERY_URL + '/artists';

  if (metaQueries.length > 0) {
    const queryString = metaQueries.map((query, index) => {
      return `meta_query[${index}][key]=${query.key}&meta_query[${index}][value]=${query.value}`;
    }).join('&');
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler:', error);
    return [];
  }
}

export async function fetchArtistById(id) {
  let url = CUSTOM_QUERY_URL + '/artists';

  if (id) {
    url += `?id=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Fehler:', error);
    return {};
  }
}

export async function fetchEventsByLocationIds(locationIds = []) {
  const metaQueries = locationIds.map(id => ({ key: 'location', value: id })); 
  return await fetchEventsWithMetaQueries(metaQueries);
}

export async function fetchCities() {
  let cities = [];
  let locations = await fetchLocationsWithMetaQueries();
  locations.forEach(location => {    
    if (!cities.includes(location.meta.address_city.toString())) {
      cities.push(location.meta.address_city.toString());
    }
  });

  return cities;
}
  