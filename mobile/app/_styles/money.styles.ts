import { StyleSheet } from 'react-native';

export const moneyStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    balanceCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    balanceGradient: {
        padding: 24,
    },
    balanceInfo: {
        marginBottom: 20,
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    balanceChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    balanceChangeText: {
        fontSize: 14,
        color: 'white',
    },
    addMoneyBtn: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        alignSelf: 'center',
    },
    addMoneyBtnText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    creditIcon: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    debitIcon: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    transactionIconText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 14,
        color: '#999',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    creditAmount: {
        color: '#4caf50',
    },
    debitAmount: {
        color: '#f44336',
    },
    comingSoon: {
        backgroundColor: '#f5f7fa',
        padding: 24,
        margin: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    comingSoonTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    comingSoonText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    featureItem: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    featureText: {
        fontSize: 12,
        color: '#f5576c',
        fontWeight: '500',
    },
});
