import { ColorTheme } from '../db'

interface Config {
    defaultModel: AvailableModel["value"];
    defaultType: 'openai' | 'custom';
    defaultAuth: 'none' | 'bearer-token' | 'api-key';
    defaultBase: string;
    defaultVersion: string;
	defaultKey: string;
	defaultTheme: ColorTheme;
    availableModels: AvailableModel[];
    writingCharacters: WritingCharacter[];
    writingTones: string[];
    writingStyles: string[];
    writingFormats: WritingFormat[];
    showDownloadLink: boolean;
    allowThemeToggle: boolean;
    allowSettingsModal: boolean;
    allowDatabaseModal: boolean;
    showTwitterLink: boolean;
    showFeedbackLink: boolean;
}

interface AvailableModel {
    value: string;
    label: string;
}
  
interface WritingCharacter {
    label: string;
    value: string;
}
  
interface WritingFormat {
    value: string;
    label: string;
}

export let config: Config;

export const loadConfig = async () => {
    const response = await fetch("config.json");
    config = await response.json();
    return config;
};
