/**
 * Password validation utility matching backend requirements
 */

export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Must contain at least one special character');
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0) {
        if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) &&
            /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength = 'strong';
        } else {
            strength = 'medium';
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        strength
    };
}
