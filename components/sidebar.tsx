import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, MoreVertical, Share, Edit, Trash } from "lucide-react";
import { Chat } from "./chatLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string) => void;
  createNewChat: () => void;
  shareChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  deleteChat: (id: string) => void;
};

type ClassifiedChats = {
  [key: string]: Chat[];
};

const classifyChats = (chats: Chat[]): ClassifiedChats => {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const oneWeekAgo = today - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = today - 30 * 24 * 60 * 60 * 1000;

  return chats.reduce((acc: ClassifiedChats, chat) => {
    const chatDate = new Date(chat.createdAt);
    if (chat.createdAt >= today) {
      acc["Today"] = [...(acc["Today"] || []), chat];
    } else if (chat.createdAt >= oneWeekAgo) {
      acc["Previous 7 Days"] = [...(acc["Previous 7 Days"] || []), chat];
    } else if (chat.createdAt >= oneMonthAgo) {
      acc["Previous 30 Days"] = [...(acc["Previous 30 Days"] || []), chat];
    } else {
      const monthYear = chatDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      acc[monthYear] = [...(acc[monthYear] || []), chat];
    }
    return acc;
  }, {});
};

export const Sidebar = ({
  open,
  setOpen,
  chats,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  shareChat,
  renameChat,
  deleteChat,
}: SidebarProps) => {
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRename = (chatId: string) => {
    if (newTitle.trim()) {
      renameChat(chatId, newTitle.trim());
      setRenamingChatId(null);
      setNewTitle("");
    }
  };

  const classifiedChats = classifyChats(chats);

  return (
    <div
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-semibold">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Button
          className="mx-4 mb-2"
          variant="secondary"
          onClick={createNewChat}
        >
          <Plus className="mr-2 h-4 w-4" /> New chat
        </Button>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {Object.entries(classifiedChats).map(
              ([category, categoryChats]) => (
                <div key={category}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-400">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryChats.map((chat) => (
                      <div key={chat.id} className="flex items-center">
                        {renamingChatId === chat.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleRename(chat.id);
                            }}
                            className="flex-1 mr-2"
                          >
                            <Input
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="New chat name"
                              className="bg-gray-800 text-white"
                            />
                          </form>
                        ) : (
                          <Button
                            variant={
                              chat.id === currentChatId ? "default" : "ghost"
                            }
                            className="w-full justify-start mr-2"
                            onClick={() => setCurrentChatId(chat.id)}
                          >
                            {chat.title}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => shareChat(chat.id)}
                            >
                              <Share className="mr-2 h-4 w-4" />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setRenamingChatId(chat.id);
                                setNewTitle(chat.title);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteChat(chat.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};