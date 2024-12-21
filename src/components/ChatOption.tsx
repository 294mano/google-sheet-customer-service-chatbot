import React from 'react';
import { cn } from '@/lib/utils';

interface ChatOptionProps {
  text: string;
  onClick: () => void;
  active?: boolean;
}

const ChatOption: React.FC<ChatOptionProps> = ({ text, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={cn('chat-button', active && 'active')}
    >
      {text}
    </button>
  );
};

export default ChatOption;