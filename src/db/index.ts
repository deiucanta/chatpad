import { Deta } from "deta";
import { nanoid } from "nanoid";

export * from './types.js'

export const deta = Deta()

export const detaDB = {
  chats: deta.Base("chats"),
  messages: deta.Base("messages"),
  prompts: deta.Base("prompts"),
  settings: deta.Base("settings"),
  integrations: deta.Base("integrations"),
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
//     super("dialogue");
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
