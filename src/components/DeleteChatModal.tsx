import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-location";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Chat, db } from "../db";
import { useApiKey } from "../hooks/useApiKey";
import { useChatId } from "../hooks/useChatId";
import {t} from "i18next";

export function DeleteChatModal({
  chat,
  children,
}: {
  chat: Chat;
  children: ReactElement;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [key, setKey] = useApiKey();

  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(key);
  }, [key]);
  const chatId = useChatId();
  const navigate = useNavigate();

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title={t('deleteChat')}>
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();
              await db.chats.where({ id: chat.id }).delete();
              await db.messages.where({ chatId: chat.id }).delete();
              if (chatId === chat.id) {
                navigate({ to: `/` });
              }
              close();

              notifications.show({
                title: t('deleted'),
                message: t('chatDeleted'),
              });
            } catch (error: any) {
              if (error.toJSON().message === "Network Error") {
                notifications.show({
                  title: t('networkError.title'),
                  color: "red",
                  message: t('networkError.message'),
                });
              } else {
                notifications.show({
                  title: t('removeChatError.title'),
                  color: "red",
                  message: t('removeChatError.message'),
                });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Stack>
            <Text size="sm">{t('confirmDeleteChat')}</Text>
            <Button type="submit" color="red" loading={submitting}>
              {t('delete')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
