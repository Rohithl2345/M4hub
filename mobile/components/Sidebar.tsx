import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated as RNAnimated,
    TouchableWithoutFeedback,
    ScrollView,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { COLORS } from '@/constants/colors';
import { logout } from '@/store/slices/authSlice';
import { toggleMagic, setSidebarOpen } from '@/store/slices/uiSlice';
import { useSegments } from 'expo-router';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/use-app-theme';

function FloatingSidebarIcon({ icon, index }: { icon: any; index: number }) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const posX = ((index * 13 + 7) % 80 + 10) / 100 * SIDEBAR_WIDTH;
    const size = 18 + (index % 4) * 8;
    const duration = 10000 + (index % 12) * 1000;

    useEffect(() => {
        const delay = (index * 1500) % 15000;
        opacity.value = withDelay(delay, withTiming(0.2, { duration: 1000 }));
        translateY.value = height;
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-100, {
                    duration: duration,
                    easing: Easing.linear,
                }),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Reanimated.View
            style={[
                {
                    position: 'absolute',
                    left: posX,
                    zIndex: 0,
                },
                animatedStyle,
            ]}
        >
            <Ionicons name={icon} size={size} color="#fff" />
        </Reanimated.View>
    );
}

function FloatingSidebarIcons({ icon }: { icon: any }) {
    return (
        <View style={styles.floatingIconsContainer}>
            {[...Array(15)].map((_, i) => (
                <FloatingSidebarIcon key={i} icon={icon} index={i} />
            ))}
        </View>
    );
}

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar = ({ isOpen: propIsOpen, onClose: propOnClose }: SidebarProps) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const magicEnabled = useAppSelector((state) => state.ui.magicEnabled);
    const reduxIsOpen = useAppSelector((state) => state.ui.isSidebarOpen);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const isOpen = propIsOpen ?? reduxIsOpen;

    const onClose = () => {
        if (propOnClose) propOnClose();
        dispatch(setSidebarOpen(false));
    };

    const animation = React.useRef(new RNAnimated.Value(0)).current;

    const segments = useSegments();
    const currentTab = segments[1] || 'dashboard';

    const sidebarTheme = React.useMemo(() => {
        if (currentTab === 'music') return {
            accent: '#10b981' as const,
            icon: 'musical-notes' as const,
            gradient: ['#064e3b', '#065f46'] as const
        };
        if (currentTab === 'messages') return {
            accent: '#3b82f6' as const,
            icon: 'chatbubbles' as const,
            gradient: ['#1e3a8a', '#172554'] as const
        };
        if (currentTab === 'money') return {
            accent: '#f59e0b' as const,
            icon: 'wallet' as const,
            gradient: ['#78350f', '#451a03'] as const
        };
        if (currentTab === 'news') return {
            accent: '#ef4444' as const,
            icon: 'newspaper' as const,
            gradient: ['#7f1d1d', '#450a0a'] as const
        };
        return {
            accent: '#6366f1' as const,
            icon: 'apps' as const,
            gradient: ['#4c1d95', '#2e1065'] as const
        };
    }, [currentTab]);

    const isActive = (route: string) => {
        if (route === '/' && currentTab === 'dashboard') return true;
        if (route === '/explore' && currentTab === 'explore') return true;
        return currentTab === route.replace('/', '');
    };

    useEffect(() => {
        RNAnimated.timing(animation, {
            toValue: isOpen ? 1 : 0,
            duration: 220, // Faster, snappier animation
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-SIDEBAR_WIDTH, 0],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const menuItems = [
        { label: 'Home', icon: 'home', route: '/' },
        { label: 'Music', icon: 'musical-notes', route: '/music' },
        { label: 'Messages', icon: 'chatbubbles', route: '/messages' },
        { label: 'Money', icon: 'wallet', route: '/money' },
        { label: 'News', icon: 'newspaper', route: '/news' },
        { label: 'Profile', icon: 'person', route: '/explore' },
    ];

    const handleNavigate = (route: string) => {
        onClose();
        router.push(route as any);
    };

    // Keep component mounted during closing animation
    const [isMounted, setIsMounted] = React.useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
        } else {
            const timer = setTimeout(() => setIsMounted(false), 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isMounted && !isOpen) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <RNAnimated.View style={[styles.backdrop, { opacity }]} />
            </TouchableWithoutFeedback>

            {/* Sidebar Content */}
            <RNAnimated.View style={[
                styles.sidebar,
                { transform: [{ translateX }] },
                magicEnabled && { borderLeftWidth: 0, elevation: 25 }
            ]}>
                <View style={[styles.container]}>
                    <LinearGradient
                        colors={sidebarTheme.gradient as any}
                        style={StyleSheet.absoluteFill}
                    />

                    {magicEnabled && <FloatingSidebarIcons icon={sidebarTheme.icon} />}

                    {/* Header */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                        style={[styles.header, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }]}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                            <View style={[styles.profileSection, { flex: 1, paddingRight: 42 }]}>
                                <View style={{ position: 'relative' }}>
                                    <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }]}>
                                        <ThemedText style={[styles.avatarText, { color: '#fff', fontSize: 18, fontWeight: '900' }]}>
                                            {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                                        </ThemedText>
                                    </View>
                                    {/* Online Status Dot */}
                                    <View style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' }} />
                                </View>

                                <View style={styles.userInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <ThemedText style={[styles.userName, { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: -0.5 }]} numberOfLines={1}>
                                            {user?.firstName} {user?.lastName || ''}
                                        </ThemedText>
                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                            <Ionicons name="checkmark-circle" size={11} color="#fff" />
                                        </View>
                                    </View>
                                    <ThemedText style={[styles.userEmail, { color: 'rgba(255,255,255,0.6)', fontSize: 10.5, fontWeight: '600', marginTop: 1 }]} numberOfLines={1}>{user?.email || 'Premium Member'}</ThemedText>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#22c55e' }} />
                                        <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }}>Active Connection</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onClose}
                                style={{ position: 'absolute', right: -2, width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
                            >
                                <Ionicons name="close" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={[styles.sectionTitle, magicEnabled && { color: 'rgba(255,255,255,0.5)' }]}>Main Hubs</ThemedText>
                        </View>

                        {menuItems.map((item) => {
                            const active = isActive(item.route);
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.menuItem,
                                        active && styles.menuItemActive,
                                        active && magicEnabled && styles.menuItemActiveMagic
                                    ]}
                                    onPress={() => handleNavigate(item.route)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={active ? '#fff' : 'rgba(255,255,255,0.6)'}
                                    />
                                    <ThemedText style={[
                                        styles.menuLabel,
                                        active && { fontWeight: '800' },
                                        { color: active ? '#fff' : 'rgba(255,255,255,0.7)' }
                                    ]}>
                                        {item.label}
                                    </ThemedText>
                                    {active && <View style={[styles.activeIndicator, { backgroundColor: '#fff' }]} />}
                                </TouchableOpacity>
                            );
                        })}


                    </ScrollView>

                    {/* Magic Toggle Above Footer */}
                    <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
                        <TouchableOpacity
                            style={[styles.menuItem, { paddingHorizontal: 0 }]}
                            onPress={() => dispatch(toggleMagic())}
                        >
                            <Ionicons
                                name={magicEnabled ? "sparkles" : "sparkles-outline"}
                                size={22}
                                color={magicEnabled ? '#fff' : 'rgba(255,255,255,0.6)'}
                            />
                            <ThemedText style={[styles.menuLabel, { color: magicEnabled ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: magicEnabled ? '800' : '500' }]}>Magic Effects</ThemedText>
                            <View style={styles.switchWrapper}>
                                <View style={[styles.switch, magicEnabled && styles.switchActive, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <View style={[styles.switchThumb, magicEnabled && styles.switchThumbActive, { backgroundColor: '#fff' }]} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.footer, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                dispatch(logout());
                                router.replace('/auth/email-login?mode=login');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 10,
                                marginBottom: 12
                            }}
                        >
                            <Ionicons name="log-out" size={18} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 13 }}>Logout Session</Text>
                        </TouchableOpacity>
                        <ThemedText style={[styles.version, { color: 'rgba(255,255,255,0.4)', marginBottom: 4 }]}>M4hub Mobile v1.0.0</ThemedText>
                    </View>
                </View>
            </RNAnimated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    floatingIconsContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    menuList: {
        flex: 1,
        paddingTop: 10,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 14,
        marginVertical: 1,
    },
    menuItemActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    menuItemActiveMagic: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        marginHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        paddingHorizontal: 10,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    activeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6366f1',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 20,
        marginVertical: 10,
    },
    switchWrapper: {
        marginLeft: 'auto',
    },
    switch: {
        width: 40,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
        padding: 2,
    },
    switchActive: {
        backgroundColor: '#6366f1',
    },
    switchThumb: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        elevation: 2,
    },
    switchThumbActive: {
        transform: [{ translateX: 20 }],
    },
    logoutItem: {
        marginTop: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        alignItems: 'center',
    },
    version: {
        fontSize: 10,
        color: '#94a3b8',
    },
});
