import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Chat, db } from "../db";
import '../i18n'
import {t} from "i18next";

export function EditChatModal({
  chat,
  children,
}: {
  chat: Chat;
  children: ReactElement;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(chat?.description ?? "");
  }, [chat]);

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title={t('editChat')} withinPortal>
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();
              await db.chats.where({ id: chat.id }).modify((chat) => {
                chat.description = value;
              });
              notifications.show({
                title: t('chatUpdated.title'),
                message: t('chatUpdated.message'),
              });
              close();
            } catch (error: any) {
              if (error.toJSON().message === "Network Error") {
                notifications.show({
                  title: t('networkError.title'),
                  color: "red",
                  message: t('networkError.message'),
                });
              }
              const message = error.response?.data?.error?.message;
              if (message) {
                notifications.show({
                  title: t('error.title'),
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
              label={t('name')}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              formNoValidate
              data-autofocus
            />
            <Button type="submit" loading={submitting}>
              {t('save')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
