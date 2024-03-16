import { encode } from "gpt-token-utils";
import OpenAI from 'openai';
import { db } from "../db";
import { config } from "./config";

function getClient(apiKey: string, apiType: string, apiAuth: string, basePath: string, version: string) {
  var openai
  if (apiType === "openai" || (apiType === "custom" && apiAuth === "bearer-token")) {
    openai = new OpenAI({apiKey: apiKey, dangerouslyAllowBrowser: true});
  }
  else {
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: basePath,
      dangerouslyAllowBrowser: true,
      defaultQuery: { 'api-version': version },
      defaultHeaders: { 'api-key': apiKey }
    });
  }
  return openai;
}

export async function createStreamChatCompletion(
  apiKey: string,
  messages: Array<{ role: string; content: string; }>,
  chatId: string,
  messageId: string
) {
  const settings = await db.settings.get("general");
  const type = settings?.openAiApiType ?? config.defaultType;
  const auth = settings?.openAiApiAuth ?? config.defaultAuth;
  const base = settings?.openAiApiBase ?? config.defaultBase;
  const version = settings?.openAiApiVersion ?? config.defaultVersion;
  const model = settings?.openAiModel ?? config.defaultModel;
  const client = getClient(apiKey, type, auth, base, version);
  const stream = await client.beta.chat.completions.stream({
    model: 'gpt-4',
    messages,
    stream: true,
  });
  var full = "";
  stream.on('content', (delta, snapshot) => {
    full += delta;
    setStreamContent(messageId, full, false);
  });

  const chatCompletion = await stream.finalChatCompletion();
  setStreamContent(messageId, full, true);
  setTotalTokens(chatId, full);
}

function setStreamContent(
  messageId: string,
  content: string,
  isFinal: boolean
) {
  content = isFinal ? content : content + "█";
  db.messages.update(messageId, { content: content });
}

function setTotalTokens(chatId: string, content: string) {
  let total_tokens = encode(content).length;
  db.chats.where({ id: chatId }).modify((chat) => {
    if (chat.totalTokens) {
      chat.totalTokens += total_tokens;
    } else {
      chat.totalTokens = total_tokens;
    }
  });
}

export async function createChatCompletion(apiKey: string, messages: Array<{ role: string; content: string; }>) {
  const settings = await db.settings.get("general");
  const model = settings?.openAiModel ?? config.defaultModel;
  const type = settings?.openAiApiType ?? config.defaultType;
  const auth = settings?.openAiApiAuth ?? config.defaultAuth;
  const base = settings?.openAiApiBase ?? config.defaultBase;
  const version = settings?.openAiApiVersion ?? config.defaultVersion;

  const client = getClient(apiKey, type, auth, base, version);
  return client.chat.completions.create(
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

export async function checkOpenAIKey(apiKey: string) {
  return createChatCompletion(apiKey, [
    {
      role: "user",
      content: "hello",
    },
  ]);
}
