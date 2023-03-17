import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import {
  createHashHistory,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import { ChatRoute } from "../routes/ChatRoute";
import { DataRoute } from "../routes/DataRoute";
import { IndexRoute } from "../routes/IndexRoute";
import { Layout } from "./Layout";

const history = createHashHistory();
const location = new ReactLocation({ history });

export function App() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: prefersDark ? "dark" : "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <Router
      location={location}
      routes={[
        { path: "/", element: <IndexRoute /> },
        { path: "/chats/:chatId", element: <ChatRoute /> },
        { path: "/data", element: <DataRoute /> },
      ]}
    >
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
            primaryColor: "teal",
            globalStyles: (theme) => ({
              body: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[0],
              },
            }),
            components: {
              Modal: {
                styles: {
                  title: {
                    fontSize: "1.2rem",
                    fontWeight: 600,
                  },
                },
              },
              ModalRoot: {
                defaultProps: {
                  padding: "xl",
                  centered: true,
                },
              },
              Overlay: {
                defaultProps: {
                  opacity: 0.7,
                  blur: 3,
                },
              },
            },
          }}
        >
          <Layout />
          <Notifications />
        </MantineProvider>
      </ColorSchemeProvider>
    </Router>
  );
}
