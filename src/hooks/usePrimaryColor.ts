import { useMantineTheme } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'

export function usePrimaryColor() {
  return useLocalStorage<string>({
    key: "mantine-primary-color",
    defaultValue: "teal",
  })
}

export function usePrimaryThemeColor() {
  const [primaryColor] = usePrimaryColor()
  const theme = useMantineTheme()
  return theme.colors[primaryColor]
}
