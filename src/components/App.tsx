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
      ]}
    >
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          withCSSVariables
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
                defaultProps: {
                  padding: "xl",
                },
                styles: {
                  title: {
                    fontSize: "1.2rem",
                    fontWeight: 600,
                  },
                },
              },
              ModalRoot: {
                defaultProps: {
                  centered: true,
                },
              },
              Overlay: {
                defaultProps: {
                  opacity: 0.6,
                  blur: 6,
                },
              },
              // Input: {
              //   defaultProps: {
              //     variant: "filled",
              //   },
              // },
              InputWrapper: {
                styles: {
                  label: {
                    marginBottom: 4,
                  },
                },
              },
              Code: {
                styles: (theme) => ({
                  root: {
                    fontSize: theme.fontSizes.sm,
                    backgroundColor:
                      theme.colorScheme == "dark"
                        ? theme.colors.dark[7]
                        : theme.colors.gray[1],
                  },
                }),
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
