import React, { useState, useEffect, useRef } from 'react';
import {
    ScrollView,
    View,
    TouchableOpacity,
    Text,
    Modal,
    TextInput,
    Alert,
    Animated,
    Dimensions,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    RefreshControl
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HubHeaderBackground } from '@/components/HubHeaderBackground';
import { moneyStyles as styles } from '../_styles/money.styles';
import paymentService, { BankAccount, Transaction, BankInfo } from '../../services/payment.service';
import storageService from '../../services/storage.service';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function MoneyScreen() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const router = useRouter();
    const isDark = theme === 'dark';
    // States
    const [token, setToken] = useState<string | null>(null);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [banks, setBanks] = useState<BankInfo[]>([]);
    const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
    const [showBankPicker, setShowBankPicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Modals
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Form States - Linking
    const [linkForm, setLinkForm] = useState({
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: '',
        upiPin: ''
    });

    // Form States - Transfer
    const [transferStep, setTransferStep] = useState(1); // 1: Search, 2: Amount, 3: PIN, 4: Result
    const [searchPhone, setSearchPhone] = useState('');
    const [targetUser, setTargetUser] = useState<any>(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferPin, setTransferPin] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferMode, setTransferMode] = useState<'PHONE' | 'BANK'>('PHONE');
    const [recipientBankForm, setRecipientBankForm] = useState({
        accountNumber: '',
        confirmAccountNumber: '',
        ifsc: '',
        accountHolderName: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const [showBalance, setShowBalance] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [checkBalancePin, setCheckBalancePin] = useState('');
    const [txSearchQuery, setTxSearchQuery] = useState('');

    // Animations
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const loadData = async () => {
        setIsLoading(true);
        const savedToken = await storageService.getAuthToken();
        if (savedToken) {
            setToken(savedToken);
            const [account, history, banksList] = await Promise.all([
                paymentService.getAccount(savedToken),
                paymentService.getHistory(savedToken),
                paymentService.getSupportedBanks(savedToken)
            ]);
            setBankAccount(account);
            setTransactions(history);
            setBanks(banksList);
        }
        setIsLoading(false);
    };

    const handleLinkAccount = async () => {
        if (!token) return;
        if (!linkForm.accountNumber || !linkForm.bankName || !linkForm.ifscCode ||
            !linkForm.accountHolderName || !linkForm.upiPin) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (linkForm.ifscCode.length !== 11) {
            Alert.alert('Error', 'IFSC code must be exactly 11 characters');
            return;
        }
        if (linkForm.upiPin.length !== 6) {
            Alert.alert('Error', 'UPI PIN must be 6 digits');
            return;
        }
        setIsProcessing(true);
        try {
            const account = await paymentService.linkAccount(
                token,
                linkForm.accountNumber,
                linkForm.bankName,
                linkForm.ifscCode,
                linkForm.accountHolderName,
                linkForm.upiPin
            );
            setBankAccount(account);
            setShowLinkModal(false);
            setLinkForm({ accountNumber: '', bankName: '', ifscCode: '', accountHolderName: '', upiPin: '' });
            setSelectedBank(null);
            Alert.alert('Success', 'Bank account linked and verified successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data || 'Failed to link bank account');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckBalance = async () => {
        if (!token || checkBalancePin.length !== 6) return;
        setIsProcessing(true);
        try {
            const newBalance = await paymentService.checkBalance(token, checkBalancePin);
            setBankAccount(prev => prev ? { ...prev, balance: newBalance } : null);
            setShowBalance(true);
            setShowBalanceModal(false);
            setCheckBalancePin('');
        } catch (error: any) {
            Alert.alert('Verification Failed', 'Invalid UPI PIN or connection error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSearchUser = async () => {
        if (!searchPhone || !token) return;
        setIsProcessing(true);
        try {
            const user = await paymentService.searchUserByPhone(token, searchPhone);
            setTargetUser(user);
            setTransferStep(2);
        } catch (error) {
            Alert.alert('Error', 'User not found or no bank account linked');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyBeneficiary = () => {
        if (!recipientBankForm.accountNumber || !recipientBankForm.ifsc || !recipientBankForm.accountHolderName) {
            Alert.alert('Error', 'All fields are required'); return;
        }
        if (recipientBankForm.accountNumber !== recipientBankForm.confirmAccountNumber) {
            Alert.alert('Error', 'Account numbers do not match');
            return;
        }
        if (recipientBankForm.ifsc.length !== 11) {
            Alert.alert('Error', 'Invalid IFSC Code (Must be 11 chars)'); return;
        }
        setTargetUser({
            id: -1,
            name: recipientBankForm.accountHolderName,
            phoneNumber: recipientBankForm.accountNumber,
            type: 'EXTERNAL',
            ifsc: recipientBankForm.ifsc
        });
        setTransferStep(2);
    };

    const handleTransfer = async () => {
        if (!token || !targetUser) return;
        setTransferStep(4); // step 4 is Processing
        setIsProcessing(true);
        try {
            // Simulated secure SDK processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            let result;
            if (targetUser.type === 'EXTERNAL') {
                result = await paymentService.transferToAccount(
                    token,
                    targetUser.name,
                    targetUser.phoneNumber,
                    targetUser.ifsc,
                    parseFloat(transferAmount),
                    transferPin,
                    transferNote
                );
            } else {
                result = await paymentService.transferMoney(
                    token,
                    targetUser.id,
                    parseFloat(transferAmount),
                    transferPin,
                    transferNote
                );
            }
            setTransferStep(5); // step 5 is Success
            Animated.spring(successAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
            loadData(); // Refresh balance and history
        } catch (error: any) {
            const errorMsg = typeof error.response?.data === 'string' ? error.response.data : 'Transaction rejected';
            Alert.alert('Transfer Failed', errorMsg);
            setTransferStep(3); // Go back to PIN
        } finally {
            setIsProcessing(false);
            setTransferPin('');
        }
    };

    const resetTransfer = () => {
        setShowTransferModal(false);
        setTransferStep(1);
        setSearchPhone('');
        setTargetUser(null);
        setTransferAmount('');
        setTransferPin('');
        setTransferNote('');
        successAnim.setValue(0);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4c669f" />
            </View>
        );
    }

    const currentUserId = user?.id;

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => (
                        <View style={{ gap: 2 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, letterSpacing: -0.5, color: '#ffffff' }}>Wallet</Text>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Securely manage your funds</Text>
                        </View>
                    ),
                    headerBackground: () => (
                        <HubHeaderBackground
                            colors={['#78350f', '#451a03']}
                            icon="wallet"
                        />
                    ),
                    headerTintColor: '#ffffff',
                    headerTitleAlign: 'left',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => dispatch(setSidebarOpen(true))}
                            style={{ marginLeft: 16, marginRight: 8 }}
                        >
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="menu" size={22} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={loadData} style={{ marginRight: 16 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="refresh" size={18} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                decelerationRate="normal"
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#f59e0b"
                    />
                }
            >
                {/* Search / Mini Actions Bar */}
                <View style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 12, borderRadius: 12, gap: 10 }}
                    >
                        <Ionicons name="search" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                        <ThemedText style={{ color: isDark ? '#4b5563' : '#94a3b8', fontSize: 13, fontWeight: '500' }}>Search transactions...</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Interactive Money Card (Hero Section) */}
                <View style={[styles.balanceHeader, { backgroundColor: '#78350f', overflow: 'hidden' }]}>
                    <LinearGradient
                        colors={['#78350f', '#b45309']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={{ position: 'relative', zIndex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' }]}>Available Balance</Text>
                            {bankAccount && (
                                <TouchableOpacity onPress={() => showBalance ? setShowBalance(false) : setShowBalanceModal(true)}>
                                    <Ionicons
                                        name={showBalance ? "eye-off" : "refresh"}
                                        size={20}
                                        color="rgba(255,255,255,0.6)"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={[styles.headerBalance, { color: '#ffffff', fontWeight: '900' }]}>
                            <Text style={{ fontSize: 24, opacity: 0.6, fontWeight: '600' }}>$ </Text>
                            {bankAccount ? (
                                showBalance ? bankAccount.balance.toLocaleString() : '••••••'
                            ) : '0.00'}
                        </Text>

                        {bankAccount && !showBalance && (
                            <TouchableOpacity onPress={() => setShowBalanceModal(true)} style={{ marginTop: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 }}>
                                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>Check live balance</Text>
                            </TouchableOpacity>
                        )}

                        {bankAccount && (
                            <View style={[styles.bankTag, { backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 0, alignSelf: 'flex-start', paddingHorizontal: 16, marginTop: 24 }]}>
                                <Ionicons name="business" size={14} color="white" />
                                <Text style={styles.bankTagName}>
                                    {bankAccount.bankName} • {bankAccount.accountNumber.slice(-4).padStart(8, '*')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={[styles.actionItem, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]} onPress={() => { setTransferMode('PHONE'); setShowTransferModal(true); }}>
                        <View style={[styles.actionIcon, isDark && { backgroundColor: '#0f172a' }]}>
                            <Ionicons name="phone-portrait" size={24} color="#3b82f6" />
                        </View>
                        <ThemedText style={styles.actionLabel}>To Phone</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionItem, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]} onPress={() => { setTransferMode('BANK'); setShowTransferModal(true); }}>
                        <View style={[styles.actionIcon, isDark && { backgroundColor: '#0f172a' }]}>
                            <Ionicons name="swap-horizontal" size={24} color="#f97316" />
                        </View>
                        <ThemedText style={styles.actionLabel}>To Bank</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionItem, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]} onPress={() => setShowLinkModal(true)}>
                        <View style={[styles.actionIcon, isDark && { backgroundColor: '#0f172a' }]}>
                            <Ionicons name="add-circle" size={24} color="#22c55e" />
                        </View>
                        <ThemedText style={styles.actionLabel}>Link Bank</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Transactions */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flex: 0.6 }}>
                            <Ionicons name="search" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                            <TextInput
                                style={{ flex: 1, fontSize: 12, color: isDark ? '#f8fafc' : '#1e293b', marginLeft: 6, padding: 0 }}
                                placeholder="Search history..."
                                placeholderTextColor={isDark ? '#4b5563' : '#94a3b8'}
                                value={txSearchQuery}
                                onChangeText={setTxSearchQuery}
                            />
                        </View>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#f1f5f9" />
                            <Text style={styles.emptyText}>No activity recorded</Text>
                        </View>
                    ) : (
                        transactions.filter(tx => {
                            const isIncoming = tx.receiver?.id === user?.id;
                            const displayUser = isIncoming ? tx.sender : tx.receiver;
                            return (displayUser?.name || '').toLowerCase().includes(txSearchQuery.toLowerCase());
                        }).map((tx) => {
                            const isIncoming = tx.receiver?.id === user?.id;
                            const displayUser = isIncoming ? tx.sender : tx.receiver;
                            return (
                                <View key={tx.id} style={[styles.transactionCard, isDark && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                                    <View style={[styles.txAvatar, {
                                        backgroundColor: isIncoming ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#7f1d1d' : '#fee2e2')
                                    }]}>
                                        <Text style={{
                                            color: isIncoming ? (isDark ? '#34d399' : '#166534') : (isDark ? '#f87171' : '#991b1b'),
                                            fontWeight: '900'
                                        }}>
                                            {(displayUser?.name || 'U').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.txInfo}>
                                        <ThemedText style={[styles.txName, isDark && { color: '#f8fafc' }]}>{displayUser?.name || 'External A/c'}</ThemedText>
                                        <ThemedText style={styles.txDate}>
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                    <View>
                                        <Text style={[styles.txAmount, {
                                            color: isIncoming ? '#22c55e' : '#ef4444'
                                        }]}>
                                            {isIncoming ? '+' : '-'}${tx.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Link Bank Account Modal */}
            <Modal visible={showLinkModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Link Bank Account</Text>
                            <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Select Bank *</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowBankPicker(true)}
                            >
                                <Text style={{ color: selectedBank ? '#1e293b' : '#94a3b8' }}>
                                    {selectedBank ? selectedBank.name : 'Tap to select bank'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>IFSC Code *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="SBIN0001234"
                                autoCapitalize="characters"
                                maxLength={11}
                                value={linkForm.ifscCode}
                                onChangeText={(val) => {
                                    const value = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                    setLinkForm({ ...linkForm, ifscCode: value });
                                }}
                            />
                            <Text style={styles.helperText}>11-character bank code</Text>

                            <Text style={styles.inputLabel}>Account Holder Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="As per bank records"
                                value={linkForm.accountHolderName}
                                onChangeText={(val) => setLinkForm({ ...linkForm, accountHolderName: val })}
                            />
                            <Text style={styles.helperText}>Enter name exactly as in bank account</Text>

                            <Text style={styles.inputLabel}>Account Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1234567890"
                                keyboardType="number-pad"
                                value={linkForm.accountNumber}
                                onChangeText={(val) => {
                                    const numericValue = val.replace(/\D/g, '');
                                    setLinkForm({ ...linkForm, accountNumber: numericValue });
                                }}
                            />

                            <Text style={styles.inputLabel}>Set UPI PIN (6 digits) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="******"
                                secureTextEntry
                                maxLength={6}
                                keyboardType="number-pad"
                                value={linkForm.upiPin}
                                onChangeText={(val) => {
                                    const numericValue = val.replace(/\D/g, '');
                                    setLinkForm({ ...linkForm, upiPin: numericValue });
                                }}
                            />
                            <Text style={styles.helperText}>Create a 6-digit PIN for transactions</Text>

                            <TouchableOpacity
                                style={[styles.primaryBtn, isProcessing && { opacity: 0.6 }]}
                                onPress={handleLinkAccount}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.primaryBtnText}>Verify & Link Account</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Secure PIN Modal for Balance Check */}
            <Modal visible={showBalanceModal} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: 40 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Enter UPI PIN</Text>
                            <TouchableOpacity onPress={() => setShowBalanceModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 20 }}>
                                Verification required to fetch live balance from your bank.
                            </Text>

                            <TextInput
                                style={[styles.input, { width: '80%', textAlign: 'center', letterSpacing: 10, fontSize: 24 }]}
                                placeholder="••••••"
                                secureTextEntry
                                keyboardType="number-pad"
                                maxLength={6}
                                value={checkBalancePin}
                                onChangeText={(val) => setCheckBalancePin(val.replace(/\D/g, ''))}
                                autoFocus
                            />

                            <TouchableOpacity
                                style={[styles.primaryBtn, { width: '80%', marginTop: 20 }, isProcessing && { opacity: 0.6 }]}
                                onPress={handleCheckBalance}
                                disabled={isProcessing || checkBalancePin.length !== 6}
                            >
                                <Text style={styles.primaryBtnText}>
                                    {isProcessing ? 'Verifying...' : 'Verify & Fetch'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bank Picker Modal */}
            <Modal visible={showBankPicker} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '70%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Your Bank</Text>
                            <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={banks}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.bankItem}
                                    onPress={() => {
                                        setSelectedBank(item);
                                        setLinkForm({
                                            ...linkForm,
                                            bankName: item.name,
                                            ifscCode: item.ifscPrefix + '0001234'
                                        });
                                        setShowBankPicker(false);
                                    }}
                                >
                                    <View style={styles.bankIcon}>
                                        <Ionicons name="business" size={24} color="#4c669f" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bankName}>{item.name}</Text>
                                        <Text style={styles.bankCode}>Code: {item.code}</Text>
                                    </View>
                                    {selectedBank?.code === item.code && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4c669f" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Transfer Money Modal (Google Pay Style) */}
            <Modal visible={showTransferModal} animationType="slide">
                <View style={styles.transferContainer}>
                    <View style={styles.transferHeader}>
                        <TouchableOpacity onPress={resetTransfer}>
                            <Ionicons name="arrow-back" size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <Text style={styles.transferHeaderTitle}>Send Money</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {transferStep === 1 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>{transferMode === 'PHONE' ? 'Enter Phone Number' : 'Enter Bank Details'}</Text>
                            {transferMode === 'PHONE' ? (
                                <View style={styles.searchBox}>
                                    <Ionicons name="call-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Enter mobile linked to M4Hub"
                                        keyboardType="phone-pad"
                                        value={searchPhone}
                                        onChangeText={(val) => {
                                            const numericValue = val.replace(/\D/g, '');
                                            setSearchPhone(numericValue);
                                        }}
                                    />
                                    <TouchableOpacity onPress={handleSearchUser} disabled={isProcessing}>
                                        {isProcessing ? <ActivityIndicator size="small" color="#4c669f" /> : <Text style={styles.goBtn}>Next</Text>}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ width: '100%' }}>
                                    <TextInput style={styles.input} placeholder="Account Number" keyboardType="number-pad"
                                        value={recipientBankForm.accountNumber}
                                        onChangeText={v => setRecipientBankForm({ ...recipientBankForm, accountNumber: v.replace(/\D/g, '') })} />
                                    <TextInput style={styles.input} placeholder="Re-enter Account" keyboardType="number-pad"
                                        value={recipientBankForm.confirmAccountNumber}
                                        onChangeText={v => setRecipientBankForm({ ...recipientBankForm, confirmAccountNumber: v.replace(/\D/g, '') })} />
                                    <TextInput style={styles.input} placeholder="IFSC Code" autoCapitalize="characters"
                                        value={recipientBankForm.ifsc}
                                        onChangeText={v => setRecipientBankForm({ ...recipientBankForm, ifsc: v.toUpperCase() })} />
                                    <TextInput style={[styles.input, { marginBottom: 20 }]} placeholder="Recipient Name"
                                        value={recipientBankForm.accountHolderName}
                                        onChangeText={v => setRecipientBankForm({ ...recipientBankForm, accountHolderName: v })} />
                                    <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyBeneficiary}>
                                        <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {transferStep === 2 && targetUser && (
                        <View style={styles.stepContainer}>
                            <View style={styles.userDisplay}>
                                <View style={styles.userAvatarLarge}>
                                    <Text style={styles.avatarTextLarge}>{targetUser.name.charAt(0)}</Text>
                                </View>
                                <Text style={styles.userNameLarge}>{targetUser.name}</Text>
                                <Text style={styles.userPhoneLarge}>{targetUser.phoneNumber}</Text>
                            </View>

                            <View style={styles.amountBox}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0"
                                    keyboardType="decimal-pad"
                                    autoFocus
                                    value={transferAmount}
                                    onChangeText={setTransferAmount}
                                />
                            </View>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Add a note (optional)"
                                value={transferNote}
                                onChangeText={setTransferNote}
                            />
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setTransferStep(3)}>
                                <Text style={styles.primaryBtnText}>Proceed to Pay</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {transferStep === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.stepTitle}>Enter UPI PIN</Text>
                            <Text style={styles.stepSubtitle}>Sending ${transferAmount} to {targetUser?.name}</Text>
                            <TextInput
                                style={[styles.input, { textAlign: 'center', fontSize: 32, letterSpacing: 10 }]}
                                placeholder="******"
                                secureTextEntry
                                maxLength={6}
                                keyboardType="number-pad"
                                autoFocus
                                value={transferPin}
                                onChangeText={(val) => setTransferPin(val.replace(/\D/g, ''))}
                                onSubmitEditing={handleTransfer}
                            />
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleTransfer} disabled={isProcessing}>
                                {isProcessing ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Confirm Payment</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {transferStep === 4 && (
                        <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="large" color="#4c669f" style={{ marginBottom: 24 }} />
                            <Text style={styles.stepTitle}>Securing Connection</Text>
                            <Text style={styles.stepSubtitle}>Connecting to your bank's secure SDK...</Text>
                        </View>
                    )}

                    {transferStep === 5 && (
                        <View style={[styles.stepContainer, { justifyContent: 'center' }]}>
                            <Animated.View style={{
                                transform: [{ scale: successAnim }],
                                alignItems: 'center'
                            }}>
                                <View style={styles.successCircle}>
                                    <Ionicons name="checkmark" size={64} color="white" />
                                </View>
                                <Text style={styles.successTitle}>Payment Successful!</Text>
                                <Text style={styles.successSubtitle}>${transferAmount} sent to {targetUser?.name}</Text>
                                <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 40 }]} onPress={resetTransfer}>
                                    <Text style={styles.primaryBtnText}>Done</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setTransferMode('BANK');
                    setShowTransferModal(true);
                }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </ThemedView >
    );
}
