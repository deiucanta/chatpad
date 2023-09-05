import { useMatchRoute } from "@tanstack/react-location";

export function useChatId() {
  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: "/chats/:chatId" });
  return match?.chatId;
}

export function usePublicChatId() {
  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: "/shared/chats/:chatId" });
  return match?.chatId;
}
