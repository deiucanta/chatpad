interface Config {
    defaultModel: AvailableModel["value"];
    defaultType: 'openai' | 'custom';
    defaultAuth: 'none' | 'bearer-token' | 'api-key';
    defaultBase: string;
    defaultVersion: string;
    defaultKey: string;
    availableModels: AvailableModel[];
    writingCharacters: WritingCharacter[];
    writingTones: string[];
    writingStyles: string[];
    writingFormats: WritingFormat[];
    showDownloadLink: boolean;
    allowDarkModeToggle: boolean;
    allowSettingsModal: boolean;
    allowDatabaseModal: boolean;
    showTwitterLink: boolean;
    showFeedbackLink: boolean;
    githubUrl: string;
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

export async function loadConfig() {
    config = await import('../config.json') as Config;
}
