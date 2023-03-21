import { ActionIcon, Flex, Menu } from "@mantine/core";
import { IconDotsVertical, IconMessages } from "@tabler/icons-react";
import { Link } from "@tanstack/react-location";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "../db";
import { useChatId } from "../hooks/useChatId";
import { DeleteChatModal } from "./DeleteChatModal";
import { EditChatModal } from "./EditChatModal";
import { MainLink } from "./MainLink";

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

  return (
    <>
      {filteredChats.map((chat) => (
        <Flex
          key={chat.id}
          className={chatId === chat.id ? "active" : undefined}
          sx={(theme) => ({
            marginTop: 1,
            "&:hover, &.active": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Link to={`/chats/${chat.id}`} style={{ flex: 1 }}>
            <MainLink
              icon={<IconMessages size="1rem" />}
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
              <EditChatModal chat={chat}>
                <Menu.Item>Edit</Menu.Item>
              </EditChatModal>
              <DeleteChatModal chat={chat}>
                <Menu.Item>Delete</Menu.Item>
              </DeleteChatModal>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      ))}
    </>
  );
}
