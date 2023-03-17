import { useMatchRoute } from "@tanstack/react-location";

export function useChatId() {
  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: "/chats/:chatId" });
  return match?.chatId;
}
