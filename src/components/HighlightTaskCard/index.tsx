import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tarefa } from '../../types/models';

interface HighlightTaskCardProps {
    tarefa: Tarefa | null;
    onComplete: (id: number) => void;
}

export function HighlightTaskCard({ tarefa, onComplete }: HighlightTaskCardProps) {
    if (!tarefa) {
        return (
            <View style={styles.cardDone}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.label}>Todas Concluídas!</Text>
                </View>
                <Text style={styles.title}>Parabéns! 🎉</Text>
                <Text style={styles.time}>Você completou todas as tarefas de hoje.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#FFF" />
                <Text style={styles.label}>Próxima Tarefa</Text>
            </View>
            <Text style={styles.title}>{tarefa.titulo}</Text>
            <Text style={styles.time}>Hoje às {tarefa.horario}</Text>
            
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => onComplete(tarefa.id)} 
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    Marcar como Feito (+{tarefa.xp} XP)
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#1CB0F6', 
        borderRadius: 24, 
        padding: 20, 
        elevation: 8 
    },
    cardDone: { 
        backgroundColor: '#58CC02', 
        borderRadius: 24, 
        padding: 20, 
        elevation: 8 
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12 
    },
    label: { 
        color: '#FFF', 
        fontSize: 14, 
        fontWeight: '600', 
        textTransform: 'uppercase' 
    },
    title: { 
        color: '#FFF', 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    time: { 
        color: '#E0F2FE', 
        fontSize: 16, 
        marginBottom: 20 
    },
    button: { 
        backgroundColor: '#FFF', 
        paddingVertical: 14, 
        borderRadius: 16, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: '#1CB0F6', 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});
