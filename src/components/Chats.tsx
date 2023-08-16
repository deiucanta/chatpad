import { ActionIcon, Flex, Menu } from "@mantine/core";
import {
	IconDotsVertical,
	IconMessages,
	IconPencil,
	IconPin,
	IconPinned,
	IconPinnedOff,
	IconTrash
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-location";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "../db";
import { useChatId } from "../hooks/useChatId";
import { DeleteChatModal } from "./DeleteChatModal";
import { EditChatModal } from "./EditChatModal";
import { MainLink } from "./MainLink";
import { notifications } from "@mantine/notifications";

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

  const toggleChatPin = async (chatId: string, event: React.UIEvent) => {
    try {
      event.preventDefault();
      await db.chats.where({ id: chatId }).modify((chat) => {
        chat.pinned = !chat.pinned;
      });
    } catch (error: any) {
      if (error.toJSON().message === "Network Error") {
        notifications.show({
          title: "Error",
          color: "red",
          message: "No internet connection.",
        });
      }
      const message = error.response?.data?.error?.message;
      if (message) {
        notifications.show({
          title: "Error",
          color: "red",
          message,
        });
      }
    }
  };

  return (
    <>
      {filteredChats
        .sort((chat) => (chat.pinned ? -1 : 1))
        .map((chat) => (
          <Flex
            key={chat.id}
            className={chatId === chat.id ? "active" : undefined}
            sx={(theme) => ({
              marginTop: 1,
              "&:hover, &.active": {
                backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1],
              },
            })}
          >
            <Link to={`/chats/${chat.id}`} style={{ flex: 1 }}>
              <MainLink
                icon={chat.pinned ? <IconPinned size="1rem" /> : <IconMessages size="1rem" />}
                color="teal"
                chat={chat}
                label={chat.description}
              />
            </Link>
            <Menu shadow="md" width={200} keepMounted>
              <Menu.Target>
                <ActionIcon sx={{ height: "auto" }}>
                  <IconDotsVertical size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  icon={chat.pinned ? <IconPinnedOff size="1rem" /> : <IconPin size="1rem" />}
                  onClick={(event) => toggleChatPin(chat.id, event)}
                >
                  {chat.pinned ? "Remove pin" : "Pin this"}
                </Menu.Item>
                <EditChatModal chat={chat}>
                  <Menu.Item icon={<IconPencil size="1rem" />}>Edit</Menu.Item>
                </EditChatModal>
                <DeleteChatModal chat={chat}>
                  <Menu.Item color="red" icon={<IconTrash size="1rem" />}>
                    Delete
                  </Menu.Item>
                </DeleteChatModal>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        ))}
    </>
  );
}
