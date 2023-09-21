export interface Chat {
    key: string;
    description: string;
    totalTokens: number;
    prompt?: string | null;
    writingInstructions?: string | null;
    writingCharacter?: string | null;
    writingTone?: string | null;
    writingStyle?: string | null;
    writingFormat?: string | null;
    model?: string | null;
    private?: boolean;
    shared?: boolean;
    createdAt: string;
  }
  
  export interface Message {
    key: string;
    chatId: string;
    role: "system" | "assistant" | "user";
    content: string;
    createdAt: string;
  }
  
  export interface Prompt {
    key: string;
    title: string;
    content: string;
    writingCharacter?: string | null;
    writingTone?: string | null;
    writingStyle?: string | null;
    writingFormat?: string | null;
    createdAt: string;
  }
  
  export interface Settings {
    key: "general";
    openAiApiKey?: string;
    openAiModel?: string;
    openAiApiType?: 'openai' | 'custom';
    openAiApiAuth?: 'none' | 'bearer-token' | 'api-key';
    openAiApiBase?: string;
    openAiApiVersion?: string;
  }
  
  export interface Integration {
    key: string;
    instance: string
    apiKey: string
  }