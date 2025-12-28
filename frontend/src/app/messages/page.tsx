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
    CircularProgress
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
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<{ id: number; name: string } | null>(null);
    const [headerMenuAnchor, setHeaderMenuAnchor] = useState<null | HTMLElement>(null);
    const [groupOptionsAnchor, setGroupOptionsAnchor] = useState<null | HTMLElement>(null);
    const [activeGroupMenu, setActiveGroupMenu] = useState<any | null>(null);



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

    const handleDeleteGroup = (groupId: number, groupName: string) => {
        setGroupToDelete({ id: groupId, name: groupName });
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteGroup = async () => {
        if (!groupToDelete) return;

        try {
            await chatService.deleteGroup(groupToDelete.id);
            if (selectedEntity?.type === 'group' && selectedEntity.data.id === groupToDelete.id) {
                setSelectedEntity(null);
                setMessages([]);
            }
            loadGroups();
            setDeleteConfirmOpen(false);
            setGroupToDelete(null);
        } catch (error: any) {
            logger.error('Error deleting group:', error);
            alert(error.response?.data?.error || 'Failed to delete group');
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
                            {selectedEntity.type === 'group' && (
                                <IconButton
                                    onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
                                    sx={{
                                        color: '#fff',
                                        opacity: 0.8,
                                        '&:hover': { opacity: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                        ml: 1
                                    }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
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
                                        <div
                                            key={friend.id}
                                            className={styles.gridItem}
                                            onClick={() => handleSelectFriend(friend)}
                                        >
                                            <div className={styles.avatarContainer}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        unreadCounts[`friend-${friend.id}`] ?
                                                            <Box sx={{ bgcolor: '#ef4444', color: '#fff', borderRadius: '50%', minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #fff' }}>
                                                                {unreadCounts[`friend-${friend.id}`]}
                                                            </Box> : null
                                                    }
                                                >
                                                    <Avatar sx={{
                                                        width: 52,
                                                        height: 52,
                                                        bgcolor: getAvatarColor(friend.id),
                                                        fontSize: 20,
                                                        fontWeight: 800,
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                                    }}>
                                                        {(friend.name || friend.username || 'U').charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                                <div className={styles.memberTag} style={{ color: friend.isActive ? '#10b981' : '#64748b', background: friend.isActive ? '#ecfdf5' : '#f1f5f9', borderColor: friend.isActive ? '#d1fae5' : '#e2e8f0' }}>
                                                    {friend.isActive ? 'Online' : 'Offline'}
                                                </div>
                                            </div>

                                            <div className={styles.gridItemText}>
                                                <Typography className={styles.groupTitle} noWrap>
                                                    {friend.name || friend.username}
                                                </Typography>
                                                <Typography className={styles.groupDesc}>
                                                    {friend.lastMessageContent || `Send a message to @${friend.username}`}
                                                </Typography>
                                                <Typography className={styles.creatorText}>
                                                    @{friend.username}
                                                </Typography>
                                            </div>

                                            <div className={styles.actionColumn}>
                                                <Typography className={styles.detailedTime}>
                                                    {friend.lastMessageAt ?
                                                        `Active ${new Date(friend.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                        : 'New Chat'}
                                                </Typography>
                                                <IconButton size="small" sx={{ color: '#3b82f6', opacity: 0.5, '&:hover': { opacity: 1, bgcolor: '#eff6ff' } }}>
                                                    <ChatBubbleIcon fontSize="small" />
                                                </IconButton>
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
                                            <div className={styles.avatarContainer}>
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
                                                <div className={styles.memberTag}>
                                                    {group.members?.length || 0} Members
                                                </div>
                                            </div>

                                            <div className={styles.gridItemText}>
                                                <Typography className={styles.groupTitle} noWrap>
                                                    {group.name}
                                                </Typography>
                                                <Typography className={styles.groupDesc}>
                                                    {group.description || 'No description provided'}
                                                </Typography>
                                                <Typography className={styles.creatorText}>
                                                    Created by <b>{group.createdBy?.name || group.createdBy?.username || 'Owner'}</b>
                                                </Typography>
                                            </div>

                                            <div className={styles.actionColumn}>
                                                <Typography className={styles.detailedTime}>
                                                    {(() => {
                                                        if (group.lastMessageAt) {
                                                            return `Active ${new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                                        }
                                                        return `Created ${new Date(group.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                                    })()}
                                                </Typography>
                                                {user?.id === group.createdBy?.id && (
                                                    <Button
                                                        size="small"
                                                        variant="text"
                                                        startIcon={<DeleteIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGroup(group.id, group.name);
                                                        }}
                                                        className={styles.ghostDangerBtn}
                                                        sx={{ fontSize: '0.7rem' }}
                                                    >
                                                        Delete Group
                                                    </Button>
                                                )}
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
                                            <Badge badgeContent={sentRequests.length} color="info" sx={{ mr: 2 }}>
                                                <SendIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                                            </Badge>
                                            <Typography variant="h6" fontWeight={800} color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>OUTGOING REQUESTS</Typography>
                                        </div>

                                        {sentRequests.length > 0 ? (
                                            <div className={styles.requestGrid}>
                                                {sentRequests.map((request) => (
                                                    <div key={request.id} className={`${styles.requestCard} ${styles.outgoing}`}>
                                                        <div className={styles.requestHeader}>
                                                            <Avatar sx={{ width: 56, height: 56, bgcolor: '#2563eb', fontSize: 24, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
                                                                {(request.receiver.name || request.receiver.username || 'U').charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <div>
                                                                <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
                                                                    {request.receiver.name || request.receiver.username}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 600 }}>
                                                                    Request Pending
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                        <Chip
                                                            label="Waiting for response"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: '#bfdbfe',
                                                                color: '#1d4ed8',
                                                                fontWeight: 700,
                                                                width: '100%',
                                                                borderRadius: '12px',
                                                                bgcolor: '#eff6ff',
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
                    sx: { p: 0 } // Classes handle padding
                }}
            >
                <DialogTitle className={styles.dialogHeader} component="div">
                    <Typography variant="h5" component="div" fontWeight={800} sx={{ letterSpacing: '-0.5px', color: '#1e293b' }}>
                        Search Friends
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ color: '#64748b', mt: 0.5 }}>
                        Search for people by their name or username to start a conversation.
                    </Typography>
                </DialogTitle>

                <DialogContent className={styles.searchContent}>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            placeholder="Type a name or username..."
                            fullWidth
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                    <List sx={{ mt: 2 }}>
                        {!hasSearched ? (
                            <div className={styles.searchPlaceholder}>
                                <SearchIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                                <Typography variant="h6" fontWeight={800} color="#64748b" gutterBottom>
                                    Start Searching
                                </Typography>
                                <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 280 }}>
                                    Enter a name or username in the field above to find people to connect with.
                                </Typography>
                            </div>
                        ) : isSearching ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <CircularProgress size={32} sx={{ mb: 2 }} />
                                <Typography color="textSecondary" variant="body2" fontWeight={600}>Searching for users...</Typography>
                            </Box>
                        ) : hasSearched && searchResults.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                <EmojiPeopleIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                                <Typography color="textSecondary" variant="body2" fontWeight={700}>
                                    No users found for "{searchQuery}"
                                </Typography>
                            </Box>
                        ) : (
                            searchResults.map((result) => {
                                const isFriend = friends.some(f => f.id === result.id);
                                const isPending = pendingRequests.some(r => r.sender.id === result.id);
                                const isSent = sentRequests.some(r => r.receiver.id === result.id);
                                const isSelf = user?.id === result.id;

                                let statusTag = null;
                                if (isFriend) statusTag = <Chip label="Friend" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />;
                                else if (isPending) statusTag = <Chip label="Req Sent to You" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />;
                                else if (isSent) statusTag = <Chip label="Pending" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />;

                                return (
                                    <div key={result.id} className={styles.searchResultItem}>
                                        <div className={styles.resultInfo}>
                                            <Avatar sx={{
                                                width: 52,
                                                height: 52,
                                                bgcolor: getAvatarColor(result.id),
                                                fontSize: '1.3rem',
                                                fontWeight: 800,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                border: '2px solid #fff'
                                            }}>
                                                {(result.name || result.username || 'U').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div className={styles.resultDetails}>
                                                <Typography className={styles.resultName}>
                                                    {result.name || result.username}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                                                    <Typography className={styles.resultUsername}>
                                                        @{result.username}
                                                    </Typography>
                                                    {statusTag}
                                                </Box>
                                            </div>
                                        </div>

                                        <div className={styles.resultAction}>
                                            {!isSelf && (
                                                <>
                                                    {isFriend ? (
                                                        <IconButton disabled sx={{ bgcolor: 'rgba(16, 185, 129, 0.1) !important', color: '#10b981 !important' }}>
                                                            <CheckIcon />
                                                        </IconButton>
                                                    ) : isPending ? (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            className={styles.successBtn}
                                                            onClick={() => handleAcceptRequest(result.id)}
                                                            sx={{ borderRadius: '50px', px: 2, height: 36 }}
                                                        >
                                                            Accept
                                                        </Button>
                                                    ) : isSent ? (
                                                        <Chip label="Requested" variant="outlined" sx={{ fontWeight: 700 }} />
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
                                                            className={styles.primaryBtn}
                                                            sx={{ borderRadius: '50px', px: 2, height: 36 }}
                                                        >
                                                            Add Friend
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                            {isSelf && <Chip label="You" size="small" variant="outlined" sx={{ fontWeight: 700 }} />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </List>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                    className: styles.dialogPaper,
                    sx: { maxWidth: '400px', width: '100%', p: isMobile ? 0 : 1 }
                }}
            >
                <DialogTitle className={styles.dialogHeader} component="div" sx={{ borderBottom: '1px solid #f1f5f9', pb: 2 }}>
                    <Typography variant="h6" component="div" fontWeight={800} sx={{ color: '#1e293b' }}>
                        Confirm Deletion
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2.5, pb: 1 }}>
                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.6 }}>
                        Are you sure you want to permanently delete the group <strong>"{groupToDelete?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, color: '#64748b', bgcolor: '#fef2f2', p: 2, borderRadius: '12px', border: '1px solid #fee2e2' }}>
                        This action cannot be undone. All messages and history will be cleared for everyone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1.5 }}>
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        sx={{
                            px: 3,
                            borderRadius: '50px',
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteGroup}
                        className={styles.dangerBtn}
                        startIcon={<DeleteIcon />}
                        sx={{ px: 4, py: 1 }}
                    >
                        Delete Group
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Header / Group Detail Menu */}
            <Menu
                anchorEl={headerMenuAnchor}
                open={Boolean(headerMenuAnchor)}
                onClose={() => setHeaderMenuAnchor(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 15px 35px -5px rgba(0,0,0,0.15)',
                        minWidth: '260px',
                        mt: 1.5,
                        p: 1,
                        border: '1px solid #f1f5f9'
                    }
                }}
            >
                {selectedEntity?.type === 'group' && (
                    <Box sx={{ p: 1 }}>
                        <Typography variant="overline" sx={{ px: 2, color: '#94a3b8', fontWeight: 800, letterSpacing: 1.2 }}>
                            Group Members ({selectedEntity.data.members?.length || 0})
                        </Typography>
                        <List sx={{ pt: 1, pb: 0 }}>
                            {selectedEntity.data.members?.map((member: any) => (
                                <Box key={member.id} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1,
                                    borderRadius: '12px',
                                    '&:hover': { bgcolor: '#f8fafc' }
                                }}>
                                    <Avatar sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: getAvatarColor(member.id),
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2" fontWeight={700} noWrap color="#1e293b">
                                            {member.name || member.username}
                                        </Typography>
                                        {selectedEntity.data.createdBy?.id === member.id && (
                                            <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800 }}>
                                                Group Admin
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </List>

                        {user?.id === selectedEntity.data.createdBy?.id && (
                            <>
                                <Box sx={{ my: 1, borderTop: '1px solid #f1f5f9' }} />
                                <MenuItem
                                    onClick={() => {
                                        handleDeleteGroup(selectedEntity.data.id, selectedEntity.data.name);
                                        setHeaderMenuAnchor(null);
                                    }}
                                    sx={{
                                        color: '#ef4444',
                                        fontWeight: 800,
                                        borderRadius: '12px',
                                        py: 1.5,
                                        gap: 1.5,
                                        '&:hover': { bgcolor: '#fef2f2' }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: '#ef4444', minWidth: 'auto' }}>
                                        <DeleteIcon fontSize="small" />
                                    </ListItemIcon>
                                    Delete Group
                                </MenuItem>
                            </>
                        )}
                    </Box>
                )}
            </Menu>
        </DashboardLayout>
    );
}
