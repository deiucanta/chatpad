import {
  ActionIcon,
  Button,
  Modal,
  Select,
  SimpleGrid,
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
import { config } from "../utils/config";

export function EditPromptModal({ prompt }: { prompt: Prompt }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const { setPrompts } = usePrompts()

  const [writingCharacter, setWritingCharacter] = useState<string | null>(null);
  const [writingTone, setWritingTone] = useState<string | null>(null);
  const [writingStyle, setWritingStyle] = useState<string | null>(null);
  const [writingFormat, setWritingFormat] = useState<string | null>(null);

  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  useEffect(() => {
    setValue(prompt?.content ?? "");
    setTitle(prompt?.title ?? "");
    setWritingCharacter(prompt?.writingCharacter ?? null);
    setWritingTone(prompt?.writingTone ?? null);
    setWritingStyle(prompt?.writingStyle ?? null);
    setWritingFormat(prompt?.writingFormat ?? null);
  }, [prompt]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Edit Prompt" size="lg">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              const updates: Partial<Prompt> = {
                title,
                content: value,
                writingCharacter,
                writingFormat,
                writingStyle,
                writingTone
              }

              console.log({ updates })

              await detaDB.prompts.update(updates, prompt.key)
              setPrompts(current => (current || []).map(item => {
                if (item.key === prompt.key) {
                  return { ...item, ...updates };
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
            <SimpleGrid
              spacing="xs"
              breakpoints={[
                { minWidth: "sm", cols: 4 },
                { maxWidth: "sm", cols: 2 },
              ]}
            >
              <Select
                value={writingCharacter}
                onChange={setWritingCharacter}
                data={config.writingCharacters}
                placeholder="Character"
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingTone}
                onChange={setWritingTone}
                data={config.writingTones}
                placeholder="Tone"
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingStyle}
                onChange={setWritingStyle}
                data={config.writingStyles}
                placeholder="Style"
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
              <Select
                value={writingFormat}
                onChange={setWritingFormat}
                data={config.writingFormats}
                placeholder="Format"
                variant="filled"
                searchable
                clearable
                sx={{ flex: 1 }}
              />
            </SimpleGrid>
            <Textarea
              label="Content"
              placeholder="Further instructions..."
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
