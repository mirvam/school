'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Message, ChatRoom } from '@/types/marketplace';

// Mock Dialect integration - in production, use actual Dialect SDK
interface MessagingContextType {
  chatRooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, recipient: PublicKey) => Promise<void>;
  createChatRoom: (recipient: PublicKey, listingId?: PublicKey) => Promise<ChatRoom>;
  selectRoom: (room: ChatRoom | null) => void;
  markAsRead: (roomId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
}

interface MessagingProviderProps {
  children: React.ReactNode;
}

export function MessagingProvider({ children }: MessagingProviderProps) {
  const { publicKey, connected } = useWallet();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize messaging when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadChatRooms();
    } else {
      setChatRooms([]);
      setSelectedRoom(null);
      setMessages([]);
    }
  }, [connected, publicKey]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    } else {
      setMessages([]);
    }
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    try {
      // Mock implementation - in production, fetch from Dialect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock chat rooms
      const mockRooms: ChatRoom[] = [
        {
          id: 'room-1',
          participants: [
            publicKey,
            new PublicKey('2222222222222222222222222222222222222222222222')
          ],
          lastMessage: {
            id: 'msg-1',
            sender: new PublicKey('2222222222222222222222222222222222222222222222'),
            recipient: publicKey,
            content: 'Hi! Is this MacBook still available?',
            timestamp: Date.now() - 3600000, // 1 hour ago
            encrypted: true,
          },
          createdAt: Date.now() - 86400000, // 1 day ago
        },
        {
          id: 'room-2',
          participants: [
            publicKey,
            new PublicKey('4444444444444444444444444444444444444444444444')
          ],
          lastMessage: {
            id: 'msg-2',
            sender: publicKey,
            recipient: new PublicKey('4444444444444444444444444444444444444444444444'),
            content: 'Thanks for your interest! Yes, it\'s still available.',
            timestamp: Date.now() - 7200000, // 2 hours ago
            encrypted: true,
          },
          createdAt: Date.now() - 172800000, // 2 days ago
        },
      ];
      
      setChatRooms(mockRooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      // Mock implementation - in production, fetch from Dialect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          sender: new PublicKey('2222222222222222222222222222222222222222222222'),
          recipient: publicKey!,
          content: 'Hi! Is this MacBook still available?',
          timestamp: Date.now() - 3600000,
          encrypted: true,
        },
        {
          id: 'msg-2',
          sender: publicKey!,
          recipient: new PublicKey('2222222222222222222222222222222222222222222222'),
          content: 'Yes, it\'s still available! Are you interested?',
          timestamp: Date.now() - 3540000,
          encrypted: true,
        },
        {
          id: 'msg-3',
          sender: new PublicKey('2222222222222222222222222222222222222222222222'),
          recipient: publicKey!,
          content: 'Definitely! Can we arrange to meet?',
          timestamp: Date.now() - 3480000,
          encrypted: true,
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, recipient: PublicKey) => {
    if (!publicKey || !content.trim()) return;

    try {
      // Mock implementation - in production, use Dialect SDK
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: publicKey,
        recipient,
        content: content.trim(),
        timestamp: Date.now(),
        encrypted: true,
      };

      // Add to messages if it's for the current room
      if (selectedRoom && selectedRoom.participants.some(p => p.equals(recipient))) {
        setMessages(prev => [...prev, newMessage]);
      }

      // Update the last message in chat rooms
      setChatRooms(prev => prev.map(room => {
        if (room.participants.some(p => p.equals(recipient))) {
          return { ...room, lastMessage: newMessage };
        }
        return room;
      }));

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const createChatRoom = async (recipient: PublicKey, listingId?: PublicKey): Promise<ChatRoom> => {
    if (!publicKey) throw new Error('Wallet not connected');

    try {
      // Check if room already exists
      const existingRoom = chatRooms.find(room => 
        room.participants.some(p => p.equals(recipient))
      );

      if (existingRoom) {
        setSelectedRoom(existingRoom);
        return existingRoom;
      }

      // Create new room (mock implementation)
      const newRoom: ChatRoom = {
        id: `room-${Date.now()}`,
        participants: [publicKey, recipient],
        listingId,
        createdAt: Date.now(),
      };

      setChatRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      
      return newRoom;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  };

  const selectRoom = (room: ChatRoom | null) => {
    setSelectedRoom(room);
  };

  const markAsRead = (roomId: string) => {
    // In production, this would mark messages as read in Dialect
    console.log('Marking room as read:', roomId);
  };

  const value: MessagingContextType = {
    chatRooms,
    selectedRoom,
    messages,
    isLoading,
    sendMessage,
    createChatRoom,
    selectRoom,
    markAsRead,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export default MessagingProvider;