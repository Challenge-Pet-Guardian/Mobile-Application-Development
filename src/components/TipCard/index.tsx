import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface TipCardProps {
    title?: string;
    text: string;
}

export function TipCard({ title = "Dica do Dia", text }: TipCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <FontAwesome5 name="lightbulb" size={20} color="#FFC800" />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        borderRadius: 20, 
        padding: 16, 
        alignItems: 'center', 
        gap: 16, 
        borderWidth: 1, 
        borderColor: '#E2E8F0' 
    },
    iconContainer: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        backgroundColor: '#FFFBEB', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    content: { 
        flex: 1 
    },
    title: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1E293B', 
        marginBottom: 4 
    },
    text: { 
        fontSize: 14, 
        color: '#64748B', 
        lineHeight: 20 
    }
});
