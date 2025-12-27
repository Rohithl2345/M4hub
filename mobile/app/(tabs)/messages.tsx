import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/slices/authSlice';
import chatService, { ChatMessage, FriendRequest, UserSearchResult } from '../../services/chat.service';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useFocusEffect } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function MessagesScreen() {
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector(selectToken);
    const [friends, setFriends] = useState<UserSearchResult[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<{ type: 'friend' | 'group', data: any } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [activeTab, setActiveTab] = useState(0); // 0: Friends, 1: Groups, 2: Requests

    // Dialog/Search states
    const [showSearch, setShowSearch] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [groupFormError, setGroupFormError] = useState<{ name?: string, members?: string } | null>(null);
    const [groupSearchResults, setGroupSearchResults] = useState<UserSearchResult[]>([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    const flatListRef = useRef<FlatList>(null);



    useEffect(() => {
        if (user?.id && token) {
            chatService.connect(user.id, () => {
                console.log('Connected to chat');
            });
            return () => chatService.disconnect();
        }
    }, [user?.id, token]);

    // Debounced Search for Friends
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleSearch();
            } else if (searchQuery.length === 0) {
                setSearchResults([]);
                setHasSearched(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Debounced Search for Members in Group Creation
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (groupSearchQuery.length >= 3 && token) {
                setIsSearchingMembers(true);
                try {
                    const results = await chatService.searchUsers(groupSearchQuery, token);
                    setGroupSearchResults(results || []);
                } catch (error) {
                    console.error('Error searching members:', error);
                } finally {
                    setIsSearchingMembers(false);
                }
            } else if (groupSearchQuery.length === 0) {
                setGroupSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [groupSearchQuery, token]);

    useEffect(() => {
        if (!user?.id || !token) return;

        const unsubMessage = chatService.onMessage((message) => {
            const isCurrentChat = selectedEntity && (
                (selectedEntity.type === 'friend' && (message.senderId === selectedEntity.data.id || message.receiverId === selectedEntity.data.id)) ||
                (selectedEntity.type === 'group' && message.receiverId === selectedEntity.data.id)
            );

            if (isCurrentChat) {
                setMessages((prev) => [...prev, message]);
            }
            loadFriends();
        });

        const unsubRequest = chatService.onRequest(() => {
            console.log('Refreshing data due to real-time notification');
            loadPendingRequests();
            loadGroups();
        });

        const unsubPresence = chatService.onPresence((data: any) => {
            console.log('Presence update received:', data);
            setFriends(prevFriends => prevFriends.map(f => {
                if (f.id == data.userId) {
                    return { ...f, isActive: data.isActive };
                }
                return f;
            }));
        });

        loadFriends();
        loadGroups();
        loadPendingRequests();

        // Fallback polling every 15 seconds
        const interval = setInterval(loadPendingRequests, 15000);

        return () => {
            unsubMessage();
            unsubRequest();
            unsubPresence();
            clearInterval(interval);
        };
    }, [user?.id, token, selectedEntity]);

    const loadFriends = async () => {
        if (!token) return;
        try {
            const friendsList = await chatService.getFriends(token);
            setFriends(friendsList);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadGroups = async () => {
        if (!token) return;
        try {
            const list = await chatService.getGroups(token);
            setGroups(list);
        } catch (error) {
            console.error('Error loading groups:', error);
        }
    };

    const loadPendingRequests = async () => {
        if (!token) return;
        try {
            const [received, sent] = await Promise.all([
                chatService.getPendingRequests(token),
                chatService.getSentRequests(token)
            ]);
            setPendingRequests(received);
            setSentRequests(sent);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleSelectFriend = async (friend: UserSearchResult) => {
        if (!token) return;
        setSelectedEntity({ type: 'friend', data: friend });
        try {
            const conversation = await chatService.getConversation(friend.id, token);
            setMessages(conversation);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const handleSelectGroup = async (group: any) => {
        if (!token) return;
        setSelectedEntity({ type: 'group', data: group });
        try {
            const conversation = await chatService.getGroupMessages(group.id, token);
            setMessages(conversation);
        } catch (error) {
            console.error('Error loading group messages:', error);
        }
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !user) return;

        if (selectedEntity?.type === 'friend') {
            chatService.sendMessage(user.id, selectedEntity.data.id, messageInput);
        } else if (selectedEntity?.type === 'group') {
            chatService.sendGroupMessage(user.id, selectedEntity.data.id, messageInput);
        }

        setMessageInput('');
    };

    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!token) return;
        const query = searchQuery.trim();
        if (!query) {
            setSearchError('Please enter a username or name');
            return;
        }
        setSearchError(null);

        if (query) {
            setIsSearching(true);
            setHasSearched(true);
            try {
                const results = await chatService.searchUsers(query, token);
                setSearchResults(results || []);
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }
    };

    const handleAcceptRequest = async (requestId: number) => {
        if (!token) return;
        try {
            await chatService.acceptRequest(requestId, token);
            loadPendingRequests();
            loadFriends();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const resetSearchForm = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        setSearchError(null);
        setShowSearch(false);
    };

    const resetGroupForm = () => {
        setNewGroupName('');
        setNewGroupDesc('');
        setSelectedMemberIds([]);
        setGroupSearchQuery('');
        setGroupFormError(null);
        setGroupSearchResults([]);
        setShowCreateGroup(false);
    };

    const handleCreateGroup = async () => {
        if (!token || !user) return;

        const errors: { name?: string, members?: string } = {};
        if (!newGroupName.trim()) errors.name = 'Group name is required';
        if (selectedMemberIds.length === 0) errors.members = 'Select at least one member';

        if (Object.keys(errors).length > 0) {
            setGroupFormError(errors);
            return;
        }

        try {
            await chatService.createGroup(newGroupName, newGroupDesc, token, selectedMemberIds);
            resetGroupForm();
            loadGroups();
            Alert.alert('Success', 'Group created successfully!');
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group');
        }
    };

    const toggleMemberSelection = (friendId: number) => {
        setSelectedMemberIds(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const renderEmptyState = (type: string) => {
        const configs: any = {
            friends: { icon: 'person-add', title: 'No Friends Yet', subtitle: 'Search and add friends to start chatting.' },
            groups: { icon: 'people', title: 'No Groups', subtitle: 'Join or create a group to chat with many.' },
            requests: { icon: 'checkmark-circle', title: 'All Caught Up', subtitle: 'No pending friend requests.' },
        };
        const config = configs[type] || configs.friends;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name={config.icon} size={80} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>{config.title}</Text>
                <Text style={styles.emptySubtitle}>{config.subtitle}</Text>
            </View>
        );
    };

    const renderListItem = ({ item, type }: { item: any, type: 'friend' | 'group' | 'request' }) => {
        if (type === 'request') {
            return (
                <View style={styles.cardItem}>
                    <View style={[styles.avatar, { backgroundColor: COLORS.SUCCESS }]}>
                        <Text style={styles.avatarText}>{(item.sender.name || item.sender.username || 'U').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.sender.name || (item.sender.username ? `@${item.sender.username}` : item.sender.email)}</Text>
                        <Text style={styles.cardSubtitle}>New friend request</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptRequest(item.id)}
                    >
                        <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const isFriend = type === 'friend';
        return (
            <TouchableOpacity
                style={styles.cardItem}
                onPress={() => isFriend ? handleSelectFriend(item) : handleSelectGroup(item)}
            >
                <View style={[styles.avatar, { backgroundColor: isFriend ? COLORS.PRIMARY : COLORS.SECONDARY }]}>
                    {isFriend ? (
                        <>
                            <Text style={styles.avatarText}>{(item.name || item.username || 'U').charAt(0).toUpperCase()}</Text>
                            <View style={[styles.statusDotList, item.isActive ? styles.online : styles.offline]} />
                        </>
                    ) : (
                        <Ionicons name="people" size={24} color="white" />
                    )}
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {isFriend ? (item.name || (item.username ? `@${item.username}` : item.email)) : item.name}
                        </Text>
                        {item.lastMessageAt && (
                            <Text style={styles.listTimestamp}>
                                {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {isFriend ? (item.lastMessageContent || (item.username ? `@${item.username}` : item.email)) : (item.description || 'Global Team')}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
        );
    };

    if (!selectedEntity) {
        return (
            <View style={styles.container}>
                {/* Header - Exact same structure as Money tab */}
                <LinearGradient
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTopActions}>
                    </View>
                    <Ionicons name="chatbubble-ellipses" size={64} color="white" />
                    <Text style={styles.headerTitle}>Messenger</Text>
                    <Text style={styles.headerSubtitle}>Connect with friends and groups</Text>
                </LinearGradient>

                {/* Tab Selection */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity
                        style={[styles.statCard, activeTab === 0 && styles.activeStatCard]}
                        onPress={() => setActiveTab(0)}
                    >
                        <Ionicons name="people" size={32} color={activeTab === 0 ? '#4c669f' : '#999'} />
                        <Text style={[styles.statValue, activeTab === 0 && styles.activeStatValue]}>{friends.length}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, activeTab === 1 && styles.activeStatCard]}
                        onPress={() => setActiveTab(1)}
                    >
                        <Ionicons name="grid" size={32} color={activeTab === 1 ? '#4c669f' : '#999'} />
                        <Text style={[styles.statValue, activeTab === 1 && styles.activeStatValue]}>{groups.length}</Text>
                        <Text style={styles.statLabel}>Groups</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, activeTab === 2 && styles.activeStatCard]}
                        onPress={() => setActiveTab(2)}
                    >
                        <Ionicons name="mail-unread" size={32} color={activeTab === 2 ? '#4c669f' : '#999'} />
                        <Text style={[styles.statValue, activeTab === 2 && styles.activeStatValue]}>{pendingRequests.length + sentRequests.length}</Text>
                        <Text style={styles.statLabel}>Requests</Text>
                    </TouchableOpacity>
                </View>

                {/* List Content */}
                <View style={styles.section}>
                    {activeTab === 0 && (
                        <FlatList
                            data={friends}
                            renderItem={(props) => renderListItem({ ...props, type: 'friend' })}
                            keyExtractor={(item) => item.id.toString()}
                            ListHeaderComponent={
                                <TouchableOpacity
                                    style={styles.tabActionBtn}
                                    onPress={() => setShowSearch(true)}
                                >
                                    <LinearGradient
                                        colors={['#6366f1', '#4f46e5']}
                                        style={styles.tabActionGradient}
                                    >
                                        <Ionicons name="person-add" size={20} color="white" />
                                        <Text style={styles.tabActionText}>Add New Friend</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={() => renderEmptyState('friends')}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                    {activeTab === 1 && (
                        <FlatList
                            data={groups}
                            renderItem={(props) => renderListItem({ ...props, type: 'group' })}
                            keyExtractor={(item) => item.id.toString()}
                            ListHeaderComponent={
                                <TouchableOpacity
                                    style={styles.tabActionBtn}
                                    onPress={() => setShowCreateGroup(true)}
                                >
                                    <LinearGradient
                                        colors={['#8b5cf6', '#7c3aed']}
                                        style={styles.tabActionGradient}
                                    >
                                        <Ionicons name="add-circle" size={22} color="white" />
                                        <Text style={styles.tabActionText}>Create New Group</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={() => renderEmptyState('groups')}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                    {activeTab === 2 && (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={[]}
                                renderItem={null}
                                ListHeaderComponent={
                                    <View>
                                        {/* Received Section */}
                                        <View style={{ marginBottom: 32 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                                <Ionicons name="person-add" size={24} color={COLORS.PRIMARY} style={{ marginRight: 12 }} />
                                                <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>Received Requests</Text>
                                                <View style={{ marginLeft: 'auto', backgroundColor: COLORS.PRIMARY, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 }}>
                                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{pendingRequests.length}</Text>
                                                </View>
                                            </View>

                                            {pendingRequests.length > 0 ? (
                                                pendingRequests.map((request) => (
                                                    <View key={request.id} style={styles.cardItem}>
                                                        <View style={[styles.avatar, { backgroundColor: COLORS.SUCCESS }]}>
                                                            <Text style={styles.avatarText}>{(request.sender.name || request.sender.username || 'U').charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                        <View style={styles.cardContent}>
                                                            <Text style={styles.cardTitle}>{request.sender.name || (request.sender.username ? `@${request.sender.username}` : request.sender.email)}</Text>
                                                            <Text style={styles.cardSubtitle}>Incoming Request</Text>
                                                        </View>
                                                        <TouchableOpacity
                                                            style={styles.acceptBtn}
                                                            onPress={() => handleAcceptRequest(request.id)}
                                                        >
                                                            <Text style={styles.acceptBtnText}>Accept</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            ) : (
                                                <View style={{ padding: 30, alignItems: 'center', backgroundColor: 'white', borderRadius: 24 }}>
                                                    <Text style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '600' }}>No incoming requests</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Sent Section */}
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                                <Ionicons name="send" size={20} color="#64748b" style={{ marginRight: 12 }} />
                                                <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>Sent Requests</Text>
                                                <View style={{ marginLeft: 'auto', backgroundColor: '#94a3b8', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 }}>
                                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{sentRequests.length}</Text>
                                                </View>
                                            </View>

                                            {sentRequests.length > 0 ? (
                                                sentRequests.map((request) => (
                                                    <View key={request.id} style={styles.cardItem}>
                                                        <View style={[styles.avatar, { backgroundColor: '#cbd5e1' }]}>
                                                            <Text style={styles.avatarText}>{(request.receiver.name || request.receiver.username || 'U').charAt(0).toUpperCase()}</Text>
                                                        </View>
                                                        <View style={styles.cardContent}>
                                                            <Text style={styles.cardTitle}>{request.receiver.name || (request.receiver.username ? `@${request.receiver.username}` : request.receiver.email)}</Text>
                                                            <Text style={styles.cardSubtitle}>Outgoing Request</Text>
                                                        </View>
                                                        <View style={[styles.acceptBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#cbd5e1' }]}>
                                                            <Text style={[styles.acceptBtnText, { color: '#64748b' }]}>Pending</Text>
                                                        </View>
                                                    </View>
                                                ))
                                            ) : (
                                                <View style={{ padding: 30, alignItems: 'center', backgroundColor: 'white', borderRadius: 24 }}>
                                                    <Text style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '600' }}>No outgoing requests</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                }
                                contentContainerStyle={{ padding: 16 }}
                            />
                        </View>
                    )}
                </View>

                {/* Search Modal */}
                <Modal
                    visible={showSearch}
                    animationType="slide"
                    transparent={false}
                    onShow={() => {
                        setHasSearched(false);
                        setSearchResults([]);
                        setSearchQuery('');
                        setSearchError(null);
                    }}
                >
                    <View style={styles.modalBody}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={resetSearchForm}>
                                <Ionicons name="close" size={28} color="#1e293b" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Find Friends</Text>
                            <View style={{ width: 28 }} />
                        </View>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#64748b" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search username..."
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    if (text.trim()) setSearchError(null);
                                }}
                                onSubmitEditing={handleSearch}
                            />
                            <TouchableOpacity onPress={handleSearch}>
                                <Text style={styles.searchBtnText}>Go</Text>
                            </TouchableOpacity>
                        </View>
                        {searchError && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 8, marginHorizontal: 24, borderRadius: 8, marginBottom: 12 }}>
                                <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#b91c1c', fontSize: 12, fontWeight: '500' }}>
                                    {searchError}
                                </Text>
                            </View>
                        )}
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={() => {
                                if (isSearching) {
                                    return <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b', fontWeight: 'bold' }}>Searching...</Text>;
                                }
                                if (hasSearched) {
                                    return (
                                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                                            <Ionicons name="search-outline" size={60} color="#cbd5e1" />
                                            <Text style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontWeight: 'bold', fontSize: 18 }}>No users found for "{searchQuery}"</Text>
                                        </View>
                                    );
                                }
                                return null;
                            }}
                            renderItem={({ item }) => {
                                if (!item) return null;
                                const isFriend = (friends || []).some(f => f?.id === item.id);
                                const isPending = (pendingRequests || []).some(r => r?.sender?.id === item.id);
                                const isSent = (sentRequests || []).some(r => r?.receiver?.id === item.id);
                                const isSelf = user?.id === item.id;

                                let statusText = '';
                                if (isFriend) statusText = 'Friend';
                                else if (isPending) statusText = 'Request Received';
                                else if (isSent) statusText = 'Request Pending';
                                else if (isSelf) statusText = 'You';

                                return (
                                    <View style={styles.cardItem}>
                                        <View style={[styles.avatar, { backgroundColor: isSelf ? COLORS.PRIMARY : '#cbd5e1' }]}>
                                            <Text style={styles.avatarText}>{(item.name || item.username || 'U').charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{item.name || (item.username ? `@${item.username}` : item.email)}</Text>
                                            <Text style={styles.cardSubtitle}>{statusText || (item.username ? `@${item.username}` : item.email)}</Text>
                                        </View>
                                        {(!isFriend && !isSent && !isSelf && !isPending) && (
                                            <TouchableOpacity
                                                style={styles.addBtn}
                                                onPress={async () => {
                                                    if (!token) return;
                                                    try {
                                                        await chatService.sendFriendRequest(token, undefined, item.id);
                                                        Alert.alert('Success', 'Friend request sent!');
                                                        loadPendingRequests();
                                                        // Immediately refresh search to show pending status
                                                        handleSearch();
                                                    } catch (err) {
                                                        Alert.alert('Error', 'Failed to send request');
                                                    }
                                                }}
                                            >
                                                <Ionicons name="person-add" size={20} color="white" />
                                            </TouchableOpacity>
                                        )}
                                        {isSent && <Ionicons name="checkmark-circle" size={24} color="#cbd5e1" />}
                                    </View>
                                );
                            }}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    </View>
                </Modal>

                {/* Create Group Modal */}
                <Modal visible={showCreateGroup} animationType="slide" transparent={false}>
                    <View style={styles.modalBody}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={resetGroupForm}>
                                <Ionicons name="close" size={28} color="#1e293b" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>New Group</Text>
                            <TouchableOpacity onPress={handleCreateGroup}>
                                <Ionicons name="checkmark-circle" size={32} color={COLORS.PRIMARY} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <View style={{ padding: 24 }}>
                                <Text style={styles.fieldLabel}>GROUP INFO</Text>
                                <TextInput
                                    style={[styles.inputField, groupFormError?.name && styles.inputError]}
                                    placeholder="Group Name *"
                                    value={newGroupName}
                                    onChangeText={(text) => {
                                        setNewGroupName(text);
                                        if (groupFormError?.name) setGroupFormError(prev => prev ? { ...prev, name: undefined } : null);
                                    }}
                                />
                                {groupFormError?.name && <Text style={styles.errorText}>{groupFormError.name}</Text>}

                                <TextInput
                                    style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Description (Optional)"
                                    value={newGroupDesc}
                                    onChangeText={setNewGroupDesc}
                                    multiline
                                />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 }}>
                                    <Text style={[styles.fieldLabel, groupFormError?.members && { color: '#ef4444' }]}>
                                        ADD MEMBERS ({selectedMemberIds.length})
                                    </Text>
                                    {groupFormError?.members && <Text style={styles.errorText}>{groupFormError.members}</Text>}
                                </View>

                                {/* Selected Members Horizontal Scroll */}
                                {selectedMemberIds.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                        {selectedMemberIds.map(id => {
                                            const friend = friends.find(f => f.id === id);
                                            return (
                                                <TouchableOpacity key={id} onPress={() => toggleMemberSelection(id)} style={styles.selectedMember}>
                                                    <View style={styles.selectedAvatar}>
                                                        <Text style={styles.selectedAvatarText}>{(friend?.name || friend?.username || 'U').charAt(0).toUpperCase()}</Text>
                                                        <View style={styles.removeIcon}>
                                                            <Ionicons name="close" size={10} color="white" />
                                                        </View>
                                                    </View>
                                                    <Text style={styles.selectedName} numberOfLines={1}>{friend?.name || friend?.username}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                )}

                                <View style={styles.searchBar}>
                                    <Ionicons name="search" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search friends to add..."
                                        value={groupSearchQuery}
                                        onChangeText={setGroupSearchQuery}
                                    />
                                    {isSearchingMembers && <Text style={{ fontSize: 10, color: COLORS.PRIMARY }}>Searching...</Text>}
                                </View>

                                <View style={styles.memberList}>
                                    {(groupSearchQuery.length >= 3 ? groupSearchResults : friends).map((item) => {
                                        const isSelected = selectedMemberIds.includes(item.id);
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                                                onPress={() => toggleMemberSelection(item.id)}
                                            >
                                                <View style={[styles.avatar, { width: 40, height: 40, backgroundColor: isSelected ? COLORS.PRIMARY : '#e2e8f0' }]}>
                                                    <Text style={[styles.avatarText, { fontSize: 16 }]}>{(item.name || item.username || 'U').charAt(0).toUpperCase()}</Text>
                                                </View>
                                                <Text style={styles.memberName}>{item.name || item.username}</Text>
                                                <Ionicons
                                                    name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                                                    size={24}
                                                    color={isSelected ? COLORS.PRIMARY : '#cbd5e1'}
                                                />
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {groupSearchQuery.length >= 3 && groupSearchResults.length === 0 && !isSearchingMembers && (
                                        <View style={styles.noResultsContainer}>
                                            <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                                            <Text style={styles.noResultsText}>No friends found for "{groupSearchQuery}"</Text>
                                        </View>
                                    )}
                                    {groupSearchQuery.length > 0 && groupSearchQuery.length < 3 && (
                                        <Text style={styles.searchHint}>Type at least 3 characters...</Text>
                                    )}
                                    {friends.length === 0 && groupSearchQuery.length === 0 && (
                                        <Text style={styles.searchHint}>You don't have any friends to add yet.</Text>
                                    )}
                                </View>

                                <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateGroup}>
                                    <Text style={styles.primaryBtnText}>Create Group</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Attachment Menu */}
                <Modal
                    visible={showAttachMenu}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowAttachMenu(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowAttachMenu(false)}
                    >
                        <View style={styles.attachMenu}>
                            <TouchableOpacity style={styles.attachOption} onPress={() => { setShowAttachMenu(false); Alert.alert('Feat', 'File selection coming soon'); }}>
                                <View style={[styles.optionIcon, { backgroundColor: COLORS.PRIMARY }]}>
                                    <Ionicons name="document-text" size={24} color="white" />
                                </View>
                                <Text style={styles.optionText}>Send File</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.attachOption} onPress={() => { setShowAttachMenu(false); Alert.alert('Feat', 'Photo selection coming soon'); }}>
                                <View style={[styles.optionIcon, { backgroundColor: COLORS.SECONDARY }]}>
                                    <Ionicons name="image" size={24} color="white" />
                                </View>
                                <Text style={styles.optionText}>Send Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chatHeader}
            >
                <TouchableOpacity onPress={() => setSelectedEntity(null)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.chatHeaderInfo}>
                    <Text style={styles.chatHeaderTitle}>
                        {selectedEntity.type === 'friend' ? (selectedEntity.data.name || selectedEntity.data.username) : selectedEntity.data.name}
                    </Text>
                    {selectedEntity.type === 'friend' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.headerStatusDot, selectedEntity.data.isActive ? styles.online : styles.offline]} />
                            <Text style={styles.chatHeaderSubtitle}>
                                {selectedEntity.data.isActive ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.chatHeaderSubtitle}>
                            {selectedEntity.data.members?.length || 0} Members
                        </Text>
                    )}
                </View>
                {selectedEntity.type === 'group' && (
                    <TouchableOpacity style={{ padding: 8 }}>
                        <Ionicons name="information-circle-outline" size={24} color="white" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={{ paddingLeft: 8 }}>
                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Group Members Preview (for Group Chat) */}
            {selectedEntity.type === 'group' && selectedEntity.data.members && (
                <View style={styles.membersPreview}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        {selectedEntity.data.members.map((member: any) => (
                            <View key={member.id} style={styles.memberAvatarSmall}>
                                <View style={[styles.avatar, { width: 32, height: 32, backgroundColor: COLORS.SECONDARY }]}>
                                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>
                                        {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.memberAvatarName} numberOfLines={1}>{member.name || member.username}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                    <View style={[styles.msgWrapper, item.senderId === user?.id ? styles.msgSent : styles.msgReceived]}>
                        <View style={[styles.msgBubble, item.senderId === user?.id ? styles.bubbleSent : styles.bubbleReceived]}>
                            <Text style={[styles.msgText, item.senderId === user?.id ? styles.textSent : styles.textReceived]}>
                                {item.content}
                            </Text>
                        </View>
                        <Text style={styles.msgTime}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ padding: 16 }}
            />

            <View style={styles.chatInputContainer}>
                <View style={styles.inputInner}>
                    <TextInput
                        style={styles.chatInput}
                        placeholder="Type something..."
                        value={messageInput}
                        onChangeText={setMessageInput}
                        multiline
                    />
                    <TouchableOpacity style={{ padding: 8 }} onPress={() => setShowAttachMenu(true)}>
                        <Ionicons name="attach" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                        <LinearGradient
                            colors={['#4c669f', '#3b5998', '#192f6a']}
                            style={styles.sendBtnGradient}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    attachMenu: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    attachOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 16,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusDotList: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
    },
    headerStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    online: {
        backgroundColor: COLORS.SUCCESS,
    },
    offline: {
        backgroundColor: '#94a3b8',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTopActions: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        flexDirection: 'row',
        gap: 12,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        marginTop: 2,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
        backgroundColor: '#f8fafc',
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activeStatCard: {
        backgroundColor: '#eef2ff',
        borderWidth: 2,
        borderColor: '#4c669f',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 8,
    },
    activeStatValue: {
        color: '#4c669f',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        position: 'relative',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
    },
    activeTabText: {
        color: 'white',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 3,
        backgroundColor: 'white',
        borderRadius: 1.5,
    },
    tabBadge: {
        position: 'absolute',
        top: -8,
        right: -12,
        backgroundColor: '#ef4444',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    tabBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
    listContainer: {
        flex: 1,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listTimestamp: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    acceptBtn: {
        backgroundColor: COLORS.SUCCESS,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    acceptBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 14,
    },
    addBtn: {
        backgroundColor: COLORS.PRIMARY,
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    // Modal Styles
    modalBody: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        backgroundColor: 'white',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    searchBtnText: {
        color: COLORS.PRIMARY,
        fontWeight: '800',
    },
    inputField: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    primaryBtn: {
        backgroundColor: COLORS.PRIMARY,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    // Chat UI
    chatHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    chatHeaderInfo: {
        flex: 1,
        marginLeft: 8,
    },
    chatHeaderTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
    },
    chatHeaderSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    msgWrapper: {
        marginBottom: 16,
        maxWidth: '85%',
    },
    msgSent: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    msgReceived: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    msgBubble: {
        padding: 14,
        borderRadius: 20,
    },
    bubbleSent: {
        backgroundColor: '#4c669f',
        borderBottomRightRadius: 4,
    },
    bubbleReceived: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    msgText: {
        fontSize: 16,
        lineHeight: 22,
    },
    textSent: {
        color: 'white',
    },
    textReceived: {
        color: '#1e293b',
    },
    msgTime: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 6,
    },
    chatInputContainer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    inputInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },
    chatInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        maxHeight: 100,
    },
    sendBtn: {
        padding: 4,
    },
    sendBtnGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabActionBtn: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tabActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 10,
    },
    tabActionText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '800',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#64748b',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputError: {
        borderWidth: 1.5,
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '700',
        marginTop: -12,
        marginBottom: 16,
        marginLeft: 4,
    },
    selectedMember: {
        alignItems: 'center',
        marginRight: 16,
        width: 60,
    },
    selectedAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    selectedAvatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    removeIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ef4444',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'white',
    },
    selectedName: {
        fontSize: 11,
        color: '#1e293b',
        fontWeight: '700',
    },
    memberList: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        marginBottom: 20,
        maxHeight: 300,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        gap: 12,
    },
    memberItemSelected: {
        backgroundColor: '#f1f5f9',
    },
    memberName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    searchHint: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
        padding: 16,
        fontStyle: 'italic',
    },
    membersPreview: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    memberAvatarSmall: {
        alignItems: 'center',
        marginRight: 20,
        width: 45,
    },
    memberAvatarName: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '700',
        marginTop: 4,
        textAlign: 'center',
    },
    noResultsContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});
