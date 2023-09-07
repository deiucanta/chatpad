import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import {
  createBrowserHistory,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import { BaseLayout } from "../layouts/Base";
import { PublicLayout } from "../layouts/Public";

const history = createBrowserHistory();
const location = new ReactLocation({ history });

export function App() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: prefersDark ? "dark" : "light",
    getInitialValueInEffect: false,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <Router
      location={location}
      routes={[
        { id: "root", path: "/", element: () => import('../routes/IndexRoute').then((mod) => <BaseLayout><mod.IndexRoute /></BaseLayout>)},
        { id: "chat", path: "/chats/:chatId", element: () => import('../routes/ChatRoute').then((mod) => <BaseLayout><mod.ChatRoute /></BaseLayout>) },
        { id: "public_chat", path: "/shared/chats/:chatId", element: () => import('../routes/PublicChatRoute').then((mod) => <PublicLayout><mod.PublicChatRoute /></PublicLayout>) },
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
            primaryColor: "orange",
            defaultRadius: "md",
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
          {/* <BaseLayout /> */}
          {/* <PublicLayout /> */}
          <Outlet />
          <Notifications position="bottom-right" style={{ marginBottom: '4rem' }} />
        </MantineProvider>
      </ColorSchemeProvider>
    </Router>
  );
}
