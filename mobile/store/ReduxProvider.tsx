/**
 * Redux Provider Wrapper
 * Wrap your app with this provider
 */

import { Provider } from 'react-redux';
import { store } from './store';
import { SessionManager } from './SessionManager';

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
