import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

import { envConfig } from './src/lib/env';

export default function App() {
    console.log('--- APP CONFIG ---');
    console.log('API URL:', envConfig.apiUrl);
    console.log('------------------');

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

