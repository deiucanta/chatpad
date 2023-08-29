import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Chat, detaDB } from "../db";
import { useChat, useChats } from "../hooks/contexts";

export function EditChatModal({
  chat,
  children,
}: {
  chat: Chat;
  children: ReactElement;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const { setChats } = useChats()
  const { setChat } = useChat()

  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(chat?.description ?? "");
  }, [chat]);

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title="Edit Chat" withinPortal>
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              await detaDB.chats.update({ description: value }, chat.key);
              setChats(current => (current || []).map(item => {
                if (item.key === chat.key) {
                  return { ...item, description: value };
                }
          
                return item;
              }));
              setChat(current => {
                if (current?.key === chat.key) {
                  return { ...current, description: value };
                }
          
                return current;
              })

              notifications.show({
                title: "Saved",
                message: "",
              });
              close();
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
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Stack>
            <TextInput
              label="Name"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              formNoValidate
              data-autofocus
            />
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
