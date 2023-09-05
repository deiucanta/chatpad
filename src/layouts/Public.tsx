import {
  AppShell,
  useMantineColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Chat } from "../db";
import { usePublicChatId } from "../hooks/useChatId";
import { ChatContext, IncognitoModeContext } from "../hooks/contexts";
import { ChatHeader } from "../components/ChatHeader";
import { useLocalStorage } from "@mantine/hooks";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  const chatId = usePublicChatId();

  const [incognitoMode, setIncognitoMode] = useLocalStorage({
    key: 'incognito-mode', defaultValue: false, getInitialValueInEffect: false
  });

  const [chat, setChat] = useState<Chat | null>(null);
  useEffect(() => {
    const dataFetch = async () => {
      try {
        const res = await fetch(`/api/public/chats/${chatId}`)
        const item = await res.json()

        const fetchedChat = item as unknown as Chat
        setChat(fetchedChat);

        document.title = fetchedChat.description ? `${fetchedChat.description} | Chatpad AI` : 'Chatpad AI'
      } catch (e) {
        console.error(e)
      }
    };

    if (chatId) {
      dataFetch();
    } else {
      setChat(null);
    }
  }, [chatId]);

  return (
    <ChatContext.Provider value={{ chat: chat, setChat: setChat }}>
      <IncognitoModeContext.Provider value={{ incognitoMode: incognitoMode, setIncognitoMode: setIncognitoMode }}>
        <AppShell
          className={`${colorScheme}-theme`}          
          header={
            chat ? (
              <ChatHeader readOnly />
            ) : undefined
          }
          layout="alt"
          padding={0}
        >
          {children}
        </AppShell>
      </IncognitoModeContext.Provider>
    </ChatContext.Provider>
  );
}
