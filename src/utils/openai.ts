import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

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
  const client = getClient(apiKey);
  return client.createChatCompletion({
    model: "gpt-3.5-turbo",
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
