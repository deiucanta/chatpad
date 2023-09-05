import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Flex,
  MediaQuery,
  Navbar,
  rem,
  ScrollArea,
  SegmentedControl,
  TextInput,
  Tooltip,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconSearch,
  IconSettings,
  IconSpy,
  IconSpyOff,
  IconX,
} from "@tabler/icons-react";
import { Link, useNavigate, useRouter } from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { Chat, detaDB, Prompt, Settings } from "../db";
import { useChatId } from "../hooks/useChatId";
import { Chats } from "../components/Chats";
import { CreatePromptModal } from "../components/CreatePromptModal";
import { LogoIcon } from "../components/Logo";
import { Prompts } from "../components/Prompts";
import { SettingsModal } from "../components/SettingsModal";
import { config } from "../utils/config";
import { ChatContext, ChatsContext, IncognitoModeContext, PromptsContext, SettingsContext } from "../hooks/contexts";
import { ChatHeader } from "../components/ChatHeader";
import { useLocalStorage } from "@mantine/hooks";
import { CreateChatButton } from "../components/CreateChatButton";
import { DeleteChatsModal } from "../components/DeleteChatsModal";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const router = useRouter();

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const chatId = useChatId();

  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<"Chats" | "Prompts">("Chats");
  const [search, setSearch] = useState("");

  const [incognitoMode, setIncognitoMode] = useLocalStorage({
    key: 'incognito-mode', defaultValue: false, getInitialValueInEffect: false
  });

  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    const dataFetch = async () => {
      let item = await detaDB.settings.get('general');

      if (!item) {
        item = await detaDB.settings.put({
          key: "general",
          openAiModel: config.defaultModel,
          openAiApiType: config.defaultType,
          openAiApiAuth: config.defaultAuth,
          ...(config.defaultKey != '' && { openAiApiKey: config.defaultKey }),
          ...(config.defaultBase != '' && { openAiApiBase: config.defaultBase }),
          ...(config.defaultVersion != '' && { openAiApiVersion: config.defaultVersion }),
        }, 'general');
      }

      setSettings(item as unknown as Settings);
    };

    dataFetch();
  }, []);

  const [chat, setChat] = useState<Chat | null>(null);
  useEffect(() => {
    const dataFetch = async () => {
      const item = await detaDB.chats.get(chatId!);
      const fetchedChat = item as unknown as Chat

      setChat(fetchedChat);

      if (fetchedChat.private && !incognitoMode) {
        setIncognitoMode(true)
        if (colorScheme === 'light') {
          toggleColorScheme()
        }
      } else if (!(fetchedChat.private ?? false) && incognitoMode) {
        setIncognitoMode(false)
        if (colorScheme === 'dark') {
          toggleColorScheme()
        }
      }
    };

    if (chatId) {
      dataFetch();
    } else {
      setChat(null);
    }
  }, [chatId]);

  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    const dataFetch = async () => {
      const { items } = await detaDB.chats.fetch(incognitoMode ? { private: true } : { 'private?ne': true });

      setChats(items as unknown as Chat[]);
    };

    dataFetch();
  }, [incognitoMode]);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  useEffect(() => {
    const dataFetch = async () => {
      const { items } = await detaDB.prompts.fetch();

      setPrompts(items as unknown as Prompt[]);
    };

    dataFetch();
  }, []);

  const border = `${rem(1)} solid ${
    theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
  }`;

  useEffect(() => {
    setOpened(false);
  }, [router.state.location]);

  const handleIncognito = () => {
    const newValue = !incognitoMode

    // if we are in a chat that doesn't match the mode, navigate to home view
    if (chat && (chat?.private ?? false) !== newValue) {
      setChat(null)
      navigate({ to: `/`, replace: true });
    }

    setIncognitoMode(newValue)

    const isDark = colorScheme === 'dark'
    if (newValue && !isDark) {
      toggleColorScheme()
    } else if (!newValue && isDark) {
      toggleColorScheme()
    }
  }

  return (
    <SettingsContext.Provider value={{ settings: settings, setSettings: setSettings }}>
      <ChatContext.Provider value={{ chat: chat, setChat: setChat }}>
        <ChatsContext.Provider value={{ chats: chats, setChats: setChats }}>
          <PromptsContext.Provider value={{ prompts: prompts, setPrompts: setPrompts }}>
            <IncognitoModeContext.Provider value={{ incognitoMode: incognitoMode, setIncognitoMode: setIncognitoMode }}>
              <AppShell
                className={`${colorScheme}-theme`}
                navbarOffsetBreakpoint="sm"
                navbar={
                  <Navbar width={{ md: 300 }} hiddenBreakpoint="md" hidden={!opened}>
                    <Navbar.Section className="app-region-drag">
                      <Box
                        style={{
                          height: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: 10,
                          borderBottom: border,
                        }}
                      >
                        <Link
                          to="/"
                          className="app-region-no-drag"
                          style={{ padding: 4, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <LogoIcon style={{ height: 22, display: "block", }} color1={theme.colors[theme.primaryColor][3]} color2={theme.colors[theme.primaryColor][7]} />
                          <Text size='1.25rem' weight={600}>
                            Dialogue AI
                          </Text>
                        </Link>
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          {incognitoMode ? (
                            <Tooltip label="Disable Incognito Mode">
                              <ActionIcon
                                size="xl"
                                onClick={handleIncognito}
                              >
                                <IconSpyOff size={20} />
                              </ActionIcon>
                            </Tooltip>
                          ) : (
                            <Tooltip label="Incognito Mode">
                              <ActionIcon
                                size="xl"
                                onClick={handleIncognito}
                              >
                                <IconSpy size={20} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <SettingsModal>
                            <Tooltip label="Settings">
                              <ActionIcon
                                size="xl"
                                sx={(theme) => ({
                                  [theme.fn.smallerThan('md')]: {
                                    marginRight: '2.5rem',
                                  },
                                })}
                                >
                                <IconSettings size={20} />
                              </ActionIcon>
                            </Tooltip>
                          </SettingsModal>
                        </Box>
                      </Box>
                    </Navbar.Section>
                    <Navbar.Section
                      sx={(theme) => ({
                        padding: rem(4),
                        background:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : theme.colors.gray[1],
                        borderBottom: border,
                      })}
                    >
                      <SegmentedControl
                        fullWidth
                        value={tab}
                        onChange={(value) => setTab(value as typeof tab)}
                        data={["Chats", "Prompts"]}
                      />
                    </Navbar.Section>
                    <Navbar.Section
                      sx={(theme) => ({
                        padding: rem(4),
                        background:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.white,
                        borderBottom: border,
                      })}
                    >
                      <TextInput
                        variant="unstyled"
                        radius={0}
                        placeholder="Search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.currentTarget.value.toLowerCase())
                        }
                        sx={{ paddingInline: 4 }}
                        icon={<IconSearch opacity={0.8} size={20} />}
                        rightSection={
                          !!search && (
                            <ActionIcon onClick={() => setSearch("")}>
                              <IconX opacity={0.5} size={20} />{" "}
                            </ActionIcon>
                          )
                        }
                      />
                    </Navbar.Section>
                    <Navbar.Section grow component={ScrollArea} id="chats">
                      {tab === "Chats" && <Chats search={search} />}
                      {tab === "Prompts" && (
                        <Prompts search={search} onPlay={() => setTab("Chats")} />
                      )}
                    </Navbar.Section>
                    <Navbar.Section>
                      <Flex direction="column" p={10} gap="xs">
                        {tab === "Chats" && (
                          <>
                            { incognitoMode && (
                              <DeleteChatsModal />
                            )}
                            <CreateChatButton fullWidth>
                              {incognitoMode ? "New Private Chat" : "New Chat"}
                            </CreateChatButton>
                          </>
                        )}
                        {tab === "Prompts" && <CreatePromptModal />}
                      </Flex>
                    </Navbar.Section>
                  </Navbar>
                }
                header={
                  chat ? (
                    <ChatHeader />
                  ) : undefined
                }
                layout="alt"
                padding={0}
              >
                <MediaQuery largerThan="md" styles={{ display: "none" }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    className="app-region-no-drag"
                    sx={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}
                  />
                </MediaQuery>
                {children}
              </AppShell>
            </IncognitoModeContext.Provider>
          </PromptsContext.Provider>
        </ChatsContext.Provider>
      </ChatContext.Provider>
    </SettingsContext.Provider>
  );
}
