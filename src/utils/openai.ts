import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { db } from "../db";
import { defaultModel } from "./constants";
import { OpenAIExt } from "openai-ext";
import { encode } from 'gpt-token-utils'

function getClient(apiKey: string) {
  const configuration = new Configuration({
    apiKey,
  });
  return new OpenAIApi(configuration);
}

export async function createStreamChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[],
  chatId: string,
  messageId: string,
) {
  const settings = await db.settings.get("general");
  const model = settings?.openAiModel ?? defaultModel;

  return OpenAIExt.streamClientChatCompletion(
    {
      model,
      messages
    },
    {
      apiKey: apiKey,
      handler: {        
        onContent(content, isFinal, stream) {
          setStreamContent(messageId, content, isFinal);
          if(isFinal){            
            setTotalTokens(chatId, content);
          }
        },
        onDone(stream) {          
        },
        onError(error, stream) {
          console.error(error);
        },
      },
    }
  );
}

function setStreamContent(messageId:string, content:string, isFinal:boolean){
  content = (isFinal ? content : content + "█")
  db.messages.update(messageId, {content: content})  
}

function setTotalTokens(chatId:string, content:string){
  let total_tokens = encode(content).length;
  db.chats.where({ id: chatId }).modify((chat) => {
    if (chat.totalTokens) {
      chat.totalTokens += total_tokens;
    } else {
      chat.totalTokens = total_tokens;
    }
  });
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
