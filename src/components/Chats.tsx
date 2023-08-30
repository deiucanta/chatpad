import { ActionIcon, Flex, Menu, useMantineTheme } from "@mantine/core";
import { IconDotsVertical, IconMessages } from "@tabler/icons-react";
import { Link } from "@tanstack/react-location";
import { useMemo } from "react";
import { useChatId } from "../hooks/useChatId";
import { DeleteChatModal } from "./DeleteChatModal";
import { EditChatModal } from "./EditChatModal";
import { MainLink } from "./MainLink";
import { useChats } from "../hooks/contexts";

export function Chats({ search }: { search: string }) {
  const chatId = useChatId();

  const theme = useMantineTheme();


  const { chats } = useChats()

  // const [chats, setChats] = useState<Chat[]>();

  // useEffect(() => {
  //   // fetch data
  //   const dataFetch = async () => {
  //     const { items } = await detaDB.chats.fetch();

  //     setChats(items as unknown as Chat[]);
  //   };

  //   dataFetch();
  // }, []);

  // const chats = useLiveQuery(() =>
  //   db.chats.orderBy("createdAt").reverse().toArray()
  // );
  const filteredChats = useMemo(
    () =>
      (chats ?? []).filter((chat) => {
        if (!search) return true;
        return chat.description.toLowerCase().includes(search);
      }),
    [chats, search]
  );

  return (
    <>
      {filteredChats.map((chat) => (
        <Flex
          key={chat.key}
          className={chatId === chat.key ? "active" : undefined}
          sx={(theme) => ({
            marginTop: 1,
            "&:hover, &.active": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Link to={`/chats/${chat.key}`} style={{ flex: 1 }}>
            <MainLink
              icon={<IconMessages size="1rem" />}
              color={theme.primaryColor}
              label={chat.description}
            />
          </Link>
          <Menu shadow="md" width={200} keepMounted>
            <Menu.Target>
              <ActionIcon sx={{ height: "auto" }}>
                <IconDotsVertical size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <EditChatModal chat={chat}>
                <Menu.Item>Edit</Menu.Item>
              </EditChatModal>
              <DeleteChatModal chat={chat}>
                <Menu.Item>Delete</Menu.Item>
              </DeleteChatModal>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      ))}
    </>
  );
}
