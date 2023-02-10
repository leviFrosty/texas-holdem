import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

export default function App({ Component, pageProps }: AppProps) {
  // TODO: use device preference for theme as default. Add user preferences menu / add light/dark theme toggler in the hotdog menu
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
        fontFamily: "Verdana, sans-serif",
      }}
    >
      <NotificationsProvider limit={2} position="top-left">
        <ModalsProvider>
          <Component {...pageProps} />
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}
