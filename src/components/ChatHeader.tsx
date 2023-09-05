import { ActionIcon, Box, Flex, Header, TextInput, Tooltip, useMantineTheme } from "@mantine/core";
import { IconAdjustments, IconInfoCircle, IconShare2, IconWorld } from "@tabler/icons-react";
import { EditChatModal } from "./EditChatModal";
import { Chat, detaDB } from "../db";
import { useEffect, useRef, useState } from "react";
import { useChat, useChats } from "../hooks/contexts";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ShareChatModal } from "./ShareChatModal";
import { LogoText } from "./Logo";
import { Link } from "@tanstack/react-location";

export function ChatHeader({ readOnly = false }: { readOnly?: boolean}) {
    const [title, setTitle] = useState('')
    const [debounced] = useDebouncedValue(title, 800);
    const theme = useMantineTheme()

    const { chat, setChat } = useChat()
    const { setChats } = useChats()

    useEffect(() => {
        if (chat?.description) setTitle(chat.description)
    }, [chat])

    useEffect(() => {
        const save = async () => {
            if (!chat || !debounced || debounced === chat.description) return
            await detaDB.chats.update({ description: title }, chat!.key)
            setChat(current => ({ ...(current as Chat), description: title }))
            setChats(current => (current || []).map(item => {
                if (item.key === chat.key) {
                    return { ...item, description: title };
                }
          
                return item;
            }))

            notifications.show({
                title: "Saved",
                color: "green",
                message: "Chat name updated.",
            });
        }

        save()
    }, [debounced])

    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (title && ref.current) {
            ref.current.size = Math.max(title.length - 1, 8)
        }
    }, [title])

    return (
        <Header height={60} p="xs" className="app-region-drag">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                {readOnly && (
                    <Link to="/" style={{ display: 'block' }}>
                        <LogoText
                            style={{
                                height: 22,
                                color: theme.colors[theme.primaryColor][6],
                                display: "block",
                            }}
                        />
                    </Link>
                )}
            </div>

            <TextInput
                id="chat-name"
                ref={ref}
                placeholder="Chat Name"
                variant="unstyled"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                styles={{ input: { fontSize: '1rem', textAlign: 'center' } }}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                readOnly={readOnly}
            />

            <Flex
                align="center"
                sx={(theme) => ({
                    [theme.fn.smallerThan('md')]: {
                        marginRight: readOnly ? '' : '2.5rem',
                        paddingBottom: 3,
                    },
                })}
            >
                <ShareChatModal chat={chat!} readOnly={readOnly}>
                    <Tooltip label={chat!.shared && !readOnly ? "Shared Chat" : "Share Chat"}>
                        <ActionIcon size="xl" loaderProps={{ size: 20 }} pos="relative">
                            {chat!.shared && !readOnly ? (
                                <>
                                    <IconWorld size={20} />
                                    <Box w={10} h={10} sx={(theme) => ({ background: theme.colors.blue[6], borderRadius: '100%' })} pos="absolute" top={8} right={8}></Box>
                                </>
                            ) : (
                                <IconShare2 size={20} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                </ShareChatModal>

                {!readOnly ? (
                    <>
                        <EditChatModal chat={chat!}>
                            <Tooltip label="Chat Settings">
                                <ActionIcon size="xl">
                                    <IconAdjustments size={20} />
                                </ActionIcon>
                            </Tooltip>
                        </EditChatModal>
                    </>
                ) : (
                    <Tooltip label="What is this?">
                        <a href="https://deta.space/discovery/@deta/dialogue" target="_blank">
                            <ActionIcon size="xl">
                                <IconInfoCircle size={20} />
                            </ActionIcon>
                        </a>
                    </Tooltip>
                )}
            </Flex>
        </Box>
    </Header>
    )
}