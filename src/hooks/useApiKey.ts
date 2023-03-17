import { useLocalStorage } from "@mantine/hooks";

export function useApiKey() {
  return useLocalStorage({
    key: "openai-key",
    defaultValue: "",
  });
}
