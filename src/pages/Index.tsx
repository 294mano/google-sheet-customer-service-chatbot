import React, { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatOption from '@/components/ChatOption';
import { fetchSheetData, findMatchingAnswer } from '@/utils/sheetsHelper';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

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
            text: "台科大酷點校園客服機器人Demo:請點選你要查詢的項目或直接在信息框內輸入\n\n此為測試用; 你可以輸入\"台科大酷點\", \"5G\"或\"信用卡\"來看看結果:另外\"查詢訂單狀態\"及\"取消訂單\" 按鈕;目前無作用",
            isBot: true
          }
        ]);
      } else {
        toast({
          title: "連接錯誤",
          description: "無法連接到知識庫",
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

  const handleReset = () => {
    setMessages([
      {
        text: "台科大酷點校園客服機器人Demo:請點選你要查詢的項目或直接在信息框內輸入",
        isBot: true
      }
    ]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="chat-container bg-white rounded-xl shadow-lg flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
            />
          ))}
        </div>
        
        {messages.length === 1 && (
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
        
        <Button
          onClick={handleReset}
          className="absolute bottom-20 left-4 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Home className="mr-2 h-4 w-4" />
          回首頁
        </Button>
      </div>
    </div>
  );
};

export default Index;