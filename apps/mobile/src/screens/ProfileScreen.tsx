import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAuthConfig } from '../lib/env';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { ChangePasswordScreen } from './ChangePasswordScreen';

export function ProfileScreen() {
    const { user, logout, refreshProfile, isLoading } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const authConfig = getAuthConfig();

    const handleLogout = async () => {
        Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
            { text: 'Cancelar', onPress: () => {} },
            {
                text: 'Cerrar sesión',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (err) {
                        Alert.alert('Error', 'Error al cerrar sesión');
                    }
                },
            },
        ]);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setError('');
        try {
            await refreshProfile();
        } catch (_err) {
            const errorMessage =
                _err instanceof Error ? _err.message : 'Error al actualizar perfil';

            // Don't show error if session expired (logout will handle it)
            if (errorMessage !== 'Session expired') {
                setError(errorMessage);
            }
        } finally {
            setRefreshing(false);
        }
    };

    // Si no hay usuario y auth está deshabilitado, no mostrar nada
    if (!user && authConfig.isDisabled) {
        return (
            <View style={styles.container}>
                <View style={styles.noAuthContainer}>
                    <Text style={styles.noAuthText}>La autenticación está deshabilitada</Text>
                </View>
            </View>
        );
    }

    // Si no hay usuario pero auth es opcional, mostrar pantalla de login
    if (!user) {
        return (
            <View style={styles.container}>
                {showLogin ? (
                    <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />
                ) : (
                    <RegisterScreen onNavigateToLogin={() => setShowLogin(true)} />
                )}
            </View>
        );
    }

    // Si está mostrando la pantalla de cambio de contraseña
    if (showChangePassword) {
        return (
            <ChangePasswordScreen onGoBack={() => setShowChangePassword(false)} />
        );
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.name}>{user.name}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                    </Text>
                </View>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Rol</Text>
                    <Text style={styles.infoValue}>{user.role}</Text>
                </View>
            </View>

            {user.role === 'ADMIN' && (
                <View style={styles.adminNotice}>
                    <Text style={styles.adminNoticeTitle}>Panel de Administración</Text>
                    <Text style={styles.adminNoticeText}>
                        Como administrador, tienes acceso a funcionalidades adicionales de gestión.
                    </Text>
                </View>
            )}

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowChangePassword(true)}
                    disabled={isLoading}
                >
                    <Text style={styles.actionButtonText}>🔐 Cambiar Contraseña</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
                    onPress={handleLogout}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.spacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: '#1e40af',
        fontSize: 12,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        padding: 12,
        margin: 16,
        borderRadius: 4,
    },
    errorText: {
        color: '#991b1b',
        fontSize: 14,
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    adminNotice: {
        backgroundColor: '#fef3c7',
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
        padding: 12,
        margin: 16,
        borderRadius: 4,
    },
    adminNoticeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 4,
    },
    adminNoticeText: {
        fontSize: 12,
        color: '#b45309',
    },
    actionsContainer: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#dc2626',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    spacing: {
        height: 40,
    },
    noAuthContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noAuthText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
});
