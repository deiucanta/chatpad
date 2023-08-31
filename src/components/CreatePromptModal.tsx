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
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { detaDB, generateKey, Prompt } from "../db";
import { usePrompts } from "../hooks/contexts";
import { config } from "../utils/config";

export function CreatePromptModal({ content, title: titleProp, open: openProp }: { content?: string, title?: string, open?: boolean }) {
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
    setValue(content ?? "");
    setTitle(titleProp ?? "");
    if (openProp) {
      open()
    }
  }, [content, titleProp, openProp]);

  return (
    <>
      {!openProp && (
        <>
          {content ? (
            <Tooltip label="Save as Prompt" position="top">
              <ActionIcon onClick={open}>
                <IconPlaylistAdd opacity={0.5} size={20} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button fullWidth onClick={open} leftIcon={<IconPlus size={20} />}>
              New Prompt
            </Button>
          )}
        </>
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
                writingCharacter,
                writingTone,
                writingStyle,
                writingFormat,
                createdAt: new Date().toISOString(),
              }, generateKey())

              const prompt = item as unknown as Prompt
              setPrompts(current => [...(current || []), prompt])
              
              notifications.show({
                title: "Saved",
                color: "green",
                message: "Prompt created",
              });

              setTitle("")
              setValue("")
              setWritingCharacter(null)
              setWritingTone(null)
              setWritingStyle(null)
              setWritingFormat(null)

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
              placeholder="Prompt title"
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
    </>
  );
}
