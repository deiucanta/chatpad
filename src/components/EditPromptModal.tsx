import {
  ActionIcon,
  Button,
  Modal,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { detaDB, Prompt } from "../db";
import { usePrompts } from "../hooks/contexts";

export function EditPromptModal({ prompt }: { prompt: Prompt }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const { setPrompts } = usePrompts()

  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  useEffect(() => {
    setValue(prompt?.content ?? "");
    setTitle(prompt?.title ?? "");
  }, [prompt]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Edit Prompt" size="lg">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              await detaDB.prompts.update({ title: title, content: value }, prompt.key)
              setPrompts(current => (current || []).map(item => {
                if (item.key === prompt.key) {
                  return { ...item, title, content: value };
                }
          
                return item;
              }))

              notifications.show({
                title: "Saved",
                message: "Prompt updated",
              });

              close()
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
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              formNoValidate
              data-autofocus
            />
            <Textarea
              label="Content"
              autosize
              minRows={5}
              maxRows={10}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
      <Tooltip label="Edit Prompt">
        <ActionIcon size="lg" onClick={open}>
          <IconPencil size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
