import React, { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatOption from '@/components/ChatOption';
import { fetchSheetData, findMatchingAnswer } from '@/utils/sheetsHelper';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  text: string;
  isBot: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initChat = async () => {
      const data = await fetchSheetData();
      if (data) {
        setSheetData(data);
        setMessages([
          {
            text: "Hello, I'm your ChatBot Real Estate Agent! 🏠👋",
            isBot: true
          },
          {
            text: "Choose what are you interested in:",
            isBot: true
          }
        ]);
      } else {
        toast({
          title: "Connection Error",
          description: "Could not connect to the knowledge base",
          variant: "destructive"
        });
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { text, isBot: false }]);

    const answer = findMatchingAnswer(text, sheetData);
    if (answer) {
      setMessages(prev => [
        ...prev,
        { 
          text: `${answer.answer}\n${answer.details}`,
          isBot: true 
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { 
          text: "找不到答案; 請試試輸入5G或信用卡做測試",
          isBot: true 
        }
      ]);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSendMessage(option);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="chat-container bg-white rounded-xl shadow-lg flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
            />
          ))}
        </div>
        
        {messages.length === 2 && (
          <div className="p-4 space-y-2 border-t">
            <ChatOption
              text="查詢訂單狀態"
              onClick={() => handleOptionClick("查詢訂單狀態")}
            />
            <ChatOption
              text="取消訂單"
              onClick={() => handleOptionClick("取消訂單")}
            />
            <ChatOption
              text="問客服機器人"
              onClick={() => handleOptionClick("問客服機器人")}
            />
          </div>
        )}
        
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Index;