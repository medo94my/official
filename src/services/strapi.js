// src/services/strapi.js
import { FALLBACK_SKILLS, FALLBACK_PROJECTS, FALLBACK_SERVICES, STATS, PROFILE } from '../constants/profile';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API = `${STRAPI_URL}/api`;

// Helper to flatten Strapi response
// Strapi v4 returns { data: { id, attributes: { ... } } }
const flatten = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) return data.map(flatten);
  if (data.data) return flatten(data.data);
  if (data.attributes) {
    const flat = { id: data.id, ...data.attributes };
    // Handle nested media/relations
    Object.keys(flat).forEach(key => {
        if (flat[key] && flat[key].data) {
            flat[key] = flatten(flat[key]);
        }
    });
    return flat;
  }
  return data;
};

// Helper to get full image URL
const getImageUrl = (img) => {
    if (!img || !img.url) return '';
    if (img.url.startsWith('http')) return img.url;
    return `${STRAPI_URL}${img.url}`;
};

export const getSkills = async () => {
  try {
    const res = await fetch(`${STRAPI_API}/skills?populate=*`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    const items = flatten(json);
    
    return items.map(item => ({
        id: item.id,
        title: item.title,
        icon: getImageUrl(item.icon),
        langs: item.languages ? item.languages.split(',').map(s => s.trim()) : [] 
    }));
  } catch (error) {
    console.warn('Strapi: Fetch skills failed, using fallback.');
    return FALLBACK_SKILLS;
  }
};

export const getProjects = async () => {
  try {
    const res = await fetch(`${STRAPI_API}/projects?populate=*`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    const items = flatten(json);

    return items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        languages: item.languages ? item.languages.split(',').map(s => s.trim()) : [],
        desc: item.description,
        github: item.githubUrl,
        website: item.websiteUrl,
        media: getImageUrl(item.media),
    }));
  } catch (error) {
    console.warn('Strapi: Fetch projects failed, using fallback.');
    return FALLBACK_PROJECTS;
  }
};

export const getServices = async () => {
  try {
    const res = await fetch(`${STRAPI_API}/services?populate=*`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    const items = flatten(json);

    return items.map(item => ({
        id: item.id,
        desc: item.title, 
        img: null, 
        iconUrl: getImageUrl(item.icon)
    }));
  } catch (error) {
    console.warn('Strapi: Fetch services failed, using fallback.');
    return FALLBACK_SERVICES;
  }
};

export const getStats = async () => {
    try {
        const res = await fetch(`${STRAPI_API}/stats?sort=order:asc`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const items = flatten(json);
        
        if (items.length === 0) return STATS;

        return items.map(item => ({
            label: item.label,
            value: item.value
        }));
    } catch (error) {
        console.warn('Strapi: Fetch stats failed, using fallback.');
        return STATS;
    }
}

export const getProfile = async () => {
    try {
        // Assuming single type or finding first 'profile'
        const res = await fetch(`${STRAPI_API}/profiles?populate=*`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const items = flatten(json);
        
        if (!items || items.length === 0) return PROFILE;
        const item = items[0];

        return {
            name: item.name,
            role: item.role,
            email: item.email,
            phone: item.phone,
            location: item.location,
            about: item.about,
            social: item.social || PROFILE.social 
        };
    } catch (error) {
         console.warn('Strapi: Fetch profile failed, using fallback.');
         return PROFILE;
    }
}
