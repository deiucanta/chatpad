import { notifications } from "@mantine/notifications";
import { Chat, detaDB, generateKey } from "../db";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useChats, useSettings } from "../hooks/contexts";
import { useNavigate } from "@tanstack/react-location";
import { ReactNode } from "react";


export function CreateChatButton(props: { children: ReactNode, [x:string]: any }) {
    const navigate = useNavigate();
    const { settings } = useSettings()
    const { setChats }  = useChats()

    const handleCreate = async () => {
        if (!settings?.openAiApiKey) {
            notifications.show({
                title: "Error",
                color: "red",
                message: "OpenAI API Key is not defined. Please set your API Key",
            });
            return;
        };
            
        const item = await detaDB.chats.put({
            description: "New Chat",
            prompt: null,
            totalTokens: 0,
            createdAt: new Date().toISOString(),
        }, generateKey())

        setChats(chats => ([...(chats || []), item as unknown as Chat]))

        const id = item!.key as string
        navigate({ to: `/chats/${id}`, replace: true });
    }
    return (
        <Button
            leftIcon={<IconPlus size={20} />}
            onClick={handleCreate}
            {...props}
        >
            {props.children}
        </Button>
    )
}