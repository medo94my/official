
import 'server-only'

export async function getServices() {
  const res = await fetch('http://localhost:3000/api/services');
  const data = await res.json();
  return data;
}

export async function getSkills() {
  const res = await fetch('http://localhost:3000/api/skills');
  const data = await res.json();
  return data;
}

export async function getProjects() {
  const res = await fetch('http://localhost:3000/api/projects');
  const data = await res.json();
  return data;
}

export async function getPersonalInfo() {
  const res = await fetch('http://localhost:3000/api/personal-info');
  const data = await res.json();
  return data;
}
