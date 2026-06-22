import type React from 'react';

export enum AIModelCategory {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  MUSIC = 'MUSIC',
  PWA = 'PWA',
  VIDEO = 'VIDEO',
  CUSTOM = 'CUSTOM'
}

export interface PromptField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

export interface Purpose {
  nameKey: string;
  fields: PromptField[];
  template: (data: Record<string, string>, languageName: string) => string;
}

export interface AIModel {
  nameKey: string;
}

export interface CategoryConfig {
  nameKey: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  models: Record<string, AIModel>;
  purposes: Record<string, Purpose>;
}

export type PromptConfig = Record<AIModelCategory, CategoryConfig>;
export type PromptData = Record<string, string>;
export type Translations = Record<string, string>;
export interface Language {
  code: string;
  name: string;
}

export interface UserProfile {
  name: string;
  preferredLanguage: string;
  favoriteCategory: AIModelCategory;
  customContext: string;
  customApiKey: string;
}