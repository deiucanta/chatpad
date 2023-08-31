import { ActionIcon, Box, Header, TextInput, Tooltip } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";
import { EditChatModal } from "./EditChatModal";
import { Chat, detaDB } from "../db";
import { useEffect, useRef, useState } from "react";
import { useChat, useChats } from "../hooks/contexts";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export function ChatHeader() {
    const [title, setTitle] = useState('')
    const [debounced] = useDebouncedValue(title, 800);

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
            <div></div>

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
            />

            <EditChatModal chat={chat!}>
            <Tooltip label="Chat Settings">
                <ActionIcon size="xl">
                <IconAdjustments size={20} />
                </ActionIcon>
            </Tooltip>
            </EditChatModal>
        </Box>
    </Header>
    )
}