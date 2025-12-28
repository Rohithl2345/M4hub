'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import chatService, { ChatMessage, FriendRequest, UserSearchResult } from '@/services/chat.service';
import DashboardLayout from '@/components/DashboardLayout';
import { logger } from '@/utils/logger';
import styles from './messages.module.css';
import {
    Box,
    TextField,
    Button,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    IconButton,
    Badge,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    ListItemAvatar,
    Chip,
    InputAdornment,
    Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ForumIcon from '@mui/icons-material/Forum';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme, useMediaQuery } from '@mui/material';

import { env } from '@/utils/env';

const API_URL = env.apiUrl;

export default function MessagesPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useSelector((state: RootState) => state.auth.user);
    const [friends, setFriends] = useState<UserSearchResult[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<{ type: 'friend' | 'group', data: any } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [groupFormError, setGroupFormError] = useState<{ name?: string; members?: string } | null>(null);



    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !selectedEntity) return;

        try {
            logger.info('Uploading file...');
            const result = await chatService.uploadFile(file);
            logger.info('File uploaded:', result);
            const msgType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';

            if (selectedEntity.type === 'friend') {
                chatService.sendMessage(user.id, selectedEntity.data.id, result.fileName, msgType, result.url);
            } else if (selectedEntity.type === 'group') {
                // Group message currently supports type but maybe not mediaUrl in backend DTO?
                // Assuming it works for now or text fallback
                chatService.sendGroupMessage(selectedEntity.data.id, user.id, result.fileName, msgType);
            }
        } catch (error) {
            logger.error('Error uploading file:', error);
        }
        handleMenuClose();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initial Data Load and Polling
    useEffect(() => {
        if (user?.id) {
            loadFriends();
            loadGroups();
            loadPendingRequests();

            // Fallback polling for requests and status
            const interval = setInterval(() => {
                loadPendingRequests();
                loadFriends();
            }, 15000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [user?.id]);

    // Auto-search for friends when query length >= 3
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

    // Message and Request Subscriptions
    useEffect(() => {
        if (!user?.id) return;

        const unsubMessage = chatService.onMessage((message) => {
            const currentUserId = user?.id;
            const messageSenderId = message.senderId || message.sender?.id;

            // Check if message belongs to current conversation
            const isFromSelectedFriend = selectedEntity?.type === 'friend' &&
                (Number(messageSenderId) === Number(selectedEntity.data.id) || Number(message.receiverId) === Number(selectedEntity.data.id));

            const isFromSelectedGroup = selectedEntity?.type === 'group' && Number(message.receiverId) === Number(selectedEntity.data.id);

            if (isFromSelectedFriend || isFromSelectedGroup) {
                setMessages((prev) => [...prev, message]);
            } else {
                // Background message - increment unread count for the sender
                if (Number(messageSenderId) !== Number(currentUserId)) {
                    const key = `friend-${messageSenderId}`;
                    setUnreadCounts(prev => ({
                        ...prev,
                        [key]: (prev[key] || 0) + 1
                    }));
                }
            }
            loadFriends();
        });

        const unsubRequest = chatService.onRequest(() => {
            loadPendingRequests();
            loadGroups();
        });

        const unsubPresence = chatService.onPresence((data) => {
            logger.debug('Presence update received in page:', data);
            setFriends(prevFriends => prevFriends.map(f => {
                // Use loose equality (==) to handle string/number mismatch
                if (f.id == data.userId) {
                    logger.debug(`Updating user ${f.id} to ${data.isActive}`);
                    return { ...f, isActive: data.isActive };
                }
                return f;
            }));

            // If the active chat is with this user, update its status too
            setSelectedEntity(prev => {
                if (prev?.type === 'friend' && prev.data.id == data.userId) {
                    return { ...prev, data: { ...prev.data, isActive: data.isActive } };
                }
                return prev;
            });
        });

        return () => {
            unsubMessage();
            unsubRequest();
            unsubPresence();
        };
    }, [user?.id, selectedEntity]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Refresh data on window focus or network restoration
    useEffect(() => {
        const handleRefresh = () => {
            if (user?.id && navigator.onLine) {
                logger.info('Refreshing data due to focus or network restoration');
                loadFriends();
                loadPendingRequests();
                if (selectedEntity?.type === 'friend' && selectedEntity.data?.id) {
                    chatService.getConversation(selectedEntity.data.id).then(setMessages);
                }
            }
        };

        window.addEventListener('focus', handleRefresh);
        window.addEventListener('online', handleRefresh);

        return () => {
            window.removeEventListener('focus', handleRefresh);
            window.removeEventListener('online', handleRefresh);
        };
    }, [user?.id, selectedEntity]);

    const loadFriends = async () => {
        try {
            const friendsList = await chatService.getFriends();
            setFriends(friendsList);
        } catch (error) {
            logger.error('Error loading friends:', error);
        }
    };

    const loadGroups = async () => {
        try {
            const groupList = await chatService.getGroups();
            setGroups(groupList);
        } catch (error) {
            logger.error('Error loading groups:', error);
        }
    };

    const loadPendingRequests = async () => {
        try {
            const [received, sent] = await Promise.all([
                chatService.getPendingRequests(),
                chatService.getSentRequests()
            ]);
            setPendingRequests(received);
            setSentRequests(sent);
        } catch (error) {
            logger.error('Error loading requests:', error);
        }
    };

    const handleSelectFriend = async (friend: UserSearchResult) => {
        if (!friend || !friend.id) return;
        setSelectedEntity({ type: 'friend', data: friend });
        // Clear unread count
        setUnreadCounts(prev => {
            const next = { ...prev };
            delete next[`friend-${friend.id}`];
            return next;
        });
        try {
            const conversation = await chatService.getConversation(friend.id);
            setMessages(conversation);
        } catch (error) {
            logger.error('Error loading conversation:', error);
        }
    };

    const handleSelectGroup = async (group: any) => {
        setSelectedEntity({ type: 'group', data: group });
        setMessages([]);
    };

    const handleBack = () => {
        setSelectedEntity(null);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !user) return;

        if (selectedEntity?.type === 'friend') {
            // We don't add the message manually here to avoid duplicates.
            // The message will be added when received via the WebSocket confirmation.
            chatService.sendMessage(user.id, selectedEntity.data.id, messageInput);
        } else if (selectedEntity?.type === 'group') {
            chatService.sendGroupMessage(selectedEntity.data.id, user.id, messageInput);
        }

        setMessageInput('');
        loadFriends();
    };

    const toggleMemberSelection = (friendId: number) => {
        setSelectedMemberIds(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const AVATAR_COLORS = [
        '#3b82f6', '#2563eb', '#1d4ed8', '#0ea5e9', '#06b6d4',
        '#6366f1', '#64748b', '#94a3b8'
    ];

    const getAvatarColor = (id: number | string) => {
        const numId = typeof id === 'string' ? id.length : (id || 0);
        return AVATAR_COLORS[numId % AVATAR_COLORS.length];
    };

    const resetGroupForm = () => {
        setNewGroupName('');
        setNewGroupDesc('');
        setSelectedMemberIds([]);
        setGroupSearchQuery('');
        setGroupFormError(null);
        setGroupDialogOpen(false);
    };

    const handleCreateGroup = async () => {
        if (!user) return;

        const errors: { name?: string; members?: string } = {};
        if (!newGroupName.trim()) errors.name = 'Group name is required';
        if (selectedMemberIds.length === 0) errors.members = 'Please select at least one friend';

        if (Object.keys(errors).length > 0) {
            setGroupFormError(errors);
            return;
        }

        try {
            await chatService.createGroup(newGroupName, newGroupDesc, selectedMemberIds);
            resetGroupForm();
            loadGroups();
        } catch (error) {
            logger.error('Error creating group:', error);
        }
    };

    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async () => {
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
                const results = await chatService.searchUsers(query);
                setSearchResults(results);
            } catch (error) {
                logger.error('Error searching users:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }
    };

    const handleAcceptRequest = async (requestId: number) => {
        try {
            await chatService.acceptRequest(requestId);
            await Promise.all([
                loadPendingRequests(),
                loadFriends()
            ]);
        } catch (error) {
            logger.error('Error accepting request:', error);
        }
    };

    const renderEmptyState = (type: 'friends' | 'groups' | 'requests' | 'general' | 'incoming' | 'outgoing' = 'general') => {
        const isSubSection = type === 'incoming' || type === 'outgoing';

        const configs = {
            friends: {
                icon: <PersonAddIcon className={styles.emptyIcon} />,
                title: 'No Friends Yet',
                subtitle: 'Find and add friends to start a private conversation.'
            },
            groups: {
                icon: <GroupsIcon className={styles.emptyIcon} />,
                title: 'No Groups Joined',
                subtitle: 'Create a group or join one to chat with multiple people.'
            },
            requests: {
                icon: <CheckIcon className={styles.emptyIcon} />,
                title: 'No Pending Requests',
                subtitle: 'When people want to connect with you, they will appear here.'
            },
            incoming: {
                icon: <PersonAddIcon className={styles.emptyIcon} sx={{ fontSize: isSubSection ? 48 : 72, mb: 2, color: '#cbd5e1' }} />,
                title: 'No Incoming Friend Requests',
                subtitle: "When people send you friend requests, they'll appear here"
            },
            outgoing: {
                icon: <SendIcon className={styles.emptyIcon} sx={{ fontSize: isSubSection ? 48 : 72, mb: 2, color: '#cbd5e1' }} />,
                title: 'No Outgoing Friend Requests',
                subtitle: 'Friend requests you send will appear here'
            },
            general: {
                icon: <ForumIcon className={styles.emptyIcon} />,
                title: 'Start a conversation',
                subtitle: 'Search for friends or create a group using the icons above.'
            }
        };

        const config = configs[type] || configs.general;

        return (
            <div className={`${styles.emptyState} ${isSubSection ? styles.emptySectionState : ''}`}>
                {config.icon}
                <Typography variant="h6" fontWeight={800} color="#1e293b">{config.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>{config.subtitle}</Typography>
            </div>
        );
    };

    return (
        <DashboardLayout title="Messages">
            <div className={styles.container}>
                {!selectedEntity ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerContent}>
                                <div className={styles.headerInfo}>
                                    <ChatBubbleIcon className={styles.headerIcon} />
                                    <div>
                                        <h1 className={styles.title}>Messenger</h1>
                                        <p className={styles.subtitle}>Stay connected with your friends and groups</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tabsContainer}>
                            <div className={styles.headerTabsRow}>
                                <Tabs
                                    value={tabValue}
                                    onChange={(_, v) => setTabValue(v)}
                                    textColor="inherit"
                                    variant={isMobile ? "fullWidth" : "standard"}
                                    className={styles.tabs}
                                    TabIndicatorProps={{
                                        style: { display: 'none' }
                                    }}
                                    sx={{
                                        minHeight: '44px',
                                        '& .MuiTabs-flexContainer': {
                                            gap: isMobile ? '0px' : '12px'
                                        }
                                    }}
                                >
                                    <Tab
                                        icon={<PeopleIcon />}
                                        label={isMobile ? "" : "Friends"}
                                        iconPosition="start"
                                        className={styles.headerTab}
                                        title="Friends"
                                    />
                                    <Tab
                                        icon={<GroupsIcon />}
                                        label={isMobile ? "" : "Groups"}
                                        iconPosition="start"
                                        className={styles.headerTab}
                                        title="Groups"
                                    />
                                    <Tab
                                        icon={
                                            <Badge badgeContent={pendingRequests.length} color="error">
                                                <PersonAddIcon />
                                            </Badge>
                                        }
                                        label={isMobile ? "" : "Requests"}
                                        iconPosition="start"
                                        className={styles.headerTab}
                                        title="Requests"
                                    />
                                </Tabs>

                                <div className={styles.headerActions}>
                                    {tabValue === 0 && (
                                        <Button
                                            className={styles.primaryBtn}
                                            startIcon={<PersonAddIcon />}
                                            onClick={() => setSearchDialogOpen(true)}
                                            sx={{
                                                borderRadius: '50px',
                                                px: 3,
                                                py: 0.8,
                                                whiteSpace: 'nowrap',
                                                fontWeight: 800,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Add Friend
                                        </Button>
                                    )}
                                    {tabValue === 1 && (
                                        <Button
                                            className={styles.primaryBtn}
                                            startIcon={<GroupAddIcon />}
                                            onClick={() => setGroupDialogOpen(true)}
                                            sx={{
                                                borderRadius: '50px',
                                                px: 3,
                                                py: 0.8,
                                                whiteSpace: 'nowrap',
                                                fontWeight: 800,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Create Group
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.chatHeader}>
                        <div className={styles.navLeft}>
                            <IconButton onClick={handleBack} className={styles.actionBtn}>
                                <ArrowBackIcon />
                            </IconButton>
                            <div className={styles.navInfo}>
                                <div className={styles.navTitle}>
                                    {selectedEntity.data.name || selectedEntity.data.username}
                                </div>
                                {selectedEntity.type === 'friend' ? (() => {
                                    const activeFriend = friends.find(f => f.id === selectedEntity.data.id);
                                    const isOnline = activeFriend?.isActive ?? selectedEntity.data.isActive;

                                    return (
                                        <div className={styles.statusWrapper}>
                                            <div className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} />
                                            <span className={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    );
                                })() : (
                                    <div className={styles.statusWrapper}>
                                        <GroupsIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: 'rgba(255,255,255,0.7)' }} />
                                        <span className={styles.statusText}>
                                            {selectedEntity.data.members?.length || 0} Members
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.navActions}>
                            {selectedEntity.type === 'group' && selectedEntity.data.members && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, gap: -1 }}>
                                    {selectedEntity.data.members.slice(0, 5).map((member: any, i: number) => (
                                        <Tooltip key={member.id} title={member.name || member.username}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '0.8rem',
                                                    border: '2px solid #fff',
                                                    ml: i > 0 ? -1 : 0,
                                                    bgcolor: getAvatarColor(member.id),
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    ))}
                                    {selectedEntity.data.members.length > 5 && (
                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', border: '2px solid #fff', ml: -1, bgcolor: '#94a3b8' }}>
                                            +{selectedEntity.data.members.length - 5}
                                        </Avatar>
                                    )}
                                </Box>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.mainContent}>
                    {!selectedEntity ? (
                        <div className={styles.listView}>
                            {tabValue === 0 && (
                                <div className={styles.gridList}>
                                    {friends.map((friend) => (
                                        <div key={friend.id} className={styles.gridItem} onClick={() => handleSelectFriend(friend)}>
                                            <Box sx={{ position: 'relative' }}>
                                                <Badge
                                                    color="primary"
                                                    badgeContent={unreadCounts[`friend-${friend.id}`]}
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                >
                                                    <Avatar sx={{ width: 56, height: 56, bgcolor: getAvatarColor(friend.id), fontSize: 24, fontWeight: 800 }}>
                                                        {(friend.name || friend.username || 'U').charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                                <Box sx={{
                                                    position: 'absolute',
                                                    bottom: 2,
                                                    right: 2,
                                                    width: 14,
                                                    height: 14,
                                                    bgcolor: friend.isActive ? '#10b981' : '#94a3b8',
                                                    borderRadius: '50%',
                                                    border: '2.5px solid #fff'
                                                }} />
                                            </Box>
                                            <div className={styles.gridItemText}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
                                                        {friend.name || friend.username}
                                                    </Typography>
                                                    {friend.lastMessageAt && (
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                            {new Date(friend.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                    <Typography variant="body2" color="textSecondary" sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '200px',
                                                        fontWeight: unreadCounts[`friend-${friend.id}`] ? 700 : 400,
                                                        color: unreadCounts[`friend-${friend.id}`] ? '#1e293b' : '#64748b'
                                                    }}>
                                                        {friend.lastMessageContent || `@${friend.username}`}
                                                    </Typography>
                                                </Box>
                                            </div>
                                        </div>
                                    ))}
                                    {friends.length === 0 && renderEmptyState('friends')}
                                </div>
                            )}

                            {tabValue === 1 && (
                                <div className={styles.gridList}>
                                    {groups.map((group) => (
                                        <div key={group.id} className={styles.gridItem} onClick={() => handleSelectGroup(group)}>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    unreadCounts[`group-${group.id}`] ?
                                                        <Box sx={{ bgcolor: '#ef4444', color: '#fff', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>
                                                            {unreadCounts[`group-${group.id}`]}
                                                        </Box> : null
                                                }
                                            >
                                                <Avatar sx={{ width: 56, height: 56, bgcolor: getAvatarColor(group.id), fontSize: 24, fontWeight: 800 }}>
                                                    {(group.name || 'G').charAt(0).toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                            <div className={styles.gridItemText}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight={800} color="#1e293b">{group.name}</Typography>
                                                    {group.lastMessageAt && (
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                            {new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" sx={{
                                                    color: unreadCounts[`group-${group.id}`] ? '#1e293b' : '#64748b',
                                                    fontWeight: unreadCounts[`group-${group.id}`] ? 700 : 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '200px'
                                                }}>
                                                    {group.description || 'No description'}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                    {groups.length === 0 && renderEmptyState('groups')}
                                </div>
                            )}

                            {tabValue === 2 && (
                                <div className={styles.requestsWrapper}>
                                    {/* Incoming Friend Requests Section */}
                                    <div className={styles.requestSection}>
                                        <div className={styles.sectionHeader}>
                                            <Badge badgeContent={pendingRequests.length} color="primary" sx={{ mr: 2 }}>
                                                <PersonAddIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                                            </Badge>
                                            <Typography variant="h6" fontWeight={800} color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>INCOMING REQUESTS</Typography>
                                        </div>

                                        {pendingRequests.length > 0 ? (
                                            <div className={styles.requestGrid}>
                                                {pendingRequests.map((request) => (
                                                    <div key={request.id} className={`${styles.requestCard} ${styles.incoming}`}>
                                                        <div className={styles.requestHeader}>
                                                            <Avatar sx={{ width: 56, height: 56, bgcolor: '#10b981', fontSize: 24, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                                                {(request.sender.name || request.sender.username || 'U').charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <div>
                                                                <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
                                                                    {request.sender.name || request.sender.username}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                                                                    Wants to connect
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className={styles.successBtn}
                                                            onClick={() => handleAcceptRequest(request.id)}
                                                            startIcon={<CheckIcon />}
                                                            sx={{ borderRadius: '12px', py: 1.5 }}
                                                        >
                                                            Accept Request
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            renderEmptyState('incoming')
                                        )}
                                    </div>

                                    {/* Outgoing Friend Requests Section */}
                                    <div className={styles.requestSection}>
                                        <div className={styles.sectionHeader}>
                                            <Badge badgeContent={sentRequests.length} color="warning" sx={{ mr: 2 }}>
                                                <SendIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                                            </Badge>
                                            <Typography variant="h6" fontWeight={800} color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>OUTGOING REQUESTS</Typography>
                                        </div>

                                        {sentRequests.length > 0 ? (
                                            <div className={styles.requestGrid}>
                                                {sentRequests.map((request) => (
                                                    <div key={request.id} className={`${styles.requestCard} ${styles.outgoing}`}>
                                                        <div className={styles.requestHeader}>
                                                            <Avatar sx={{ width: 56, height: 56, bgcolor: '#f59e0b', fontSize: 24, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>
                                                                {(request.receiver.name || request.receiver.username || 'U').charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <div>
                                                                <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
                                                                    {request.receiver.name || request.receiver.username}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                                                                    Request Pending
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <Chip
                                                            label="Waiting for response"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: '#fbbf24',
                                                                color: '#d97706',
                                                                fontWeight: 700,
                                                                width: '100%',
                                                                borderRadius: '12px',
                                                                bgcolor: '#fffbeb',
                                                                height: '42px'
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            renderEmptyState('outgoing')
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.chatContainer}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <div className={styles.messagesList} id="messages-container">
                                {messages.map((msg, index) => {
                                    const currentUserId = user?.id;
                                    const messageSenderId = msg.senderId || msg.sender?.id;
                                    const isSent = Number(messageSenderId) === Number(currentUserId);
                                    return (
                                        <div
                                            key={msg.id ? `msg-${msg.id}` : `idx-${index}`}
                                            className={`${styles.messageWrapper} ${isSent ? styles.sent : styles.received}`}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 1.5,
                                                alignItems: 'flex-end',
                                                flexDirection: isSent ? 'row-reverse' : 'row',
                                                maxWidth: '100%',
                                                mb: 1
                                            }}>
                                                <Avatar sx={{
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '0.75rem',
                                                    bgcolor: isSent ? '#3b82f6' : '#e2e8f0',
                                                    color: isSent ? '#fff' : '#64748b',
                                                    fontWeight: 700,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    flexShrink: 0
                                                }}>
                                                    {isSent ? (user?.name || user?.username || 'M').charAt(0).toUpperCase() : (selectedEntity?.data?.name || selectedEntity?.data?.username || 'U').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: isSent ? 'flex-end' : 'flex-start',
                                                    maxWidth: 'calc(100% - 40px)',
                                                    flexShrink: 1
                                                }}>
                                                    {msg.messageType === 'IMAGE' && msg.mediaUrl ? (
                                                        <Box
                                                            component="img"
                                                            src={`${API_URL}${msg.mediaUrl}`}
                                                            alt="shared image"
                                                            sx={{
                                                                maxWidth: '200px',
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                mb: 0.5
                                                            }}
                                                            onClick={() => window.open(`${API_URL}${msg.mediaUrl}`, '_blank')}
                                                        />
                                                    ) : msg.messageType === 'FILE' && msg.mediaUrl ? (
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            bgcolor: 'rgba(0,0,0,0.05)',
                                                            p: 1,
                                                            borderRadius: '8px',
                                                            mb: 0.5
                                                        }}>
                                                            <AttachFileIcon fontSize="small" />
                                                            <a href={`${API_URL}${msg.mediaUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                                {msg.content}
                                                            </a>
                                                        </Box>
                                                    ) : (
                                                        <div className={styles.messageBubble}>{msg.content}</div>
                                                    )}
                                                    <span className={styles.messageTime}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </Box>
                                            </Box>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className={styles.inputArea}>
                                <TextField
                                    fullWidth
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    variant="outlined"
                                    className={styles.inputField}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleMenuClick} sx={{ color: '#64748b', mr: 0.5 }}>
                                                    <AttachFileIcon sx={{ fontSize: '1.4rem' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { border: 'none' },
                                            paddingRight: '8px'
                                        }
                                    }}
                                />
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        sx: {
                                            mb: 2,
                                            borderRadius: 3,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                            minWidth: 180,
                                            border: '1px solid #f1f5f9'
                                        }
                                    }}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={() => { fileInputRef.current?.click(); handleMenuClose(); }} sx={{ py: 1.5, gap: 1.5 }}>
                                        <AttachFileIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" fontWeight={700}>Send File</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { fileInputRef.current?.click(); handleMenuClose(); }} sx={{ py: 1.5, gap: 1.5 }}>
                                        <InsertPhotoIcon fontSize="small" color="secondary" />
                                        <Typography variant="body2" fontWeight={700}>Send Photo</Typography>
                                    </MenuItem>
                                </Menu>
                                <IconButton className={`${styles.primaryBtn} ${styles.sendBtn}`} onClick={handleSendMessage} disabled={!messageInput.trim()}>
                                    <SendIcon sx={{ fontSize: '1.4rem' }} />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    className: styles.dialogPaper,
                    sx: { p: isMobile ? 0 : 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Search Friends</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Search for people by their name or username to start a conversation.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            placeholder="Type at least 3 characters to search..."
                            fullWidth
                            size="small"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && searchQuery.length >= 3 && handleSearch()}
                            className={styles.modernInput}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <List sx={{ mt: 3, minHeight: '100px' }}>
                        {isSearching ? (
                            <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center', fontStyle: 'italic' }}>Searching...</Typography>
                        ) : hasSearched && searchResults.length === 0 ? (
                            <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center', fontStyle: 'italic' }}>No users found for "{searchQuery}"</Typography>
                        ) : (
                            searchResults.map((result) => {
                                const isFriend = friends.some(f => f.id === result.id);
                                const isPending = pendingRequests.some(r => r.sender.id === result.id);
                                const isSent = sentRequests.some(r => r.receiver.id === result.id);
                                const isSelf = user?.id === result.id;

                                let statusText = '';
                                if (isFriend) statusText = 'Friend';
                                else if (isPending) statusText = 'Accept Request';
                                else if (isSent) statusText = 'Pending';
                                else if (isSelf) statusText = 'You';

                                return (
                                    <Box
                                        key={result.id}
                                        className={styles.searchResultItem}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 48, height: 48, bgcolor: isSelf ? '#64748b' : '#3b82f6', fontSize: '1.2rem', fontWeight: 800 }}>
                                                {(result.name || result.username || 'U').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1 }}>
                                                    {result.name || result.username}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.2 }}>
                                                    @{result.username} {statusText ? `• ${statusText}` : ''}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {!isSelf && (
                                            <Box>
                                                {isFriend ? (
                                                    <Chip label="Friend" color="success" size="small" sx={{ fontWeight: 700, color: '#fff' }} />
                                                ) : isPending ? (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleAcceptRequest(result.id)}
                                                        sx={{
                                                            borderRadius: '50px',
                                                            px: 3,
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                            color: '#fff !important',
                                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                                        }}
                                                    >
                                                        Accept
                                                    </Button>
                                                ) : isSent ? (
                                                    <Chip label="Pending" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<PersonAddIcon />}
                                                        onClick={async () => {
                                                            try {
                                                                await chatService.sendFriendRequest(undefined, result.id);
                                                                loadPendingRequests();
                                                                // Refresh status
                                                                const updated = await chatService.searchUsers(searchQuery);
                                                                setSearchResults(updated);
                                                            } catch (error) {
                                                                console.error('Add friend error:', error);
                                                            }
                                                        }}
                                                        sx={{
                                                            borderRadius: '50px',
                                                            px: 3
                                                        }}
                                                        className={styles.primaryBtn}
                                                    >
                                                        Add Friend
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                        {isSelf && <Chip label="You" size="small" variant="outlined" />}
                                    </Box>
                                );
                            })
                        )}
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                    <Button
                        onClick={() => {
                            setSearchDialogOpen(false);
                            setHasSearched(false);
                            setSearchResults([]);
                            setSearchQuery('');
                        }}
                        className={styles.primaryBtn}
                        sx={{ px: 4, py: 1, borderRadius: '50px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={groupDialogOpen}
                onClose={resetGroupForm}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    className: styles.dialogPaper,
                    sx: { p: isMobile ? 0 : 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Create Group</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select friends to add and give your group a name.
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <TextField
                            placeholder="Search friends..."
                            fullWidth
                            size="small"
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            className={styles.modernInput}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Typography variant="subtitle2" fontWeight={700} sx={{
                            mb: 1,
                            color: groupFormError?.members ? '#ef4444' : '#64748b',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span>ADD FRIENDS ({selectedMemberIds.length})</span>
                            {groupFormError?.members && <span style={{ fontSize: '0.75rem' }}>{groupFormError.members}</span>}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            gap: 1.5,
                            overflowX: 'auto',
                            pb: 1,
                            minHeight: 85,
                            alignItems: 'center',
                            justifyContent: groupSearchQuery.length < 3 ? 'center' : 'flex-start',
                            '&::-webkit-scrollbar': { height: 4 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 }
                        }}>
                            {groupSearchQuery.length < 3 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                    Type at least 3 characters to see friends...
                                </Typography>
                            ) : friends.filter(f =>
                                (f.name || f.username || '').toLowerCase().includes(groupSearchQuery.toLowerCase())
                            ).length === 0 ? (
                                <Box sx={{ width: '100%', py: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No friends match your search.
                                    </Typography>
                                </Box>
                            ) : (
                                friends
                                    .filter(f =>
                                        (f.name || f.username || '').toLowerCase().includes(groupSearchQuery.toLowerCase())
                                    )
                                    .map(friend => (
                                        <Box
                                            key={friend.id}
                                            onClick={() => toggleMemberSelection(friend.id)}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                cursor: 'pointer',
                                                minWidth: 60
                                            }}
                                        >
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                badgeContent={
                                                    selectedMemberIds.includes(friend.id) ?
                                                        <CheckIcon sx={{ fontSize: 12, bgcolor: '#10b981', color: '#fff', borderRadius: '50%', p: 0.2 }} /> :
                                                        null
                                                }
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        bgcolor: getAvatarColor(friend.id),
                                                        opacity: selectedMemberIds.includes(friend.id) ? 1 : 0.6,
                                                        border: selectedMemberIds.includes(friend.id) ? '3px solid #10b981' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {(friend.name || friend.username).charAt(0).toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                            <Typography variant="caption" fontWeight={700} sx={{
                                                maxWidth: 60,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: selectedMemberIds.includes(friend.id) ? '#10b981' : 'text.secondary'
                                            }}>
                                                {friend.name || friend.username}
                                            </Typography>
                                        </Box>
                                    ))
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            placeholder="Group Name *"
                            fullWidth
                            size="small"
                            value={newGroupName}
                            onChange={(e) => {
                                setNewGroupName(e.target.value);
                                if (groupFormError?.name) setGroupFormError(prev => ({ ...prev, name: undefined }));
                            }}
                            error={!!groupFormError?.name}
                            helperText={groupFormError?.name}
                            className={styles.modernInput}
                            sx={{
                                '& .MuiFormHelperText-root': { fontWeight: 600, ml: 1 }
                            }}
                        />
                        <TextField
                            placeholder="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                            className={styles.modernInput}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={resetGroupForm}
                        className="btn-secondary"
                        sx={{ px: 3, borderRadius: '50px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateGroup}
                        className={styles.primaryBtn}
                        sx={{ px: 4, borderRadius: '50px' }}
                    >
                        Create Group
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout >
    );
}
