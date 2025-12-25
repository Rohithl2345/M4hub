'use client';

import DashboardLayout from '@/components/DashboardLayout';
import styles from './money.module.css';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function MoneyPage() {
    const recentTransactions = [
        { id: 1, type: 'credit', title: 'Salary Deposit', amount: '+$3,500', date: 'Jan 15' },
        { id: 2, type: 'debit', title: 'Netflix Subscription', amount: '-$12.99', date: 'Jan 14' },
        { id: 3, type: 'debit', title: 'Grocery Shopping', amount: '-$125.50', date: 'Jan 13' },
        { id: 4, type: 'credit', title: 'Freelance Project', amount: '+$850', date: 'Jan 12' },
    ];

    return (
        <DashboardLayout title="Money">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <AccountBalanceWalletIcon className={styles.headerIcon} />
                    <div>
                        <h1 className={styles.title}>Money Management</h1>
                        <p className={styles.subtitle}>Track your finances and manage your wallet</p>
                    </div>
                </div>

                {/* Balance Card */}
                <div className={styles.balanceCard}>
                    <div className={styles.balanceInfo}>
                        <p className={styles.balanceLabel}>Total Balance</p>
                        <h2 className={styles.balanceAmount}>$12,453.75</h2>
                        <p className={styles.balanceChange}>
                            <TrendingUpIcon className={styles.trendIcon} />
                            <span>+12.5% from last month</span>
                        </p>
                    </div>
                    <button className={styles.addMoneyBtn}>Add Money</button>
                </div>

                {/* Quick Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <AccountBalanceIcon className={styles.statIcon} />
                        <div>
                            <h3>$8,234</h3>
                            <p>Bank Account</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <CreditCardIcon className={styles.statIcon} />
                        <div>
                            <h3>$4,219</h3>
                            <p>Credit Cards</p>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Transactions</h2>
                    <div className={styles.transactionsList}>
                        {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className={styles.transactionCard}>
                                <div className={`${styles.transactionIcon} ${styles[transaction.type]}`}>
                                    {transaction.type === 'credit' ? '+' : '-'}
                                </div>
                                <div className={styles.transactionInfo}>
                                    <h4>{transaction.title}</h4>
                                    <p>{transaction.date}</p>
                                </div>
                                <div className={`${styles.amount} ${styles[transaction.type]}`}>
                                    {transaction.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon */}
                <div className={styles.comingSoon}>
                    <h3>💰 More Features Coming Soon!</h3>
                    <p>Building powerful financial management tools for you</p>
                    <ul>
                        <li>Bill payments</li>
                        <li>Investment tracking</li>
                        <li>Budget planning</li>
                        <li>Money transfers</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
