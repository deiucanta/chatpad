import { Button, Input, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ReactElement, cloneElement, useState } from "react";
import { Chat, detaDB } from "../db";
import { useChat, useChats } from "../hooks/contexts";

export function ShareChatModal({ children, chat, readOnly }: { children: ReactElement, chat: Chat, readOnly?: boolean }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [url, setUrl] = useState<string | null>(null);

  const { setChat } = useChat()
  const { setChats } = useChats()

  const handleClick = async () => {
    if (!chat.shared) {
      await detaDB.chats.update({ shared: true }, chat.key)
      setChat(current => ({ ...(current as unknown as Chat), shared: true }))
      setChats(current => (current || []).map(item => {
        if (item.key === chat.key) {
          return { ...item, shared: true };
        }

        return item;
      }))

      notifications.show({
        title: "Shared!",
        color: "green",
        message: "Chat is now public.",
      })
    }

    setUrl(`${window.location.origin}/shared/chats/${chat.key}`)
    open()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url ?? '')

    notifications.show({
      title: "Copied!",
      color: "green",
      message: "URL copied to clipboard.",
    })

    close()
  }

  const handleDisable = async () => {
    await detaDB.chats.update({ shared: false }, chat.key)
    setChat(current => ({ ...(current as unknown as Chat), shared: false }))
    setChats(current => (current || []).map(item => {
      if (item.key === chat.key) {
        return { ...item, shared: false };
      }

      return item;
    }))

    notifications.show({
      title: "Disabled!",
      color: "green",
      message: "Chat is now private.",
    })

    close()
  }

  return (
    <>
      {cloneElement(children, { onClick: handleClick })}
      <Modal opened={opened} onClose={close} title={chat.shared && !readOnly ? "Shared Chat" : "Share Chat"} size="md">
        <Stack>
          <Text size="sm">Use this URL to share this chat with others:</Text>
          <Input readOnly value={url ?? ''} />
          <Stack spacing="xs">
            <Button type="submit" onClick={handleCopy}>
              Copy URL
            </Button>
            {!readOnly && (
              <Button variant="light" color="red" onClick={handleDisable}>
                Disable Sharing
              </Button>
            )}
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
