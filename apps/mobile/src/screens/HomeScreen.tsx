import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMainScreenConfig, getAuthConfig, envConfig } from '../lib/env';
import { Logo } from '../components/Logo';

interface HomeScreenProps {
    onNavigateToProfile?: () => void;
}

export function HomeScreen({ onNavigateToProfile }: HomeScreenProps) {
    const { user, logout } = useAuth();
    const mainConfig = getMainScreenConfig();
    const authConfig = getAuthConfig();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: envConfig.backgroundColor }]}>
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Logo size={120} variant="square" />
                    <Text style={[styles.appTitle, { color: envConfig.textColor }]}>
                        {envConfig.appName}
                    </Text>
                </View>

                {/* Welcome Message */}
                {!user && (
                    <View style={styles.welcomeSection}>
                        <Text style={[styles.welcomeTitle, { color: envConfig.textColor }]}>
                            ¡Bienvenido!
                        </Text>
                        <Text style={styles.welcomeDescription}>
                            Explora nuestra aplicación. Puedes usar todas las funciones como invitado o registrarte para una experiencia personalizada.
                        </Text>
                    </View>
                )}

                {/* Custom Message (when logged in) */}
                {user && mainConfig.message !== 'Hola Mundo' && (
                    <View style={styles.messageSection}>
                        <Text style={[styles.title, { color: envConfig.textColor }]}>
                            {mainConfig.message}
                        </Text>
                    </View>
                )}

                {/* User Info Card */}
                {user && (
                    <View style={styles.userCard}>
                        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
                        <Text style={[styles.userName, { color: envConfig.primaryColor }]}>
                            {user.name}
                        </Text>
                        <Text style={styles.emailText}>{user.email}</Text>
                        {user.role === 'ADMIN' && (
                            <View style={[styles.adminBadge, { backgroundColor: `${envConfig.primaryColor}15` }]}>
                                <Text style={[styles.adminBadgeText, { color: envConfig.primaryColor }]}>
                                    👑 Administrador
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Actions */}
                {!authConfig.isDisabled && user && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={logout}
                        >
                            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    welcomeSection: {
        marginBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    welcomeDescription: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 400,
    },
    messageSection: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    userCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    emailText: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 12,
    },
    adminBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    adminBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actions: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

