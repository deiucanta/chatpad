import { ActionIcon, Box, Flex, Group, Text, Tooltip } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-location";
import { useMemo } from "react";
import { Chat, detaDB, generateKey } from "../db";
import { DeletePromptModal } from "./DeletePromptModal";
import { EditPromptModal } from "./EditPromptModal";
import { useChats, usePrompts, useSettings } from "../hooks/contexts";
import { notifications } from "@mantine/notifications";

export default function Prompts({
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
              {prompt.content || prompt.writingCharacter || prompt.writingTone || prompt.writingFormat || prompt.writingStyle}
            </Text>
          </Box>
          <Group spacing="none">
            <Tooltip label="New Chat From Prompt">
              <ActionIcon
                size="lg"
                onClick={async () => {
                  if (!settings?.openAiApiKey) {
                    notifications.show({
                      title: "Error",
                      color: "red",
                      message: "OpenAI API Key is not defined. Please set your API Key",
                    });
                    return;
                  };

                  const item = await detaDB.chats.put({
                    description: prompt.title ? `New ${prompt.title} Chat` : "New Chat",
                    prompt: prompt.key,
                    writingInstructions: prompt.content,
                    writingCharacter: prompt.writingCharacter,
                    writingTone: prompt.writingTone,
                    writingStyle: prompt.writingStyle,
                    writingFormat: prompt.writingFormat,
                    totalTokens: 0,
                    createdAt: new Date().toISOString(),
                  }, generateKey())

                  const chat = item as unknown as Chat
                  setChats(current => ([...(current || []), chat]))

                  navigate({ to: `/chats/${chat.key}` });
                  onPlay();
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
