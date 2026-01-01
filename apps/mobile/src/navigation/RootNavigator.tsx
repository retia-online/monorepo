import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { getAuthConfig } from '../lib/env';

import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props: any) => (
                    <LoginScreen onNavigateToRegister={() => props.navigation.navigate('Register')} />
                )}
            </Stack.Screen>
            <Stack.Screen name="Register">
                {(props: any) => (
                    <RegisterScreen onNavigateToLogin={() => props.navigation.navigate('Login')} />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}


function AppStack() {
    const { user } = useAuth();
    const authConfig = getAuthConfig();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: authConfig.isDisabled ? '#94a3b8' : '#3b82f6',
                tabBarInactiveTintColor: '#9ca3af',
            }}
        >
            <Tab.Screen
                name="HomeTab"
                options={{
                    title: 'Inicio',
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            >
                {({ navigation }) => (
                    <HomeScreen
                        onNavigateToProfile={() => {
                            if (!authConfig.isDisabled) {
                                navigation.navigate('ProfileTab');
                            }
                        }}
                    />
                )}
            </Tab.Screen>

            {/* Solo mostrar perfil si auth no está deshabilitado */}
            {!authConfig.isDisabled && (
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileScreen}
                    options={{
                        title: user ? 'Mi Perfil' : 'Iniciar Sesión',
                        tabBarLabel: user ? 'Perfil' : 'Login',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name={user ? "person-outline" : "log-in-outline"}
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

export function RootNavigator() {
    const { isLoading, isSignedIn } = useAuth();
    const authConfig = getAuthConfig();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    // Determinar qué mostrar basado en el modo de autenticación
    const shouldShowAuthStack = () => {
        // En modo deshabilitado u opcional, siempre vamos al AppStack primero
        if (authConfig.isDisabled || authConfig.isOptional) {
            return false;
        }

        // En cualquier otro modo (required, whitelist, invite-only), 
        // mostramos el login si no está autenticado
        return !isSignedIn;
    };

    return shouldShowAuthStack() ? <AuthStack /> : <AppStack />;
}
