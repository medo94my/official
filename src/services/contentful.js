// src/services/contentful.js
import { createClient } from 'contentful';
import { skills, projects, service } from '../data';

// These should be environment variables in a real setup
const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

let client = null;

if (SPACE_ID && ACCESS_TOKEN) {
  client = createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN,
  });
}

export const getSkills = async () => {
  if (!client) return skills;
  try {
    const response = await client.getEntries({ content_type: 'skill' });
    return response.items.map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      icon: item.fields.icon?.fields?.file?.url ? `https:${item.fields.icon.fields.file.url}` : '',
      langs: item.fields.languages || [], // Assumes 'languages' is a list of strings
    }));
  } catch (error) {
    console.error('Error fetching skills from Contentful:', error);
    return skills;
  }
};

export const getProjects = async () => {
  if (!client) return projects;
  try {
    const response = await client.getEntries({ content_type: 'project' });
    return response.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.name,
      type: item.fields.type,
      languages: item.fields.languages || [],
      desc: item.fields.description,
      github: item.fields.githubUrl,
      website: item.fields.websiteUrl,
      media: item.fields.media?.fields?.file?.url ? `https:${item.fields.media.fields.file.url}` : '',
    }));
  } catch (error) {
    console.error('Error fetching projects from Contentful:', error);
    return projects;
  }
};

export const getServices = async () => {
  if (!client) return service;
  try {
    const response = await client.getEntries({ content_type: 'service' });
    return response.items.map((item) => ({
      id: item.sys.id,
      desc: item.fields.title, // using 'desc' to match existing data structure
      img: null, // Icons are hard to map from CMS dynamically unless using an icon set or image upload.
                 // For now, we might fall back to mapping text to local icons or uploading SVGs.
                 // We'll assume the CMS provides an image/icon URL.
      iconUrl: item.fields.icon?.fields?.file?.url ? `https:${item.fields.icon.fields.file.url}` : null,
    }));
  } catch (error) {
    console.error('Error fetching services from Contentful:', error);
    return service;
  }
};
