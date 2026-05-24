import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
export type HeaderProps = { title?: string; };

export function Header({ title }: HeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.brandContainer}>
                <FontAwesome5 name="paw" size={18} color="#FFF" />
                <Text style={styles.brandText}>Pet Guardian</Text>
            </View>
            <Text style={styles.pageTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 18,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: "#134879",
        elevation: 6,
    },
    brandContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    brandText: { fontSize: 18, color: "#FFF", fontWeight: "bold" },
    pageTitle: { fontSize: 15, color: "#FFF", fontWeight: "600", opacity: 0.9 }
});