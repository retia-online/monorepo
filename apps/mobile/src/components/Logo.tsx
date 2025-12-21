import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { envConfig } from '../lib/env';

interface LogoProps {
    size?: number;
    variant?: 'square' | 'rectangular';
}

export function Logo({ size = 120, variant = 'square' }: LogoProps) {
    const primaryColor = envConfig.primaryColor;
    const secondaryColor = envConfig.secondaryColor;

    if (variant === 'rectangular') {
        const width = size * 2.5;
        const height = size;

        return (
            <View style={styles.container}>
                <Svg width={width} height={height} viewBox="0 0 300 120">
                    <Defs>
                        <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                            <Stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect width="300" height="120" rx="15" fill="url(#gradient)" />
                    <Circle cx="60" cy="60" r="25" fill="white" opacity="0.9" />
                    <Rect x="110" y="35" width="120" height="12" rx="6" fill="white" opacity="0.9" />
                    <Rect x="110" y="55" width="80" height="8" rx="4" fill="white" opacity="0.7" />
                    <Rect x="110" y="75" width="100" height="6" rx="3" fill="white" opacity="0.5" />
                </Svg>
            </View>
        );
    }

    // Square variant
    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox="0 0 200 200">
                <Defs>
                    <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                        <Stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Rect width="200" height="200" rx="20" fill="url(#gradient)" />
                <Circle cx="100" cy="80" r="30" fill="white" opacity="0.9" />
                <Rect x="70" y="120" width="60" height="8" rx="4" fill="white" opacity="0.8" />
                <Rect x="80" y="140" width="40" height="6" rx="3" fill="white" opacity="0.6" />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
