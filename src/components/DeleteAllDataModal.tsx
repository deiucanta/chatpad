import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { db } from "../db";
import {t} from "i18next";

export function DeleteAllDataModal({ onOpen }: { onOpen: () => void }) {
  const [opened, { open, close }] = useDisclosure(false, { onOpen });

  return (
    <>
      <Button
        onClick={open}
        variant="outline"
        color="red"
        leftIcon={<IconTrash size={20} />}
      >
          {t('deleteAllData')}
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title={t('deleteAllData')}
        size="md"
        withinPortal
      >
        <Stack>
          <Text size="sm">{t('confirmDeleteAllData')}</Text>
          <Button
            onClick={async () => {
              await db.delete();
              localStorage.clear();
              window.location.assign("/");
            }}
            color="red"
          >
              {t('delete')}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
