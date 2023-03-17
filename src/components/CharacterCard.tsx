import { Card, Grid, Group, Text } from "@mantine/core";

const CharacterCard = ({
  character,
  onClick,
  selectedIndex,
  i,
}: {
  character: { name: string; description: string };
  onClick: any;
  selectedIndex: number;
  i: number;
}) => {
  const isActive = selectedIndex === i;
  return (
    <Grid.Col xs={6} md={4}>
      <Card
        withBorder
        component="a"
        onClick={onClick}
        sx={(theme) => ({
          cursor: "pointer",
          height: "100%",
          borderColor: isActive
            ? `${theme.colors.blue["5"]} !important`
            : undefined,
          borderRadius: theme.radius.md,
          padding: theme.spacing.lg,
          // boxShadow: theme.shadows.xs,
          ":hover": {
            borderColor: `${theme.colors.blue["5"]} !important`,
          },
        })}
      >
        <Group position="apart" mb="xs">
          <Text weight={500}>{character.name}</Text>
        </Group>

        <Text size="sm" color="dimmed">
          {character.description}
        </Text>
      </Card>
    </Grid.Col>
  );
};

export default CharacterCard;
