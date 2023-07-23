import {
  Badge,
  Button,
  Center,
  Container,
  Group,
  SimpleGrid,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCloudDownload,
  IconCurrencyDollar,
  IconKey,
  IconLock,
  IconNorthStar,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Logo } from "../components/Logo";
import { SettingsModal } from "../components/SettingsModal";
import { db } from "../db";
import { config } from "../utils/config";
import {t} from "i18next";

export function IndexRoute() {
  const settings = useLiveQuery(() => db.settings.get("general"));
  const { openAiApiKey } = settings ?? {};

  const features = [
    {
      icon: IconCurrencyDollar,
      title: t('freeAndOpenSource.title'),
      description: t('freeAndOpenSource.description'),
    },
    {
      icon: IconLock,
      title: t('privacyFocused.title'),
      description: t('privacyFocused.description'),
    },
    {
      icon: IconNorthStar,
      title: t('bestExperience.title'),
      description: t('bestExperience.description'),
    },
  ];

  return (
    <>
      <Center py="xl" sx={{ height: "100%" }}>
        <Container size="sm">
          <Badge mb="lg">GPT-4 Ready</Badge>
          <Text>
            <Logo style={{ maxWidth: 240 }} />
          </Text>
          <Text mt={4} size="xl">
            {t('notAnotherUI')}
          </Text>
          <SimpleGrid
            mt={50}
            cols={3}
            spacing={30}
            breakpoints={[{ maxWidth: "md", cols: 1 }]}
          >
            {features.map((feature, index) => (
              <div key={index}>
                <ThemeIcon variant="outline" size={50} radius={50}>
                  <feature.icon size={26} stroke={1.5} />
                </ThemeIcon>
                <Text mt="sm" mb={7}>
                  {feature.title}
                </Text>
                <Text size="sm" color="dimmed" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Text>
              </div>
            ))}
          </SimpleGrid>
          <Group mt={50}>
            {config.allowSettingsModal && (
              <SettingsModal>
                <Button
                  size="md"
                  variant={openAiApiKey ? "light" : "filled"}
                  leftIcon={<IconKey size={20} />}
                >
                  {openAiApiKey ? t('changeOpenAIKey') : t('enterOpenAIKey')}
                </Button>
              </SettingsModal>
            )}
            {config.showDownloadLink && !window.todesktop && (
              <Button
                component="a"
                href="https://dl.todesktop.com/230313oyppkw40a"
                // href="https://download.chatpad.ai/"
                size="md"
                variant="outline"
                leftIcon={<IconCloudDownload size={20} />}
              >
                {t('downloadDesktopApp')}
              </Button>
            )}
          </Group>
        </Container>
      </Center>
    </>
  );
}