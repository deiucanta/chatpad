import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  MediaQuery,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { KeyboardEvent, useState, type ChangeEvent } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { MessageItem } from "../components/MessageItem";
import { db } from "../db";
import { useChatId } from "../hooks/useChatId";
import { config } from "../utils/config";
import {
  createChatCompletion,
  createStreamChatCompletion,
} from "../utils/openai";
import {t} from "i18next";

export function ChatRoute() {
  const chatId = useChatId();
  const apiKey = useLiveQuery(async () => {
    return (await db.settings.where({ id: "general" }).first())?.openAiApiKey;
  });
  const messages = useLiveQuery(() => {
    if (!chatId) return [];
    return db.messages.where("chatId").equals(chatId).sortBy("createdAt");
  }, [chatId]);
  const userMessages =
    messages
      ?.filter((message) => message.role === "user")
      .map((message) => message.content) || [];
  const [userMsgIndex, setUserMsgIndex] = useState(0);
  const [content, setContent] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const chat = useLiveQuery(async () => {
    if (!chatId) return null;
    return db.chats.get(chatId);
  }, [chatId]);

  const [writingCharacter, setWritingCharacter] = useState<string | null>(null);
  const [writingTone, setWritingTone] = useState<string | null>(null);
  const [writingStyle, setWritingStyle] = useState<string | null>(null);
  const [writingFormat, setWritingFormat] = useState<string | null>(null);

  const getSystemMessage = () => {
    const message: string[] = [];
    // @ts-ignore
    if (writingCharacter) message.push(t('youAre') + ` ${writingCharacter}.`);
    if (writingTone) message.push(t('respondInTone') + ` ${writingTone} ` + t('tone'));
    if (writingStyle) message.push(t('respondInStyle') +` ${writingStyle} ` + t('style'));
    if (writingFormat) message.push(writingFormat);
    if (message.length === 0)
      message.push(t('youAreChatGPT'));
    return message.join(" ");
  };

  const submit = async () => {
    if (submitting) return;

    if (!chatId) {
      notifications.show({
        title: t('chatIdError.title'),
        color: "red",
        message: t('chatIdError.message'),
      });
      return;
    }

    if (!apiKey) {
      notifications.show({
        title: t('apiKeyError.title'),
        color: "red",
        message: t('apiKeyError.message'),
      });
      return;
    }

    try {
      setSubmitting(true);

      await db.messages.add({
        id: nanoid(),
        chatId,
        content,
        role: "user",
        createdAt: new Date(),
      });
      setContent("");

      const messageId = nanoid();
      await db.messages.add({
        id: messageId,
        chatId,
        content: "█",
        role: "assistant",
        createdAt: new Date(),
      });

      await createStreamChatCompletion(
        apiKey,
        [
          {
            role: "system",
            content: getSystemMessage(),
          },
          ...(messages ?? []).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          { role: "user", content },
        ],
        chatId,
        messageId
      );

      setSubmitting(false);

      if (chat?.description === t('newChat')) {
        const messages = await db.messages
          .where({ chatId })
          .sortBy("createdAt");
        const createChatDescription = await createChatCompletion(apiKey, [
          {
            role: "system",
            content: getSystemMessage(),
          },
          ...(messages ?? []).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          {
            role: "user",
            content: t('defineTitleChat'),
          },
        ]);
        const chatDescription =
          createChatDescription.data.choices[0].message?.content;

        if (createChatDescription.data.usage) {
          await db.chats.where({ id: chatId }).modify((chat) => {
            chat.description = chatDescription ?? t('newChat');
            if (chat.totalTokens) {
              chat.totalTokens +=
                createChatDescription.data.usage!.total_tokens;
            } else {
              chat.totalTokens = createChatDescription.data.usage!.total_tokens;
            }
          });
        }
      }
    } catch (error: any) {
      if (error.toJSON().message === "Network Error") {
        notifications.show({
          title: t('networkError.title'),
          color: "red",
          message: t('networkError.message'),
        });
      }
      const message = error.response?.data?.error?.message;
      if (message) {
        notifications.show({
          title: t('error.title'),
          color: "red",
          message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!chatId) return null;

  return (
    <>
      <Container pt="xl" pb={100}>
        <Stack spacing="xs">
          {messages?.map((message) => (
            <MessageItem key={message.id} message={message} />
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
            <SimpleGrid
              mb="sm"
              spacing="xs"
              breakpoints={[
                { minWidth: "sm", cols: 4 },
                { maxWidth: "sm", cols: 2 },
              ]}
            >
              <Select
                value={writingCharacter}
                onChange={setWritingCharacter}
                data={config.writingCharacters}
                placeholder={t('character')}
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingTone}
                onChange={setWritingTone}
                data={config.writingTones}
                placeholder={t('toneList')}
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingStyle}
                onChange={setWritingStyle}
                data={config.writingStyles}
                placeholder={t('styleList')}
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingFormat}
                onChange={setWritingFormat}
                data={config.writingFormats}
                placeholder={t('format')}
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
            </SimpleGrid>
          )}
          <Flex gap="sm">
            <Textarea
              key={chatId}
              sx={{ flex: 1 }}
              placeholder={t('yourMessageHere')}
              autosize
              autoFocus
              disabled={submitting}
              minRows={1}
              maxRows={5}
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
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Button
                h="auto"
                onClick={() => {
                  submit();
                }}
              >
                <AiOutlineSend />
              </Button>
            </MediaQuery>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
