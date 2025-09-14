
export interface Skill {
  id: number;
  icon: string;
  title: string;
  langs: string[];
}

export interface Project {
  id: number;
  name: string;
  type: string;
  languages: string[];
  desc: string;
  github: string;
  website: string;
  media: string;
}

export interface Service {
  id: number;
  icon: string;
  desc: string;
}

export interface SocialLink {
  id: number;
  name: string;
  url: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  summary: {
    text1: string;
    backend: string[];
    text2: string;
    frontend: string[];
    text3: string;
  };
}
