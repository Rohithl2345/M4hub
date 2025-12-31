/**
 * Authentication validation utilities
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isValid: boolean;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
}

/**
 * Username validation
 */
export function validateUsername(username: string): ValidationResult {
    if (!username || username.trim() === '') {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 30) {
        return { isValid: false, error: 'Username must be less than 30 characters' };
    }

    // Only allow alphanumeric, underscore, hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    return { isValid: true };
}

/**
 * Email or Username validation (for login)
 */
export function validateIdentifier(identifier: string): ValidationResult {
    if (!identifier || identifier.trim() === '') {
        return { isValid: false, error: 'Email or username is required' };
    }

    // If it contains @, validate as email
    if (identifier.includes('@')) {
        return validateEmail(identifier);
    }

    // Otherwise validate as username
    return validateUsername(identifier);
}

/**
 * Password validation with detailed feedback
 */
export function validatePassword(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    if (!password || password.length === 0) {
        return {
            score: 0,
            feedback: ['Password is required'],
            isValid: false
        };
    }

    // Length check
    if (password.length < 8) {
        feedback.push('Password must be at least 8 characters');
    } else {
        score++;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        feedback.push('Add at least one uppercase letter');
    } else {
        score++;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        feedback.push('Add at least one lowercase letter');
    } else {
        score++;
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        feedback.push('Add at least one number');
    } else {
        score++;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        feedback.push('Add at least one special character (!@#$%^&*...)');
    } else {
        score++;
    }

    // Check for common weak patterns
    const weakPatterns = [
        /^123456/,
        /^password/i,
        /^qwerty/i,
        /^abc123/i,
        /(.)\1{2,}/, // repeated characters
    ];

    for (const pattern of weakPatterns) {
        if (pattern.test(password)) {
            feedback.push('Password is too common or predictable');
            score = Math.max(0, score - 1);
            break;
        }
    }

    return {
        score: Math.min(score, 4), // Cap at 4
        feedback,
        isValid: score >= 4 // Require all 5 criteria (length, upper, lower, number, special)
    };
}

/**
 * Phone number validation (for Indian numbers)
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
 * OTP validation
 */
export function validateOTP(otp: string, length: number = 6): ValidationResult {
    if (!otp || otp.trim() === '') {
        return { isValid: false, error: 'Verification code is required' };
    }

    if (otp.length !== length) {
        return { isValid: false, error: `Verification code must be ${length} digits` };
    }

    if (!/^\d+$/.test(otp)) {
        return { isValid: false, error: 'Verification code must contain only numbers' };
    }

    return { isValid: true };
}

/**
 * Name validation
 */
export function validateName(name: string): ValidationResult {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 50) {
        return { isValid: false, error: 'Name must be less than 50 characters' };
    }

    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name)) {
        return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true };
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
    if (!confirmation || confirmation.trim() === '') {
        return { isValid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmation) {
        return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
    switch (score) {
        case 0:
        case 1:
            return 'Weak';
        case 2:
            return 'Fair';
        case 3:
            return 'Good';
        case 4:
            return 'Strong';
        default:
            return 'Weak';
    }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
    switch (score) {
        case 0:
        case 1:
            return '#ef4444'; // Red
        case 2:
            return '#f59e0b'; // Orange
        case 3:
            return '#3b82f6'; // Blue
        case 4:
            return '#10b981'; // Green
        default:
            return '#94a3b8'; // Gray
    }
}
