import { env } from '@/utils/env';

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
    private getHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async getSupportedBanks(): Promise<BankInfo[]> {
        try {
            const response = await fetch(`${env.apiUrl}/api/payments/banks`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching banks:', error);
            return [];
        }
    }

    async getAccount(): Promise<BankAccount | null> {
        try {
            const response = await fetch(`${env.apiUrl}/api/payments/account`, {
                headers: this.getHeaders()
            });
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching bank account:', error);
            return null;
        }
    }

    async linkAccount(accountNumber: string, bankName: string, ifscCode: string,
        accountHolderName: string, upiPin: string): Promise<BankAccount> {
        const response = await fetch(`${env.apiUrl}/api/payments/link`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ accountNumber, bankName, ifscCode, accountHolderName, upiPin })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to link bank account');
        }
        return await response.json();
    }

    async searchUserByPhone(phone: string): Promise<any> {
        const response = await fetch(`${env.apiUrl}/api/payments/search?phone=${encodeURIComponent(phone)}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('User not found');
        return await response.json();
    }

    async transferMoney(receiverId: number, amount: number, upiPin: string, description: string): Promise<Transaction> {
        const response = await fetch(`${env.apiUrl}/api/payments/transfer`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ receiverId, amount, upiPin, description })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Transfer failed');
        }
        return await response.json();
    }

    async transferToAccount(
        recipientName: string,
        accountNumber: string,
        ifsc: string,
        amount: number,
        upiPin: string,
        description: string
    ): Promise<Transaction> {
        const response = await fetch(`${env.apiUrl}/api/payments/transfer-external`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ recipientName, accountNumber, ifsc, amount, upiPin, description })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Transfer failed');
        }
        return await response.json();
    }

    async getHistory(): Promise<Transaction[]> {
        try {
            const response = await fetch(`${env.apiUrl}/api/payments/history`, {
                headers: this.getHeaders()
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return [];
        }
    }

    async checkBalance(upiPin: string): Promise<number> {
        const response = await fetch(`${env.apiUrl}/api/payments/check-balance`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ upiPin })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to fetch balance');
        }
        const data = await response.json();
        return data.balance;
    }
}

const paymentService = new PaymentService();
export default paymentService;
