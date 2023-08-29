import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-location";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Chat, Message, detaDB } from "../db";
import { useApiKey } from "../hooks/useApiKey";
import { useChatId } from "../hooks/useChatId";
import { useChats } from "../hooks/contexts";

export function DeleteChatModal({
  chat,
  children,
}: {
  chat: Chat;
  children: ReactElement;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [key, _] = useApiKey();

  const [__, setValue] = useState("");
  useEffect(() => {
    setValue(key);
  }, [key]);
  const chatId = useChatId();
  const navigate = useNavigate();

  const { setChats } = useChats()

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title="Delete Chat">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              await detaDB.chats.delete(chat.key);
              
              // todo: handle pagination
              const { items } = await detaDB.messages.fetch({ chatId: chat.key })
              await Promise.all(items.map(async (message) => {
                await detaDB.messages.delete((message as unknown as Message).key)
              }))

              setChats(current => (current || [])?.filter((c) => c.key !== chat.key))

              if (chatId === chat.key) {
                navigate({ to: `/` });
              }
              close();

              notifications.show({
                title: "Deleted",
                message: "Chat deleted.",
              });
            } catch (error: any) {
              if (error.toJSON().message === "Network Error") {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message: "No internet connection.",
                });
              } else {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message:
                    "Can't remove chat. Please refresh the page and try again.",
                });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Stack>
            <Text size="sm">Are you sure you want to delete this chat?</Text>
            <Button type="submit" color="red" loading={submitting}>
              Delete
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
