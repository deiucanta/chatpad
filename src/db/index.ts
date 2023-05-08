import Dexie, { Table } from "dexie";
import "dexie-export-import";
import { config } from "../utils/config";

export interface Chat {
  id: string;
  description: string;
  totalTokens: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: "system" | "assistant" | "user";
  content: string;
  createdAt: Date;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Settings {
  id: "general";
  openAiApiKey?: string;
  openAiModel?: string;
  openAiApiType?: 'openai' | 'custom';
  openAiApiAuth?: 'none' | 'bearer-token' | 'api-key';
  openAiApiBase?: string;
  openAiApiVersion?: string;
}

export class Database extends Dexie {
  chats!: Table<Chat>;
  messages!: Table<Message>;
  prompts!: Table<Prompt>;
  settings!: Table<Settings>;

  constructor() {
    super("chatpad");
    this.version(2).stores({
      chats: "id, createdAt",
      messages: "id, chatId, createdAt",
      prompts: "id, createdAt",
      settings: "id",
    });

    this.on("populate", async () => {
      db.settings.add({
        id: "general",
        openAiModel: config.defaultModel,
        openAiApiType: config.defaultType,
        openAiApiAuth: config.defaultAuth,
        ...(config.defaultKey != '' && { openAiApiKey: config.defaultKey }),
        ...(config.defaultBase != '' && { openAiApiBase: config.defaultBase }),
        ...(config.defaultVersion != '' && { openAiApiVersion: config.defaultVersion }),
      });
    });
  }
}

export const db = new Database();
