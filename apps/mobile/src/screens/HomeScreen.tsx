import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMainScreenConfig, getAuthConfig } from '../lib/env';

interface HomeScreenProps {
    onNavigateToProfile?: () => void;
}

export function HomeScreen({ onNavigateToProfile }: HomeScreenProps) {
    const { user, logout } = useAuth();
    const mainConfig = getMainScreenConfig();
    const authConfig = getAuthConfig();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{mainConfig.message}</Text>

                {user && (
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeText}>¡Bienvenido, {user.name}!</Text>
                        <Text style={styles.emailText}>{user.email}</Text>
                    </View>
                )}

                {!authConfig.isDisabled && (
                    <View style={styles.actions}>
                        {user ? (
                            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        ) : (
                            authConfig.isOptional && onNavigateToProfile && (
                                <View style={styles.authButtons}>
                                    <Text style={styles.optionalAuthText}>
                                        ¿Quieres iniciar sesión para una mejor experiencia?
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.loginButton}
                                        onPress={onNavigateToProfile}
                                    >
                                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    userInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    emailText: {
        fontSize: 14,
        color: '#666',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    authButtons: {
        alignItems: 'center',
    },
    optionalAuthText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    loginButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
