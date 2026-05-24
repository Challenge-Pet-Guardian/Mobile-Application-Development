import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Pet } from '../../types/models';

interface HealthHistoryCardProps {
    pets: Pet[];
}

export const HealthHistoryCard = memo(function HealthHistoryCard({ pets }: HealthHistoryCardProps) {
    return (
        <View style={styles.card}>
            <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>Histórico Clínico</Text>
            {pets.map((pet, index) => (
                <View 
                    key={index} 
                    style={index === pets.length - 1 ? styles.lastPetItem : styles.petItem}
                >
                    <Text style={styles.petName}>{pet.nome}</Text>
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <MaterialCommunityIcons name="weight" size={24} color="#1CB0F6" />
                            <Text style={styles.value}>{pet.peso || '-- kg'}</Text>
                            <Text style={styles.label}>Peso</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.item}>
                            <MaterialCommunityIcons name="needle" size={24} color="#FF9600" />
                            <Text style={styles.value}>{pet.ultimaVacina || '--/--'}</Text>
                            <Text style={styles.label}>Vacina</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.item}>
                            <FontAwesome5 name="stethoscope" size={20} color="#58CC02" />
                            <Text style={styles.value}>{pet.ultimaConsulta || '--/--'}</Text>
                            <Text style={styles.label}>Consulta</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#FFF', 
        borderRadius: 20, 
        padding: 20, 
        borderWidth: 1, 
        borderColor: '#E2E8F0' 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1E293B' 
    },
    petItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 15
    },
    lastPetItem: {
        marginBottom: 15,
        borderBottomWidth: 0,
        paddingBottom: 0
    },
    petName: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: '#333', 
        marginBottom: 10 
    },
    row: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 5 
    },
    item: { 
        alignItems: 'center', 
        flex: 1 
    },
    value: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1E293B', 
        marginTop: 8 
    },
    label: { 
        fontSize: 12, 
        color: '#64748B', 
        marginTop: 4 
    },
    divider: { 
        width: 1, 
        height: 40, 
        backgroundColor: '#E2E8F0' 
    }
});
