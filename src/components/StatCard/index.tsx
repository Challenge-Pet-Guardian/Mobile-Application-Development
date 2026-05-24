import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string | number;
    color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
    const isDisabled = color === '#A0AEC0';

    return (
        <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <Text 
                style={[styles.value, { color: isDisabled ? '#A0AEC0' : '#1A202C' }]} 
                numberOfLines={1} 
                adjustsFontSizeToFit
            >
                {value}
            </Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { 
        flex: 1, 
        backgroundColor: '#FFF', 
        marginHorizontal: 5, 
        padding: 15, 
        borderRadius: 20, 
        alignItems: 'center', 
        elevation: 2 
    },
    iconCircle: { 
        width: 45, 
        height: 45, 
        borderRadius: 22.5, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    value: { 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    label: { 
        fontSize: 12, 
        color: '#A0AEC0', 
        marginTop: 2 
    }
});
