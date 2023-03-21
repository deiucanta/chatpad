import { ActionIcon, Box, Flex, Group, Text, Tooltip } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-location";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { db } from "../db";
import { createChatCompletion } from "../utils/openai";
import { DeletePromptModal } from "./DeletePromptModal";
import { EditPromptModal } from "./EditPromptModal";

export function Prompts({
  onPlay,
  search,
}: {
  onPlay: () => void;
  search: string;
}) {
  const navigate = useNavigate();
  const prompts = useLiveQuery(() =>
    db.prompts.orderBy("createdAt").reverse().toArray()
  );
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
  const apiKey = useLiveQuery(async () => {
    return (await db.settings.where({ id: "general" }).first())?.openAiApiKey;
  });

  return (
    <>
      {filteredPrompts.map((prompt) => (
        <Flex
          key={prompt.id}
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
                  if (!apiKey) return;
                  const id = nanoid();
                  await db.chats.add({
                    id,
                    description: "New Chat",
                    totalTokens: 0,
                    createdAt: new Date(),
                  });
                  await db.messages.add({
                    id: nanoid(),
                    chatId: id,
                    content: prompt.content,
                    role: "user",
                    createdAt: new Date(),
                  });
                  navigate({ to: `/chats/${id}` });
                  onPlay();

                  const result = await createChatCompletion(apiKey, [
                    {
                      role: "system",
                      content:
                        "You are ChatGPT, a large language model trained by OpenAI.",
                    },
                    { role: "user", content: prompt.content },
                  ]);

                  const resultDescription =
                    result.data.choices[0].message?.content;
                  await db.messages.add({
                    id: nanoid(),
                    chatId: id,
                    content: resultDescription ?? "unknown reponse",
                    role: "assistant",
                    createdAt: new Date(),
                  });

                  if (result.data.usage) {
                    await db.chats.where({ id: id }).modify((chat) => {
                      if (chat.totalTokens) {
                        chat.totalTokens += result.data.usage!.total_tokens;
                      } else {
                        chat.totalTokens = result.data.usage!.total_tokens;
                      }
                    });
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
