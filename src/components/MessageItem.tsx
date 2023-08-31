import {
  ActionIcon,
  Box,
  Card,
  Code,
  Collapse,
  CopyButton,
  Flex,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconArrowForward, IconCopy, IconTrash, IconUser } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message, detaDB } from "../db";
import "../styles/markdown.scss";
import { CreatePromptModal } from "./CreatePromptModal";
import { LogoIcon } from "./Logo";
import { ScrollIntoView } from "./ScrollIntoView";
import { notifications } from "@mantine/notifications";

export function MessageItem({ message, onDeleted, handleUseMessage }: { message: Message, onDeleted: (key: string) => void, handleUseMessage: (key: string) => void }) {
  const wordCount = useMemo(() => {
    var matches = message.content.match(/[\w\d\’\'-\(\)]+/gi);
    return matches ? matches.length : 0;
  }, [message.content]);

  const [isExpanded, setExpanded] = useState(false);
  const ref = useClickOutside(() => setExpanded(false));
  const theme = useMantineTheme();

  const handleDelete = async () => {
    await detaDB.messages.delete(message.key);

    onDeleted(message.key)

    setExpanded(false);

    notifications.show({
      title: "Deleted",
      color: "green",
      message: "Message deleted.",
    });
  }

  return (
    <ScrollIntoView>
      <Card
        ref={ref}
        withBorder
        onClick={() => setExpanded(true)}
        style={{ cursor: 'pointer' }}
        sx={{
          '&:hover': {
            border: '1px solid #acacac'
          }
        }}
      >
        <Flex gap="sm">
          {message.role === "user" && (
            <ThemeIcon color="gray" size="lg">
              <IconUser size={20} />
            </ThemeIcon>
          )}
          {message.role === "assistant" && <LogoIcon style={{ height: 32 }} color1={theme.colors[theme.primaryColor][3]} color2={theme.colors[theme.primaryColor][7]} />}
          <Box sx={{ flex: 1, width: 0 }} className="markdown">
            <ReactMarkdown
              children={message.content}
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <Table verticalSpacing="sm" highlightOnHover {...props} />
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <Code {...props} />
                  ) : (
                    <Box sx={{ position: "relative" }}>
                      <Code block {...props} />
                      <CopyButton value={String(props.children)}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={copied ? "Copied" : "Copy"}
                            position="left"
                          >
                            <ActionIcon
                              sx={{ position: "absolute", top: 4, right: 4 }}
                              onClick={copy}
                            >
                              <IconCopy opacity={0.4} size={20} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Box>
                  ),
              }}
            />
          </Box>
        </Flex>

        <Collapse in={isExpanded}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <Box>
              <Text size="sm" color="dimmed">
                {wordCount} words
              </Text>
            </Box>

            <Box style={{ display: 'flex' }}>
              <CreatePromptModal content={message.content || ''} />
              <Tooltip label="Re-use Message" position="top">
                <ActionIcon onClick={() => handleUseMessage(message.content)}>
                  <IconArrowForward opacity={0.5} size={20} />
                </ActionIcon>
              </Tooltip>
              <CopyButton value={message.content}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied Message" : "Copy Message"} position="top">
                    <ActionIcon onClick={copy}>
                      <IconCopy opacity={0.5} size={20} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
              <Tooltip label="Delete Message" position="top">
                <ActionIcon onClick={handleDelete}>
                  <IconTrash opacity={0.5} size={20} />
                </ActionIcon>
              </Tooltip>
            </Box>
            </Box>
          </Collapse>
      </Card>
    </ScrollIntoView>
  );
}
