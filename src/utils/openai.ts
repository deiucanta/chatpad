import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { db } from "../db";
import { defaultModel } from "./constants";

function getClient(apiKey: string) {
  const configuration = new Configuration({
    apiKey,
  });
  return new OpenAIApi(configuration);
}

export async function createChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[]
) {
  const settings = await db.settings.get("general");
  const model = settings?.openAiModel ?? defaultModel;

  const client = getClient(apiKey);
  return client.createChatCompletion({
    model,
    stream: false,
    messages,
  });
}

export async function checkOpenAIKey(apiKey: string) {
  return createChatCompletion(apiKey, [
    {
      role: "user",
      content: "hello",
    },
  ]);
}
