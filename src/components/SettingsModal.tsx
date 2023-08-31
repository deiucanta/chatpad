import {
  Alert,
  Anchor,
  Button,
  Flex,
  Modal,
  PasswordInput,
  TextInput,
  Select,
  Stack,
  Text,
  useMantineColorScheme,
  Box,
  SegmentedControl,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Settings, detaDB } from "../db";
import { config } from "../utils/config";
import { checkOpenAIKey } from "../utils/openai";
import { useSettings } from "../hooks/contexts";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";

export function SettingsModal({ children }: { children: ReactElement }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [value, setValue] = useState("");
  const [model, setModel] = useState(config.defaultModel);
  const [type, setType] = useState(config.defaultType);
  const [auth, setAuth] = useState(config.defaultAuth);
  const [base, setBase] = useState("");
  const [version, setVersion] = useState("");

  const { settings, setSettings } = useSettings()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (settings?.openAiApiKey) {
      setValue(settings.openAiApiKey);
    }
    if (settings?.openAiModel) {
      setModel(settings.openAiModel);
    }
    if (settings?.openAiApiType) {
      setType(settings.openAiApiType);
    }
    if (settings?.openAiApiAuth) {
      setAuth(settings.openAiApiAuth);
    }
    if (settings?.openAiApiBase) {
      setBase(settings.openAiApiBase);
    }
    if (settings?.openAiApiVersion) {
      setVersion(settings.openAiApiVersion);
    }
  }, [settings]);

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title="Settings" size="lg">
        <Stack>
          <Box>
            <Text size="sm" weight={500} mb={4}>Theme</Text>
            <SegmentedControl
              value={colorScheme}
              onChange={() => toggleColorScheme()}
              data={[
                {
                  value: 'light',
                  label: (
                    <Center>
                      <IconSunHigh size="1rem" />
                      <Box ml={10}>Light</Box>
                    </Center>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <Center>
                      <IconMoonStars size="1rem" />
                      <Box ml={10}>Dark</Box>
                    </Center>
                  ),
                },
              ]}
            />
          </Box>
          <form
            onSubmit={async (event) => {
              try {
                setSubmitting(true);
                event.preventDefault();
                await checkOpenAIKey({ ...(settings as Settings), openAiApiKey: value });

                if (settings?.openAiApiKey) {
                  await detaDB.settings.update({
                    openAiApiKey: value,
                  }, 'general');
                } else {
                  await detaDB.settings.put({
                    openAiApiKey: value
                  }, 'general')
                }

                setSettings(current => {
                  if (current) {
                    return { ...current, openAiApiKey: value };
                  } else {
                    return { key: 'general', openAiApiKey: value };
                  }
                })

                // await db.settings.where({ id: "general" }).modify((apiKey) => {
                //   apiKey.openAiApiKey = value;
                //   console.log(apiKey);
                // });
                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Key has been saved.",
                });
              } catch (error: any) {
                if (error.message === "Network Error") {
                  notifications.show({
                    title: "Error",
                    color: "red",
                    message: "No internet connection.",
                  });
                }
                const message = error.message
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
            <Flex gap="xs" align="end">
              <PasswordInput
                label="OpenAI API Key"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                sx={{ flex: 1 }}
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                Save
              </Button>
            </Flex>
          </form>
          <Text size="sm">
            <Anchor
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
            >
              Get your OpenAI API key
            </Anchor>
          </Text>
          <Select
            label="OpenAI Type"
            value={type}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                const updates = {
                  openAiApiType: value as any ?? 'openai',
                }
                await detaDB.settings.update(updates, "general");

                setSettings(current => ({ ...(current!), ...updates }))

                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Type has been saved.",
                });
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
            withinPortal
            data={[{ "value": "openai", "label": "OpenAI"}, { "value": "custom", "label": "Custom (e.g. Azure OpenAI)"}]}
          />
          <Select
            label="OpenAI Model (OpenAI Only)"
            value={model}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                const updates = {
                  openAiModel: value ?? undefined,
                }
                await detaDB.settings.update(updates, "general");
                setSettings(current => ({ ...(current!), ...updates }))

                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Model has been saved.",
                });
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
            withinPortal
            data={config.availableModels}
          />
          <Alert color="orange" title="Warning">
            The displayed cost was not updated yet to reflect the costs for each
            model. Right now it will always show the cost for GPT-3.5 on OpenAI.
          </Alert>
          <Select
            label="OpenAI Auth (Custom Only)"
            value={auth}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                const updates = {
                  openAiApiAuth: value as any ?? 'none',
                }
                await detaDB.settings.update(updates, "general");
                setSettings(current => ({ ...(current!), ...updates }))

                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Auth has been saved.",
                });
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
            withinPortal
            data={[{ "value": "none", "label": "None"}, { "value": "bearer-token", "label": "Bearer Token"}, { "value": "api-key", "label": "API Key"}]}
          />
          <form
            onSubmit={async (event) => {
              try {
                setSubmitting(true);
                event.preventDefault();

                const updates = {
                  openAiApiBase: base,
                }
                await detaDB.settings.update(updates, "general");
                setSettings(current => ({ ...(current!), ...updates }))

                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Base has been saved.",
                });
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
            <Flex gap="xs" align="end">
              <TextInput
                label="OpenAI API Base (Custom Only)"
                placeholder="https://<resource-name>.openai.azure.com/openai/deployments/<deployment>"
                sx={{ flex: 1 }}
                value={base}
                onChange={(event) => setBase(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                Save
              </Button>
            </Flex>
          </form>
          <form
            onSubmit={async (event) => {
              try {
                setSubmitting(true);
                event.preventDefault();

                const updates = {
                  openAiApiVersion: version,
                }
                await detaDB.settings.update(updates, "general");
                setSettings(current => ({ ...(current!), ...updates }))

                notifications.show({
                  title: "Saved",
                  color: "green",
                  message: "Your OpenAI Version has been saved.",
                });
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
            <Flex gap="xs" align="end">
              <TextInput
                label="OpenAI API Version (Custom Only)"
                placeholder="2023-03-15-preview"
                sx={{ flex: 1 }}
                value={version}
                onChange={(event) => setVersion(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                Save
              </Button>
            </Flex>
          </form>
        </Stack>
      </Modal>
    </>
  );
}
