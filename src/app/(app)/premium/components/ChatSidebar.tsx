// src/app/(app)/premium/components/ChatSidebar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit3, MessageSquareText, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatSessionSummary {
  id: string;
  title: string;
  // lastMessagePreview?: string; // Optional: for a snippet of the last message
  // updatedAt: Date; // Optional: for sorting or display
}

interface ChatSidebarProps {
  sessions: ChatSessionSummary[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void; // For mobile toggle
}

export function ChatSidebar({
  sessions,
  activeChatId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  isOpen,
  setIsOpen,
}: ChatSidebarProps) {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<ChatSessionSummary | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  const handleOpenRenameModal = (session: ChatSessionSummary) => {
    setChatToRename(session);
    setNewChatTitle(session.title);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = () => {
    if (chatToRename && newChatTitle.trim()) {
      onRenameChat(chatToRename.id, newChatTitle.trim());
    }
    setIsRenameModalOpen(false);
    setChatToRename(null);
    setNewChatTitle('');
  };

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-40 w-72 bg-black/80 backdrop-blur-lg border-r border-gray-700/50 p-5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      <div className={sidebarClasses}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">My Chats</h2>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          onClick={() => {
            onNewChat();
            if (window.innerWidth < 768) setIsOpen(false); // Close sidebar on mobile after action
          }}
          className="w-full mb-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> New Chat
        </Button>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50">
          {sessions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No chats yet. Start a new one!</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectChat(session.id);
                if (window.innerWidth < 768) setIsOpen(false); // Close sidebar on mobile after action
              }}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out",
                "hover:bg-gray-700/70",
                activeChatId === session.id
                  ? "bg-gradient-to-r from-orange-600/80 to-red-600/70 text-white font-semibold shadow-inner"
                  : "text-gray-300 hover:text-orange-300"
              )}
            >
              <div className="flex items-center overflow-hidden">
                <MessageSquareText className={cn(
                    "h-5 w-5 mr-3 flex-shrink-0",
                    activeChatId === session.id ? "text-white" : "text-gray-500 group-hover:text-orange-400"
                )} />
                <span className="truncate text-sm">{session.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-7 w-7 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity",
                    activeChatId === session.id ? "text-white opacity-70 hover:opacity-100" : "hover:text-orange-300"
                )}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent onSelectChat from firing
                  handleOpenRenameModal(session);
                }}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-auto pt-4 text-center">Chat history is local for now.</p>
      </div>

      {/* Rename Chat Modal */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-orange-400">Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Enter new chat title"
              className="bg-gray-800 border-gray-600 text-white focus:border-orange-500"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmRename} className="bg-orange-500 hover:bg-orange-600">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
