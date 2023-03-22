import {
  ActionIcon,
  Box,
  Card,
  Flex,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconUser } from "@tabler/icons-react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../db";
import "../styles/markdown.scss";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoIcon } from "./Logo";
import { ScrollIntoView } from "./ScrollIntoView";

export function MessageItem({ message }: { message: Message }) {
  const clipboard = useClipboard({ timeout: 500 });
  const wordCount = useMemo(() => {
    var matches = message.content.match(/[\w\d\’\'-\(\)]+/gi);
    return matches ? matches.length : 0;
  }, [message.content]);

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
            <ReactMarkdown
              children={message.content}
              remarkPlugins={[remarkGfm]}
              components={{
                table: (props) => (
                  <Table verticalSpacing="sm" highlightOnHover {...props} />
                ),
              }}
            />
            {message.role === "assistant" && (
              <Box>
                <Text size="sm" color="dimmed">
                  {wordCount} words
                </Text>
              </Box>
            )}
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
            {/* <Tooltip label={`${wordCount} words`} position="left">
              <ActionIcon>
                <IconInfoCircle opacity={0.5} size={20} />
              </ActionIcon>
            </Tooltip> */}
          </Box>
        </Flex>
      </Card>
    </ScrollIntoView>
  );
}
