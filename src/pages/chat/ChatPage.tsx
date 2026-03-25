import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, ChevronLeft, Search } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import { findUserById } from '../../data/users';
import { getMessagesBetweenUsers, sendMessage, getConversationsForUser } from '../../data/messages';
import { MessageCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [userId]);

  const chatPartner = userId ? findUserById(userId) : null;

  useEffect(() => {

    if (currentUser) {
      setConversations(getConversationsForUser(currentUser.id));
    }
  }, [currentUser]);

  useEffect(() => {

    if (currentUser && userId) {
      setMessages(getMessagesBetweenUsers(currentUser.id, userId));
    }
  }, [currentUser, userId]);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser || !userId) return;

    const message = sendMessage({
      senderId: currentUser.id,
      receiverId: userId,
      content: newMessage
    });

    setMessages([...messages, message]);
    setNewMessage('');

    setConversations(getConversationsForUser(currentUser.id));
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
      {}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white z-20`}>
        <div className="p-4 border-b border-gray-200 md:hidden flex items-center justify-between ">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <Button variant="ghost" size="sm" className="rounded-full p-2">
            <Search size={20} />
          </Button>
        </div>
        <ChatUserList conversations={conversations} />
      </div>

      {}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative`}>
        {}
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden mr-2 p-1 rounded-full"
                  onClick={() => navigate('/messages')}
                >
                  <ChevronLeft size={24} />
                </Button>

                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />

                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{chatPartner.name}</h2>
                  <p className="text-xs text-success-600 font-medium">
                    {chatPartner.isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  aria-label="Voice call"
                >
                  <Phone size={18} />
                </Button>

                <Link to="/video">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 hover:bg-primary-50 hover:text-primary-600 transition-colors text-primary-600"
                    aria-label="Video call"
                  >
                    <Video size={18} />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Info"
                >
                  <Info size={18} />
                </Button>
              </div>
            </div>

            {}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                  <p className="text-gray-500 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>

            {}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Add emoji"
                >
                  <Smile size={20} />
                </Button>

                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-2 text-center">
              Choose a contact from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};