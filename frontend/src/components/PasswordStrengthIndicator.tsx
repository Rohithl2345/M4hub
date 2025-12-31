'use client';

import { validatePassword } from '@/utils/passwordValidator';

interface Props {
    password: string;
}

export default function PasswordStrengthIndicator({ password }: Props) {
    if (!password) return null;

    const result = validatePassword(password);

    const getBarColor = () => {
        if (result.strength === 'strong') return 'bg-green-500';
        if (result.strength === 'medium') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getBarWidth = () => {
        if (result.strength === 'strong') return 'w-full';
        if (result.strength === 'medium') return 'w-2/3';
        return 'w-1/3';
    };

    return (
        <div className="mt-2 space-y-2">
            {/* Strength bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getBarColor()} ${getBarWidth()} transition-all duration-300`}
                />
            </div>

            {/* Strength text */}
            {result.valid ? (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Password is {result.strength}
                </p>
            ) : (
                <div className="space-y-1">
                    {result.errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400">
                            × {error}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
