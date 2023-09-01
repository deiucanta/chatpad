import { Deta } from "deta";
import "dexie-export-import";
import { nanoid } from "nanoid";

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

export const deta = Deta()

export const detaDB = {
  chats: deta.Base("chats"),
  messages: deta.Base("messages"),
  prompts: deta.Base("prompts"),
  settings: deta.Base("settings"),
}

// Used as large number to make sure keys are generated in descending order
const maxDateNowValue = 8.64e15 

export const generateKey = (ascending: boolean = true): string => {
	const timestamp = ascending ? Date.now() : maxDateNowValue - Date.now()

	return `${ timestamp.toString(16) }${ nanoid(5) }`
}

// export class Database extends Dexie {
//   chats!: Table<Chat>;
//   messages!: Table<Message>;
//   prompts!: Table<Prompt>;
//   settings!: Table<Settings>;

//   constructor() {
//     super("chatpad");
//     this.version(2).stores({
//       chats: "id, createdAt",
//       messages: "id, chatId, createdAt",
//       prompts: "id, createdAt",
//       settings: "id",
//     });

//     this.on("populate", async () => {
//       db.settings.add({
//         key: "general",
//         openAiModel: config.defaultModel,
//         openAiApiType: config.defaultType,
//         openAiApiAuth: config.defaultAuth,
//         ...(config.defaultKey != '' && { openAiApiKey: config.defaultKey }),
//         ...(config.defaultBase != '' && { openAiApiBase: config.defaultBase }),
//         ...(config.defaultVersion != '' && { openAiApiVersion: config.defaultVersion }),
//       });
//     });
//   }
// }

// export const db = new Database();
