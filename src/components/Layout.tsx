import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  MediaQuery,
  Navbar,
  rem,
  ScrollArea,
  SegmentedControl,
  TextInput,
  Tooltip,
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
import { Link, Outlet, useRouter } from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { Chat, detaDB, Prompt, Settings } from "../db";
import { useChatId } from "../hooks/useChatId";
import { Chats } from "./Chats";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoText } from "./Logo";
import { Prompts } from "./Prompts";
import { SettingsModal } from "./SettingsModal";
import { config } from "../utils/config";
import { ChatContext, ChatsContext, IncognitoModeContext, PromptsContext, SettingsContext } from "../hooks/contexts";
import { ChatHeader } from "./ChatHeader";
import { useLocalStorage } from "@mantine/hooks";
import { CreateChatButton } from "./CreateChatButton";

declare global {
  interface Window {
    todesktop?: any;
  }
}

export function Layout() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<"Chats" | "Prompts">("Chats");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const chatId = useChatId();

  const [incognitoMode, setIncognitoMode] = useLocalStorage({
    key: 'incognito-mode', defaultValue: false
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

      setChat(item as unknown as Chat);
    };

    if (chatId) {
      dataFetch();
    }
  }, [chatId]);

  const [chats, setChats] = useState<Chat[]>([]);
  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      const { items } = await detaDB.chats.fetch();

      setChats(items as unknown as Chat[]);
    };

    dataFetch();
  }, []);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  useEffect(() => {
    // fetch data
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
    if (incognitoMode) {
      setIncognitoMode(false)
      if (colorScheme === 'dark') {
        toggleColorScheme()
      }
    } else {
      setIncognitoMode(true)
      if (colorScheme !== 'dark') {
        toggleColorScheme()
      }
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
                          style={{ marginTop: 10, padding: 4 }}
                        >
                          <LogoText
                            style={{
                              height: 22,
                              color: theme.colors[theme.primaryColor][6],
                              display: "block",
                            }}
                          />
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
                    <Navbar.Section grow component={ScrollArea}>
                      {tab === "Chats" && <Chats search={search} />}
                      {tab === "Prompts" && (
                        <Prompts search={search} onPlay={() => setTab("Chats")} />
                      )}
                    </Navbar.Section>
                    <Navbar.Section>
                    <Box sx={{ padding: 10 }}>
                        {tab === "Chats" && (
                          <CreateChatButton fullWidth>
                            {incognitoMode ? "New Incognito Chat" : "New Chat"}
                          </CreateChatButton>
                        )}
                        {tab === "Prompts" && <CreatePromptModal />}
                      </Box>
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
                <Outlet />
              </AppShell>
            </IncognitoModeContext.Provider>
          </PromptsContext.Provider>
        </ChatsContext.Provider>
      </ChatContext.Provider>
    </SettingsContext.Provider>
  );
}
