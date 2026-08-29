export interface SeedProfileLink {
  label: string;
  url: string;
}

export interface SeedProfile {
  name: string;
  title: string;
  summary: string;
  location: string;
  email: string;
  languages: string[];
  links: SeedProfileLink[];
}

export interface SeedSkill {
  name: string;
  category: string;
  level: string;
}

export interface SeedExperience {
  company: string;
  position: string;
  periodStart: string;
  periodEnd: string | null;
  achievements: string[];
}

export interface SeedProject {
  name: string;
  description: string;
  url: string;
  tags: string[];
}

export interface SeedFile {
  profile: SeedProfile;
  skills: SeedSkill[];
  experience: SeedExperience[];
  projects: SeedProject[];
}

export interface SeedCounts {
  skills: number;
  experience: number;
  achievements: number;
  projects: number;
  links: number;
}
