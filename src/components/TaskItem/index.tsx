import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';

interface TaskItemProps {
    id: number;
    title: string;
    time: string;
    xp: number;
    isDone: boolean;
    onToggle: (id: number) => void;
}

export function TaskItem({ id, title, time, xp, isDone, onToggle }: TaskItemProps) {
    return (
        <TouchableOpacity 
            onPress={() => onToggle(id)} 
            activeOpacity={0.7} 
            style={[styles.row, isDone && styles.rowDone]}
        >
            <View style={[styles.radioCircle, isDone && styles.radioCircleDone]}>
                {isDone && <Entypo name="check" size={16} color="#FFF" />}
            </View>
            <View style={styles.info}>
                <Text style={[styles.text, isDone && styles.textDone]}>{title}</Text>
                <Text style={styles.time}>{time}</Text>
            </View>
            <Text style={styles.xp}>+{xp} XP</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFF', 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: '#E2E8F0',
        marginBottom: 12
    },
    rowDone: { 
        backgroundColor: '#F8FAFC', 
        borderColor: '#F1F5F9' 
    },
    radioCircle: { 
        width: 28, 
        height: 28, 
        borderRadius: 14, 
        borderWidth: 2, 
        borderColor: '#CBD5E1', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 16 
    },
    radioCircleDone: { 
        backgroundColor: '#58CC02', 
        borderColor: '#58CC02' 
    },
    info: { 
        flex: 1 
    },
    text: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B', 
        marginBottom: 4 
    },
    textDone: { 
        color: '#94A3B8', 
        textDecorationLine: 'line-through' 
    },
    time: { 
        fontSize: 14, 
        color: '#64748B' 
    },
    xp: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#FF9600' 
    }
});
