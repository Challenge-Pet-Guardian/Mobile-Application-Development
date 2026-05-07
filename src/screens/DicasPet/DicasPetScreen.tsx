import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, SafeAreaView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';

// Simulando a TB_DICA do seu banco de dados Oracle
const DICAS_PET = [
  { 
    id: '1', 
    icone: 'needle', 
    cor: '#FF9600',
    titulo: 'Carteirinha em Dia!', 
    desc: 'As vacinas V10/V8 e a Antirrábica devem ser reforçadas anualmente. Isso previne a maioria das doenças graves.' 
  },
  { 
    id: '2', 
    icone: 'food-apple', 
    cor: '#E53E3E',
    titulo: 'Alimentos Proibidos', 
    desc: 'Nunca dê chocolate, uvas, cebola ou alho para o seu pet. Esses alimentos são extremamente tóxicos e podem ser fatais.' 
  },
  { 
    id: '3', 
    icone: 'dog-service', 
    cor: '#00A859',
    titulo: 'Gasto de Energia', 
    desc: 'Passeios diários de 30 a 40 minutos reduzem a ansiedade, evitam móveis destruídos e garantem a saúde cardiovascular do seu parceiro.' 
  },
  { 
    id: '4', 
    icone: 'fire', 
    cor: '#1CB0F6',
    titulo: 'Mantenha a Ofensiva', 
    desc: 'Marque as tarefas como concluídas todos os dias para aumentar a ofensiva da sua matilha e subir no ranking de cuidadores!' 
  },
  { 
    id: '5', 
    icone: 'water', 
    cor: '#0066FF',
    titulo: 'Hidratação Constante', 
    desc: 'Troque a água do bebedouro pelo menos duas vezes ao dia. Água fresca e limpa previne problemas renais no futuro.' 
  },
  { 
    id: '6', 
    icone: 'weather-sunny', 
    cor: '#D69E2E',
    titulo: 'Cuidado com o Calor', 
    desc: 'Evite passear com seu pet entre 10h e 16h. O asfalto quente pode queimar as patas. Faça o "teste das costas da mão" no chão antes de sair.' 
  }
];

export default function DicasScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
        <Header title="Guia do Pet" />
      </View>

      <View style={styles.headerFeed}>
        <Text style={styles.feedTitle}>Artigos e Cuidados</Text>
        <Text style={styles.feedSubtitle}>Conteúdo curado pela nossa equipe veterinária</Text>
      </View>

      <FlatList 
        data={DICAS_PET}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={styles.tipCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.cor + '15' }]}>
              {/* @ts-ignore */}
              <MaterialCommunityIcons name={item.icone} size={28} color={item.cor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.tipTitle}>{item.titulo}</Text>
              <Text style={styles.tipDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  headerFeed: {
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 5
  },
  feedTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1A202C' 
  },
  feedSubtitle: { 
    fontSize: 14, 
    color: '#718096', 
    marginTop: 4 
  },
  tipCard: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#EDF2F7',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  iconContainer: { 
    width: 54, 
    height: 54, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  textContainer: {
    flex: 1,
  },
  tipTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#2D3748', 
    marginBottom: 6 
  },
  tipDesc: { 
    fontSize: 14, 
    color: '#4A5568', 
    lineHeight: 22 
  }
});