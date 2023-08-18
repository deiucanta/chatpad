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
import { Chat, db } from "../db";
import { DeleteChatModal } from "./DeleteChatModal";
import { EditChatModal } from "./EditChatModal";
import { MainLink } from "./MainLink";
import { notifications } from "@mantine/notifications";

export function ChatItem({ chat, isActive }: { chat: Chat, isActive: boolean }) {
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
    <Flex
      key={chat.id}
      className={isActive ? "active" : undefined}
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
            {chat.pinned ? "Remove pin" : "Pin chat"}
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
  )
}
