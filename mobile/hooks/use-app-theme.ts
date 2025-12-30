import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/store/hooks';

export function useAppTheme(): 'light' | 'dark' {
    const themePreference = useAppSelector((state) => state.ui.theme);
    const systemColorScheme = useColorScheme();

    if (themePreference === 'system') {
        return systemColorScheme === 'dark' ? 'dark' : 'light';
    }

    return themePreference;
}
