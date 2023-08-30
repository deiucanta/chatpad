import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";

interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
}

export function MainLink({ icon, color, label }: MainLinkProps) {
  return (
    <UnstyledButton
      sx={(theme) => ({
        // display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      })}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text
          size="sm"
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            flex: 1,
            width: 0,
          }}
        >
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}
