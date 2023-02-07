import { Button, Group, NumberInput, Stack, Drawer } from "@mantine/core";
import {
  defaultMatchTime,
  defaultRounds,
  defaultStartingBid,
  GameSettings,
  UserSettings,
} from "../pages";
import { IconClock, IconCirclePlus, IconCoins } from "@tabler/icons-react";

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
                return {
                  ...prevState,
                  matchTime: val ?? defaultMatchTime,
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
          <Group>
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
              description="Large bid is 2x the small bid."
              withAsterisk
              min={1}
            />
          </Group>
        </Stack>
      </Drawer>
    </>
  );
}
