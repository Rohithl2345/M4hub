import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { messagesStyles as styles } from './_styles/messages.styles';

export default function MessagesScreen() {
    const recentChats = [
        { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', time: '2m ago', unread: 2 },
        { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow!', time: '1h ago', unread: 0 },
        { id: 3, name: 'Team Group', lastMessage: 'Meeting at 3 PM', time: '3h ago', unread: 5 },
        { id: 4, name: 'Alex Johnson', lastMessage: 'Thanks for the help!', time: '1d ago', unread: 0 },
    ];

    const stats = [
        { label: 'Conversations', value: '24' },
        { label: 'Unread', value: '7' },
        { label: 'Groups', value: '3' },
    ];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Messages',
                    headerShown: true,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Ionicons name="chatbubble" size={64} color="white" />
                    <ThemedText style={styles.headerTitle}>Messages</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Stay connected with friends and family</ThemedText>
                </LinearGradient>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                            <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Recent Chats */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recent Chats</ThemedText>
                    {recentChats.map((chat) => (
                        <TouchableOpacity key={chat.id} style={styles.chatCard}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={32} color="white" />
                            </View>
                            <View style={styles.chatInfo}>
                                <ThemedText style={styles.chatName}>{chat.name}</ThemedText>
                                <ThemedText style={styles.lastMessage}>{chat.lastMessage}</ThemedText>
                            </View>
                            <View style={styles.chatMeta}>
                                <ThemedText style={styles.time}>{chat.time}</ThemedText>
                                {chat.unread > 0 && (
                                    <View style={styles.badge}>
                                        <ThemedText style={styles.badgeText}>{chat.unread}</ThemedText>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Coming Soon */}
                <View style={styles.comingSoon}>
                    <ThemedText style={styles.comingSoonTitle}>💬 More Features Coming Soon!</ThemedText>
                    <ThemedText style={styles.comingSoonText}>We&apos;re building an amazing messaging experience for you</ThemedText>
                    <View style={styles.featuresList}>
                        {['Real-time messaging', 'Group chats', 'Media sharing', 'Voice & video calls'].map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <ThemedText style={styles.featureText}>{feature}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}
