import { Text } from "@mantine/core";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "../db";
import { useChatId } from "../hooks/useChatId";
import { ChatItem } from "./ChatItem";

export function Chats({ search }: { search: string }) {
  const chatId = useChatId();
  const chats = useLiveQuery(() =>
    db.chats.orderBy("createdAt").reverse().toArray()
  );
  const filteredChats = useMemo(
    () =>
      (chats ?? []).filter((chat) => {
        if (!search) return true;
        return chat.description.toLowerCase().includes(search);
      }),
    [chats, search]
  );

  const pinnedChats = useMemo(() => filteredChats.filter((chat) => chat.pinned), [filteredChats]);
  const unpinnedChats = useMemo(() => filteredChats.filter((chat) => !chat.pinned), [filteredChats]);

  return (
    <>
      {pinnedChats.length > 0 ? (
        <>
          <Text p="xs" fz="xs" fw={700} color="gray" children={"Pinned"} />
          {pinnedChats.map((chat) => (
            <ChatItem chat={chat} isActive={chatId === chat.id} />
          ))}

          {unpinnedChats.length > 0 ? <Text p="xs" fz="xs" fw={700} color="gray" children={"Unpinned"} /> : null}
        </>
      ) : null}

      {unpinnedChats.map((chat) => (
        <ChatItem chat={chat} isActive={chatId === chat.id} />
      ))}
    </>
  )
}
