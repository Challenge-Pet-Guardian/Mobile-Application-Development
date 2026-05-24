import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Header } from '../../components/Header';

const DICAS_PET = [
  { id: '1', icone: 'needle', cor: '#FF9600', titulo: 'Carteirinha em Dia!', desc: 'As vacinas V10/V8 e a Antirrábica devem ser reforçadas anualmente.' },
  { id: '2', icone: 'food-apple', cor: '#E53E3E', titulo: 'Alimentos Proibidos', desc: 'Nunca dê chocolate, uvas, cebola ou alho para o seu pet.' },
  { id: '3', icone: 'dog-service', cor: '#00A859', titulo: 'Gasto de Energia', desc: 'Passeios diários de 30 a 40 minutos reduzem a ansiedade.' },
  { id: '4', icone: 'fire', cor: '#1CB0F6', titulo: 'Mantenha a Ofensiva', desc: 'Marque as tarefas como concluídas todos os dias para aumentar a ofensiva!' },
  { id: '5', icone: 'water', cor: '#0066FF', titulo: 'Hidratação Constante', desc: 'Troque a água do bebedouro pelo menos duas vezes ao dia.' }
];

export default function DicasScreen() {
  return (
    <View style={styles.container}>
      
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
        <Header title="Guia do Pet" />
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 15, marginTop: 5 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A202C' }}>Artigos e Cuidados</Text>
        <Text style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>Conteúdo curado pela nossa equipe</Text>
      </View>

      <FlatList 
        data={DICAS_PET}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }} 
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity activeOpacity={0.8} style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#EDF2F7', elevation: 2, flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: item.cor + '15' }}>
                {/* @ts-ignore */}
                <MaterialCommunityIcons name={item.icone} size={28} color={item.cor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#2D3748', marginBottom: 6 }}>{item.titulo}</Text>
                <Text style={{ fontSize: 14, color: '#4A5568', lineHeight: 22 }}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 50 : 30 
  }
});