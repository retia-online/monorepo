import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function TestContent() {
    const { isLoading, isSignedIn, user } = useAuth();
    console.log('--- TestContent executing ---', { isLoading, isSignedIn, user });

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading Auth State...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fef' }}>
            <Text style={{ fontSize: 20 }}>Auth Provider Loaded!</Text>
            <Text>Status: {isSignedIn ? 'Signed In' : 'Signed Out'}</Text>
            {user && <Text>User: {user.email}</Text>}
        </View>
    );
}

export default function App() {
    console.log('--- AlternativeApp executing ---');
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <TestContent />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
