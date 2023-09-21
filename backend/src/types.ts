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

  export enum ViewType {
    DETAIL = '@deta/detail',
    RAW = '@deta/raw',
    FILE = '@deta/file',
    LIST = '@deta/list',
    TABLE = '@deta/table',
  }

  export type ActionInput = {
    name: string
    title?: string
    type?: string
    optional: boolean
  }

export type AppAction = {
    title: string
    name: string
    description: string
    local?: boolean
    output: ViewType
    app_name: string
    instance_id: string
    instance_alias: string
    channel: string
    version: string
    input?: ActionInput[]
    icon_url?: string
    placeholder_icon_config?: {
      css_background: string
    }
  }