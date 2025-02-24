import { CUSTOM_QUERY_URL } from '../functions/theme';

import pkg from 'he';
const { decode } = pkg;

export async function fetchEvents($limit, $page, metaQueries = []) {
  const posts = [];
  let url = CUSTOM_QUERY_URL + '/events';

  if ($limit) {
    url += `?per_page=${$limit}`;

    if ($page) {
      url += `&page=${$page}`;
    }
  }

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
  let entry = {};
  let url = CUSTOM_QUERY_URL + '/events';

  if (id) {
    url += `?id=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    entry = data[0];
    entry.title = decode(entry.title);
    entry.tickets = entry.meta.links_tickets.toString();
    entry.date = entry.meta.info_date.toString().substring(6, 8) + '.' + entry.meta.info_date.toString().substring(4, 6) + '.' + entry.meta.info_date.toString().substring(0, 4);
    entry.start = entry.meta.info_time_start.toString().split(':').slice(0, 2).join(':');
    entry.doors = entry.meta.info_time_doors.toString().split(':').slice(0, 2).join(':');

    let location = await fetchLocationById(entry.meta.location);
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

  } catch (error) {
    console.error('Fehler:', error);  
  }

  return entry;
}

export async function fetchArtistEvents(artistId) {
  const posts = [];
  const url = CUSTOM_QUERY_URL + `/events?meta_query[0][key]=artists&meta_query[0][value]=${artistId}&meta_query[0][compare]=LIKE`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let id of data) {
      id = id.id;
      let entry = await fetchEventById(id);
      posts.push(entry);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
  });
  
  return posts || null;
}

export async function fetchLocationEvents(locationId) {
  const posts = [];
  const url = CUSTOM_QUERY_URL + `/events?meta_query[0][key]=location&meta_query[0][value]=${locationId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let id of data) {
      id = id.id;
      let entry = await fetchEventById(id);
      posts.push(entry);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
  });

  return posts || null;
}

export async function fetchGenreEvents(genreId) {
  const posts = [];
  const url = CUSTOM_QUERY_URL + `/genres?id=${genreId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();   

    for (let id of data) {
      for (let event of id.events) {
        let entry = await fetchEventById(event);
        posts.push(entry);
      }
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
  });

  return posts || null;
}

export async function fetchCityEvents(cityId) {
  const posts = [];
  const url = CUSTOM_QUERY_URL + `/cities?id=${cityId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();   

    for (let id of data) {
      for (let location of id.locations) {
        let locationEvents = await fetchLocationEvents(location);
        for (let event of locationEvents) {
          posts.push(event);
        }
      }
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
  });

  return posts || null;
}

export async function fetchLocations(limit, page, metaQueries = []) {
  const posts = [];
  let url = CUSTOM_QUERY_URL + '/locations';

  if (limit) {
    url += `?per_page=${limit}`;

    if (page) {
      url += `&page=${page}`;
    }
  }

  if (metaQueries.length > 0) {
    const queryString = metaQueries.map((query, index) => {
      return `meta_query[${index}][key]=${query.key}&meta_query[${index}][value]=${query.value}`;
    }).join('&');
    url += `?${queryString}`;
  }

  console.log(url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    for (let entry of data) {
      entry.title = decode(entry.title);
      entry.address = entry.meta.address_street + ' ' + entry.meta.address_house_number + ', ' + entry.meta.address_postal_code + ' ' + entry.meta.address_city;
      entry.city = entry.meta.address_city.toString();
      entry.coordinates = { lat: entry.meta.coordinates_latitude.toString(), lng: entry.meta.coordinates_longitude.toString() };   
      
      delete entry.meta;

      posts.push(entry);
    }
  } catch (error) {
    console.error('Fehler:', error);
  }

  return posts;
}

export async function fetchLocationById(id) {
  let entry = {};
  let url = CUSTOM_QUERY_URL + '/locations';

  if (id) {
    url += `?id=${id}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    entry = data[0];
    entry.title = decode(entry.title);
    entry.address = entry.meta.address_street + ' ' + entry.meta.address_house_number + ', ' + entry.meta.address_postal_code + ' ' + entry.meta.address_city;
    entry.city = entry.meta.address_city.toString();
    entry.coordinates = { lat: entry.meta.coordinates_latitude.toString(), lng: entry.meta.coordinates_longitude.toString() };   
    delete entry.meta;
  } catch (error) {
    console.error('Fehler:', error);
  }

  return entry;
}

export async function fetchArtists(limit, page, metaQueries = []) {
  let posts = [];
  let url = CUSTOM_QUERY_URL + '/artists';

  if (limit) {
    url += `?per_page=${limit}`;

    if (page) {
      url += `&page=${page}`;
    }
  }

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
      
      delete entry.meta;
      posts.push(entry);
    }

  } catch (error) {
    console.error('Fehler:', error);
  }

  return posts;
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
  return await fetchEvents(null, metaQueries);
}

export async function fetchCities() {
  let cities = [];
  let url = CUSTOM_QUERY_URL + '/cities';

  try {
    const response = await fetch(url);
    const data = await response.json();
    cities = data;
  } catch (error) {
    console.error('Fehler:', error);
  }

  return cities;
}

export async function fetchGenres() {
  let genres = [];
  let url = CUSTOM_QUERY_URL + '/genres';

  try {
    const response = await fetch(url);
    const data = await response.json();
    genres = data;
  } catch (error) {
    console.error('Fehler:', error);
  }

  return genres;
}
  