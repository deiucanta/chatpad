import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { Chat, Message, detaDB } from "../db";

export function DeleteChatsModal({ onOpen }: { onOpen: () => void }) {
  const [opened, { open, close }] = useDisclosure(false, { onOpen });

  return (
    <>
      <Button
        onClick={open}
        variant="outline"
        color="red"
        leftIcon={<IconTrash size={20} />}
      >
        Delete Chats
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Delete Chats"
        size="md"
        withinPortal
      >
        <Stack>
          <Text size="sm">Are you sure you want to delete your chats?</Text>
          <Button
            onClick={async () => {
              // todo: handle pagination
              const { items: chats } = await detaDB.chats.fetch()
              await Promise.all(chats.map(async (chat) => {
                await detaDB.chats.delete((chat as unknown as Chat).key)
              }))

              const { items: messages } = await detaDB.messages.fetch()
              await Promise.all(messages.map(async (message) => {
                await detaDB.messages.delete((message as unknown as Message).key)
              }))

              localStorage.clear();
              window.location.assign("/");
            }}
            color="red"
          >
            Delete
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
