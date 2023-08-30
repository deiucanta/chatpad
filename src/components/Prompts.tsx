import { ActionIcon, Box, Flex, Group, Text, Tooltip } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-location";
import { useMemo } from "react";
import { Chat, detaDB, generateKey } from "../db";
import { createChatCompletion } from "../utils/openai";
import { DeletePromptModal } from "./DeletePromptModal";
import { EditPromptModal } from "./EditPromptModal";
import { useChats, usePrompts, useSettings } from "../hooks/contexts";

export function Prompts({
  onPlay,
  search,
}: {
  onPlay: () => void;
  search: string;
}) {
  const navigate = useNavigate();

  const { prompts } = usePrompts()
  const { setChats } = useChats()

  const filteredPrompts = useMemo(
    () =>
      (prompts ?? []).filter((prompt) => {
        if (!search) return true;
        return (
          prompt.title.toLowerCase().includes(search) ||
          prompt.content.toLowerCase().includes(search)
        );
      }),
    [prompts, search]
  );

  const { settings } = useSettings()

  return (
    <>
      {filteredPrompts.map((prompt) => (
        <Flex
          key={prompt.key}
          sx={(theme) => ({
            marginTop: 1,
            padding: theme.spacing.xs,
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Box
            sx={(theme) => ({
              flexGrow: 1,
              width: 0,
              fontSize: theme.fontSizes.sm,
            })}
          >
            <Text
              weight={500}
              sx={{
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {prompt.title}
            </Text>
            <Text
              color="dimmed"
              sx={{
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {prompt.content}
            </Text>
          </Box>
          <Group spacing="none">
            <Tooltip label="New Chat From Prompt">
              <ActionIcon
                size="lg"
                onClick={async () => {
                  if (!settings?.openAiApiKey) return;

                  const item = await detaDB.chats.put({
                    description: "New Chat",
                    totalTokens: 0,
                    createdAt: new Date().toISOString(),
                  }, generateKey())

                  const chat = item as unknown as Chat
                  setChats(current => ([...(current || []), chat]))

                  await detaDB.messages.put({
                    chatId: chat.key,
                    content: prompt.content,
                    role: "user",
                    createdAt: new Date().toISOString(),
                  }, generateKey())

                  navigate({ to: `/chats/${chat.key}` });
                  onPlay();

                  const result = await createChatCompletion(settings, [
                    {
                      role: "system",
                      content:
                        "You are ChatGPT, a large language model trained by OpenAI.",
                    },
                    { role: "user", content: prompt.content },
                  ]);

                  const resultDescription =
                    result.data.choices[0].message?.content;

                  await detaDB.messages.put({
                    chatId: chat.key,
                    content: resultDescription ?? "unknown reponse",
                    role: "assistant",
                    createdAt: new Date().toISOString(),
                  }, generateKey())

                  if (result.data.usage) {
                    // todo: add to chat totalTokens
                    await detaDB.chats.update({ totalTokens: result.data.usage!.total_tokens }, chat.key)

                    // await db.chats.where({ id: chat.key }).modify((chat) => {
                    //   if (chat.totalTokens) {
                    //     chat.totalTokens += result.data.usage!.total_tokens;
                    //   } else {
                    //     chat.totalTokens = result.data.usage!.total_tokens;
                    //   }
                    // });
                  }
                }}
              >
                <IconPlayerPlay size={20} />
              </ActionIcon>
            </Tooltip>
            <EditPromptModal prompt={prompt} />
            <DeletePromptModal prompt={prompt} />
          </Group>
        </Flex>
      ))}
    </>
  );
}
