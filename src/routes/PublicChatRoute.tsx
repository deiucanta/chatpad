import {
  Card,
  Container,
  Skeleton,
  Stack,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { MessageItem } from "../components/MessageItem";
import { Message } from "../db";
import { usePublicChatId } from "../hooks/useChatId";

export function PublicChatRoute() {
  const chatId = usePublicChatId();
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const dataFetch = async () => {
      setLoading(true);
      const res = await fetch(`/api/public/chats/${chatId}/messages`)
      const { items } = await res.json()

      setMessages(items as unknown as Message[]);
      setLoading(false);
    };

    dataFetch();
  }, [chatId]);

  if (!chatId) return null;

  return (
    <>
      <Container pt="xl" pb={100}>
        <Stack spacing="xs" id="test">
          {messages?.map((message) => (
            <MessageItem key={message.key} message={message} readOnly />
          ))}
        </Stack>
        {loading && (
          <Card withBorder mt="xs">
            <Skeleton height={8} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} width="70%" radius="xl" />
          </Card>
        )}
      </Container>
    </>
  );
}
