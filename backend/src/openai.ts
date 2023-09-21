import { chats, messages, prompts, generateKey, Prompt, Message, Chat, Settings } from './db.js'

import { getSystemMessage, createChatCompletion } from '../../src/utils/openai.js'

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