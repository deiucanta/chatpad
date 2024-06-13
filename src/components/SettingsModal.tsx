import {
  Alert,
  Anchor,
  Button,
  Flex,
  List,
  Modal,
  PasswordInput,
  TextInput,
  Select,
  Stack,
  Text,
  Tabs,
  useMantineColorScheme,
} from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { ColorTheme, db } from "../db";
import { config } from "../utils/config";
import { checkOpenAIKey } from "../utils/openai";
import {
  IconBrightnessHalf,
  IconMoonStars,
  IconSunHigh,
} from "@tabler/icons-react";

export function SettingsModal({ children }: { children: ReactElement }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [value, setValue] = useState("");
  const [model, setModel] = useState(config.defaultModel);
  const [type, setType] = useState(config.defaultType);
  const [auth, setAuth] = useState(config.defaultAuth);
  const [base, setBase] = useState("");
  const [version, setVersion] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>("system");
  const { toggleColorScheme } = useMantineColorScheme();

  const preferredColorScheme = useColorScheme();

  useEffect(() => {
    if (selectedTheme === "system") {
      toggleColorScheme(preferredColorScheme);
    }
  }, [preferredColorScheme]);

  useEffect(() => {
    toggleColorScheme(
      selectedTheme === "system" ? preferredColorScheme : selectedTheme
    );
  }, [selectedTheme]);

  const settings = useLiveQuery(async () => {
    return db.settings.where({ id: "general" }).first();
  });

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
    if (settings?.theme) {
      setSelectedTheme(settings.theme);
    }
  }, [settings]);

  const onThemeChange = async (colorTheme: ColorTheme) => {
    try {
      setSubmitting(true);
      await db.settings.where({ id: "general" }).modify((row) => {
        row.theme = colorTheme;
        console.log(row);
      });
      setSelectedTheme(colorTheme);
      notifications.show({
        title: "Saved",
        message: "Your theme has been saved.",
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
  };

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title="Settings" size="lg">
        <Stack>
          <form
            onSubmit={async (event) => {
              try {
                setSubmitting(true);
                event.preventDefault();
                await checkOpenAIKey(value);
                await db.settings.where({ id: "general" }).modify((apiKey) => {
                  apiKey.openAiApiKey = value;
                  console.log(apiKey);
                });
                notifications.show({
                  title: "Saved",
                  message: "Your OpenAI Key has been saved.",
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
          <List withPadding>
            <List.Item>
              <Text size="sm">
                <Anchor
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                >
                  Get your OpenAI API key
                </Anchor>
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" color="dimmed">
                The API Key is stored locally on your browser and never sent
                anywhere else.
              </Text>
            </List.Item>
          </List>
          <Select
            label="OpenAI Type"
            value={type}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                await db.settings.update("general", {
                  openAiApiType: value ?? 'openai',
                });
                notifications.show({
                  title: "Saved",
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
                await db.settings.update("general", {
                  openAiModel: value ?? undefined,
                });
                notifications.show({
                  title: "Saved",
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
                await db.settings.update("general", {
                  openAiApiAuth: value ?? 'none',
                });
                notifications.show({
                  title: "Saved",
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
                await db.settings.where({ id: "general" }).modify((row) => {
                  row.openAiApiBase = base;
                  console.log(row);
                });
                notifications.show({
                  title: "Saved",
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
                await db.settings.where({ id: "general" }).modify((row) => {
                  row.openAiApiVersion = version;
                  console.log(row);
                });
                notifications.show({
                  title: "Saved",
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
          {config.allowThemeToggle && (
            <Stack spacing={0}>
              <Text children="Theme" />
              <Tabs variant="pills" value={selectedTheme}>
                <Tabs.List>
                  <Tabs.Tab
                    value="light"
                    icon={<IconSunHigh size="1rem" />}
                    children="Light Mode"
                    onClick={() => onThemeChange("light")}
                  />
                  <Tabs.Tab
                    value="dark"
                    icon={<IconMoonStars size="1rem" />}
                    children="Dark Mode"
                    onClick={() => onThemeChange("dark")}
                  />
                  <Tabs.Tab
                    value="system"
                    icon={<IconBrightnessHalf size="1rem" />}
                    children="System theme"
                    onClick={() => onThemeChange("system")}
                  />
                </Tabs.List>
              </Tabs>
            </Stack>
          )}
        </Stack>
      </Modal>
    </>
  );
}
