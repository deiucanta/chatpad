import { ActionIcon, Box, Card, Flex, ThemeIcon, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconUser } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { Message } from "../db";
import "../styles/markdown.scss";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoIcon } from "./Logo";

import { ScrollIntoView } from "./ScrollIntoView";

export function MessageItem({ message }: { message: Message }) {
  const clipboard = useClipboard({ timeout: 500 });

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
          <Box sx={{ flex: 1, width: 0 }} className="markdown">
            <ReactMarkdown children={message.content} />
          </Box>
          <Box>
            <CreatePromptModal content={message.content} />
            <Tooltip
              label={clipboard.copied ? "Copied" : "Copy"}
              position="left"
            >
              <ActionIcon onClick={() => clipboard.copy(message.content)}>
                <IconCopy opacity={0.5} size={20} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </Flex>
      </Card>
    </ScrollIntoView>
  );
}
