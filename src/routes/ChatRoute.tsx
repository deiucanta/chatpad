import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Select,
  Skeleton,
  Stack,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { KeyboardEvent, useState, type ChangeEvent, useEffect } from "react";
import { IconSend, IconPlayerStop } from "@tabler/icons-react";
import { MessageItem } from "../components/MessageItem";
import { Message, Prompt, detaDB, generateKey } from "../db";
import { useChatId } from "../hooks/useChatId";
import {
  createChatCompletion,
  createStreamChatCompletion,
  getSystemMessage,
} from "../utils/openai";
import { useChat, useChats, usePrompts, useSettings } from "../hooks/contexts";
import { CreatePromptModal } from "../components/CreatePromptModal";
import { config } from "../utils/config";

export function ChatRoute() {
  const chatId = useChatId();

  const { settings } = useSettings()
  const { prompts } = usePrompts()

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      const { items } = await detaDB.messages.fetch({ chatId }, { desc: false });

      setMessages(items as unknown as Message[]);
    };

    dataFetch();
  }, [chatId]);

  // const messages = useLiveQuery(() => {
  //   if (!chatId) return [];
  //   return db.messages.where("chatId").equals(chatId).sortBy("createdAt");
  // }, [chatId]);
  const userMessages =
    messages
      ?.filter((message) => message.role === "user")
      .map((message) => message.content) || [];
  const [userMsgIndex, setUserMsgIndex] = useState(0);
  const [content, setContent] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coolDown, setCoolDown] = useState(false);
  const [chatStream, setChatStream] = useState<any>(null);
  const [promptKey, setPromptKey] = useState<string | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const { setChats } = useChats()
  const { chat, setChat } = useChat()

  useEffect(() => {
    if (chat?.prompt) {
      setPromptKey(chat.prompt)
    }
  }, [chat]);

  const submit = async () => {
    if (submitting || coolDown) return;

    if (!chatId) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "chatId is not defined. Please create a chat to get started.",
      });
      return;
    }

    if (!settings?.openAiApiKey) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "OpenAI API Key is not defined. Please set your API Key",
      });
      return;
    }

    try {
      setSubmitting(true);

      let systemMessageValue = ""
      if (promptKey) {
        const item = await detaDB.prompts.get(promptKey);
        if (item) {
          const prompt = item as unknown as Prompt

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
          setChat(chat => ({ ...chat!, ...updates }))
          await detaDB.chats.update(updates, chatId)
        }
      }

      let model = settings?.openAiModel
      if (selectedModel && selectedModel !== 'default') {
        model = selectedModel
      } else if (chat?.model) {
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

      const userMessage = await detaDB.messages.put({
        chatId,
        content,
        role: "user",
        createdAt: new Date().toISOString(),
      }, generateKey())

      setMessages(current => [...current, userMessage as unknown as Message])
      setContent("");
      setPromptKey(null);

      const systemMessage = await detaDB.messages.put({
        chatId,
        content: "█",
        role: "assistant",
        createdAt: new Date().toISOString(),
      }, generateKey())

      setMessages(current => [...current, systemMessage as unknown as Message])
      setGenerating(true)

      const messageId = systemMessage!.key as string
      const chatCompletionStream = createStreamChatCompletion(
        { ...settings, openAiModel: model },
        [
          {
            role: "system",
            content: systemMessageValue,
          },
          ...(messages ?? []).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          { role: "user", content },
        ],
        chatId,
        messageId,
        (content) => {      
          setMessages(current => current.map(message => {
            if (message.key === messageId) {
              return { ...message, content };
            }
      
            return message;
          }));
        },
        () => {
          setGenerating(false)
          setChatStream(null)
          setCoolDown(true);
          setTimeout(() => setCoolDown(false), 500);
        },
      );

      setChatStream(chatCompletionStream)
      setSubmitting(false);

      if (chat?.description === "New Chat") {
        const res = await detaDB.messages.fetch({ chatId })
        const messages = res.items as unknown as Message[]
        // const messages = await db.messages
        //   .where({ chatId })
        //   .sortBy("createdAt");
        const createChatDescription = await createChatCompletion(
          { ...settings, openAiModel: model },
          [
            {
              role: "system",
              content: systemMessageValue,
            },
            ...(messages ?? []).map((message) => ({
              role: message.role,
              content: message.content,
            })),
            {
              role: "user",
              content:
                "What would be a short and relevant title for this chat ? You must strictly answer with only the title, no other text is allowed. Don't use quotation marks",
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
          await detaDB.chats.update(chatUpdates, chatId)

          setChat(chat => ({ ...chat!, ...chatUpdates }))
          setChats(current => (current || []).map(item => {
            if (item.key === chat.key) {
              return { ...item, ...chatUpdates };
            }
      
            return item;
          }));

          // await db.chats.where({ id: chatId }).modify((chat) => {
          //   chat.description = chatDescription ?? "New Chat";
          //   if (chat.totalTokens) {
          //     chat.totalTokens +=
          //       createChatDescription.data.usage!.total_tokens;
          //   } else {
          //     chat.totalTokens = createChatDescription.data.usage!.total_tokens;
          //   }
          // });
        }
      }
    } catch (error: any) {
      setGenerating(false)
      if (error.toJSON().message === "Network Error") {
        notifications.show({
          title: "Error",
          color: "red",
          message: "No internet connection.",
        });
      }
      const message = error.response?.data?.error?.message;
      if (message) {
        notifications.show({
          title: "Error",
          color: "red",
          message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stopGeneration = async () => {
    if (chatStream) {
      chatStream.abort()
      setChatStream(null)
    }
  }

  const onUserMsgToggle = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd } = event.currentTarget;
    if (
      !["ArrowUp", "ArrowDown"].includes(event.code) ||
      selectionStart !== selectionEnd ||
      (event.code === "ArrowUp" && selectionStart !== 0) ||
      (event.code === "ArrowDown" &&
        selectionStart !== event.currentTarget.value.length)
    ) {
      // do nothing
      return;
    }
    event.preventDefault();

    const newMsgIndex = userMsgIndex + (event.code === "ArrowUp" ? 1 : -1);
    const allMessages = [contentDraft, ...Array.from(userMessages).reverse()];

    if (newMsgIndex < 0 || newMsgIndex >= allMessages.length) {
      // index out of range, do nothing
      return;
    }
    setContent(allMessages.at(newMsgIndex) || "");
    setUserMsgIndex(newMsgIndex);
  };

  const onContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setContent(value);
    setContentDraft(value);
    setUserMsgIndex(0);
  };

  const handleMessageDelete = (key: string) => {
    setMessages(current => current.filter(message => message.key !== key))
  }

  const handleUseMessage = (message: string) => {
    setContent(message)
  }

  if (!chatId) return null;

  return (
    <>
      <Container pt="xl" pb={100}>
        <Stack spacing="xs">
          {messages?.map((message) => (
            <MessageItem key={message.key} message={message} onDeleted={handleMessageDelete} handleUseMessage={handleUseMessage} />
          ))}
        </Stack>
        {submitting && (
          <Card withBorder mt="xs">
            <Skeleton height={8} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} width="70%" radius="xl" />
          </Card>
        )}
      </Container>
      <Box
        py="lg"
        sx={(theme) => ({
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          [`@media (min-width: ${theme.breakpoints.md})`]: {
            left: 300,
          },
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[0],
        })}
      >
        <Container>
          {messages?.length === 0 && (
            <Box
              mb="sm"
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                data={[
                  { label: 'Chats use the model set in settings by default. Use this to overwrite it.', value: 'default', disabled: true },
                  ...config.simplifiedModels,
                ]}
                placeholder="Pin chat to model"
                variant="filled"
                searchable
                clearable
              />

              <Select
                value={promptKey}
                onChange={setPromptKey}
                data={[
                  { label: 'Select a prompt to use', value: 'default', disabled: true },
                  ...prompts.map(prompt => ({ value: prompt.key, label: prompt.title }))
                ]}
                placeholder="Select Prompt"
                variant="filled"
                searchable
                clearable
                creatable
                getCreateLabel={(query) => `+ Create "${query}" Prompt`}
                onCreate={(query) => {
                  setNewPromptTitle(query)
                  return query;
                }}
              />

              {newPromptTitle && <CreatePromptModal title={newPromptTitle} open={true} />}
            </Box>
          )}
          <Flex gap="sm" style={{ position: 'relative' }}>
            <Textarea
              key={chatId}
              sx={{ flex: 1 }}
              styles={{ input: { paddingRight: 60, paddingTop: '0.7rem !important', paddingBottom: '0.7rem !important' } }}
              placeholder="Your message here..."
              autosize
              autoFocus
              disabled={submitting}
              minRows={1}
              maxRows={8}
              value={content}
              onChange={onContentChange}
              onKeyDown={async (event) => {
                if (event.code === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                  setUserMsgIndex(0);
                }
                if (event.code === "ArrowUp") {
                  onUserMsgToggle(event);
                }
                if (event.code === "ArrowDown") {
                  onUserMsgToggle(event);
                }
              }}
            />
            <Button
              w="auto"
              h="auto"
              px={8}
              py={5}
              onClick={() => {
                if (generating) {
                  stopGeneration();

                  notifications.show({
                    title: "Stopped",
                    color: "green",
                    message: "Generation stopped.",
                  });
                } else {
                  submit();
                }
              }}
              style={{ position: 'absolute', right: 5, bottom: 5 }}
              disabled={!generating && !content}
            >
              {generating ? (<IconPlayerStop />) : (<IconSend />)}
            </Button>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
