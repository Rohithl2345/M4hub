import { env } from '@/utils/env';

export interface BankAccount {
    id: number;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
    isVerified: boolean;
    balance: number;
    isPrimary: boolean;
}

export interface Beneficiary {
    id: number;
    name: string;
    accountNumber: string;
    ifscCode: string;
    phoneNumber?: string;
    type: 'INTERNAL' | 'EXTERNAL';
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

    async getAccounts(): Promise<BankAccount[]> {
        try {
            const response = await fetch(`${env.apiUrl}/api/payments/accounts`, {
                headers: this.getHeaders()
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            return [];
        }
    }

    async setPrimaryAccount(accountId: number): Promise<void> {
        const response = await fetch(`${env.apiUrl}/api/payments/accounts/${accountId}/primary`, {
            method: 'POST',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to set primary account');
    }

    async deleteAccount(accountId: number): Promise<void> {
        const response = await fetch(`${env.apiUrl}/api/payments/accounts/${accountId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete account');
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

    async getBeneficiaries(): Promise<Beneficiary[]> {
        const response = await fetch(`${env.apiUrl}/api/payments/beneficiaries`, {
            headers: this.getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    }

    async addBeneficiary(name: string, accountNumber: string, ifscCode: string, phoneNumber: string, type: 'INTERNAL' | 'EXTERNAL'): Promise<Beneficiary> {
        const response = await fetch(`${env.apiUrl}/api/payments/beneficiaries`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, accountNumber, ifscCode, phoneNumber, type })
        });
        if (!response.ok) throw new Error('Failed to add recipient');
        return await response.json();
    }

    async deleteBeneficiary(id: number): Promise<void> {
        const response = await fetch(`${env.apiUrl}/api/payments/beneficiaries/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete recipient');
    }

    async searchUserByPhone(phone: string): Promise<any> {
        const response = await fetch(`${env.apiUrl}/api/payments/search?phone=${encodeURIComponent(phone)}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('User not found');
        return await response.json();
    }

    async transferMoney(sourceAccountId: number, receiverId: number, amount: number, upiPin: string, description: string): Promise<Transaction> {
        const response = await fetch(`${env.apiUrl}/api/payments/transfer`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ sourceAccountId, receiverId, amount, upiPin, description })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Transfer failed');
        }
        return await response.json();
    }

    async transferToAccount(
        sourceAccountId: number,
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
            body: JSON.stringify({ sourceAccountId, recipientName, accountNumber, ifsc, amount, upiPin, description })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Transfer failed');
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

    async checkBalance(accountId: number, upiPin: string): Promise<number> {
        const response = await fetch(`${env.apiUrl}/api/payments/check-balance`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ accountId, upiPin })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch balance');
        }
        const data = await response.json();
        return data.balance;
    }
}

const paymentService = new PaymentService();
export default paymentService;
