import { encode } from "gpt-token-utils";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { OpenAIExt } from "openai-ext";
import { db, detaDB } from "../db";
import { config } from "./config";
import { useDebounce } from "./debounce";

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

export async function createStreamChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[],
  chatId: string,
  messageId: string,
  onContent: (content: string, isFinal: boolean) => void
) {
  const settings = await db.settings.get("general");
  const model = settings?.openAiModel ?? config.defaultModel;

  const debouncedSetStreamContent = useDebounce(setStreamContent, 200);

  return OpenAIExt.streamClientChatCompletion(
    {
      model,
      messages,
    },
    {
      apiKey: apiKey,
      handler: {
        onContent(content, isFinal) {
          debouncedSetStreamContent(messageId, content, isFinal);
          if (isFinal) {
            setTotalTokens(chatId, content);
          }
          onContent(content, isFinal);
        },
        onDone() {},
        onError(error) {
          console.error(error);
        },
      },
    }
  );
}

async function setStreamContent(
  messageId: string,
  content: string,
  isFinal: boolean
) {
  content = isFinal ? content : content + "█";

  await detaDB.messages.update({ content: content }, messageId);
}

async function setTotalTokens(chatId: string, content: string) {
  let total_tokens = encode(content).length;

  // todo: add to existing totalTokens
  await detaDB.chats.update({ totalTokens: total_tokens }, chatId);

  // db.chats.where({ id: chatId }).modify((chat) => {
  //   if (chat.totalTokens) {
  //     chat.totalTokens += total_tokens;
  //   } else {
  //     chat.totalTokens = total_tokens;
  //   }
  // });
}

export async function createChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[]
) {
  const settings = await db.settings.get("general");
  const model = settings?.openAiModel ?? config.defaultModel;
  const type = settings?.openAiApiType ?? config.defaultType;
  const auth = settings?.openAiApiAuth ?? config.defaultAuth;
  const base = settings?.openAiApiBase ?? config.defaultBase;
  const version = settings?.openAiApiVersion ?? config.defaultVersion;

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

export async function checkOpenAIKey(apiKey: string) {
  return createChatCompletion(apiKey, [
    {
      role: "user",
      content: "hello",
    },
  ]);
}
