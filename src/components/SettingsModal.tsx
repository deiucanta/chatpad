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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { db } from "../db";
import { config } from "../utils/config";
import { checkOpenAIKey } from "../utils/openai";
import '../i18n'
import {t} from "i18next";

export function SettingsModal({ children }: { children: ReactElement }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [value, setValue] = useState("");
  const [model, setModel] = useState(config.defaultModel);
  const [type, setType] = useState(config.defaultType);
  const [auth, setAuth] = useState(config.defaultAuth);
  const [base, setBase] = useState("");
  const [version, setVersion] = useState("");

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
  }, [settings]);

  return (
    <>
      {cloneElement(children, { onClick: open })}
      <Modal opened={opened} onClose={close} title={t('settings')} size="lg">
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
                  title: t('openAIKeySaved.title'),
                  message: t('openAIKeySaved.message'),
                });
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
            <Flex gap="xs" align="end">
              <PasswordInput
                label={t('openAIAPIKey')}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                sx={{ flex: 1 }}
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                {t('save')}
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
                  {t('getYourOpenAIAPIkey')}
                </Anchor>
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" color="dimmed">
                {t('APIKeyStoredLocally')}
              </Text>
            </List.Item>
          </List>
          <Select
            label={t('openAIType')}
            value={type}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                await db.settings.update("general", {
                  openAiApiType: value ?? 'openai',
                });
                notifications.show({
                  title: t('openAIKeySaved.title'),
                  message: t('openAIKeySaved.message'),
                });
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
            withinPortal
            data={[{ "value": "openai", "label": "OpenAI"}, { "value": "custom", "label": t('openIATTypeCustom')}]}
          />
          <Select
            label={t('openAIModel')}
            value={model}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                await db.settings.update("general", {
                  openAiModel: value ?? undefined,
                });
                notifications.show({
                  title: t('openAIModelSaved.title'),
                  message: t('openAIModelSaved.message'),
                });
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
            withinPortal
            data={config.availableModels}
          />
          <Alert color="orange" title={t('warning')}>
            {t('warningCostMessage')}
          </Alert>
          <Select
            label={t('openAIAuth')}
            value={auth}
            onChange={async (value) => {
              setSubmitting(true);
              try {
                await db.settings.update("general", {
                  openAiApiAuth: value ?? 'none',
                });
                notifications.show({
                  title: t('openAIModelSaved.title'),
                  message: t('openAIModelSaved.message'),
                });
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
            withinPortal
            data={[{ "value": "none", "label": t('none')}, { "value": "bearer-token", "label": t('bearerToken')}, { "value": "api-key", "label": t('apiKey')}]}
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
                  title: t('openAIBaseSaved.title'),
                  message: t('openAIBaseSaved.message'),
                });
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
            <Flex gap="xs" align="end">
              <TextInput
                label={t('openAIAPIBase')}
                placeholder="https://<resource-name>.openai.azure.com/openai/deployments/<deployment>"
                sx={{ flex: 1 }}
                value={base}
                onChange={(event) => setBase(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                {t('save')}
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
                  title: t('openAIVersionSaved.title'),
                  message: t('openAIVersionSaved.message'),
                });
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
            <Flex gap="xs" align="end">
              <TextInput
                label={t('openAIAPIVersion')}
                placeholder="2023-03-15-preview"
                sx={{ flex: 1 }}
                value={version}
                onChange={(event) => setVersion(event.currentTarget.value)}
                formNoValidate
              />
              <Button type="submit" loading={submitting}>
                {t('save')}
              </Button>
            </Flex>
          </form>
        </Stack>
      </Modal>
    </>
  );
}
