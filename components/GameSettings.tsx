import { NumberInput, Stack, Drawer, Divider, Text } from "@mantine/core";
import {
  defaultBidMultiplier,
  defaultMatchTime,
  defaultRounds,
  defaultStartingBid,
  GameSettings,
  UserSettings,
} from "../pages";
import {
  IconClock,
  IconCirclePlus,
  IconCoins,
  IconVariable,
} from "@tabler/icons-react";

interface Props {
  gameSettings: GameSettings;
  userSettings: UserSettings;
  setGameSettings: (
    val: GameSettings | ((prevState: GameSettings) => GameSettings)
  ) => void;
  handleOpenSettingsDrawer: (val: boolean) => void;
}

export default function Settings({
  gameSettings,
  userSettings,
  setGameSettings,
  handleOpenSettingsDrawer,
}: Props) {
  return (
    <>
      <Drawer
        opened={userSettings.isChangingSettings}
        onClose={() => handleOpenSettingsDrawer(false)}
        title="Settings"
        padding="xl"
        size="xl"
      >
        <Stack>
          <NumberInput
            icon={<IconClock />}
            value={gameSettings.matchTime}
            onChange={(val) =>
              setGameSettings((prevState) => {
                const oldDateObj = new Date();
                return {
                  ...prevState,
                  matchTime: val ?? defaultMatchTime,
                  finishTime: new Date(
                    oldDateObj.getTime() +
                      (val ? val : prevState.matchTime) * 60000
                  ),
                };
              })
            }
            min={1}
            max={1000}
            label="Match Time"
            description="Time in minutes"
            withAsterisk
          />
          <NumberInput
            icon={<IconCirclePlus />}
            value={gameSettings.rounds}
            onChange={(val) =>
              setGameSettings((prevState) => {
                return {
                  ...prevState,
                  rounds: val ?? defaultRounds,
                };
              })
            }
            label="Rounds"
            description="Bid rounds. Bids will increase by multiplier after each round."
            withAsterisk
            min={1}
          />
          <NumberInput
            icon={<IconCoins />}
            value={gameSettings.startingBid}
            onChange={(val) =>
              setGameSettings((prevState) => {
                return {
                  ...prevState,
                  startingBid: val ?? defaultStartingBid,
                };
              })
            }
            label="Starting Bid"
            description={`Large bid is ${gameSettings.bidMultiplier} the small bid.`}
            withAsterisk
            min={1}
          />
          <NumberInput
            icon={<IconVariable />}
            value={gameSettings.bidMultiplier}
            onChange={(val) =>
              setGameSettings((prevState) => {
                return {
                  ...prevState,
                  bidMultiplier: val ?? defaultBidMultiplier,
                };
              })
            }
            label="Bid Multiplier"
            description={`Small bid (${gameSettings.startingBid}) will be multiplied by this value at the start of each round.`}
            withAsterisk
            min={2}
          />
          <Stack sx={{ gap: "0px" }}>
            <Divider my="xs" />
            <Text size="xs">
              Changing game settings will restart your current game.
            </Text>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
