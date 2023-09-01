import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFlame } from "@tabler/icons-react";
import { Chat, Message, detaDB } from "../db";
import { notifications } from "@mantine/notifications";
import floating from "../utils/floating";
import { useChat, useChats } from "../hooks/contexts";
import { useNavigate } from "@tanstack/react-location";

export function DeleteChatsModal({ onOpen }: { onOpen?: () => void }) {
  const [opened, { open, close }] = useDisclosure(false, { onOpen });
  const navigate = useNavigate()

  const { setChats } = useChats()
  const { setChat } = useChat()

  const deleteChats = async () => {
    let res = await detaDB.chats.fetch({ private: true })
    let chats = res.items;
    while (res.last) {
      res = await detaDB.chats.fetch({ private: true }, { last: res.last });
      chats = chats.concat(res.items);
    }

    await Promise.all(chats.map(async (chat) => {
      await detaDB.chats.delete((chat as unknown as Chat).key)

      res = await detaDB.messages.fetch({ chatId: chat.key })
      let messages = res.items;
      while (res.last) {
        res = await detaDB.messages.fetch({ chatId: chat.key }, { last: res.last })
        messages = messages.concat(res.items);
      }

      await Promise.all(messages.map(async (message) => {
        await detaDB.messages.delete((message as unknown as Message).key)
      }))
    }))

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        floating({
          content: "🔥",
          number: 2,
          duration: 0.5,
          repeat: 1,
          elem: undefined
        });
      }, (i * 5) + (Math.random() * 10));
    }

    setChat(null)
    setChats([])
    navigate({ to: '/', replace: true })

    notifications.show({
      title: "Burned",
      color: "green",
      message: "Private chats deleted.",
    });

    close()
  }

  return (
    <>
      <Button
        fullWidth 
        variant="light"
        leftIcon={<IconFlame size={20} />}
        onClick={open}
      >
        Burn Private Chats
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Burn Private Chats"
        size="md"
        withinPortal
      >
        <Stack>
          <Text size="sm">Are you sure you want to delete all your private chats?</Text>
          <Button
            onClick={deleteChats}
            color="red"
          >
            Burn Them
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
