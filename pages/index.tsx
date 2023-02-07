import Head from "next/head";
import {
  Stack,
  Title,
  Divider,
  Flex,
  Container,
  Box,
  Group,
  Text,
  Menu,
  Modal,
  Button,
  ActionIcon,
  RingProgress,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Settings from "../components/GameSettings";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import {
  IconCards,
  IconMenu2,
  IconSettings,
  IconArrowBack,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconRefresh,
} from "@tabler/icons-react";
import useTimer from "../lib/timer";
import { useEffect } from "react";
export const defaultMatchTime = 0.05;
export const defaultRounds = 3;
export const defaultStartingBid = 10;

export interface GameSettings {
  matchTime: number;
  finishTime: Date;
  startTime?: number;
  rounds: number;
  startingBid: number;
  hasGameStarted: boolean;
}

export interface UserSettings {
  isChangingSettings: boolean;
}

export default function Home() {
  const getDefaultFinishTime = () => {
    const oldDateObj = new Date();
    return new Date(oldDateObj.getTime() + defaultMatchTime * 60000);
  };
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>({
    key: "game-settings",
    defaultValue: {
      matchTime: defaultMatchTime,
      finishTime: getDefaultFinishTime(),
      rounds: defaultRounds,
      startingBid: defaultStartingBid,
      hasGameStarted: false,
    },
  });
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>({
    key: "user-settings",
    defaultValue: {
      isChangingSettings: true,
    },
  });
  const { minutes, seconds, timeLapsedAsPercent, start, pause, isRunning } =
    useTimer(gameSettings.finishTime, 50);
  const hasTimerFinished = timeLapsedAsPercent === 1;

  useEffect(() => {
    if (timeLapsedAsPercent === 1 && gameSettings.hasGameStarted) {
      showNotification({
        title: "Game over",
        message: "Total time has elapsed",
      });
      setGameSettings((prevState) => {
        return {
          ...prevState,
          hasGameStarted: false,
        };
      });
    }
  }, [gameSettings.hasGameStarted, setGameSettings, timeLapsedAsPercent]);

  const handleOpenSettingsDrawer = (open: boolean) => {
    setUserSettings((prevState) => {
      return {
        ...prevState,
        isChangingSettings: open,
      };
    });
  };

  const resetGame = () => {
    setGameSettings({
      hasGameStarted: false,
      finishTime: getDefaultFinishTime(),
      startTime: undefined,
      matchTime: defaultMatchTime,
      rounds: defaultRounds,
      startingBid: defaultStartingBid,
    });
    showNotification({
      title: "Game reset!",
      message: "Data cleared",
    });
  };

  const startGame = () => {
    setGameSettings((prevState) => {
      return {
        ...prevState,
        startTime: Date.now().valueOf(),
        hasGameStarted: true,
      };
    });
    start();
  };

  const restartGame = () => {
    setGameSettings((prevState) => {
      return {
        ...prevState,
        hasGameStarted: false,
        finishTime: getDefaultFinishTime(),
        startTime: undefined,
      };
    });
  };

  const openConfirmResetModal = () =>
    openConfirmModal({
      centered: true,
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          You will reset all game settings back to defaults and you will lose
          your time and rounds. Are you sure you want to do this?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: resetGame,
    });

  return (
    <>
      <Head>
        <title>Texas Holdem/Poker - Tournament Timer</title>
        <meta
          name="description"
          content="The simple poker tournament bid and timer tracker."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <Stack justify="space-between" mih="100vh" pt="md" pb="xl">
            <Group position="apart">
              <Group>
                <IconCards />
              </Group>
              <Menu>
                <Menu.Target>
                  <ActionIcon>
                    <IconMenu2 />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item
                    icon={<IconSettings />}
                    onClick={() => handleOpenSettingsDrawer(true)}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<IconArrowBack />}
                    color="red"
                    onClick={openConfirmResetModal}
                  >
                    Reset Game
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
            <Box
              sx={{
                flex: 1,
              }}
              m="md"
            >
              <Title order={2}>Tournament Timer</Title>
              <Divider my="md" />
              <Stack mih={"100%"}>
                <Text>Has Game Started {`${gameSettings.hasGameStarted}`}</Text>
                <Text>Match time {gameSettings.matchTime}</Text>
                <Text>Rounds {gameSettings.rounds}</Text>
                <Text>Starting Bid {gameSettings.startingBid}</Text>
                <Text>Minutes Remaining {minutes}</Text>
                <Text>Seconds remaining {seconds}</Text>
                <RingProgress
                  roundCaps
                  label={
                    <Text
                      size="xs"
                      align="center"
                      px="xs"
                      sx={{ pointerEvents: "none" }}
                    >
                      {minutes}:{seconds}
                    </Text>
                  }
                  sections={[
                    {
                      value: timeLapsedAsPercent * 100,
                      color: "blue",
                      tooltip: "Total time elapsed",
                    },
                  ]}
                ></RingProgress>
              </Stack>
            </Box>
            <Box>
              <Divider my="sm" />
              <Flex justify="center">
                {hasTimerFinished ? (
                  <Button color="yellow" onClick={restartGame}>
                    <IconRefresh />
                  </Button>
                ) : isRunning ? (
                  <Button onClick={pause}>
                    <IconPlayerPauseFilled />
                  </Button>
                ) : (
                  <Button color="green" onClick={startGame}>
                    <IconPlayerPlayFilled />
                  </Button>
                )}
              </Flex>
            </Box>
          </Stack>
        </Container>
        <Settings
          gameSettings={gameSettings}
          handleOpenSettingsDrawer={handleOpenSettingsDrawer}
          setGameSettings={setGameSettings}
          userSettings={userSettings}
        />
      </main>
    </>
  );
}
