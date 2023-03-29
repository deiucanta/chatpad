import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { db } from "../db";
import { config } from "./config";

function getClient(apiKey: string, apiType: string, apiAuth:string, basePath: string) {
  const configuration = new Configuration({
    ...((apiType === 'openai' || (apiType === 'custom' && apiAuth === 'bearer-token')) && { apiKey: apiKey }),
    ...(apiType === 'custom' && { basePath: basePath }),
  });  
  return new OpenAIApi(configuration);
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
      messages
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...((type === 'custom' && auth === 'api-key') && { "api-key": apiKey }),
      },
      params: {
        ...((type === 'custom') && {"api-version": version}),
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
