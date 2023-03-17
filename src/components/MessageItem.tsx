import { Card, Flex, Text, ThemeIcon } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { Message } from "../db";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoIcon } from "./Logo";

import { ScrollIntoView } from "./ScrollIntoView";

export function MessageItem({ message }: { message: Message }) {
  return (
    <ScrollIntoView>
      <Card withBorder>
        <Flex gap="sm">
          {message.role === "user" && (
            <ThemeIcon color="gray" size="lg">
              <IconUser size={20} />
            </ThemeIcon>
          )}
          {message.role === "assistant" && <LogoIcon style={{ height: 32 }} />}
          <Text size="md" sx={{ flex: 1, whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
          <CreatePromptModal content={message.content} />
        </Flex>
      </Card>
    </ScrollIntoView>
  );
}
