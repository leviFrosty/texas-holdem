import Head from "next/head";
import {
  Stack,
  Title,
  Divider,
  Container,
  Box,
  Group,
  Text,
  Menu,
  Button,
  ActionIcon,
  RingProgress,
  Paper,
  Badge,
  Indicator,
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
  IconCurrencyCent,
} from "@tabler/icons-react";
import useTimer from "../lib/timer";
import { useEffect } from "react";
export const defaultMatchTime = 0.04;
export const defaultRounds = 4;
export const defaultStartingBid = 10;
export const defaultBidMultiplier = 2;

export interface GameSettings {
  matchTime: number;
  finishTime?: Date;
  startTime?: number;
  rounds: number;
  startingBid: number;
  bidMultiplier: number;
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
      bidMultiplier: defaultBidMultiplier,
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
    if (hasTimerFinished && gameSettings.hasGameStarted) {
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
  }, [
    gameSettings.hasGameStarted,
    hasTimerFinished,
    setGameSettings,
    timeElapsedAsPercent,
  ]);

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

  useEffect(() => {
    if (
      gameSettings.hasGameStarted &&
      currentRound.number !== previousRound()?.number
    ) {
      showNotification({
        color: "yellow",
        title: `Round ${currentRound.number} started`,
        message: `Bids have been multiplied.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound.number]);

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
      bidMultiplier: defaultBidMultiplier,
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

  // Listens for settings changes, restarts game after
  useEffect(() => {
    restartGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameSettings.startingBid,
    gameSettings.matchTime,
    gameSettings.rounds,
    gameSettings.bidMultiplier,
  ]);

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

  const openConfirmRestartModal = () => {
    pause();
    openConfirmModal({
      centered: true,
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          You will restart the current game, retaining your current settings.
          Are you sure you want to do this?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: restartGame,
    });
  };

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
                <Group grow>
                  <Paper withBorder p="sm">
                    <Stack>
                      <Text size="md">Small Bid</Text>
                      <Group sx={{ gap: "4px" }}>
                        <IconCurrencyCent />
                        <Text size="xl" fw="bold">
                          {gameSettings.startingBid * currentRound.number}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                  <Paper withBorder p="sm">
                    <Stack>
                      <Group spacing="xs">
                        <Text size="md">Large Bid</Text>
                        <Badge
                          sx={{ display: "inline" }}
                        >{`${gameSettings.bidMultiplier}x`}</Badge>
                      </Group>
                      <Group sx={{ gap: "4px" }}>
                        <IconCurrencyCent />
                        <Text size="xl" fw="bold">
                          {gameSettings.startingBid *
                            currentRound.number *
                            gameSettings.bidMultiplier}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                </Group>
                <Group grow>
                  <Paper withBorder p="sm">
                    <Stack>
                      <Text size="md">Match Time</Text>
                      <Group position="center">
                        <RingProgress
                          roundCaps
                          label={
                            <Text
                              size="lg"
                              align="center"
                              px="xs"
                              fw="bold"
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
                      </Group>
                    </Stack>
                  </Paper>
                  <Paper withBorder p="sm">
                    <Stack>
                      <Text size="md">Round Time</Text>
                      <Group position="center">
                        <RingProgress
                          roundCaps
                          label={
                            <Text
                              size="lg"
                              align="center"
                              px="xs"
                              fw="bold"
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
                      </Group>
                    </Stack>
                  </Paper>
                </Group>
              </Stack>
            </Box>
            <Box>
              <Divider my="sm" />
              <Group position="apart">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={() => handleOpenSettingsDrawer(true)}
                >
                  <IconSettings />
                </Button>
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
                <Button
                  color="gray"
                  variant="subtle"
                  onClick={openConfirmRestartModal}
                >
                  <IconRefresh />
                </Button>
              </Group>
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
