'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Wifi,
  WifiOff,
  User,
} from 'lucide-react';

interface ChatInterfaceProps {
  sessionId: string;
  userId: string;
  receiverId: string;
  receiverName?: string;
  receiverAvatar?: string;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  read: boolean;
}

export function ChatInterface({
  sessionId,
  userId,
  receiverId,
  receiverName = 'Spirit Guide',
  receiverAvatar,
  onVideoCall,
  onVoiceCall,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(false); // Track if there are more messages to load
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isConnected,
    isTyping: receiverTyping,
    loading,
    error,
    sendMessage,
    markAsRead,
    setTyping,
    loadMoreMessages,
  } = useChat({
    sessionId,
    userId,
    receiverId,
    onMessage: (msg) => {
      // Auto-scroll to bottom when new message arrives
      scrollToBottom();
    },
    onTyping: (typingUserId, isTyping) => {
      // Handle typing indicators
    },
    onMessagesRead: (messageIds) => {
      // Handle read receipts
    },
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      setTyping(false);
    }
  };

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;

    try {
      await sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      setTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  // Format date
  const formatDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <Card className="border-b">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={receiverAvatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{receiverName}</h3>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                  {receiverTyping && (
                    <Badge variant="secondary" className="text-xs">
                      Typing...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {onVoiceCall && (
                <Button variant="outline" size="sm" onClick={onVoiceCall}>
                  <Phone className="h-4 w-4" />
                </Button>
              )}
              {onVideoCall && (
                <Button variant="outline" size="sm" onClick={onVideoCall}>
                  <Video className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 border-b">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Load More Messages'
                  )}
                </Button>
              </div>
            )}

            {/* Messages Grouped by Date */}
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                {/* Date Separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(new Date(date))}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                {dateMessages.map((msg) => {
                  const isSender = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isSender
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(msg.timestamp)}
                          </span>
                          {isSender && (
                            <div className="ml-2">
                              {msg.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {receiverTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to bottom ref */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <Card className="border-t">
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Button type="button" variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!isConnected || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}