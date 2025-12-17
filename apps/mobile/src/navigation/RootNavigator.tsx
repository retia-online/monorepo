import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { getAuthConfig } from '@/lib/env';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  const [showLogin, setShowLogin] = React.useState(true);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {showLogin ? (
        <Stack.Screen
          name="Login"
          options={{ animationTypeForReplace: 'pop' }}
        >
          {() => (
            <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen
          name="Register"
          options={{ animationTypeForReplace: 'pop' }}
        >
          {() => (
            <RegisterScreen onNavigateToLogin={() => setShowLogin(true)} />
          )}
        </Stack.Screen>
      )}
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
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color }} />
          ),
        }}
      />
      
      {/* Solo mostrar perfil si el usuario está logueado o auth no está deshabilitado */}
      {(user || !authConfig.isDisabled) && (
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: user ? 'Mi Perfil' : 'Iniciar Sesión',
            tabBarLabel: user ? 'Perfil' : 'Login',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color }} />
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
    if (authConfig.isDisabled) {
      return false; // Nunca mostrar auth si está deshabilitado
    }
    if (authConfig.isRequired) {
      return !isSignedIn; // Mostrar auth solo si no está logueado
    }
    if (authConfig.isOptional) {
      return false; // Nunca forzar auth, siempre ir a app
    }
    return !isSignedIn; // Fallback por defecto
  };

  return (
    <NavigationContainer>
      {shouldShowAuthStack() ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}
