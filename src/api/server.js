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
      featured_media: media.source_url || null,
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
      featured_media: media.source_url || null,
      address: data.acf.address.street +  ' ' + data.acf.address.house_number + ', ' + data.acf.address.postal_code + ' ' + data.acf.address.city,
    };
  } catch (error) {
    console.error('Fehler:', error);
  }
}

export async function fetchSingleEvent(id, slug) {
  let url;

  if (id) {
    url = `${API_URL}/event/${id}`;
  } else if(slug) {
    url = `${API_URL}/event?slug=${slug}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const featuredMedia = await fetch(`${API_URL}/media/` + data.featured_media);
    const media = await featuredMedia.json();

    let genres = await fetch(`${API_URL}/genre?post=` + data.id);
    const genresData = await genres.json();

    let artists = [];
    let artistIds = data.acf.artists.headliner.concat(data.acf.artists.support);

    artistIds.forEach(async id => {
      let artist = await fetchSingleArtist(id);
      artists.push(artist);
    });

    let location = await fetchSingleLocation(data.acf.location);

    return {
      id: data.id,
      title: data.title.rendered,
      slug: data.slug,
      content: decode(stripHtml(data.content.rendered)),
      featured_media: media.source_url,
      genres: genresData.map(genre => genre.name),
      date: data.acf.info.date.substring(6, 8) + '.' + data.acf.info.date.substring(4, 6) + '.' + data.acf.info.date.substring(0, 4),
      start: data.acf.info.time_start.split(':').slice(0, 2).join(':'),
      doors: data.acf.info.time_doors.split(':').slice(0, 2).join(':'),
      artists: artists || null,
      location: location || null,
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
        let artistIds = entry.acf.artists.headliner.concat(entry.acf.artists.support);

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
          featured_media: media.source_url,
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
          featured_media: media.source_url,
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
        featured_media: media.source_url,
        address: entry.acf.address.street +  ' ' + entry.acf.address.house_number + ', ' + entry.acf.address.postal_code + ' ' + entry.acf.address.city,
      });
    }
  } catch (error) {
    console.error('Fehler:', error);
  }
  
  return posts;
}

export async function fetchLocationEvents(locationId) {
  const url = `${CUSTOM_QUERY_URL}?meta_query[0][key]=location&meta_query[0][value]=${locationId}`;
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
  