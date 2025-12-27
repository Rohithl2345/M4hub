import axios from 'axios';
import { APP_CONFIG } from '../constants';
const API_URL = APP_CONFIG.API_URL;

export interface BankAccount {
    id: number;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
    isVerified: boolean;
    balance: number;
}

export interface BankInfo {
    code: string;
    name: string;
    ifscPrefix: string;
}

export interface Transaction {
    id: number;
    sender: any;
    receiver: any;
    amount: number;
    timestamp: string;
    description: string;
    status: string;
}

class PaymentService {
    async getSupportedBanks(): Promise<BankInfo[]> {
        try {
            const response = await axios.get(`${API_URL}/api/payments/banks`);
            return response.data;
        } catch (error) {
            console.error('Error fetching banks:', error);
            return [];
        }
    }

    async getAccount(token: string): Promise<BankAccount | null> {
        try {
            const response = await axios.get(`${API_URL}/api/payments/account`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.status === 204 ? null : response.data;
        } catch (error) {
            console.error('Error fetching bank account:', error);
            return null;
        }
    }

    async linkAccount(token: string, accountNumber: string, bankName: string,
        ifscCode: string, accountHolderName: string, upiPin: string): Promise<BankAccount> {
        const response = await axios.post(`${API_URL}/api/payments/link`,
            { accountNumber, bankName, ifscCode, accountHolderName, upiPin },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async searchUserByPhone(phone: string): Promise<any> {
        const response = await axios.get(`${API_URL}/api/payments/search`, {
            params: { phone }
        });
        return response.data;
    }

    async transferMoney(token: string, receiverId: number, amount: number, upiPin: string, description: string): Promise<Transaction> {
        const response = await axios.post(`${API_URL}/api/payments/transfer`,
            { receiverId, amount, upiPin, description },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async transferToAccount(token: string, recipientName: string, accountNumber: string, ifsc: string, amount: number, upiPin: string, description: string): Promise<Transaction> {
        const response = await axios.post(`${API_URL}/api/payments/transfer-external`,
            { recipientName, accountNumber, ifsc, amount, upiPin, description },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

    async getHistory(token: string): Promise<Transaction[]> {
        try {
            const response = await axios.get(`${API_URL}/api/payments/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return [];
        }
    }
    async checkBalance(token: string, upiPin: string): Promise<number> {
        const response = await axios.post(`${API_URL}/api/payments/check-balance`,
            { upiPin },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.balance;
    }
}

export default new PaymentService();
