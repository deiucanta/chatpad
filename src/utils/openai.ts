import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { db } from '../db';
import { defaultModel } from './constants';

function getClient(apiKey: string, host: string) {
  const configuration = new Configuration({
    basePath: host,
    apiKey,
  });
  return new OpenAIApi(configuration);
}

export async function createChatCompletion({
  apiKey,
  host,
  messages,
}: {
  apiKey: string;
  host: string;
  messages: ChatCompletionRequestMessage[];
}) {
  const settings = await db.settings.get('general');
  const model = settings?.openAiModel ?? defaultModel;

  const client = getClient(apiKey, host);
  return client.createChatCompletion({
    model,
    stream: false,
    messages,
  });
}

export async function checkOpenAIKey(apiKey: string, host: string) {
  return createChatCompletion({
    apiKey,
    host,
    messages: [
      {
        role: 'user',
        content: 'hello',
      },
    ],
  });
}
