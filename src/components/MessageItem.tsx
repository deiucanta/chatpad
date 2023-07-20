import {
  ActionIcon,
  Box,
  Card,
  Code,
  CopyButton,
  Flex,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconCopy, IconUser } from "@tabler/icons-react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../db";
import "../styles/markdown.scss";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoIcon } from "./Logo";
import { ScrollIntoView } from "./ScrollIntoView";
import "../utils/prisma-setup";

export function MessageItem({ message }: { message: Message }) {
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
                table: ({ node, ...props }) => (
                  <Table verticalSpacing="sm" highlightOnHover {...props} />
                ),
                code: ({ node, inline, className, lang, ...props }) => {
                  const languageMatch = /language-(\w+)/.exec(className || "");
                  const language = languageMatch ? languageMatch[1] : undefined;

                  return inline ? (
                    <Code {...props} />
                  ) : (
                    <Box sx={{ position: "relative" }}>
                      <Prism
                        language={language as any}
                        children={`${props.children as string}`}
                      />
                    </Box>
                  );
                },
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
            <CopyButton value={message.content}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy"} position="left">
                  <ActionIcon onClick={copy}>
                    <IconCopy opacity={0.5} size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
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
