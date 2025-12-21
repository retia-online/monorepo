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
import { getAuthConfig, envConfig } from '../lib/env';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { ChangePasswordScreen } from './ChangePasswordScreen';
import { Avatar } from '../components/Avatar';

export function ProfileScreen() {
    const { user, logout, refreshProfile, isLoading } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const authConfig = getAuthConfig();

    const handleLogout = async () => {
        Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
            { text: 'Cancelar', onPress: () => { } },
            {
                text: 'Cerrar sesión',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (err) {
                        Alert.alert('Error', 'Error al cerrar sesión');
                    }
                },
                style: 'destructive',
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
            <View style={[styles.container, { backgroundColor: envConfig.backgroundColor }]}>
                <View style={styles.noAuthContainer}>
                    <Text style={styles.noAuthText}>La autenticación está deshabilitada</Text>
                </View>
            </View>
        );
    }

    // Si no hay usuario pero auth es opcional, mostrar pantalla de login
    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: envConfig.backgroundColor }]}>
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

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: envConfig.backgroundColor }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            {/* Header with Avatar */}
            <View style={styles.header}>
                <Avatar size={100} />
                <Text style={[styles.name, { color: envConfig.textColor }]}>{user.name}</Text>
                <View style={[
                    styles.roleBadge,
                    { backgroundColor: user.role === 'ADMIN' ? '#fef3c7' : `${envConfig.primaryColor}15` }
                ]}>
                    <Text style={[
                        styles.roleText,
                        { color: user.role === 'ADMIN' ? '#92400e' : envConfig.primaryColor }
                    ]}>
                        {user.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                    </Text>
                </View>
            </View>

            {/* Error Message */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Profile Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Información del Perfil</Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.iconText}>📧</Text>
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                        <Text style={styles.iconText}>👤</Text>
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Rol</Text>
                        <Text style={styles.infoValue}>{user.role}</Text>
                    </View>
                </View>
            </View>

            {/* Admin Notice */}
            {user.role === 'ADMIN' && (
                <View style={styles.adminNotice}>
                    <Text style={styles.adminNoticeTitle}>🎯 Panel de Administración</Text>
                    <Text style={styles.adminNoticeText}>
                        Como administrador, tienes acceso a funcionalidades adicionales de gestión del sistema.
                    </Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: envConfig.primaryColor }]}
                    onPress={() => setShowChangePassword(true)}
                    disabled={isLoading}
                >
                    <Text style={styles.actionButtonIcon}>🔐</Text>
                    <Text style={styles.actionButtonText}>Cambiar Contraseña</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
                    onPress={handleLogout}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.logoutButtonIcon}>🚪</Text>
                            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                        </>
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
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#991b1b',
        fontSize: 14,
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 8,
    },
    adminNotice: {
        backgroundColor: '#fef3c7',
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
        padding: 16,
        margin: 16,
        borderRadius: 12,
    },
    adminNoticeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 8,
    },
    adminNoticeText: {
        fontSize: 14,
        color: '#b45309',
        lineHeight: 20,
    },
    actionsContainer: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#ef4444',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    logoutButtonIcon: {
        fontSize: 18,
        marginRight: 8,
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
