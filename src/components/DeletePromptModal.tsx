import { ActionIcon, Button, Modal, Stack, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { db, Prompt } from "../db";
import { useApiKey } from "../hooks/useApiKey";
import { useChatId } from "../hooks/useChatId";
import {t} from "i18next";
import * as tty from "tty";

export function DeletePromptModal({ prompt }: { prompt: Prompt }) {
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
      <Modal opened={opened} onClose={close} title={t('deletePrompt')} size="md">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();
              await db.prompts.where({ id: prompt.id }).delete();
              close();

              notifications.show({
                title: t('deleted'),
                message: t('promptDeleted'),
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
                  title: t('removePromptError.title'),
                  color: "red",
                  message: t('removePromptError.message'),
                });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Stack>
            <Text size="sm">{t('confirmDeletePrompt')}</Text>
            <Button type="submit" color="red" loading={submitting}>
              {t('delete')}
            </Button>
          </Stack>
        </form>
      </Modal>
      <Tooltip label={t('deletePrompt')}>
        <ActionIcon color="red" size="lg" onClick={open}>
          <IconTrash size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
