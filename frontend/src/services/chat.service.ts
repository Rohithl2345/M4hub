// Modern ChatService using @stomp/stompjs
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

import { env } from '@/utils/env';
const API_URL = env.apiUrl;

export interface ChatMessage {
    id: number;
    senderId?: number;
    receiverId?: number;
    sender?: {
        id: number;
        username?: string;
    };
    receiver?: {
        id: number;
        username?: string;
    };
    content: string;
    createdAt: string;
    isRead: boolean;
    messageType?: string;
    mediaUrl?: string;
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
    lastMessageAt?: string;
    lastMessageContent?: string;
}

class ChatService {
    private stompClient: Client | null = null;
    private messageCallbacks: ((message: ChatMessage) => void)[] = [];
    private typingCallbacks: ((data: { userId: number; isTyping: boolean }) => void)[] = [];
    private deliveryCallbacks: ((messageId: number) => void)[] = [];
    private readCallbacks: ((data: { messageId: number; readAt: string }) => void)[] = [];
    private requestCallbacks: (() => void)[] = [];

    // WebSocket Connection
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
            console.log('WebSocket Connected');

            // Subscribe to personal message queue
            this.stompClient?.subscribe(`/queue/messages/${userId}`, (message: IMessage) => {
                const chatMessage = JSON.parse(message.body) as ChatMessage;
                this.messageCallbacks.forEach(callback => callback(chatMessage));
            });

            // Subscribe to typing indicators
            this.stompClient?.subscribe(`/queue/typing/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.typingCallbacks.forEach(callback => callback(data));
            });

            // Subscribe to read receipts
            this.stompClient?.subscribe(`/queue/read/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.readCallbacks.forEach(callback => callback(data));
            });

            // Subscribe to delivery receipts
            this.stompClient?.subscribe(`/queue/delivered/${userId}`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                this.deliveryCallbacks.forEach(callback => callback(data.messageId));
            });

            // Subscribe to friend request notifications
            this.stompClient?.subscribe(`/queue/requests/${userId}`, (message: IMessage) => {
                console.log('Friend request notification received');
                this.requestCallbacks.forEach(callback => callback());
            });

            // Subscribe to global presence updates (if backend supports it)
            this.stompClient?.subscribe('/topic/presence', (message: IMessage) => {
                console.log('Received raw presence message:', message.body);
                const data = JSON.parse(message.body);
                this.presenceCallbacks.forEach(callback => callback(data));
            });
            console.log('Subscribed to /topic/presence');

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
        // We reuse the existing mechanism or add a new one if needed.
        // For simplicity, let's assume we might receive presence updates via a public topic or user queue
        // But currently backend sends friend updates via polling.
        // To be truly real-time, we should subscribe to a presence topic.
        // Let's create a callback array for it.
        const wrappedCallback = (message: IMessage) => {
            const data = JSON.parse(message.body);
            callback(data);
        };
        // This is a placeholder as successful subscription happens in connect()
        // We will need to store these callbacks to be called when message arrives on /topic/presence
        this.presenceCallbacks.push(callback);
        return () => {
            this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
        };
    }

    private presenceCallbacks: ((data: { userId: number; isActive: boolean }) => void)[] = [];

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

    // REST API Calls
    async sendFriendRequest(username?: string, userId?: number): Promise<any> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }
        if (!token) return Promise.reject('No auth token');

        const payload: any = {};
        if (userId) payload.userId = userId;
        else if (username) payload.username = username;

        try {
            const response = await axios.post(
                `${API_URL}/api/chat/request/send`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    }

    async getPendingRequests(): Promise<FriendRequest[]> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }

        if (!token) {
            return [];
        }

        try {
            const response = await axios.get(`${API_URL}/api/chat/requests/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch pending requests (backend might be down/restarting)');
            return [];
        }
    }

    async getSentRequests(): Promise<FriendRequest[]> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }
        if (!token) return [];

        try {
            const response = await axios.get(`${API_URL}/api/chat/requests/sent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch sent requests');
            return [];
        }
    }

    async acceptRequest(requestId: number): Promise<any> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }
        if (!token) return Promise.reject('No auth token');

        try {
            const response = await axios.post(
                `${API_URL}/api/chat/request/accept`,
                { requestId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    }

    async rejectRequest(requestId: number): Promise<any> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }
        if (!token) return Promise.reject('No auth token');

        try {
            const response = await axios.post(
                `${API_URL}/api/chat/request/reject`,
                { requestId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            throw error;
        }
    }

    async getFriends(): Promise<UserSearchResult[]> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }
        if (!token) {
            return [];
        }

        try {
            const response = await axios.get(`${API_URL}/api/chat/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch friends list');
            return [];
        }
    }

    async getConversation(otherUserId: number): Promise<ChatMessage[]> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/chat/conversation/${otherUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async searchUsers(query: string): Promise<UserSearchResult[]> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/chat/search`, {
            params: { query },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Reactions
    async addReaction(messageId: number, emoji: string): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
            `${API_URL}/api/chat/message/${messageId}/reaction`,
            { emoji },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async removeReaction(messageId: number): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(
            `${API_URL}/api/chat/message/${messageId}/reaction`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getReactions(messageId: number): Promise<any[]> {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
            `${API_URL}/api/chat/message/${messageId}/reactions`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    // Group Chat
    async createGroup(name: string, description: string): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
            `${API_URL}/api/chat/group/create`,
            { name, description },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async addGroupMember(groupId: number, userId: number): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
            `${API_URL}/api/chat/group/${groupId}/members`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getGroups(token?: string): Promise<any[]> {
        if (!token && typeof window !== 'undefined') {
            token = localStorage.getItem('authToken') || undefined;
        }
        if (!token) return [];

        try {
            const response = await axios.get(`${API_URL}/api/chat/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch groups:', error);
            return [];
        }
    }

    // Get relationship status with a user
    async getUserRelationshipStatus(userId: number): Promise<{
        isFriend: boolean;
        isPending: boolean; // User sent request to me
        isSent: boolean; // I sent request to user
    }> {
        try {
            const [friends, pending, sent] = await Promise.all([
                this.getFriends(),
                this.getPendingRequests(),
                this.getSentRequests()
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
    async uploadFile(file: File): Promise<{ url: string; fileName: string; type: string }> {
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('authToken');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
}

export default new ChatService();
