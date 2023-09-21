import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { chats, messages, generateKey } from './db.js'
import type { Prompt, Message, Chat, Settings } from './types.js'

import config from "./config.js";

function getClient(
  apiKey: string,
  apiType: string,
  apiAuth: string,
  basePath: string
) {
  const configuration = new Configuration({
    ...((apiType === "openai" ||
      (apiType === "custom" && apiAuth === "bearer-token")) && {
      apiKey: apiKey,
    }),
    ...(apiType === "custom" && { basePath: basePath }),
  });
  return new OpenAIApi(configuration);
}

export async function createChatCompletion(
  settings: Settings,
  messages: ChatCompletionRequestMessage[]
) {
  const model = settings?.openAiModel ?? config.defaultModel;
  const type = settings?.openAiApiType ?? config.defaultType;
  const auth = settings?.openAiApiAuth ?? config.defaultAuth;
  const base = settings?.openAiApiBase ?? config.defaultBase;
  const version = settings?.openAiApiVersion ?? config.defaultVersion;
  const apiKey = settings.openAiApiKey!;

  const client = getClient(apiKey, type, auth, base);
  return client.createChatCompletion(
    {
      model,
      stream: false,
      messages,
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...(type === "custom" && auth === "api-key" && { "api-key": apiKey }),
      },
      params: {
        ...(type === "custom" && { "api-version": version }),
      },
    }
  );
}

export function getSystemMessage(prompt: { content?: string, character?: string, tone?: string, style?: string, format?: string }) {
  const message: string[] = [];
  if (prompt.character) message.push(`You are ${prompt.character}`);
  if (prompt.tone) message.push(`Respond in ${prompt.tone.toLowerCase()} tone.`);
  if (prompt.style) message.push(`Respond in ${prompt.style.toLowerCase()} style.`);
  if (prompt.format) message.push(`${prompt.format.toLowerCase()}.`);
  if (message.length === 0)
    message.push(
      "You are ChatGPT, a large language model trained by OpenAI."
    );
  if (prompt.content) message.push(prompt.content);
  return message.join(" ");
};

export const createChatWithMessage = async (chat: Chat, settings: Settings, content: string, prompt?: Prompt, previousMessages?: Message[]) => {
  let systemMessageValue = ""
  if (prompt) {
    systemMessageValue = getSystemMessage({
      content: prompt.content,
      character: prompt?.writingCharacter ?? undefined,
      tone: prompt?.writingTone ?? undefined,
      style: prompt?.writingStyle ?? undefined,
      format: prompt?.writingFormat ?? undefined,
    })

    const updates = {
      prompt: prompt.key,
      writingInstructions: prompt.content,
      writingCharacter: prompt.writingCharacter,
      writingTone: prompt.writingTone,
      writingStyle: prompt.writingStyle,
      writingFormat: prompt.writingFormat,
    }
    await chats.update(updates, chat.key)
  }
  
  let model = settings?.openAiModel
  if (chat?.model) {
    model = chat.model
  }

  if (!systemMessageValue) {
    systemMessageValue = getSystemMessage({
      content: chat?.writingInstructions ?? undefined,
      character: chat?.writingCharacter ?? undefined,
      tone: chat?.writingTone ?? undefined,
      style: chat?.writingStyle ?? undefined,
      format: chat?.writingFormat ?? undefined,
    })
  }

  await messages.put({
    chatId: chat.key,
    content,
    role: "user",
    createdAt: new Date().toISOString(),
  }, generateKey())

  const systemMessage = await messages.put({
    chatId: chat.key,
    content: "█",
    role: "assistant",
    createdAt: new Date().toISOString(),
  }, generateKey())

  const messageId = systemMessage!.key as string

  const completionResponse = await createChatCompletion(
    { ...settings, openAiModel: model },
    [
      {
        role: "system",
        content: systemMessageValue,
      },
      ...(previousMessages ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content },
    ]
  );

  const completionContent =
    completionResponse.data.choices[0].message?.content;

  await messages.update({ content: completionContent }, messageId);

  if (chat?.description === "New Chat" || chat?.description === "New Private Chat") {
    const res = await messages.fetch({ chatId: chat.key })
    const allMessages = res.items as unknown as Message[]
    const createChatDescription = await createChatCompletion(
      { ...settings, openAiModel: model },
      [
        {
          role: "system",
          content: systemMessageValue,
        },
        ...(allMessages ?? []).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: "user",
          content:
            "What would be a short and relevant title for this chat ? You must strictly answer with only the title, no other text is allowed. Don't use quotation marks, just return the text.",
        },
      ]
    );
    const chatDescription =
      createChatDescription.data.choices[0].message?.content;

    if (createChatDescription.data.usage) {
      const chatUpdates = {
        description: chatDescription ?? "New Chat",
        // todo: add to existing count instead of replacing
        totalTokens: createChatDescription.data.usage!.total_tokens,
      }
      await chats.update(chatUpdates, chat.key)
    }
  }

  return completionContent
}