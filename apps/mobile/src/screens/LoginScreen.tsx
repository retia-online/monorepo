import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
// import { isOAuthProviderAvailable } from '../lib/oauth';
import { getErrorMessage } from '../lib/error-handler';
import { getAuthConfig, envConfig } from '../lib/env';
import { Logo } from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
    onNavigateToRegister: () => void;
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
    const { login, isLoading, loginWithGoogle, loginWithFacebook } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
    const authConfig = getAuthConfig();

    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        setError('');
        setOauthLoading(provider);

        try {
            if (provider === 'google') {
                await loginWithGoogle();
            } else {
                await loginWithFacebook();
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setOauthLoading(null);
        }
    };

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        try {
            await login({ email, password });
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: envConfig.backgroundColor }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={100} variant="square" />
                    <Text style={[styles.title, { color: envConfig.textColor }]}>
                        {envConfig.appName}
                    </Text>
                    <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    {authConfig.allowsEmail && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!isLoading}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: envConfig.primaryColor },
                                    (isLoading || oauthLoading) && styles.buttonDisabled,
                                ]}
                                onPress={handleLogin}
                                disabled={isLoading || !!oauthLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {authConfig.allowsPhone && (
                        <View style={styles.phoneSection}>
                            <Text style={styles.phoneText}>
                                📱 Inicio de sesión con teléfono disponible próximamente
                            </Text>
                        </View>
                    )}
                </View>

                {(authConfig.allowsGoogle || authConfig.allowsFacebook) && (
                    <>
                        {authConfig.allowsEmail && (
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>O continúa con</Text>
                                <View style={styles.dividerLine} />
                            </View>
                        )}

                        <View style={styles.oauthContainer}>
                            {authConfig.allowsGoogle && (
                                <TouchableOpacity
                                    style={[
                                        styles.oauthButton,
                                        oauthLoading === 'google' && styles.buttonDisabled,
                                    ]}
                                    onPress={() => handleOAuthLogin('google')}
                                    disabled={isLoading || !!oauthLoading}
                                >
                                    {oauthLoading === 'google' ? (
                                        <ActivityIndicator color="#1f2937" size="small" />
                                    ) : (
                                        <View style={styles.oauthButtonContent}>
                                            <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.oauthIcon} />
                                            <Text style={styles.oauthButtonText}>Google</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            {authConfig.allowsFacebook && (
                                <TouchableOpacity
                                    style={[
                                        styles.oauthButton,
                                        oauthLoading === 'facebook' && styles.buttonDisabled,
                                    ]}
                                    onPress={() => handleOAuthLogin('facebook')}
                                    disabled={isLoading || !!oauthLoading}
                                >
                                    {oauthLoading === 'facebook' ? (
                                        <ActivityIndicator color="#1f2937" size="small" />
                                    ) : (
                                        <View style={styles.oauthButtonContent}>
                                            <Ionicons name="logo-facebook" size={18} color="#1877F2" style={styles.oauthIcon} />
                                            <Text style={styles.oauthButtonText}>Facebook</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}

                {(authConfig.mode !== 'invite-only' && !authConfig.isDisabled) && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                        <TouchableOpacity onPress={onNavigateToRegister} disabled={isLoading}>
                            <Text style={[styles.link, { color: envConfig.primaryColor }]}>
                                Regístrate aquí
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        color: '#991b1b',
        fontSize: 14,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1f2937',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#6b7280',
        fontSize: 12,
    },
    oauthContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    oauthButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    oauthButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: '600',
    },
    phoneSection: {
        backgroundColor: '#f3f4f6',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    phoneText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    oauthButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    oauthIcon: {
        marginRight: 8,
    },
});

