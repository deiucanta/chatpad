import { Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { db } from "../db";
import '../i18n'
import {t} from "i18next";

export function DeleteChatsModal({ onOpen }: { onOpen: () => void }) {
  const [opened, { open, close }] = useDisclosure(false, { onOpen });

  return (
    <>
      <Button
        onClick={open}
        variant="outline"
        color="red"
        leftIcon={<IconTrash size={20} />}
      >"
          {t("deleteChats")}
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title={t("deleteChats")}
        size="md"
        withinPortal
      >
        <Stack>
          <Text size="sm">{t("confirmDeleteChats")}</Text>
          <Button
            onClick={async () => {
              await db.chats.clear();
              await db.messages.clear();
              localStorage.clear();
              window.location.assign("/");
            }}
            color="red"
          >
              {t("delete")}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
