import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string[];
    icon: keyof typeof Ionicons.glyphMap;
    onCancel: () => void;
    onConfirm: () => void;
    isDark?: boolean;
    isLoading?: boolean;
}

export function ConfirmationModal({
    visible,
    title,
    message,
    confirmLabel,
    confirmColor,
    icon,
    onCancel,
    onConfirm,
    isDark = false,
    isLoading = false
}: ConfirmationModalProps) {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

                <Animated.View
                    entering={ZoomIn.duration(300).springify()}
                    style={[styles.modalContainer, isDark && styles.modalContainerDark]}
                >
                    {/* Icon Circle */}
                    <View style={styles.iconWrapper}>
                        <View style={[
                            styles.iconCircle,
                            isDark && styles.iconCircleDark,
                            { backgroundColor: confirmColor[0] + '15' } // 15% opacity for bg
                        ]}>
                            <Ionicons name={icon} size={32} color={confirmColor[0]} />
                        </View>
                    </View>

                    {/* Text Content */}
                    <ThemedText style={[styles.title, isDark && styles.textDark]}>
                        {title}
                    </ThemedText>
                    <ThemedText style={[styles.message, isDark && styles.textGrayDark]}>
                        {message}
                    </ThemedText>

                    {/* Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                            onPress={onCancel}
                            disabled={isLoading}
                        >
                            <ThemedText style={[styles.cancelText, isDark && styles.textDark]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, { shadowColor: confirmColor[0] }]}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={confirmColor as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <ThemedText style={styles.confirmText}>
                                    {isLoading ? '...' : confirmLabel}
                                </ThemedText>
                                {!isLoading && <Ionicons name="arrow-forward" size={18} color="white" />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 40,
        elevation: 20,
        maxWidth: 400,
    },
    modalContainerDark: {
        backgroundColor: '#1e293b',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
    },
    iconWrapper: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    iconCircleDark: {
        borderColor: '#1e293b',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontWeight: '500',
    },
    textDark: {
        color: '#f8fafc',
    },
    textGrayDark: {
        color: '#94a3b8',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonDark: {
        backgroundColor: '#334155',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    confirmButton: {
        flex: 1.2,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gradientButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
});
