import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { moneyStyles as styles } from '../_styles/money.styles';

export default function MoneyScreen() {
    const recentTransactions = [
        { id: 1, type: 'credit', title: 'Salary Deposit', amount: '+$3,500', date: 'Jan 15' },
        { id: 2, type: 'debit', title: 'Netflix Subscription', amount: '-$12.99', date: 'Jan 14' },
        { id: 3, type: 'debit', title: 'Grocery Shopping', amount: '-$125.50', date: 'Jan 13' },
        { id: 4, type: 'credit', title: 'Freelance Project', amount: '+$850', date: 'Jan 12' },
    ];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Money',
                    headerShown: true,
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Ionicons name="wallet" size={64} color="white" />
                    <ThemedText style={styles.headerTitle}>Money Management</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>Track your finances and manage your wallet</ThemedText>
                </LinearGradient>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.balanceGradient}
                    >
                        <View style={styles.balanceInfo}>
                            <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
                            <ThemedText style={styles.balanceAmount}>$12,453.75</ThemedText>
                            <View style={styles.balanceChange}>
                                <Ionicons name="trending-up" size={16} color="white" />
                                <ThemedText style={styles.balanceChangeText}>+12.5% from last month</ThemedText>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addMoneyBtn}>
                            <ThemedText style={styles.addMoneyBtnText}>Add Money</ThemedText>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="business" size={32} color="#f5576c" />
                        <ThemedText style={styles.statValue}>$8,234</ThemedText>
                        <ThemedText style={styles.statLabel}>Bank Account</ThemedText>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="card" size={32} color="#f5576c" />
                        <ThemedText style={styles.statValue}>$4,219</ThemedText>
                        <ThemedText style={styles.statLabel}>Credit Cards</ThemedText>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
                    {recentTransactions.map((transaction) => (
                        <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
                            <View style={[styles.transactionIcon, transaction.type === 'credit' ? styles.creditIcon : styles.debitIcon]}>
                                <ThemedText style={styles.transactionIconText}>
                                    {transaction.type === 'credit' ? '+' : '-'}
                                </ThemedText>
                            </View>
                            <View style={styles.transactionInfo}>
                                <ThemedText style={styles.transactionTitle}>{transaction.title}</ThemedText>
                                <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
                            </View>
                            <ThemedText style={[styles.amount, transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount]}>
                                {transaction.amount}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Coming Soon */}
                <View style={styles.comingSoon}>
                    <ThemedText style={styles.comingSoonTitle}>💰 More Features Coming Soon!</ThemedText>
                    <ThemedText style={styles.comingSoonText}>Building powerful financial management tools for you</ThemedText>
                    <View style={styles.featuresList}>
                        {['Bill payments', 'Investment tracking', 'Budget planning', 'Money transfers'].map((feature, index) => (
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
