import { Container, SimpleGrid, Flex, Button, Text, useMantineTheme, Center, Box, Tooltip, ActionIcon, Card } from "@mantine/core";
import { useChats, useIncognitoMode, usePrompts, useSettings } from "../hooks/contexts";
import { Welcome } from "../components/Welcome";
import { LogoIcon } from "../components/Logo";
import { CreateChatButton } from "../components/CreateChatButton";
import { SettingsModal } from "../components/SettingsModal";
import { IconKey, IconPlayerPlay } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Chat, detaDB, generateKey } from "../db";
import { useNavigate } from "@tanstack/react-location";


export function IndexRoute() {
  const { settings } = useSettings()
  const theme = useMantineTheme()
  const { incognitoMode } = useIncognitoMode()
  const navigate = useNavigate();

  const { setChats } = useChats()
  const { prompts } = usePrompts()

  return (
    <>
      <Center py="xl" sx={{ height: "100%" }}>
        {prompts && prompts.length > 0 ? (
          <Container size="md" fluid>
            <Flex align="center" gap={10}>
              <LogoIcon style={{ maxWidth: 45 }} color1={theme.colors[theme.primaryColor][3]} color2={theme.colors[theme.primaryColor][7]} />
              <Text size='2.25rem' weight={700}>
                Dialogue AI
              </Text>
            </Flex>
            <Text mt={4} size="xl">
              An open-source ChatGPT UI alternative
            </Text>
            <SimpleGrid
              mt={50}
              cols={3}
              spacing={10}
              breakpoints={[{ maxWidth: "lg", cols: 1 }]}
            >
              {prompts.slice(-9).reverse().map((prompt) => (
                <Card key={prompt.key} display="flex" padding="sm" radius="md" withBorder style={{ overflow: 'unset', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box maw="180px">
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
                      {prompt.content || prompt.writingCharacter || prompt.writingTone || prompt.writingFormat || prompt.writingStyle || "No Instructions"}
                    </Text>
                  </Box>

                  <Tooltip label="Start Chat From Prompt">
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
                      }}
                    >
                      <IconPlayerPlay size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Card>
              ))}
            </SimpleGrid>
            
            <Flex mt={50} align='center' gap='md' wrap="wrap">
                {settings?.openAiApiKey && (
                  <CreateChatButton size="md">
                    {incognitoMode ? "Create a New Private Chat" : "Create a New Chat"}
                  </CreateChatButton>
                )}
                <SettingsModal>
                  <Button
                    size="md"
                    variant={settings?.openAiApiKey ? "light" : "filled"}
                    leftIcon={<IconKey size={20} />}
                  >
                    {settings?.openAiApiKey ? "Change OpenAI Key" : "Enter OpenAI Key"}
                  </Button>
                </SettingsModal>
            </Flex>
          </Container>
        ) : (
          <Welcome />
        )}
      </Center>
    </>
  );
}
