'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './money.module.css';
import {
    Box,
    Typography,
    Button,
    Card,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Tooltip,
    Autocomplete,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NumbersIcon from '@mui/icons-material/Numbers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldIcon from '@mui/icons-material/Shield';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LockIcon from '@mui/icons-material/Lock';
import paymentService, { BankAccount, Transaction, BankInfo } from '@/services/payment.service';

const BANK_LOGOS: Record<string, string> = {
    'SBI': 'https://logo.clearbit.com/sbi.co.in',
    'HDFC': 'https://logo.clearbit.com/hdfcbank.com',
    'ICICI': 'https://logo.clearbit.com/icicibank.com',
    'AXIS': 'https://logo.clearbit.com/axisbank.com',
    'PNB': 'https://logo.clearbit.com/pnbindia.in',
    'BOB': 'https://logo.clearbit.com/bankofbaroda.in',
    'KOTAK': 'https://logo.clearbit.com/kotak.com',
    'YES': 'https://logo.clearbit.com/yesbank.in',
    'IDBI': 'https://logo.clearbit.com/idbibank.in',
    'INDUSIND': 'https://logo.clearbit.com/indusind.com',
    'CANARA': 'https://logo.clearbit.com/canarabank.com',
    'UNION': 'https://logo.clearbit.com/unionbankofindia.co.in',
    'IDFC': 'https://logo.clearbit.com/idfcfirstbank.com',
    'FEDERAL': 'https://logo.clearbit.com/federalbank.co.in',
    'BOI': 'https://logo.clearbit.com/bankofindia.co.in'
};

const BANK_COLORS: Record<string, string> = {
    'SBI': '#1a237e',   // Navy Blue
    'HDFC': '#004c8f',  // Dark Blue
    'ICICI': '#f37e20', // Orange
    'AXIS': '#97144d',  // Burgundy
    'PNB': '#b71c1c',   // Red
    'BOB': '#f57f17',   // Orange/Yellow
    'KOTAK': '#ed1b24', // Red
    'YES': '#005b9f',   // Blue
    'IDBI': '#388e3c',  // Green
    'INDUSIND': '#8d230f', // Dark Red
    'CANARA': '#0090da', // Light Blue
    'UNION': '#e31e24', // Red
    'IDFC': '#9d1e2e',  // Dark Red
    'FEDERAL': '#00529b', // Blue
    'BOI': '#f7941d'    // Orange
};

export default function MoneyPage() {
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [banks, setBanks] = useState<BankInfo[]>([]);

    // Modals
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);

    // Form States
    const [linkForm, setLinkForm] = useState({
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: '',
        upiPin: ''
    });
    const [transferStep, setTransferStep] = useState(1);
    const [transferMode, setTransferMode] = useState<'PHONE' | 'BANK'>('PHONE');
    const [recipientBankForm, setRecipientBankForm] = useState({
        accountNumber: '',
        confirmAccountNumber: '',
        ifsc: '',
        accountHolderName: ''
    });
    const [searchPhone, setSearchPhone] = useState('');
    const [targetUser, setTargetUser] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [upiPin, setUpiPin] = useState('');
    const [description, setDescription] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [showBalance, setShowBalance] = useState(false);
    const [balanceCheckOpen, setBalanceCheckOpen] = useState(false);
    const [balancePin, setBalancePin] = useState('');

    useEffect(() => {
        if (!linkModalOpen) {
            setLinkForm({
                accountNumber: '',
                bankName: '',
                ifscCode: '',
                accountHolderName: '',
                upiPin: ''
            });
            setError('');
        }
    }, [linkModalOpen]);


    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [account, history, banksList] = await Promise.all([
            paymentService.getAccount(),
            paymentService.getHistory(),
            paymentService.getSupportedBanks()
        ]);
        setBankAccount(account);
        setTransactions(history);
        setBanks(banksList);
        setLoading(false);
    };

    const handleLinkAccount = async () => {
        setError('');
        if (!linkForm.accountNumber || !linkForm.bankName || !linkForm.ifscCode ||
            !linkForm.accountHolderName || !linkForm.upiPin) {
            setError('Please fill all fields');
            return;
        }
        if (linkForm.ifscCode.length !== 11) {
            setError('IFSC code must be exactly 11 characters');
            return;
        }
        if (linkForm.upiPin.length !== 6) {
            setError('UPI PIN must be 6 digits');
            return;
        }
        setProcessing(true);
        try {
            const account = await paymentService.linkAccount(
                linkForm.accountNumber,
                linkForm.bankName,
                linkForm.ifscCode,
                linkForm.accountHolderName,
                linkForm.upiPin
            );
            setBankAccount(account);
            setLinkModalOpen(false);
            setLinkForm({ accountNumber: '', bankName: '', ifscCode: '', accountHolderName: '', upiPin: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckBalance = async () => {
        if (!balancePin) return;
        setProcessing(true);
        setError('');
        try {
            const newBalance = await paymentService.checkBalance(balancePin);
            setBankAccount(prev => prev ? { ...prev, balance: newBalance } : null);
            setShowBalance(true);
            setBalanceCheckOpen(false);
            setBalancePin('');
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleSearch = async () => {
        setError('');
        setProcessing(true);
        try {
            const user = await paymentService.searchUserByPhone(searchPhone);
            setTargetUser(user);
            setTransferStep(2);
        } catch (err: any) {
            setError('User not found or payment not enabled');
        } finally {
            setProcessing(false);
        }
    };

    const handleVerifyBeneficiary = () => {
        setError('');
        if (!recipientBankForm.accountNumber || !recipientBankForm.ifsc || !recipientBankForm.accountHolderName) {
            setError('All fields are required'); return;
        }
        if (recipientBankForm.accountNumber !== recipientBankForm.confirmAccountNumber) {
            setError('Account numbers do not match');
            return;
        }
        if (recipientBankForm.ifsc.length !== 11) {
            setError('Invalid IFSC Code (Must be 11 chars)');
            return;
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
        setError('');
        setTransferStep(4); // step 4 is "Processing with Bank"
        setProcessing(true);
        try {
            // Simulated delay to show the SDK processing state
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (targetUser.type === 'EXTERNAL') {
                await paymentService.transferToAccount(
                    targetUser.name,
                    targetUser.phoneNumber, // Account Number
                    targetUser.ifsc,
                    parseFloat(amount),
                    upiPin,
                    description
                );
            } else {
                await paymentService.transferMoney(targetUser.id, parseFloat(amount), upiPin, description);
            }

            setTransferStep(5); // step 5 is Success
            loadData();
        } catch (err: any) {
            setError(err.message);
            setTransferStep(3); // Go back to PIN entry
        } finally {
            setProcessing(false);
            setUpiPin('');
        }
    };

    const resetTransfer = () => {
        setTransferModalOpen(false);
        setTransferStep(1);
        setSearchPhone('');
        setTargetUser(null);
        setAmount('');
        setUpiPin('');
        setDescription('');
        setError('');
    };

    if (loading) {
        return (
            <DashboardLayout title="Money">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Money">
            <div className={styles.container}>
                <div className={styles.pageHeaderUnified}>
                    <AccountBalanceWalletIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.headerTitle}>Money Management</h1>
                        <p className={styles.headerSubtitle}>Securely manage your funds and track your transactions</p>
                    </div>
                </div>

                <div className={styles.layoutGrid}>
                    <div className={styles.mainContent}>
                        {/* Interactive Wallet Card */}
                        <div className={styles.heroSection}>
                            <div className={styles.heroContent}>
                                <div className={styles.balanceHeaderContainer}>
                                    <span className={styles.balanceLabel}>Current Balance</span>
                                    {bankAccount && (
                                        <IconButton
                                            size="small"
                                            onClick={() => showBalance ? setShowBalance(false) : setBalanceCheckOpen(true)}
                                            className={styles.balanceToggle}
                                        >
                                            {showBalance ? <VisibilityOffIcon fontSize="small" /> : <RefreshIcon fontSize="small" />}
                                        </IconButton>
                                    )}
                                </div>
                                <div className={styles.balanceAmount}>
                                    <span style={{ opacity: 0.6, fontSize: '0.6em' }}>$</span>
                                    {bankAccount ? (
                                        showBalance ? (bankAccount.balance ?? 0).toLocaleString() : '••••••'
                                    ) : '0.00'}
                                </div>

                                {!showBalance && bankAccount && (
                                    <Button
                                        className={`btn-secondary ${styles.checkBalanceBtn}`}
                                        onClick={() => setBalanceCheckOpen(true)}
                                    >
                                        Check real-time balance
                                    </Button>
                                )}

                                {bankAccount && (
                                    <div className={styles.bankPill}>
                                        <AccountBalanceIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {bankAccount.bankName} • {bankAccount.accountNumber?.slice(-4).padStart(8, '*') || '********'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Services Bar */}
                        <div className={styles.quickActionsRow}>
                            <div className={styles.actionBtn} onClick={() => setTransferModalOpen(true)}>
                                <div className={`${styles.actionIcon} ${styles.blue}`}>
                                    <PhoneIcon />
                                </div>
                                <Typography variant="caption" fontWeight={800}>TO MOBILE</Typography>
                            </div>
                            <div className={styles.actionBtn} onClick={() => {
                                setTransferMode('BANK');
                                setTransferModalOpen(true);
                            }}>
                                <div className={`${styles.actionIcon} ${styles.orange}`}>
                                    <AccountBalanceIcon />
                                </div>
                                <Typography variant="caption" fontWeight={800}>TO BANK</Typography>
                            </div>
                            <div className={styles.actionBtn} onClick={() => setLinkModalOpen(true)}>
                                <div className={`${styles.actionIcon} ${styles.green}`}>
                                    <SendIcon sx={{ transform: 'rotate(-45deg)' }} />
                                </div>
                                <Typography variant="caption" fontWeight={800}>LINK BANK</Typography>
                            </div>
                        </div>

                        {/* Recent Transactions Section */}
                        <div className={styles.transactionsList}>
                            <div className={styles.sectionTitle}>
                                <span>Recent Transactions</span>
                                <Button size="small" variant="text" sx={{ fontWeight: 800, textTransform: 'none', color: '#4c669f' }}>
                                    View Analytics
                                </Button>
                            </div>

                            {transactions.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <AccountBalanceWalletIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
                                    <Typography variant="body1" fontWeight={700}>Your ledger is empty</Typography>
                                    <Typography variant="caption">Start a transfer to see history here</Typography>
                                </div>
                            ) : (
                                transactions.map((tx) => {
                                    const isIncoming = tx.receiver?.id === currentUser?.id;
                                    const displayUser = isIncoming ? tx.sender : tx.receiver;
                                    return (
                                        <div key={tx.id} className={styles.transactionItem}>
                                            <div className={styles.txAvatar} style={{
                                                backgroundColor: isIncoming ? '#dcfce7' : '#fee2e2',
                                                color: isIncoming ? '#166534' : '#991b1b'
                                            }}>
                                                {(displayUser?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.txDetails}>
                                                <div className={styles.txName}>{displayUser?.name || 'External Account'}</div>
                                                <div className={styles.txMeta}>
                                                    {new Date(tx.timestamp).toLocaleDateString()} • {tx.description || 'General Transfer'}
                                                </div>
                                            </div>
                                            <div className={styles.txAmount} style={{ color: isIncoming ? '#16a34a' : '#ef4444' }}>
                                                {isIncoming ? '+' : '-'}${tx.amount?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Secondary Insights / Bank Info Panel */}
                    <div className={styles.sideCard}>
                        <div className={styles.card}>
                            <Typography variant="subtitle1" fontWeight={800} gutterBottom>Saved Accounts</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No saved beneficiaries yet. They'll appear here after your first transfer.
                            </Typography>
                            <Button fullWidth className="btn-secondary" sx={{ borderRadius: '12px', textTransform: 'none' }}>
                                Manage Recipients
                            </Button>
                        </div>

                        <div className={styles.insightCard}>
                            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Security Tip</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Never share your UPI PIN or banking passwords with anyone, including M4Hub staff.
                            </Typography>
                            <NumbersIcon sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 80, opacity: 0.1 }} />
                        </div>

                        <Card sx={{ p: 3, borderRadius: '24px', bgcolor: '#f1f5f9', border: 'none', boxShadow: 'none' }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">TIER STATUS</Typography>
                            <Typography variant="h6" fontWeight={900} sx={{ color: '#0f172a', mt: 1 }}>Premium Member</Typography>
                            <Box sx={{ width: '100%', height: 4, bgcolor: '#cbd5e1', borderRadius: '12px', mt: 2 }}>
                                <Box sx={{ width: '75%', height: '100%', bgcolor: '#4c669f', borderRadius: '12px' }} />
                            </Box>
                        </Card>
                    </div>
                </div>

                {/* Link Bank Modal */}
                <Dialog open={linkModalOpen} onClose={() => setLinkModalOpen(false)} PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: '500px' } }}>
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem' }}>Link your Bank Account</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Link your bank account to start making secure instant transfers. Your account will be verified with your bank.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Autocomplete
                                options={banks}
                                getOptionLabel={(option) => option.name}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    const logoUrl = BANK_LOGOS[option.code];
                                    const bankColor = BANK_COLORS[option.code] || '#64748b';

                                    return (
                                        <li key={key} {...otherProps} style={{
                                            padding: '12px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            borderBottom: '1px solid #f8fafc',
                                            cursor: 'pointer'
                                        }}>
                                            <Box
                                                component="img"
                                                src={logoUrl}
                                                alt={option.name}
                                                onError={(e: any) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${option.name}&background=${bankColor.replace('#', '')}&color=fff&size=64&font-size=0.5`;
                                                }}
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    p: 0.8,
                                                    objectFit: 'contain',
                                                    bgcolor: '#fff',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" fontWeight={600} color="#0f172a" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                    {option.name}
                                                </Typography>
                                                <Typography variant="caption" color="#64748b" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <span style={{ fontWeight: 500, color: '#94a3b8' }}>IFSC</span>
                                                    {option.ifscPrefix}****
                                                </Typography>
                                            </Box>
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Bank"
                                        placeholder="Search bank..."
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ mr: 1 }}>
                                                    {linkForm.bankName ? (
                                                        <Box
                                                            component="img"
                                                            src={BANK_LOGOS[banks.find(b => b.name === linkForm.bankName)?.code || '']}
                                                            onError={(e: any) => {
                                                                const code = banks.find(b => b.name === linkForm.bankName)?.code || '';
                                                                const color = (BANK_COLORS[code] || '#64748b').replace('#', '');
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${linkForm.bankName}&background=${color}&color=fff&size=64&font-size=0.5`;
                                                            }}
                                                            sx={{
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '6px',
                                                                border: '1px solid #e2e8f0',
                                                                p: 0.5,
                                                                objectFit: 'contain',
                                                                bgcolor: '#fff'
                                                            }}
                                                        />
                                                    ) : (
                                                        <AccountBalanceIcon sx={{ color: '#94a3b8' }} />
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                                onChange={(e, value) => {
                                    if (value) {
                                        setLinkForm({
                                            ...linkForm,
                                            bankName: value.name,
                                            ifscCode: value.ifscPrefix + '0001234' // Auto-fill standard branch code
                                        });
                                    } else {
                                        setLinkForm({
                                            ...linkForm,
                                            bankName: '',
                                            ifscCode: ''
                                        });
                                    }
                                }}
                                value={banks.find(b => b.name === linkForm.bankName) || null}
                                ListboxProps={{
                                    sx: {
                                        maxHeight: '300px',
                                        '& .MuiAutocomplete-option': { padding: 0 },
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                                        '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' }
                                    }
                                }}
                            />

                            <TextField
                                label="IFSC Code"
                                fullWidth
                                required
                                placeholder="SBIN0001234"
                                value={linkForm.ifscCode}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                    setLinkForm({ ...linkForm, ifscCode: value });
                                }}
                                inputProps={{ maxLength: 11 }}
                                helperText="11-character bank code (e.g., SBIN0001234)"
                            />

                            <TextField
                                label="Account Holder Name"
                                fullWidth
                                required
                                placeholder="As per bank records"
                                value={linkForm.accountHolderName}
                                onChange={(e) => setLinkForm({ ...linkForm, accountHolderName: e.target.value })}
                                helperText="Enter name exactly as it appears in your bank account"
                            />

                            <TextField
                                label="Account Number"
                                fullWidth
                                required
                                placeholder="1234567890"
                                value={linkForm.accountNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setLinkForm({ ...linkForm, accountNumber: value });
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NumbersIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { backgroundColor: '#fff' }
                                }}
                                inputProps={{
                                    pattern: '[0-9]*',
                                    inputMode: 'numeric',
                                    autoComplete: 'new-password'
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#fff',
                                        '&:hover': { backgroundColor: '#fff' },
                                        '&.Mui-focused': { backgroundColor: '#fff' }
                                    }
                                }}
                            />

                            <TextField
                                label="Set UPI PIN"
                                type="password"
                                fullWidth
                                required
                                placeholder="6 digits"
                                value={linkForm.upiPin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setLinkForm({ ...linkForm, upiPin: value });
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#64748b' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { backgroundColor: '#fff' }
                                }}
                                inputProps={{
                                    maxLength: 6,
                                    pattern: '[0-9]*',
                                    inputMode: 'numeric',
                                    autoComplete: 'new-password'
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#fff',
                                        '&:hover': { backgroundColor: '#fff' },
                                        '&.Mui-focused': { backgroundColor: '#fff' }
                                    }
                                }}
                                helperText="Create a 6-digit PIN for secure transactions"
                            />
                        </Box>
                        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            fullWidth
                            onClick={handleLinkAccount}
                            disabled={processing}
                            className="btn-primary"
                            sx={{ py: 1.5, borderRadius: '12px' }}
                        >
                            {processing ? <CircularProgress size={24} color="inherit" /> : 'Verify & Link Account'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Transfer Modal - Google Pay Style */}
                <Dialog
                    fullScreen={window.innerWidth < 600}
                    open={transferModalOpen}
                    onClose={resetTransfer}
                    PaperProps={{
                        sx: {
                            borderRadius: window.innerWidth < 600 ? 0 : '24px',
                            minHeight: '600px',
                            minWidth: window.innerWidth < 600 ? '100%' : '500px'
                        }
                    }}
                >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <IconButton onClick={resetTransfer}><ArrowBackIcon /></IconButton>
                        <Typography variant="h6" sx={{ ml: 2, fontWeight: 800 }}>Send Money</Typography>
                    </Box>

                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                        {transferStep === 1 && (
                            <Box sx={{ width: '100%', mt: 4 }}>
                                <Typography variant="h4" fontWeight={900} textAlign="center" gutterBottom>
                                    {transferMode === 'PHONE' ? 'Who are you paying?' : 'Enter Bank Details'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
                                    {transferMode === 'PHONE' ? "Enter the recipient's mobile number" : "Add recipient's bank account details"}
                                </Typography>

                                {transferMode === 'PHONE' ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={searchPhone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setSearchPhone(value);
                                            }}
                                            inputProps={{
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric'
                                            }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                                                sx: { borderRadius: '16px', height: 64, fontSize: '1.2rem' }
                                            }}
                                        />
                                        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
                                        <Button
                                            fullWidth
                                            onClick={handleSearch}
                                            disabled={processing || !searchPhone}
                                            className="btn-primary"
                                            sx={{ mt: 4, py: 2, borderRadius: '12px', fontSize: '1.1rem' }}
                                        >
                                            {processing ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                                        </Button>
                                    </>
                                ) : (
                                    <Box component="form" onSubmit={(e) => { e.preventDefault(); handleVerifyBeneficiary(); }} sx={{ width: '100%' }}>
                                        <TextField
                                            fullWidth label="Account Number" required
                                            value={recipientBankForm.accountNumber}
                                            onChange={(e) => setRecipientBankForm({ ...recipientBankForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                                            sx={{ mb: 2 }} inputProps={{ inputMode: 'numeric' }}
                                        />
                                        <TextField
                                            fullWidth label="Re-enter Account Number" required
                                            value={recipientBankForm.confirmAccountNumber}
                                            onChange={(e) => setRecipientBankForm({ ...recipientBankForm, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                                            error={recipientBankForm.accountNumber !== recipientBankForm.confirmAccountNumber && recipientBankForm.confirmAccountNumber.length > 0}
                                            helperText={recipientBankForm.accountNumber !== recipientBankForm.confirmAccountNumber && recipientBankForm.confirmAccountNumber.length > 0 ? "Account numbers do not match" : ""}
                                            sx={{ mb: 2 }} inputProps={{ inputMode: 'numeric' }}
                                        />
                                        <TextField
                                            fullWidth label="IFSC Code" required
                                            value={recipientBankForm.ifsc}
                                            onChange={(e) => setRecipientBankForm({ ...recipientBankForm, ifsc: e.target.value.toUpperCase() })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth label="Account Holder Name" required
                                            value={recipientBankForm.accountHolderName}
                                            onChange={(e) => setRecipientBankForm({ ...recipientBankForm, accountHolderName: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                        <Button
                                            fullWidth type="submit"
                                            className="btn-primary"
                                            sx={{ mt: 2, py: 2, borderRadius: '12px' }}
                                        >
                                            Verify & Continue
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {transferStep === 2 && targetUser && (
                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', mb: 2, bgcolor: '#4c669f' }}>
                                    {targetUser.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h5" fontWeight={900}>{targetUser.name}</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {targetUser.type === 'EXTERNAL' ? `A/c: ${targetUser.phoneNumber} - ${targetUser.ifsc}` : targetUser.phoneNumber}
                                </Typography>

                                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="h2" fontWeight={900} sx={{ opacity: 0.5 }}>$</Typography>
                                    <TextField
                                        variant="standard"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        sx={{
                                            ml: 1,
                                            '& input': {
                                                fontSize: '4rem',
                                                fontWeight: 900,
                                                textAlign: 'center',
                                                width: '200px'
                                            }
                                        }}
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </Box>
                                <TextField
                                    placeholder="What's this for?"
                                    fullWidth
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={{ mt: 4, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                />
                                <Button
                                    fullWidth
                                    onClick={() => setTransferStep(3)}
                                    disabled={!amount}
                                    className="btn-primary"
                                    sx={{ mt: 6, py: 2, borderRadius: '12px' }}
                                >
                                    Proceed to Pay
                                </Button>
                            </Box>
                        )}

                        {transferStep === 3 && (
                            <Box sx={{ width: '100%', mt: 4, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={900} gutterBottom>
                                    Enter 6-digit UPI PIN
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                                    Paying ${amount} to {targetUser.name}
                                </Typography>
                                <TextField
                                    type="password"
                                    placeholder="******"
                                    inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '3rem', letterSpacing: '10px' } }}
                                    value={upiPin}
                                    onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ''))}
                                    variant="standard"
                                    fullWidth
                                    autoFocus
                                />
                                {error && <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>{error}</Alert>}
                                <Button
                                    fullWidth
                                    onClick={handleTransfer}
                                    disabled={processing || upiPin.length < 6}
                                    className="btn-primary"
                                    sx={{ mt: 6, py: 2, borderRadius: '12px' }}
                                >
                                    {processing ? <CircularProgress size={24} color="inherit" /> : 'Secure Pay'}
                                </Button>
                            </Box>
                        )}

                        {transferStep === 4 && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                                <Typography variant="h6" fontWeight={800} gutterBottom>
                                    Connecting to Secure Side
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Authorizing transaction with your bank SDK...
                                    Please do not close this window.
                                </Typography>
                            </Box>
                        )}

                        {transferStep === 5 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 120, color: '#22c55e', mb: 4 }} />
                                <Typography variant="h3" fontWeight={900} textAlign="center" gutterBottom>
                                    Payment Successful
                                </Typography>
                                <Typography variant="h5" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
                                    ${amount} sent to {targetUser.name}
                                </Typography>
                                <Button
                                    onClick={resetTransfer}
                                    className="btn-secondary"
                                    sx={{ px: 6, borderRadius: '12px' }}
                                >
                                    Done
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
                <Fab
                    color="primary"
                    aria-label="add account"
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        boxShadow: '0 4px 20px rgba(76, 102, 159, 0.4)',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                        }
                    }}
                    onClick={() => {
                        setTransferMode('BANK');
                        setTransferModalOpen(true);
                    }}
                >
                    <AddIcon />
                </Fab>

                {/* Secure PIN Dialog for Balance Check */}
                <Dialog
                    open={balanceCheckOpen}
                    onClose={() => !processing && setBalanceCheckOpen(false)}
                    PaperProps={{ sx: { borderRadius: '24px', minWidth: '350px' } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 0, pt: 3 }}>Verify Identity</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', p: 4 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Enter your 6-digit UPI PIN to view your real-time bank balance.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            type="password"
                            placeholder="••••••"
                            inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.4rem', fontWeight: 800 } }}
                            value={balancePin}
                            onChange={(e) => setBalancePin(e.target.value.replace(/\D/g, ''))}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && balancePin.length === 6 && !processing) {
                                    handleCheckBalance();
                                }
                            }}
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 4, pt: 0 }}>
                        <Button
                            fullWidth
                            disabled={balancePin.length !== 6 || processing}
                            onClick={handleCheckBalance}
                            className="btn-primary"
                            sx={{ borderRadius: '12px', py: 1.5 }}
                        >
                            {processing ? <CircularProgress size={24} color="inherit" /> : 'Verify & Fetch'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
