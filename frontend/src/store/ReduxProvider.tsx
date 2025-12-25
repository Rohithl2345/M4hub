/**
 * Redux Provider for Next.js Client Components
 */

'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { SessionManager } from '@/components/SessionManager';

interface ReduxProviderProps {
    children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
    return (
        <Provider store={store}>
            <SessionManager />
            {children}
        </Provider>
    );
}
