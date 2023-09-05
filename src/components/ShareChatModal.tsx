import { ActionIcon, Button, Input, Modal, Stack, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconShare2 } from "@tabler/icons-react";
import { useState } from "react";
import { Chat, detaDB } from "../db";
import { useChat } from "../hooks/contexts";

export function ShareChatModal({ chat }: { chat: Chat }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const { setChat } = useChat()

  const handleClick = async () => {
    if (!chat.shared) {
      setSubmitting(true)
      await detaDB.chats.update({ shared: true }, chat.key)
      setChat(current => ({ ...(current as unknown as Chat), shared: true }))
      setSubmitting(false)

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

  return (
    <>
      <Modal opened={opened} onClose={close} title="Share Chat" size="md">
        <Stack>
          <Text size="sm">Use this URL to share this chat with others:</Text>
          <Input readOnly value={url ?? ''} />
          <Button type="submit" onClick={handleCopy}>
            Copy URL
          </Button>
        </Stack>
      </Modal>

      <Tooltip label="Share Chat">
          <ActionIcon size="xl" onClick={handleClick} loading={submitting} loaderProps={{ size: 20 }}>
              <IconShare2 size={20} />
          </ActionIcon>
      </Tooltip>
    </>
  );
}
