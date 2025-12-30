import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface LogoutModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    isDark?: boolean;
}

export function LogoutModal({ visible, onCancel, onConfirm, isDark = false }: LogoutModalProps) {
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
                        <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                            <Ionicons name="log-out" size={32} color="#ef4444" />
                        </View>
                    </View>

                    {/* Text Content */}
                    <ThemedText style={[styles.title, isDark && styles.textDark]}>
                        Logout
                    </ThemedText>
                    <ThemedText style={[styles.message, isDark && styles.textGrayDark]}>
                        Are you sure you want to log out of your account? You will need to sign in again to access your data.
                    </ThemedText>

                    {/* Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                            onPress={onCancel}
                        >
                            <ThemedText style={[styles.cancelText, isDark && styles.textDark]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#ef4444', '#dc2626']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <ThemedText style={styles.logoutText}>Logout</ThemedText>
                                <Ionicons name="arrow-forward" size={18} color="white" />
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
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    iconCircleDark: {
        backgroundColor: '#450a0a',
        borderColor: '#1e293b',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        letterSpacing: -0.5,
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
    logoutButton: {
        flex: 1,
        borderRadius: 16,
        shadowColor: '#ef4444',
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
    logoutText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
});
