import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    title: string;
    description: string;
    buttonText: string;
    buttonColor?: string;
    onButtonPress: () => void;
}

export function EmptyState({
    iconName,
    iconColor,
    title,
    description,
    buttonText,
    buttonColor = '#0066FF',
    onButtonPress
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={iconName} size={80} color={iconColor} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{description}</Text>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: buttonColor }]} 
                onPress={onButtonPress}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        backgroundColor: '#FFF', 
        borderRadius: 24, 
        padding: 30, 
        alignItems: 'center', 
        elevation: 2, 
        marginTop: 40, 
        borderWidth: 1, 
        borderColor: '#EDF2F7' 
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#1A202C', 
        marginTop: 20, 
        textAlign: 'center' 
    },
    text: { 
        fontSize: 15, 
        color: '#718096', 
        textAlign: 'center', 
        marginTop: 12, 
        marginBottom: 30, 
        lineHeight: 22 
    },
    button: { 
        width: '100%', 
        paddingVertical: 16, 
        borderRadius: 16, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: '#FFF', 
        fontWeight: 'bold', 
        fontSize: 16 
    }
});
