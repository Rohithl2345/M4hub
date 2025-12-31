/**
 * Payment validation utilities for M4Hub Money feature
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate amount for transfers
 */
export function validateAmount(amount: string | number, balance?: number): ValidationResult {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (!amount || amount === '' || amount === null || amount === undefined) {
        return { isValid: false, error: 'Amount is required' };
    }

    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Please enter a valid amount' };
    }

    if (numAmount <= 0) {
        return { isValid: false, error: 'Amount must be greater than ₹0' };
    }

    // Minimum transaction amount
    if (numAmount < 1) {
        return { isValid: false, error: 'Minimum transaction amount is ₹1' };
    }

    // Maximum single transaction (configurable)
    const MAX_TRANSACTION = 100000; // ₹1,00,000
    if (numAmount > MAX_TRANSACTION) {
        return { isValid: false, error: `Maximum transaction amount is ₹${MAX_TRANSACTION.toLocaleString()}` };
    }

    // Check balance if provided
    if (balance !== undefined && numAmount > balance) {
        return { isValid: false, error: 'Insufficient balance' };
    }

    // Check for too many decimal places
    const decimalPlaces = amount.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 2) {
        return { isValid: false, error: 'Amount can have at most 2 decimal places' };
    }

    return { isValid: true };
}

/**
 * Validate UPI PIN
 */
export function validateUPIPin(pin: string): ValidationResult {
    if (!pin || pin.trim() === '') {
        return { isValid: false, error: 'UPI PIN is required' };
    }

    if (pin.length !== 6) {
        return { isValid: false, error: 'UPI PIN must be 6 digits' };
    }

    if (!/^\d+$/.test(pin)) {
        return { isValid: false, error: 'UPI PIN must contain only numbers' };
    }

    // Check for trivial patterns
    const trivialPatterns = [
        /^123456$/,
        /^654321$/,
        /^000000$/,
        /^111111$/,
        /^(\d)\1{5}$/, // All same digits
    ];

    for (const pattern of trivialPatterns) {
        if (pattern.test(pin)) {
            return { isValid: false, error: 'PIN is too weak. Please choose a different PIN' };
        }
    }

    return { isValid: true };
}

/**
 * Validate bank account number
 */
export function validateAccountNumber(accountNumber: string): ValidationResult {
    if (!accountNumber || accountNumber.trim() === '') {
        return { isValid: false, error: 'Account number is required' };
    }

    // Remove spaces and hyphens
    const cleanNumber = accountNumber.replace(/[\s\-]/g, '');

    // Check if only digits
    if (!/^\d+$/.test(cleanNumber)) {
        return { isValid: false, error: 'Account number must contain only numbers' };
    }

    // Indian bank account numbers are typically 9-18 digits
    if (cleanNumber.length < 9) {
        return { isValid: false, error: 'Account number must be at least 9 digits' };
    }

    if (cleanNumber.length > 18) {
        return { isValid: false, error: 'Account number cannot exceed 18 digits' };
    }

    return { isValid: true };
}

/**
 * Validate IFSC code
 */
export function validateIFSC(ifsc: string): ValidationResult {
    if (!ifsc || ifsc.trim() === '') {
        return { isValid: false, error: 'IFSC code is required' };
    }

    const cleanIFSC = ifsc.toUpperCase().trim();

    // IFSC format: 4 letters (bank code) + 0 + 6 alphanumeric (branch code)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!ifscRegex.test(cleanIFSC)) {
        return {
            isValid: false,
            error: 'Invalid IFSC code format (e.g., SBIN0001234)'
        };
    }

    return { isValid: true };
}

/**
 * Validate account holder name
 */
export function validateAccountHolderName(name: string): ValidationResult {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Account holder name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Name must be less than 100 characters' };
    }

    // Allow letters, spaces, dots, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s.\-']+$/;
    if (!nameRegex.test(name)) {
        return { isValid: false, error: 'Name can only contain letters, spaces, dots, hyphens, and apostrophes' };
    }

    return { isValid: true };
}

/**
 * Validate phone number for money transfer
 */
export function validatePhoneNumber(phone: string): ValidationResult {
    if (!phone || phone.trim() === '') {
        return { isValid: false, error: 'Phone number is required' };
    }

    // Remove spaces, hyphens, and country code
    const cleanPhone = phone.replace(/[\s\-+]/g, '');

    // Check for 10-digit Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    return { isValid: true };
}

/**
 * Validate transaction description
 */
export function validateDescription(description: string, maxLength: number = 100): ValidationResult {
    // Description is optional, so empty is valid
    if (!description || description.trim() === '') {
        return { isValid: true };
    }

    if (description.length > maxLength) {
        return { isValid: false, error: `Description must be less than ${maxLength} characters` };
    }

    // Check for potentially harmful content
    const forbiddenPatterns = [
        /<script/i,
        /javascript:/i,
        /onclick/i,
        /onerror/i,
    ];

    for (const pattern of forbiddenPatterns) {
        if (pattern.test(description)) {
            return { isValid: false, error: 'Description contains invalid characters' };
        }
    }

    return { isValid: true };
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return '0.00';
    }

    return numAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Mask account number (show only last 4 digits)
 */
export function maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) {
        return '****';
    }

    const lastFour = accountNumber.slice(-4);
    const masked = '*'.repeat(Math.max(0, accountNumber.length - 4));
    return masked + lastFour;
}

/**
 * Mask UPI PIN
 */
export function maskUPIPin(pin: string): string {
    return '*'.repeat(pin.length);
}

/**
 * Format IFSC code (add space after 4th character for readability)
 */
export function formatIFSC(ifsc: string): string {
    const cleanIFSC = ifsc.toUpperCase().replace(/\s/g, '');
    if (cleanIFSC.length > 4) {
        return cleanIFSC.slice(0, 4) + ' ' + cleanIFSC.slice(4);
    }
    return cleanIFSC;
}

/**
 * Check if transaction amount is suspicious
 * (can be used to show additional confirmation dialogs)
 */
export function isSuspiciousAmount(amount: number, userHistory?: { averageTransaction: number }): boolean {
    // If amount is more than 10x the user's average transaction
    if (userHistory?.averageTransaction && amount > userHistory.averageTransaction * 10) {
        return true;
    }

    // If amount is very large (> 50,000)
    if (amount > 50000) {
        return true;
    }

    return false;
}

/**
 * Generate transaction limits info
 */
export interface TransactionLimits {
    minAmount: number;
    maxPerTransaction: number;
    dailyLimit: number;
    monthlyLimit: number;
}

export function getTransactionLimits(): TransactionLimits {
    return {
        minAmount: 1,
        maxPerTransaction: 100000, // ₹1 lakh
        dailyLimit: 200000, // ₹2 lakhs
        monthlyLimit: 1000000, // ₹10 lakhs
    };
}

/**
 * Check if user can make transaction based on limits
 */
export function checkTransactionLimits(
    amount: number,
    dailyTotal: number = 0,
    monthlyTotal: number = 0
): ValidationResult {
    const limits = getTransactionLimits();

    if (amount + dailyTotal > limits.dailyLimit) {
        return {
            isValid: false,
            error: `Daily limit of ₹${limits.dailyLimit.toLocaleString()} exceeded. Remaining: ₹${(limits.dailyLimit - dailyTotal).toLocaleString()}`
        };
    }

    if (amount + monthlyTotal > limits.monthlyLimit) {
        return {
            isValid: false,
            error: `Monthly limit of ₹${limits.monthlyLimit.toLocaleString()} exceeded. Remaining: ₹${(limits.monthlyLimit - monthlyTotal).toLocaleString()}`
        };
    }

    return { isValid: true };
}
