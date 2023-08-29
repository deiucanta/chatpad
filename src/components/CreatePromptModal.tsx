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
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { detaDB, generateKey, Prompt } from "../db";
import { usePrompts } from "../hooks/contexts";

export function CreatePromptModal({ content }: { content?: string }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const { setPrompts } = usePrompts()

  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  useEffect(() => {
    setValue(content ?? "");
  }, [content]);

  return (
    <>
      {content ? (
        <Tooltip label="Save Prompt" position="top">
          <ActionIcon onClick={open}>
            <IconPlaylistAdd opacity={0.5} size={20} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button fullWidth onClick={open} leftIcon={<IconPlus size={20} />}>
          New Prompt
        </Button>
      )}
      <Modal opened={opened} onClose={close} title="Create Prompt" size="lg">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              const item = await detaDB.prompts.put({
                title,
                content: value,
                createdAt: new Date().toISOString(),
              }, generateKey())

              const prompt = item as unknown as Prompt
              setPrompts(current => [...(current || []), prompt])
              
              notifications.show({
                title: "Saved",
                message: "Prompt created",
              });

              setTitle("")
              setValue("")

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
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              formNoValidate
              data-autofocus
            />
            <Textarea
              placeholder="Content"
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
    </>
  );
}
