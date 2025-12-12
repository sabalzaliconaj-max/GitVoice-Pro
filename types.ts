export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM'
}

export interface GitCommand {
  command: string;
  explanation: string;
  isDestructive: boolean;
  suggestedBranchName?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  gitCommand?: GitCommand;
  isConfirmed?: boolean;
}

export interface SpeechState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
}

// Expanded supported languages
export type LanguageCode = 
  | 'es-CO' // Spanish (Colombia/Latam)
  | 'en-US' // English
  | 'pt-BR' // Portuguese
  | 'fr-FR' // French
  | 'de-DE' // German
  | 'it-IT' // Italian
  | 'zh-CN' // Chinese (Simplified)
  | 'ja-JP' // Japanese
  | 'ru-RU'; // Russian

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  flag: string;
}

// Interface for UI Translations
export interface TranslationDictionary {
  welcome: string;
  thinking: string;
  listening: string;
  tapToSpeak: string;
  stop: string;
  start: string;
  subtitle: string;
  languageChanged: string;
  errorGen: string;
  destructiveWarning: string;
  cancelled: string;
  confirmed: string;
  copy: string;
  destructiveAction: string;
  confirmAction: string;
  cancelAction: string;
  commandConfirmed: string;
}
