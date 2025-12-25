import { StyleSheet } from 'react-native';

export const collapsibleStyles = StyleSheet.create({
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    content: {
        marginTop: 6,
        marginLeft: 24,
    },
    icon: {
        // Base icon style - rotation will be applied dynamically
    },
    iconOpen: {
        transform: [{ rotate: '90deg' }],
    },
    iconClosed: {
        transform: [{ rotate: '0deg' }],
    },
});
