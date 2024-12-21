import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  return (
    <div className={cn(isBot ? 'message-bot' : 'message-user')}>
      {message}
    </div>
  );
};

export default ChatMessage;