import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  urlDetails?: {
    text: string;
    url: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, urlDetails }) => {
  return (
    <div className={cn(isBot ? 'message-bot' : 'message-user')}>
      <div className="whitespace-pre-wrap">{message}</div>
      
      {urlDetails && (
        <div className="mt-4">
          <p className="mb-2 text-sm">更多的資訊,請按下列按鈕</p>
          <Button
            onClick={() => window.open(urlDetails.url, '_blank')}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            訪視資料
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;