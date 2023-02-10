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
export const defaultMatchTime = 0.04;
export const defaultRounds = 4;
export const defaultStartingBid = 10;

export interface GameSettings {
  matchTime: number;
  finishTime?: Date;
  startTime?: number;
  rounds: number;
  startingBid: number;
  hasGameStarted: boolean;
}

export interface UserSettings {
  isChangingSettings: boolean;
}

export default function Home() {
  const getFinishTime = ({ asDefault }: { asDefault: boolean }): Date => {
    const oldDateObj = new Date();
    return new Date(
      oldDateObj.getTime() +
        (asDefault ? defaultMatchTime : gameSettings.matchTime) * 60000
    );
  };
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>({
    key: "game-settings",
    defaultValue: {
      matchTime: defaultMatchTime,
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
  const {
    minutes,
    seconds,
    timeElapsed,
    timeElapsedAsPercent,
    start,
    pause,
    isRunning,
    timeLimit,
  } = useTimer(gameSettings.finishTime, 25);
  const hasTimerFinished =
    timeElapsedAsPercent && Math.ceil(timeElapsedAsPercent * 100) === 100;
  const timePerRound = timeLimit && Math.floor(timeLimit / gameSettings.rounds);

  const roundsInfo = () => {
    if (!timeLimit) {
      return;
    }
    const results = [];
    for (let i = 1; i <= gameSettings.rounds; i++) {
      const endTime =
        timePerRound && timeLimit - (timeLimit - timePerRound * i);
      results.push({
        number: i,
        endTime,
        percentOfTotalTime: endTime && 1 - (timeLimit - endTime) / timeLimit,
      });
    }
    return results;
  };

  const currentRound = roundsInfo()?.find((round) => {
    if (round.endTime && timeElapsed) {
      if (round.endTime > timeElapsed) {
        return round.number;
      }
    }
  }) ?? {
    number: 1,
    startTime: 0,
    endTime: 1,
    percentOfTotalTime: 0,
  };

  const previousRound = () => {
    const previousRoundNumber =
      currentRound.number - 1 > 0 ? currentRound.number - 1 : 1;
    return roundsInfo()?.find((round) => {
      return round.number === previousRoundNumber;
    });
  };

  const previousRoundPercent =
    currentRound.number !== 1 ? previousRound()?.percentOfTotalTime ?? 0 : 0;

  const percentCompleteOfCurrentRound =
    (timeElapsedAsPercent &&
      currentRound.percentOfTotalTime &&
      ((timeElapsedAsPercent * 100 - previousRoundPercent * 100) /
        (currentRound.percentOfTotalTime * 100 - previousRoundPercent * 100)) *
        100) ??
    0;

  // Checks for game win condition
  useEffect(() => {
    if (timeElapsedAsPercent === 1 && gameSettings.hasGameStarted) {
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
  }, [gameSettings.hasGameStarted, setGameSettings, timeElapsedAsPercent]);

  // Handles client-side setting of finishDate on page load
  useEffect(() => {
    const oldDateObj = new Date();
    setGameSettings((prevState) => {
      return {
        ...prevState,
        finishTime: new Date(
          oldDateObj.getTime() + prevState.matchTime * 60000
        ),
      };
    });
  }, [setGameSettings]);

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
      finishTime: getFinishTime({ asDefault: true }),
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
        finishTime: getFinishTime({ asDefault: false }),
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
                      value: timeElapsedAsPercent
                        ? timeElapsedAsPercent * 100
                        : 100,
                      color: "blue",
                      tooltip: "Total time elapsed",
                    },
                  ]}
                />
                <RingProgress
                  roundCaps
                  label={
                    <Text
                      size="xs"
                      align="center"
                      px="xs"
                      sx={{ pointerEvents: "none" }}
                    >
                      {currentRound.number}
                    </Text>
                  }
                  sections={[
                    {
                      value: percentCompleteOfCurrentRound,
                      color: "blue",
                      tooltip: "Current round timer",
                    },
                  ]}
                />
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
