import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Header,
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
  IconAdjustments,
  IconPlus,
  IconSearch,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { Link, Outlet, useNavigate, useRouter } from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { Chat, detaDB, generateKey, Prompt, Settings } from "../db";
import { useChatId } from "../hooks/useChatId";
import { Chats } from "./Chats";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoText } from "./Logo";
import { Prompts } from "./Prompts";
import { SettingsModal } from "./SettingsModal";
import { config } from "../utils/config";
import { ChatContext, ChatsContext, PromptsContext, SettingsContext } from "../hooks/contexts";
import { EditChatModal } from "./EditChatModal";

declare global {
  interface Window {
    todesktop?: any;
  }
}

export function Layout() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<"Chats" | "Prompts">("Chats");
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const chatId = useChatId();

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

  return (
    <SettingsContext.Provider value={{ settings: settings, setSettings: setSettings }}>
      <ChatContext.Provider value={{ chat: chat, setChat: setChat }}>
        <ChatsContext.Provider value={{ chats: chats, setChats: setChats }}>
          <PromptsContext.Provider value={{ prompts: prompts, setPrompts: setPrompts }}>
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
                            color: "#27B882",
                            display: "block",
                          }}
                        />
                      </Link>
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <SettingsModal>
                            <Tooltip label="Settings">
                              <ActionIcon size="xl">
                                <IconSettings size={20} />
                              </ActionIcon>
                            </Tooltip>
                        </SettingsModal>
                        <MediaQuery largerThan="md" styles={{ display: "none" }}>
                          <Burger
                            opened={opened}
                            onClick={() => setOpened((o) => !o)}
                            size="sm"
                            color={theme.colors.gray[6]}
                            className="app-region-no-drag"
                          />
                        </MediaQuery>
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
                        <Button
                          fullWidth
                          leftIcon={<IconPlus size={20} />}
                          onClick={async () => {
                            const item = await detaDB.chats.put({
                              description: "New Chat",
                              totalTokens: 0,
                              createdAt: new Date().toISOString(),
                            }, generateKey())

                            setChats(chats => ([...(chats || []), item as unknown as Chat]))

                            const id = item!.key as string
                            // const id = nanoid();
                            // db.chats.add({
                            //   id,
                            //   description: "New Chat",
                            //   totalTokens: 0,
                            //   createdAt: new Date(),
                            // });
                            navigate({ to: `/chats/${id}`, replace: true });
                          }}
                        >
                          New Chat
                        </Button>
                      )}
                      {tab === "Prompts" && <CreatePromptModal />}
                    </Box>
                  </Navbar.Section>
                  {/* <Navbar.Section sx={{ borderTop: border }} p="xs">
                    <Center>
                      {config.allowDarkModeToggle && (
                        <Tooltip
                          label={colorScheme === "dark" ? "Light Mode" : "Dark Mode"}
                        >
                          <ActionIcon
                            sx={{ flex: 1 }}
                            size="xl"
                            onClick={() => toggleColorScheme()}
                          >
                            {colorScheme === "dark" ? (
                              <IconSunHigh size={20} />
                            ) : (
                              <IconMoonStars size={20} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {config.allowSettingsModal && (
                        <SettingsModal>
                          <Tooltip label="Settings">
                            <ActionIcon sx={{ flex: 1 }} size="xl">
                              <IconSettings size={20} />
                            </ActionIcon>
                          </Tooltip>
                        </SettingsModal>
                      )}
                      {config.githubUrl && (
                        <Tooltip label="Source Code">
                          <ActionIcon
                            component="a"
                            href={config.githubUrl}
                            target="_blank"
                            sx={{ flex: 1 }}
                            size="xl"
                          >
                            <IconBrandGithub size={20} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {config.showTwitterLink && (
                        <Tooltip label="Follow on Twitter">
                          <ActionIcon
                            component="a"
                            href="https://twitter.com/deiucanta"
                            target="_blank"
                            sx={{ flex: 1 }}
                            size="xl"
                          >
                            <IconBrandTwitter size={20} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {config.showFeedbackLink && (
                        <Tooltip label="Give Feedback">
                          <ActionIcon
                            component="a"
                            href="https://feedback.chatpad.ai"
                            onClick={(event) => {
                              if (window.todesktop) {
                                event.preventDefault();
                                window.todesktop.contents.openUrlInBrowser(
                                  "https://feedback.chatpad.ai"
                                );
                              }
                            }}
                            target="_blank"
                            sx={{ flex: 1 }}
                            size="xl"
                          >
                            <IconMessage size={20} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Center>
                  </Navbar.Section> */}
                </Navbar>
              }
              header={
                chat ? (
                  <Header height={60} p="xs" className="app-region-drag">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div></div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {chat.description}
                      </div>

                      <EditChatModal chat={chat}>
                        <Tooltip label="Chat Settings">
                          <ActionIcon size="xl">
                            <IconAdjustments size={20} />
                          </ActionIcon>
                        </Tooltip>
                      </EditChatModal>
                    </Box>
                  </Header>
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
          </PromptsContext.Provider>
        </ChatsContext.Provider>
      </ChatContext.Provider>
    </SettingsContext.Provider>
  );
}
