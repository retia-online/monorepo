import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { envConfig } from '../lib/env';

interface AvatarProps {
    size?: number;
}

export function Avatar({ size = 100 }: AvatarProps) {
    const primaryColor = envConfig.primaryColor;
    const secondaryColor = envConfig.secondaryColor;

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
                        <Stop offset="100%" stopColor={secondaryColor} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#avatarGradient)" />
                <Circle cx="50" cy="35" r="15" fill="white" opacity="0.9" />
                <Path
                    d="M25 75 C25 65, 35 60, 50 60 C65 60, 75 65, 75 75 L75 85 C75 90, 70 95, 65 95 L35 95 C30 95, 25 90, 25 85 Z"
                    fill="white"
                    opacity="0.9"
                />
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
