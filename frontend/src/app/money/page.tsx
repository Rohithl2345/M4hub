'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './money.module.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';



import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import paymentService, { BankAccount, Beneficiary, Transaction, BankInfo } from '@/services/payment.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const BANK_LOGOS: Record<string, string> = {
    'SBI': 'https://logo.clearbit.com/sbi.co.in',
    'HDFC': 'https://logo.clearbit.com/hdfcbank.com',
    'ICICI': 'https://logo.clearbit.com/icicibank.com',
    'AXIS': 'https://logo.clearbit.com/axisbank.com',
    'PNB': 'https://logo.clearbit.com/pnbindia.in',
    'KOTAK': 'https://logo.clearbit.com/kotak.com',
    'BOB': 'https://logo.clearbit.com/bankofbaroda.in',
    'CANARA': 'https://logo.clearbit.com/canarabank.com',
    'UNION': 'https://logo.clearbit.com/unionbankofindia.co.in',
    'IDFC': 'https://logo.clearbit.com/idfcfirstbank.com',
    'FEDERAL': 'https://logo.clearbit.com/federalbank.co.in',
    'BOI': 'https://logo.clearbit.com/bankofindia.co.in'
};

const BANK_STYLES: Record<string, { background: string, color: string, border: string }> = {
    'SBI': { background: 'linear-gradient(135deg, #004e92 0%, #000428 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Deep Royal Blue
    'HDFC': { background: 'linear-gradient(135deg, #003366 0%, #001f3f 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Navy Blue
    'ICICI': { background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Orange-Red fire
    'AXIS': { background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Burgundy/Purple
    'KOTAK': { background: 'linear-gradient(135deg, #ed213a 0%, #93291e 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Red
    'PNB': { background: 'linear-gradient(135deg, #A71D31 0%, #3F0D12 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Dark Red
    'BOB': { background: 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)', color: '#1e293b', border: 'rgba(255,255,255,0.5)' }, // Orange/Yellow
    'IDFC': { background: 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Purple
    'YES': { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: '#fff', border: 'rgba(255,255,255,0.2)' }, // Green
    'DEFAULT': { background: '#f8fafc', color: '#1e293b', border: '#f1f5f9' }
};

export default function MoneyPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [supportedBanks, setSupportedBanks] = useState<BankInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const [heroAccountIndex, setHeroAccountIndex] = useState(0);

    // Dialog States
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [beneficiaryDialogOpen, setBeneficiaryDialogOpen] = useState(false);
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

    // Form States
    const [newAccount, setNewAccount] = useState({
        accountNumber: '', bank: null as BankInfo | null, holderName: '', pin: ''
    });
    const [newBeneficiary, setNewBeneficiary] = useState({
        name: '', accountNumber: '', ifscCode: '', phoneNumber: '', type: 'EXTERNAL' as 'INTERNAL' | 'EXTERNAL'
    });
    const [transferData, setTransferData] = useState({
        sourceAccountId: null as number | null,
        beneficiary: null as Beneficiary | null,
        amount: '',
        pin: '',
        description: '',
        step: 1 // 1: Select recipient, 2: Select source, 3: Amount/PIN, 4: Processing, 5: Success
    });

    const [showBalanceMap, setShowBalanceMap] = useState<Record<number, boolean>>({});
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({ accountNumber: false, bank: false, holderName: false, pin: false });
    const [touchedBen, setTouchedBen] = useState({ name: false, accountNumber: false, ifscCode: false, phoneNumber: false });
    const [successMessage, setSuccessMessage] = useState('');

    // Helper to find bank code from name (e.g. "State Bank of India" -> "SBI")
    const getBankCode = useCallback((bankName: string) => {
        const bank = supportedBanks.find(b => b.name === bankName);
        return bank ? bank.code : 'DEFAULT';
    }, [supportedBanks]);

    const loadData = useCallback(async () => {
        try {
            const [accs, bens, hist, banks] = await Promise.all([
                paymentService.getAccounts(),
                paymentService.getBeneficiaries(),
                paymentService.getHistory(),
                paymentService.getSupportedBanks()
            ]);
            setAccounts(accs);
            setBeneficiaries(bens);
            setHistory(hist);
            setSupportedBanks(banks);

            // Auto-select primary as source for transfer if available
            const primary = accs.find(a => a.isPrimary);
            if (primary) {
                setTransferData(prev => ({ ...prev, sourceAccountId: primary.id }));
            }
            return accs;
        } catch (err) {
            console.error('Failed to load money data', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleLinkAccount = async () => {
        setTouched({ accountNumber: true, bank: true, holderName: true, pin: true });

        // Validation Logic
        const isBankValid = !!newAccount.bank;
        const isAccNumValid = newAccount.accountNumber.length >= 9;
        const isNameValid = newAccount.holderName.length >= 3;
        const isPinValid = newAccount.pin.length === 6;

        if (!isBankValid || !isAccNumValid || !isNameValid || !isPinValid) {
            setError('Please correct the highlighted errors.');
            return;
        }

        setProcessing(true);
        setError('');
        try {
            // Backend validation requires valid IFSC length (11 chars)
            // We append a dummy branch code to the prefix
            const fullIfsc = `${newAccount.bank!.ifscPrefix}0001234`;

            await paymentService.linkAccount(
                newAccount.accountNumber,
                newAccount.bank!.name,
                fullIfsc,
                newAccount.holderName,
                newAccount.pin
            );
            setLinkDialogOpen(false);
            setNewAccount({ accountNumber: '', bank: null, holderName: '', pin: '' });
            setTouched({ accountNumber: false, bank: false, holderName: false, pin: false });
            setSuccessMessage('Bank account linked successfully!');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAccount = (id: number) => {
        setError('');
        setAccountToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;
        setProcessing(true);
        try {
            await paymentService.deleteAccount(accountToDelete);
            setSuccessMessage('Account removed successfully');
            loadData();
            setDeleteDialogOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
            setAccountToDelete(null);
        }
    };

    const handleSetPrimary = async (id: number) => {
        try {
            await paymentService.setPrimaryAccount(id);
            const updatedAccounts = await loadData();
            // Automatically switch Hero card to the new primary account
            const newIndex = updatedAccounts.findIndex(a => a.id === id);
            if (newIndex !== -1) {
                setHeroAccountIndex(newIndex);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAddBeneficiary = async () => {
        setTouchedBen({ name: true, accountNumber: true, ifscCode: true, phoneNumber: true });

        // Validation
        const isNameValid = newBeneficiary.name.length >= 3;
        const isAccValid = newBeneficiary.accountNumber.length >= 9;
        const isIfscValid = newBeneficiary.ifscCode.length === 11;

        if (!isNameValid || !isAccValid || !isIfscValid) {
            setError('Please correct the highlighted errors.');
            return;
        }

        setProcessing(true);
        setError('');
        try {
            await paymentService.addBeneficiary(
                newBeneficiary.name,
                newBeneficiary.accountNumber,
                newBeneficiary.ifscCode,
                newBeneficiary.phoneNumber,
                newBeneficiary.type
            );
            setBeneficiaryDialogOpen(false);
            setNewBeneficiary({ name: '', accountNumber: '', ifscCode: '', phoneNumber: '', type: 'EXTERNAL' });
            setTouchedBen({ name: false, accountNumber: false, ifscCode: false, phoneNumber: false });
            setSuccessMessage('Recipient added successfully!');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferData.sourceAccountId || !transferData.beneficiary) return;
        setTransferData(prev => ({ ...prev, step: 4 }));
        setError('');
        try {
            // Simulated delay for "Rock Solid" feel
            await new Promise(r => setTimeout(r, 2000));

            if (transferData.beneficiary.type === 'INTERNAL') {
                // Search user by phone if internal but id not present, or use service
                await paymentService.transferToAccount(
                    transferData.sourceAccountId,
                    transferData.beneficiary.name,
                    transferData.beneficiary.accountNumber,
                    transferData.beneficiary.ifscCode,
                    parseFloat(transferData.amount),
                    transferData.pin,
                    transferData.description
                );
            } else {
                await paymentService.transferToAccount(
                    transferData.sourceAccountId,
                    transferData.beneficiary.name,
                    transferData.beneficiary.accountNumber,
                    transferData.beneficiary.ifscCode,
                    parseFloat(transferData.amount),
                    transferData.pin,
                    transferData.description
                );
            }
            setTransferData(prev => ({ ...prev, step: 5 }));
            loadData();
        } catch (err: any) {
            setError(err.message);
            setTransferData(prev => ({ ...prev, step: 3 }));
        }
    };

    const toggleBalance = async (id: number) => {
        if (showBalanceMap[id]) {
            setShowBalanceMap(prev => ({ ...prev, [id]: false }));
            return;
        }
        // Request PIN to show balance
        setTransferData(prev => ({ ...prev, sourceAccountId: id, pin: '' }));
        setError('');
        setBalanceDialogOpen(true);
    };

    const handleCheckBalance = async () => {
        if (!transferData.sourceAccountId) return;
        setProcessing(true);
        setError('');
        try {
            const balance = await paymentService.checkBalance(transferData.sourceAccountId, transferData.pin);
            setAccounts(prev => prev.map(a => a.id === transferData.sourceAccountId ? { ...a, balance } : a));
            setShowBalanceMap(prev => ({ ...prev, [transferData.sourceAccountId!]: true }));
            setBalanceDialogOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
            setTransferData(prev => ({ ...prev, pin: '' }));
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Money">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress color="inherit" />
                </Box>
            </DashboardLayout>
        );
    }



    return (
        <DashboardLayout title="Money">
            <div className={styles.container}>
                {/* Header Card */}
                <div className={styles.headerCard}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerIcon}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div>
                            <h1 className={styles.headerTitle}>Money</h1>
                            <p className={styles.headerSubtitle}>Manage your wealth and transactions</p>
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {/* Main Cards Row */}
                    <Grid container spacing={4}>
                        {/* Account Card (Carousel) */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            {(() => {
                                if (accounts.length === 0) {
                                    return (
                                        <div
                                            className={styles.heroSection}
                                            style={{
                                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <div className={styles.heroContent} style={{ textAlign: 'center', padding: '20px 0' }}>
                                                <div style={{
                                                    width: 80, height: 80,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto 24px auto'
                                                }}>
                                                    <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                                                </div>
                                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
                                                    No Accounts Linked
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 400, mx: 'auto' }}>
                                                    Link your primary bank account to start sending money and tracking your wealth.
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    className={styles.goldBtn}
                                                    onClick={() => {
                                                        setError('');
                                                        setLinkDialogOpen(true);
                                                    }}
                                                    startIcon={<AddIcon />}
                                                    size="large"
                                                >
                                                    Link My First Bank Account
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                }

                                const activeAccount = accounts[heroAccountIndex] || accounts[0];
                                const bankCode = getBankCode(activeAccount.bankName);
                                const bankStyle = BANK_STYLES[bankCode] || BANK_STYLES['DEFAULT'];

                                return (
                                    <div
                                        className={styles.heroSection}
                                        style={{
                                            background: bankStyle.background,
                                            color: bankStyle.color,
                                            borderColor: bankStyle.border
                                        }}
                                    >
                                        <div className={styles.heroContent}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className={styles.balanceHeaderContainer}>
                                                    <span className={styles.balanceLabel} style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                        {activeAccount.isPrimary ? 'PRIMARY BALANCE' : 'ACCOUNT BALANCE'}
                                                    </span>
                                                    <IconButton onClick={() => toggleBalance(activeAccount.id)} className={styles.balanceToggle}>
                                                        {showBalanceMap[activeAccount.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </div>

                                                {/* Carousel Navigation */}
                                                {accounts.length > 1 && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setHeroAccountIndex(prev => prev === 0 ? accounts.length - 1 : prev - 1)}
                                                            sx={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                                                        >
                                                            <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setHeroAccountIndex(prev => prev === accounts.length - 1 ? 0 : prev + 1)}
                                                            sx={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                                                        >
                                                            <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                                                        </IconButton>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.balanceAmount}>
                                                <span className={styles.currency}>₹</span>
                                                {showBalanceMap[activeAccount.id] ? activeAccount.balance.toLocaleString('en-IN') : 'XXXXXX'}
                                            </div>
                                            <div className={styles.bankPill}>
                                                <Avatar
                                                    src={BANK_LOGOS[bankCode] || BANK_LOGOS['SBI']}
                                                    sx={{ width: 24, height: 24, bgcolor: 'white', p: 0.5 }}
                                                    variant="rounded"
                                                />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white' }}>
                                                    {activeAccount.bankName} •••• {activeAccount.accountNumber.slice(-4)}
                                                </Typography>
                                            </div>

                                            <div className={styles.cardActions}>
                                                <Button
                                                    variant="contained"
                                                    // Use white button for better contrast on colored cards
                                                    sx={{
                                                        bgcolor: 'white !important',
                                                        color: '#1e293b !important',
                                                        borderRadius: '12px',
                                                        py: '10px', px: '24px',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9) !important' }
                                                    }}
                                                    onClick={() => {
                                                        setError('');
                                                        setTransferData(prev => ({ ...prev, step: 1 }));
                                                        setTransferDialogOpen(true);
                                                    }}
                                                    startIcon={<SendIcon />}
                                                >
                                                    Send Money
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    className={styles.secondaryPill}
                                                    onClick={() => {
                                                        setError('');
                                                        setBeneficiaryDialogOpen(true);
                                                    }}
                                                >
                                                    Add Recipient
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </Grid>

                        {/* Multiple Accounts Sidebar */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <div className={styles.accountsColumn}>
                                <div className={styles.sectionHeader}>
                                    <Typography variant="h6">My Bank Accounts</Typography>
                                    <IconButton onClick={() => {
                                        setError('');
                                        setLinkDialogOpen(true);
                                    }} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </div>
                                <div className={styles.accountList}>
                                    {accounts.map(acc => {
                                        const bankCode = getBankCode(acc.bankName);
                                        const bankStyle = BANK_STYLES[bankCode] || BANK_STYLES['DEFAULT'];
                                        const isDefault = !BANK_STYLES[bankCode];

                                        return (
                                            <Card
                                                key={acc.id}
                                                className={`${styles.accListItem} ${acc.isPrimary ? styles.isPrimary : ''}`}
                                                sx={{
                                                    background: `${bankStyle.background} !important`,
                                                    borderColor: `${bankStyle.border} !important`,
                                                    color: `${bankStyle.color} !important`
                                                }}
                                            >
                                                <div className={styles.accInfo}>
                                                    <Avatar
                                                        src={BANK_LOGOS[bankCode]}
                                                        variant="rounded"
                                                        className={styles.bankLogoAvatar}
                                                        sx={{
                                                            width: 40, height: 40,
                                                            bgcolor: 'white',
                                                            p: 0.5,
                                                            borderRadius: '10px'
                                                        }}
                                                    />
                                                    <div>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'inherit' }}>{acc.bankName}</Typography>
                                                        <Typography variant="caption" sx={{ color: isDefault ? 'text.secondary' : 'rgba(255,255,255,0.7)' }}>
                                                            •••• {acc.accountNumber.slice(-4)}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div className={styles.accActions}>
                                                    {acc.isPrimary ? (
                                                        <Chip
                                                            label="Primary"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 800,
                                                                fontSize: 10,
                                                                bgcolor: 'white',
                                                                color: '#1e293b',
                                                                mr: 1
                                                            }}
                                                        />
                                                    ) : (
                                                        <Tooltip title="Set as Primary">
                                                            <IconButton
                                                                onClick={() => handleSetPrimary(acc.id)}
                                                                size="small"
                                                                sx={{ color: isDefault ? 'text.secondary' : 'rgba(255,255,255,0.7)', '&:hover': { color: isDefault ? 'text.primary' : 'white' } }}
                                                            >
                                                                <StarBorderIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <IconButton
                                                        onClick={() => toggleBalance(acc.id)}
                                                        size="small"
                                                        sx={{ color: isDefault ? 'text.secondary' : 'rgba(255,255,255,0.7)', '&:hover': { color: isDefault ? 'text.primary' : 'white' } }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDeleteAccount(acc.id)}
                                                        size="small"
                                                        sx={{ color: isDefault ? '#ef4444' : 'rgba(255,255,255,0.9)', '&:hover': { color: isDefault ? '#dc2626' : 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </Grid>
                    </Grid>

                    {/* Middle Section: Recipients & Quick Actions */}
                    {accounts.length > 0 && (
                        <>
                            <div className={styles.middleSection}>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <div className={styles.analyticsCard}>
                                            <div className={styles.sectionHeader}>
                                                <div>
                                                    <Typography variant="h6">Spending Analysis</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        You spent ₹{history.filter(t => t.sender === 'current').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')} this month
                                                    </Typography>
                                                </div>
                                                <Button
                                                    size="small"
                                                    endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
                                                >
                                                    View Report
                                                </Button>
                                            </div>
                                            <div className={styles.chartContainer}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={[
                                                            { name: '1', amount: 4000 },
                                                            { name: '5', amount: 3000 },
                                                            { name: '10', amount: 2000 },
                                                            { name: '15', amount: 2780 },
                                                            { name: '20', amount: 1890 },
                                                            { name: '25', amount: 2390 },
                                                            { name: '30', amount: 3490 },
                                                        ]}
                                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                        <ChartTooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                        />
                                                        <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <div className={styles.recipientsGrid} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div className={styles.sectionHeader}>
                                                <Typography variant="h6">Quick Transfer</Typography>
                                                <Button
                                                    size="small"
                                                    onClick={() => { console.log('View all recipients') }}
                                                >
                                                    All
                                                </Button>
                                            </div>
                                            <div className={styles.recipientsScroll} style={{ flexWrap: 'wrap', overflow: 'hidden', justifyContent: 'center' }}>
                                                <div
                                                    className={styles.addBenCircle}
                                                    onClick={() => {
                                                        setError('');
                                                        setBeneficiaryDialogOpen(true);
                                                    }}
                                                >
                                                    <AddIcon />
                                                    <span>New</span>
                                                </div>
                                                {beneficiaries.slice(0, 3).map(ben => (
                                                    <div
                                                        key={ben.id}
                                                        className={styles.benCircle}
                                                        onClick={() => {
                                                            setTransferData(prev => ({
                                                                ...prev,
                                                                beneficiary: ben,
                                                                step: 3
                                                            }));
                                                            setTransferDialogOpen(true);
                                                        }}
                                                    >
                                                        <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: '#f1f5f9', color: '#1e293b', fontWeight: 700 }}>
                                                            {ben.name[0]}
                                                        </Avatar>
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{ben.name.split(' ')[0]}</Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>

                            {/* Recent Transactions */}
                            <div className={styles.historySection}>
                                <div className={styles.sectionHeader}>
                                    <Typography variant="h6">Recent Transactions</Typography>
                                    <Button onClick={() => { console.log('View full history') }}>Full History</Button>
                                </div>
                                <div className={styles.txList}>
                                    {history.length === 0 ? (
                                        <div className={styles.emptyItems}>No recent transactions</div>
                                    ) : (
                                        history.slice(0, 5).map(tx => (
                                            <div key={tx.id} className={styles.txItem}>
                                                <Avatar sx={{ bgcolor: tx.sender === 'current' ? '#fef2f2' : '#f0fdf4', color: tx.sender === 'current' ? '#ef4444' : '#22c55e' }}>
                                                    {tx.sender === 'current' ? <ArrowForwardIosIcon sx={{ transform: 'rotate(-45deg)', fontSize: 14 }} /> : <ArrowForwardIosIcon sx={{ transform: 'rotate(135deg)', fontSize: 14 }} />}
                                                </Avatar>
                                                <div className={styles.txInfo}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                                        {tx.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(tx.timestamp).toLocaleString()}
                                                    </Typography>
                                                </div>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 900,
                                                        color: tx.sender === 'current' ? '#ef4444' : '#22c55e'
                                                    }}
                                                >
                                                    {tx.sender === 'current' ? '-' : '+'} ₹{tx.amount}
                                                </Typography>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>

            {/* Link Account Dialog */}
            <Dialog
                open={linkDialogOpen}
                onClose={() => {
                    setLinkDialogOpen(false);
                    setNewAccount({ accountNumber: '', bank: null, holderName: '', pin: '' });
                    setTouched({ accountNumber: false, bank: false, holderName: false, pin: false });
                    setError('');
                }}
                PaperProps={{
                    style: { backgroundColor: 'transparent', boxShadow: 'none' }
                }}
            >
                <div className={styles.dialogPaper}>
                    <DialogTitle className={styles.dialogTitle}>Link Account</DialogTitle>
                    <DialogContent>
                        <div className={styles.formContainer}>
                            <Autocomplete
                                options={supportedBanks}
                                getOptionLabel={(option) => option.name}
                                value={newAccount.bank}
                                onChange={(e, val) => setNewAccount(p => ({ ...p, bank: val }))}
                                onBlur={() => setTouched(p => ({ ...p, bank: true }))}
                                renderInput={(params) => <TextField
                                    {...params}
                                    label="Select Bank"
                                    variant="outlined"
                                    className={styles.goldInput}
                                    error={touched.bank && !newAccount.bank}
                                    helperText={touched.bank && !newAccount.bank ? "Please select a bank" : ""}
                                    inputProps={{ ...params.inputProps, autoComplete: 'off' }}
                                />}
                            />
                            <TextField
                                fullWidth
                                label="Account Number"
                                variant="outlined"
                                className={styles.goldInput}
                                value={newAccount.accountNumber}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setNewAccount(p => ({ ...p, accountNumber: val }));
                                }}
                                onBlur={() => setTouched(p => ({ ...p, accountNumber: true }))}
                                error={touched.accountNumber && (newAccount.accountNumber.length === 0 || newAccount.accountNumber.length < 9)}
                                helperText={touched.accountNumber && (newAccount.accountNumber.length === 0 || newAccount.accountNumber.length < 9) ? "Invalid account number" : ""}
                                autoComplete="off"
                                name="new-account-number-field"
                                id="new-account-number-field"
                            />
                            <TextField
                                fullWidth
                                label="Account Holder Name"
                                variant="outlined"
                                className={styles.goldInput}
                                value={newAccount.holderName}
                                onChange={e => setNewAccount(p => ({ ...p, holderName: e.target.value }))}
                                onBlur={() => setTouched(p => ({ ...p, holderName: true }))}
                                error={touched.holderName && newAccount.holderName.length > 0 && newAccount.holderName.length < 3}
                                helperText={touched.holderName && newAccount.holderName.length > 0 && newAccount.holderName.length < 3 ? "Name must be at least 3 characters" : ""}
                                autoComplete="off"
                                name="new-account-holder-name-field"
                                id="new-account-holder-name-field"
                            />
                            <TextField
                                fullWidth
                                label="SET UPI PIN (6 Digits)"
                                type="password"
                                variant="outlined"
                                className={styles.goldInput}
                                value={newAccount.pin}
                                onChange={e => {
                                    if (e.target.value.length <= 6) {
                                        setNewAccount(p => ({ ...p, pin: e.target.value }));
                                    }
                                }}
                                onBlur={() => setTouched(p => ({ ...p, pin: true }))}
                                error={touched.pin && newAccount.pin.length !== 6}
                                helperText={touched.pin && newAccount.pin.length !== 6 ? "PIN must be 6 digits" : ""}
                                autoComplete="new-password"
                                name="new-upi-pin-field"
                                id="new-upi-pin-field"
                            />
                            {error && <Alert severity="error">{error}</Alert>}
                        </div>
                    </DialogContent>
                    <DialogActions className={styles.dialogActions}>
                        <Button onClick={() => {
                            setLinkDialogOpen(false);
                            setNewAccount({ accountNumber: '', bank: null, holderName: '', pin: '' });
                            setTouched({ accountNumber: false, bank: false, holderName: false, pin: false });
                            setError('');
                        }} className={styles.cancelBtn}>Cancel</Button>
                        <Button
                            onClick={handleLinkAccount}
                            variant="contained"
                            disabled={processing}
                            className={styles.goldBtn}
                        >
                            {processing ? <CircularProgress size={24} /> : 'Verify & Link'}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Add Recipient Dialog */}
            <Dialog
                open={beneficiaryDialogOpen}
                onClose={() => {
                    setBeneficiaryDialogOpen(false);
                    setNewBeneficiary({ name: '', accountNumber: '', ifscCode: '', phoneNumber: '', type: 'EXTERNAL' });
                    setTouchedBen({ name: false, accountNumber: false, ifscCode: false, phoneNumber: false });
                    setError('');
                }}
                PaperProps={{
                    style: { backgroundColor: 'transparent', boxShadow: 'none' }
                }}
            >
                <div className={styles.dialogPaper}>
                    <DialogTitle className={styles.dialogTitle}>Add Recipient</DialogTitle>
                    <DialogContent>
                        <div className={styles.formContainer}>
                            <TextField
                                fullWidth label="Full Name"
                                className={styles.goldInput}
                                value={newBeneficiary.name}
                                onChange={e => setNewBeneficiary(p => ({ ...p, name: e.target.value }))}
                                onBlur={() => setTouchedBen(p => ({ ...p, name: true }))}
                                error={touchedBen.name && newBeneficiary.name.length < 3}
                                helperText={touchedBen.name && newBeneficiary.name.length < 3 ? "Name must be at least 3 characters" : ""}
                                autoComplete="off"
                                name="new-ben-name"
                                id="new-ben-name"
                            />
                            <TextField
                                fullWidth label="Bank Account Number"
                                className={styles.goldInput}
                                value={newBeneficiary.accountNumber}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setNewBeneficiary(p => ({ ...p, accountNumber: val }));
                                }}
                                onBlur={() => setTouchedBen(p => ({ ...p, accountNumber: true }))}
                                error={touchedBen.accountNumber && newBeneficiary.accountNumber.length < 9}
                                helperText={touchedBen.accountNumber && newBeneficiary.accountNumber.length < 9 ? "Invalid account number" : ""}
                                autoComplete="off"
                                name="new-ben-acc-num"
                                id="new-ben-acc-num"
                            />
                            <TextField
                                fullWidth label="IFSC Code"
                                className={styles.goldInput}
                                value={newBeneficiary.ifscCode}
                                onChange={e => setNewBeneficiary(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                                onBlur={() => setTouchedBen(p => ({ ...p, ifscCode: true }))}
                                error={touchedBen.ifscCode && newBeneficiary.ifscCode.length !== 11}
                                helperText={touchedBen.ifscCode && newBeneficiary.ifscCode.length !== 11 ? "IFSC must be 11 characters" : ""}
                                autoComplete="off"
                                name="new-ben-ifsc"
                                id="new-ben-ifsc"
                            />
                            <TextField
                                fullWidth label="Mobile Number (Optional)"
                                className={styles.goldInput}
                                value={newBeneficiary.phoneNumber}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setNewBeneficiary(p => ({ ...p, phoneNumber: val }));
                                }}
                                autoComplete="off"
                                name="new-ben-phone"
                                id="new-ben-phone"
                            />
                            {error && <Alert severity="error">{error}</Alert>}
                        </div>
                    </DialogContent>
                    <DialogActions className={styles.dialogActions}>
                        <Button onClick={() => {
                            setBeneficiaryDialogOpen(false);
                            setNewBeneficiary({ name: '', accountNumber: '', ifscCode: '', phoneNumber: '', type: 'EXTERNAL' });
                            setTouchedBen({ name: false, accountNumber: false, ifscCode: false, phoneNumber: false });
                            setError('');
                        }} className={styles.cancelBtn}>Cancel</Button>
                        <Button
                            onClick={handleAddBeneficiary}
                            variant="contained"
                            disabled={processing}
                            className={styles.goldBtn}
                        >
                            {processing ? <CircularProgress size={24} /> : 'Save Recipient'}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Transfer Money Wizard */}
            <Dialog
                open={transferDialogOpen}
                onClose={() => setTransferDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, width: 450 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {transferData.step === 5 ? 'Success' : 'Send Money'}
                    {transferData.step > 1 && transferData.step < 5 && (
                        <IconButton size="small" onClick={() => setTransferData(p => ({ ...p, step: p.step - 1 }))}>
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    {transferData.step === 1 && (
                        <Box sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Select Recipient</Typography>
                            <Grid container spacing={2}>
                                {beneficiaries.map(ben => (
                                    <Grid size={{ xs: 6 }} key={ben.id}>
                                        <Card
                                            className={`${styles.benSelectionCard} ${transferData.beneficiary?.id === ben.id ? styles.selected : ''}`}
                                            onClick={() => setTransferData(p => ({ ...p, beneficiary: ben, step: 2 }))}
                                        >
                                            <Avatar sx={{ mb: 1 }}>{ben.name[0]}</Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{ben.name}</Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {transferData.step === 2 && (
                        <Box sx={{ py: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Pay From</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {accounts.map(acc => (
                                    <Card
                                        key={acc.id}
                                        className={`${styles.accSelectionCard} ${transferData.sourceAccountId === acc.id ? styles.selected : ''}`}
                                        onClick={() => setTransferData(p => ({ ...p, sourceAccountId: acc.id, step: 3 }))}
                                    >
                                        <div className={styles.accInfo}>
                                            <Avatar src={BANK_LOGOS[acc.bankName.toUpperCase()]} sx={{ width: 32, height: 32 }} />
                                            <div>
                                                <Typography variant="subtitle2">{acc.bankName}</Typography>
                                                <Typography variant="caption">{acc.accountNumber}</Typography>
                                            </div>
                                        </div>
                                        {acc.isPrimary && <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />}
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {transferData.step === 3 && (
                        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: '#f1f5f9', color: '#1e293b' }}>
                                    {transferData.beneficiary?.name[0]}
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>{transferData.beneficiary?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{transferData.beneficiary?.accountNumber}</Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Amount (₹)"
                                type="number"
                                variant="outlined"
                                className={styles.goldInput}
                                value={transferData.amount}
                                onChange={e => setTransferData(p => ({ ...p, amount: e.target.value }))}
                                autoFocus
                            />
                            <TextField
                                fullWidth
                                label="What's this for? (Optional)"
                                variant="outlined"
                                className={styles.goldInput}
                                value={transferData.description}
                                onChange={e => setTransferData(p => ({ ...p, description: e.target.value }))}
                            />
                            <TextField
                                fullWidth
                                label="ENTER 6-DIGIT UPI PIN"
                                type="password"
                                variant="outlined"
                                className={styles.goldInput}
                                value={transferData.pin}
                                onChange={e => setTransferData(p => ({ ...p, pin: e.target.value }))}
                            />
                            {error && <Alert severity="error">{error}</Alert>}

                            <Button
                                fullWidth
                                variant="contained"
                                className={styles.goldBtn}
                                onClick={handleTransfer}
                                disabled={!transferData.amount || !transferData.pin}
                                size="large"
                            >
                                Confirm Transfer ₹{transferData.amount}
                            </Button>
                        </Box>
                    )}

                    {transferData.step === 4 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CircularProgress color="warning" size={60} thickness={4} />
                            <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>Connecting with {accounts.find(a => a.id === transferData.sourceAccountId)?.bankName}...</Typography>
                            <Typography variant="caption" color="text.secondary">Securely processing your payment request</Typography>
                        </Box>
                    )}

                    {transferData.step === 5 && (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Payment Successful</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>₹{transferData.amount}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Transferred to {transferData.beneficiary?.name}
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ borderRadius: '12px' }}
                                onClick={() => setTransferDialogOpen(false)}
                            >
                                Done
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Verification Dialog for Balance View */}
            <Dialog
                open={balanceDialogOpen}
                onClose={() => setBalanceDialogOpen(false)}
                PaperProps={{
                    style: { backgroundColor: 'transparent', boxShadow: 'none' }
                }}
            >
                <div className={styles.dialogPaper}>
                    <DialogTitle className={styles.dialogTitle}>Verify Security PIN</DialogTitle>
                    <DialogContent>
                        <div className={styles.formContainer}>
                            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
                                Enter your 6-digit UPI PIN to view account balance securely.
                            </Typography>
                            <TextField
                                fullWidth
                                type="password"
                                label="ENTER 6-DIGIT PIN"
                                variant="outlined"
                                className={styles.goldInput}
                                value={transferData.pin}
                                onChange={e => setTransferData(p => ({ ...p, pin: e.target.value }))}
                                autoComplete="new-password"
                                name="verify-pin-field"
                                id="verify-pin-field"
                                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' } }}
                            />
                            {error && <Alert severity="error">{error}</Alert>}
                        </div>
                    </DialogContent>
                    <DialogActions className={styles.dialogActions}>
                        <Button onClick={() => setBalanceDialogOpen(false)} className={styles.cancelBtn}>Cancel</Button>
                        <Button
                            onClick={handleCheckBalance}
                            variant="contained"
                            disabled={processing || transferData.pin.length !== 6}
                            className={styles.goldBtn}
                        >
                            {processing ? <CircularProgress size={24} /> : 'Verify & Show Balance'}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    style: { backgroundColor: 'transparent', boxShadow: 'none' }
                }}
            >
                <div className={styles.dialogPaper}>
                    <DialogTitle className={styles.dialogTitle}>Unlink Bank Account</DialogTitle>
                    <DialogContent>
                        <div className={styles.formContainer} style={{ alignItems: 'center', textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: '#fee2e2', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', marginBottom: '16px'
                            }}>
                                <DeleteIcon sx={{ fontSize: 40, color: '#ef4444' }} />
                            </div>
                            <Typography variant="h6" gutterBottom>
                                Are you sure you want to unlink this account?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This will remove it from your dashboard. Your transaction history will be preserved.
                            </Typography>
                            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                        </div>
                    </DialogContent>
                    <DialogActions className={styles.dialogActions}>
                        <Button onClick={() => setDeleteDialogOpen(false)} className={styles.cancelBtn}>Cancel</Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant="contained"
                            disabled={processing}
                            sx={{
                                bgcolor: '#ef4444 !important',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                padding: '10px 24px',
                                '&:hover': { bgcolor: '#dc2626 !important' }
                            }}
                        >
                            {processing ? <CircularProgress size={24} color="inherit" /> : 'Yes, Unlink'}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Success Toast */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </DashboardLayout >
    );
}

// Sub-components as markers for code structure
const ArrowBackIcon = (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg>;
