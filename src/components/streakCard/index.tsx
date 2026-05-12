import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { DiaOfensiva } from '../../types/models';

interface StreakCardProps {
    streakDays: DiaOfensiva[];
    totalStreak: number; 
}

const renderIcon = (status: DiaOfensiva['status']) => {
    switch (status) {
        case 'feito':
            return <MaterialCommunityIcons name="fire" size={16} color="#FFF" />;
        case 'perdido':
            return <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#FFF" />;
        case 'hoje':
            return <FontAwesome5 name="paw" size={14} color="#FFF" />;
        case 'futuro':
            return null;
    }
};

export function StreakCard({ streakDays, totalStreak }: StreakCardProps) {
    return (
        <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
                <Text style={styles.sectionTitle}>Ofensiva da Semana</Text>
                <View style={styles.totalStreakBadge}>
                    <MaterialCommunityIcons name="fire" size={18} color="#FF9600" />
                    <Text style={styles.totalStreakText}>
                        {totalStreak} {totalStreak === 1 ? 'dia' : 'dias'}
                    </Text>
                </View>
            </View>

            <View style={styles.streakRow}>
                {streakDays.map((item) => (
                    <View key={item.id} style={styles.streakColumn}>
                        <View
                            style={[
                                styles.streakDayCircle,
                                item.status === 'feito' && styles.streakCompleted,
                                item.status === 'perdido' && styles.streakMissed,
                                item.status === 'hoje' && styles.streakToday,
                                item.status === 'futuro' && styles.streakFuture
                            ]}
                        >
                            {renderIcon(item.status)}
                            <Text style={[
                                styles.streakDayText,
                                item.status === 'futuro' && styles.streakDayTextFuture
                            ]}>
                                {item.dayNumber}
                            </Text>
                        </View>
                        <Text style={styles.streakDayLabel}>{item.dayLabel}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    streakCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    totalStreakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#FFE4B5' },
    totalStreakText: { fontSize: 14, fontWeight: 'bold', color: '#FF9600', marginLeft: 4 },
    streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    streakColumn: { alignItems: 'center', gap: 6 },
    streakDayCircle: { width: 42, height: 56, borderRadius: 21, alignItems: 'center', justifyContent: 'center', gap: 2 },
    streakCompleted: { backgroundColor: '#00A859' },
    streakMissed: { backgroundColor: '#FF6565' },
    streakToday: { backgroundColor: '#1CB0F6' },
    streakFuture: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
    streakDayText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    streakDayTextFuture: { color: '#94A3B8' },
    streakDayLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
});