import { ActionIcon, Flex, Menu, useMantineTheme } from "@mantine/core";
import { IconDotsVertical, IconMessages, IconWorld } from "@tabler/icons-react";
import { Link } from "@tanstack/react-location";
import { DeleteChatModal } from "./DeleteChatModal";
import { EditChatModal } from "./EditChatModal";
import { MainLink } from "./MainLink";
import { useHover } from "@mantine/hooks";
import { Chat } from "../db";
import { useIncognitoMode } from "../hooks/contexts";
import { ShareChatModal } from "./ShareChatModal";

export function ChatItem({ chat, active = false }: { chat: Chat, active?: boolean }) {
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();
  const { incognitoMode } = useIncognitoMode()

  return (
    <Flex
      ref={ref}
      key={chat.key}
      className={active ? "active" : undefined}
      align='center'
      sx={(theme) => ({
        marginTop: 1,
        "&:hover, &.active": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
        },
        ...(incognitoMode ? {
          filter: 'blur(2.5px)',
          transition: 'filter 300ms ease-out',
          "&:hover, &.active": {
            filter: 'none'
          }
        } : {})
      })}
    >
      <Link to={`/chats/${chat.key}`} style={{ flex: 1 }}>
        <MainLink
          icon={<IconMessages size="1rem" />}
          color={theme.primaryColor}
          label={chat.description}
        />
      </Link>

      {chat.shared && !hovered && (
        <ActionIcon mr={5}>
          <IconWorld size={18} />
        </ActionIcon>
      )} 
        
      <Menu shadow="md" width={200} keepMounted>
        {hovered && (
          <Menu.Target>
            <ActionIcon sx={{ height: "auto", display: hovered ? 'block' : 'none' }}>
              <IconDotsVertical size={20} />
            </ActionIcon>
          </Menu.Target>
        )}
        <Menu.Dropdown>
          {chat.shared && (
            <ShareChatModal chat={chat}>
              <Menu.Item>Share</Menu.Item>
            </ShareChatModal>
          )}
          <EditChatModal chat={chat}>
            <Menu.Item>Edit</Menu.Item>
          </EditChatModal>
          <DeleteChatModal chat={chat}>
            <Menu.Item>Delete</Menu.Item>
          </DeleteChatModal>
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
}
