import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { envConfig } from '@/lib/env';

interface ChangePasswordScreenProps {
    onGoBack: () => void;
}

export function ChangePasswordScreen({ onGoBack }: ChangePasswordScreenProps) {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canChangePassword, setCanChangePassword] = useState<boolean | null>(null);
    const [checkingPermission, setCheckingPermission] = useState(true);

    // Check if user can change password
    useEffect(() => {
        const checkPasswordCapability = async () => {
            if (!user) {
                setCheckingPermission(false);
                return;
            }

            try {
                const data = await api.canChangePassword();
                setCanChangePassword(data.canChangePassword);
            } catch (error) {
                console.error('Error checking password capability:', error);
                setCanChangePassword(false);
            } finally {
                setCheckingPermission(false);
            }
        };

        checkPasswordCapability();
    }, [user]);

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!currentPassword) {
            setError('La contraseña actual es requerida');
            return false;
        }

        if (!newPassword) {
            setError('La nueva contraseña es requerida');
            return false;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (!confirmPassword) {
            setError('Confirma tu nueva contraseña');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        if (currentPassword === newPassword) {
            setError('La nueva contraseña debe ser diferente a la actual');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await api.changePassword(currentPassword, newPassword);
            
            Alert.alert(
                '¡Éxito!',
                'Tu contraseña ha sido cambiada exitosamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Clear form
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            onGoBack();
                        }
                    }
                ]
            );
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (checkingPermission) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={envConfig.primaryColor} />
                <Text style={styles.loadingText}>Verificando permisos...</Text>
            </View>
        );
    }

    // Cannot change password (OAuth user)
    if (canChangePassword === false) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Cambiar Contraseña</Text>
                </View>

                <View style={styles.oauthNoticeContainer}>
                    <View style={styles.oauthNotice}>
                        <Text style={styles.oauthNoticeTitle}>No Puedes Cambiar Contraseña</Text>
                        <Text style={styles.oauthNoticeText}>
                            Tu cuenta fue registrada usando OAuth (Google/Facebook). No tienes una contraseña tradicional que cambiar.
                        </Text>
                        <TouchableOpacity style={styles.oauthButton} onPress={onGoBack}>
                            <Text style={styles.oauthButtonText}>Volver al Perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Cambiar Contraseña</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>
                    Actualiza tu contraseña para mantener tu cuenta segura
                </Text>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña Actual</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Ingresa tu contraseña actual"
                                placeholderTextColor="#999"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showPasswords.current}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => togglePasswordVisibility('current')}
                            >
                                <Text style={styles.eyeText}>
                                    {showPasswords.current ? '🙈' : '👁️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nueva Contraseña</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Ingresa tu nueva contraseña"
                                placeholderTextColor="#999"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPasswords.new}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => togglePasswordVisibility('new')}
                            >
                                <Text style={styles.eyeText}>
                                    {showPasswords.new ? '🙈' : '👁️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>Mínimo 6 caracteres</Text>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirma tu nueva contraseña"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPasswords.confirm}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => togglePasswordVisibility('confirm')}
                            >
                                <Text style={styles.eyeText}>
                                    {showPasswords.confirm ? '🙈' : '👁️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onGoBack}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    scrollContent: {
        padding: 20,
    },
    errorContainer: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        padding: 12,
        borderRadius: 4,
        marginBottom: 20,
    },
    errorText: {
        color: '#991b1b',
        fontSize: 14,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1f2937',
    },
    eyeButton: {
        padding: 10,
    },
    eyeText: {
        fontSize: 18,
    },
    hint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
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
    cancelButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
    oauthNoticeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    oauthNotice: {
        backgroundColor: '#fef3c7',
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    oauthNoticeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 10,
        textAlign: 'center',
    },
    oauthNoticeText: {
        fontSize: 14,
        color: '#b45309',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    oauthButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    oauthButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});