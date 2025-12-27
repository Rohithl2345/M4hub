import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

import 'text-encoding';
import { APP_CONFIG } from '../constants';

const API_URL = APP_CONFIG.API_URL;

export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE';
    mediaUrl?: string;
    createdAt: string;
    deliveredAt?: string;
    readAt?: string;
    isDelivered: boolean;
    isRead: boolean;
}

export interface FriendRequest {
    id: number;
    sender: {
        id: number;
        username: string;
        name: string;
        email: string;
    };
    receiver: {
        id: number;
        username: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
}

export interface UserSearchResult {
    id: number;
    username: string;
    name: string;
    email: string;
    isActive?: boolean;
}

class ChatService {
    private stompClient: Client | null = null;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];
    private typingCallbacks: ((data: { userId: number; isTyping: boolean }) => void)[] = [];
    private readCallbacks: ((data: { messageId: number; readAt: string }) => void)[] = [];
    private deliveryCallbacks: ((messageId: number) => void)[] = [];
    private requestCallbacks: (() => void)[] = [];
    private presenceCallbacks: ((data: { userId: number; isActive: boolean }) => void)[] = [];

    connect(userId: number, onConnected?: () => void) {
        if (this.stompClient?.active) return;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
                userId: userId.toString()
            }
        });

        this.stompClient.onConnect = () => {
            console.log('Mobile WebSocket Connected');

            this.stompClient?.subscribe(`/queue/messages/${userId}`, (message: IMessage) => {
                const chatMessage = JSON.parse(message.body) as ChatMessage;
                this.messageCallbacks.forEach(callback => callback(chatMessage));
            });

            this.stompClient?.subscribe(`/queue/typing/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.typingCallbacks.forEach(callback => callback(data));
            });

            this.stompClient?.subscribe(`/queue/read/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.readCallbacks.forEach(callback => callback(data));
            });

            this.stompClient?.subscribe(`/queue/delivered/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.deliveryCallbacks.forEach(callback => callback(data.messageId));
            });

            this.stompClient?.subscribe(`/queue/requests/${userId}`, (message: IMessage) => {
                console.log('Friend request notification received');
                this.requestCallbacks.forEach(callback => callback());
            });

            this.stompClient?.subscribe('/topic/presence', (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.presenceCallbacks.forEach(callback => callback(data));
            });

            if (onConnected) onConnected();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
        }
    }

    onMessage(callback: (message: ChatMessage) => void) {
        this.messageCallbacks.push(callback);
        return () => {
            this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
        };
    }

    onTyping(callback: (data: { userId: number; isTyping: boolean }) => void) {
        this.typingCallbacks.push(callback);
        return () => {
            this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
        };
    }

    onRead(callback: (data: { messageId: number; readAt: string }) => void) {
        this.readCallbacks.push(callback);
        return () => {
            this.readCallbacks = this.readCallbacks.filter(cb => cb !== callback);
        };
    }

    onDelivery(callback: (messageId: number) => void) {
        this.deliveryCallbacks.push(callback);
        return () => {
            this.deliveryCallbacks = this.deliveryCallbacks.filter(cb => cb !== callback);
        };
    }

    onRequest(callback: () => void) {
        this.requestCallbacks.push(callback);
        return () => {
            this.requestCallbacks = this.requestCallbacks.filter(cb => cb !== callback);
        };
    }

    onPresence(callback: (data: { userId: number; isActive: boolean }) => void) {
        this.presenceCallbacks.push(callback);
        return () => {
            this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
        };
    }

    sendMessage(senderId: number, receiverId: number, content: string, messageType: string = 'TEXT', mediaUrl?: string) {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({
                    senderId,
                    receiverId,
                    content,
                    messageType,
                    mediaUrl
                })
            });
        }
    }

    sendTypingIndicator(userId: number, receiverId: number, isTyping: boolean) {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({
                    userId,
                    receiverId,
                    isTyping
                })
            });
        }
    }

    markAsRead(messageId: number, senderId: number) {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/chat.read',
                body: JSON.stringify({
                    messageId,
                    senderId
                })
            });
        }
    }

    markAsDelivered(messageId: number) {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/chat.delivered',
                body: JSON.stringify({
                    messageId
                })
            });
        }
    }

    sendGroupMessage(senderId: number, groupId: number, content: string, messageType: string = 'TEXT') {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/group.send',
                body: JSON.stringify({
                    senderId,
                    groupId,
                    content,
                    messageType
                })
            });
        }
    }

    // REST API Calls (Token passed as argument for mobile)
    async sendFriendRequest(token: string, username?: string, userId?: number): Promise<any> {
        const payload: any = {};
        if (userId) payload.userId = userId;
        else if (username) payload.username = username;

        const response = await axios.post(
            `${API_URL}/api/chat/request/send`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getPendingRequests(token: string): Promise<FriendRequest[]> {
        const response = await axios.get(`${API_URL}/api/chat/requests/pending`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async getSentRequests(token: string): Promise<FriendRequest[]> {
        const response = await axios.get(`${API_URL}/api/chat/requests/sent`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async acceptRequest(requestId: number, token: string): Promise<any> {
        const response = await axios.post(
            `${API_URL}/api/chat/request/accept`,
            { requestId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async rejectRequest(requestId: number, token: string): Promise<any> {
        const response = await axios.post(
            `${API_URL}/api/chat/request/reject`,
            { requestId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getFriends(token: string): Promise<UserSearchResult[]> {
        const response = await axios.get(`${API_URL}/api/chat/friends`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async getConversation(otherUserId: number, token: string): Promise<ChatMessage[]> {
        const response = await axios.get(`${API_URL}/api/chat/conversation/${otherUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async searchUsers(query: string, token: string): Promise<UserSearchResult[]> {
        const response = await axios.get(`${API_URL}/api/chat/search`, {
            params: { query },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async addReaction(messageId: number, emoji: string, token: string): Promise<any> {
        const response = await axios.post(
            `${API_URL}/api/chat/message/${messageId}/reaction`,
            { emoji },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async createGroup(name: string, description: string, token: string, memberIds: number[] = []): Promise<any> {
        const response = await axios.post(
            `${API_URL}/api/chat/group/create`,
            { name, description, memberIds },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getGroups(token: string): Promise<any[]> {
        const response = await axios.get(`${API_URL}/api/chat/groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async addGroupMember(groupId: number, userId: number, token: string): Promise<any> {
        const response = await axios.post(
            `${API_URL}/api/chat/group/${groupId}/members`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getGroupMessages(groupId: number, token: string): Promise<any[]> {
        const response = await axios.get(`${API_URL}/api/chat/group/${groupId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Get relationship status with a user
    async getUserRelationshipStatus(userId: number, token: string): Promise<{
        isFriend: boolean;
        isPending: boolean; // User sent request to me
        isSent: boolean; // I sent request to user
    }> {
        try {
            const [friends, pending, sent] = await Promise.all([
                this.getFriends(token),
                this.getPendingRequests(token),
                this.getSentRequests(token)
            ]);

            return {
                isFriend: friends.some(f => f.id === userId),
                isPending: pending.some(r => r.sender.id === userId),
                isSent: sent.some(r => r.receiver.id === userId)
            };
        } catch (error) {
            console.error('Error getting relationship status:', error);
            return { isFriend: false, isPending: false, isSent: false };
        }
    }
}

export default new ChatService();
