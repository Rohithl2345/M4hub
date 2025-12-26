'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import chatService, { ChatMessage, FriendRequest, UserSearchResult } from '@/services/chat.service';
import DashboardLayout from '@/components/DashboardLayout';
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
import { env } from '@/utils/env';

const API_URL = env.apiUrl;

export default function MessagesPage() {
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
            console.log('Uploading file...');
            const result = await chatService.uploadFile(file);
            console.log('File uploaded:', result);
            const msgType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';

            if (selectedEntity.type === 'friend') {
                chatService.sendMessage(user.id, selectedEntity.data.id, result.fileName, msgType, result.url);
            } else if (selectedEntity.type === 'group') {
                // Group message currently supports type but maybe not mediaUrl in backend DTO?
                // Assuming it works for now or text fallback
                chatService.sendGroupMessage(selectedEntity.data.id, user.id, result.fileName, msgType);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
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
            console.log('Refreshing requests due to real-time notification');
            loadPendingRequests();
        });

        const unsubPresence = chatService.onPresence((data) => {
            console.log('Presence update received in page:', data);
            setFriends(prevFriends => prevFriends.map(f => {
                // Use loose equality (==) to handle string/number mismatch
                if (f.id == data.userId) {
                    console.log(`Updating user ${f.username} to ${data.isActive}`);
                    return { ...f, isActive: data.isActive };
                }
                return f;
            }));
            // Also fetch fresh list to be 100% sure
            loadFriends();
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

    const loadFriends = async () => {
        try {
            const friendsList = await chatService.getFriends();
            setFriends(friendsList);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadGroups = async () => {
        try {
            const groupList = await chatService.getGroups();
            setGroups(groupList);
        } catch (error) {
            console.error('Error loading groups:', error);
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
            console.error('Error loading requests:', error);
        }
    };

    const handleSelectFriend = async (friend: UserSearchResult) => {
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
            console.error('Error loading conversation:', error);
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

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            await chatService.createGroup(newGroupName, newGroupDesc);
            setGroupDialogOpen(false);
            setNewGroupName('');
            setNewGroupDesc('');
            loadGroups();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const [searchError, setSearchError] = useState<string | null>(null);

    // ... (existing layout code) ...

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
                console.error('Error searching users:', error);
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
            console.error('Error accepting request:', error);
        }
    };

    const renderEmptyState = (type: 'friends' | 'groups' | 'requests' | 'general' = 'general') => {
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
            general: {
                icon: <ForumIcon className={styles.emptyIcon} />,
                title: 'Start a conversation',
                subtitle: 'Search for friends or create a group using the icons above.'
            }
        };

        const config = configs[type];

        return (
            <div className={styles.emptyState}>
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
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerInfo}>
                                <ChatBubbleIcon className={styles.headerIcon} />
                                <div>
                                    <h1 className={styles.title}>Messenger</h1>
                                    <p className={styles.subtitle}>Stay connected with your friends and groups</p>
                                </div>
                            </div>

                            <div className={styles.headerTabsRow}>
                                <Tabs
                                    value={tabValue}
                                    onChange={(_, v) => setTabValue(v)}
                                    textColor="inherit"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    className={styles.tabs}
                                    TabIndicatorProps={{
                                        style: { backgroundColor: '#ffffff', height: '3px', borderRadius: '3px' }
                                    }}
                                >
                                    <Tab icon={<PeopleIcon />} label="Friends" iconPosition="start" className={styles.headerTab} />
                                    <Tab icon={<GroupsIcon />} label="Groups" iconPosition="start" className={styles.headerTab} />
                                    <Tab
                                        icon={
                                            <Badge badgeContent={pendingRequests.length} color="error">
                                                <PersonAddIcon />
                                            </Badge>
                                        }
                                        label="Requests"
                                        iconPosition="start"
                                        className={styles.headerTab}
                                    />
                                </Tabs>
                            </div>

                            <div className={styles.navActions}>
                                <IconButton className={styles.actionBtn} onClick={() => setSearchDialogOpen(true)} title="Add Friend">
                                    <PersonAddIcon />
                                </IconButton>
                                <IconButton className={styles.actionBtn} onClick={() => setGroupDialogOpen(true)} title="Create Group">
                                    <GroupAddIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
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
                                {(() => {
                                    const activeFriend = selectedEntity.type === 'friend'
                                        ? friends.find(f => f.id === selectedEntity.data.id)
                                        : null;
                                    const isOnline = activeFriend?.isActive ?? selectedEntity.data.isActive;

                                    return (
                                        <div className={styles.statusWrapper}>
                                            <div className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} />
                                            <span className={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className={styles.navActions} />
                    </div>
                )}


                <Dialog
                    open={searchDialogOpen}
                    onClose={() => {
                        setSearchDialogOpen(false);
                        setHasSearched(false);
                        setSearchResults([]);
                        setSearchQuery('');
                        setSearchError(null);
                    }}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        className: styles.dialogPaper,
                        sx: { p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Search Friends</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Search for people by their name or username to start a conversation.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="User Identifier"
                                placeholder="Enter username or name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.trim()) setSearchError(null);
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                variant="filled"
                                error={!!searchError}
                                helperText={searchError}
                                sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
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
                                                <Avatar sx={{ width: 48, height: 48, bgcolor: isSelf ? '#64748b' : '#6366f1', fontSize: '1.2rem', fontWeight: 800 }}>
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
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                                color: '#fff !important'
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
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                                color: '#fff !important'
                                                            }}
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
                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={() => {
                                setSearchDialogOpen(false);
                                setHasSearched(false);
                                setSearchResults([]);
                                setSearchQuery('');
                            }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                borderRadius: 2,
                                color: 'text.secondary',
                                '&:hover': { background: '#f1f5f9' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={isSearching}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#fff !important'
                            }}
                        >
                            {isSearching ? '...' : 'Search'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={groupDialogOpen}
                    onClose={() => setGroupDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        className: styles.dialogPaper,
                        sx: { p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Create Group</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create a group to chat with multiple friends at once.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Group Name"
                                fullWidth
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                variant="filled"
                                sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                                variant="filled"
                                sx={{ '& .MuiFilledInput-root': { borderRadius: 2 } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={() => setGroupDialogOpen(false)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                borderRadius: 2,
                                color: 'text.secondary',
                                '&:hover': { background: '#f1f5f9' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateGroup}
                            disabled={!newGroupName.trim()}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#fff !important'
                            }}
                        >
                            Create Group
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
