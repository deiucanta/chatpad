import { useMemo } from "react";
import { Text } from '@mantine/core';
import { format, isToday, isYesterday, isThisWeek, subWeeks, isSameYear, isSameWeek } from 'date-fns';

import { useChatId } from "../hooks/useChatId";
import { useChats } from "../hooks/contexts";
import { ChatItem } from "./ChatItem";

export function Chats({ search }: { search: string }) {
  const chatId = useChatId();
  const { chats } = useChats()

  const filteredChats = useMemo(
    () =>
      (chats ?? [])
        .filter((chat) => {
          if (!search) return true;
          return chat.description.toLowerCase().includes(search);
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [chats, search]
  );

  const groupedChats = useMemo(() => filteredChats.reduce((acc, chat) => {
    const chatDate = new Date(chat.createdAt);
    if (isToday(chatDate)) {
      if (!acc['Today']) {
        acc['Today'] = [chat];
      } else {
        acc['Today'].push(chat);
      }
    } else if (isYesterday(chatDate)) {
      if (!acc['Yesterday']) {
        acc['Yesterday'] = [chat];
      } else {
        acc['Yesterday'].push(chat);
      }
    } else if (isThisWeek(chatDate, { weekStartsOn: 1 })) {
      const chatWeekday = format(chatDate, 'EEEE');
      if (!acc[chatWeekday]) {
        acc[chatWeekday] = [chat];
      } else {
        acc[chatWeekday].push(chat);
      }
    } else if (isSameWeek(chatDate, subWeeks(new Date(), 1), { weekStartsOn: 1 })) {
      if (!acc['Last Week']) {
        acc['Last Week'] = [chat];
      } else {
        acc['Last Week'].push(chat);
      }
    } else if (isSameYear(chatDate, new Date())) {
      const chatMonth = format(chatDate, 'MMMM');
      if (!acc[chatMonth]) {
        acc[chatMonth] = [chat];
      } else {
        acc[chatMonth].push(chat);
      }
    } else {
      const chatYear = ` ${format(chatDate, 'yyyy')}`; // space to avoid js object key sorting
      if (!acc[chatYear]) {
        acc[chatYear] = [chat];
      } else {
        acc[chatYear].push(chat);
      }
    }
    return acc;
  }, {} as Record<string, typeof filteredChats>), [filteredChats]);

  return (
    <>
      {Object.entries(groupedChats).map(([date, chats]) => (
        <div key={date}>
          <Text fz="sm" py="sm" px="xs" color="dimmed">{date}</Text>
          {chats.map((chat) => (
            <ChatItem key={chat.key} chat={chat} active={chatId === chat.key} />
          ))}
        </div>
      ))}
    </>
  );
}
