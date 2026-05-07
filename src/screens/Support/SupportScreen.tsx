import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  ScrollView, Alert 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';

// Dados fictícios que simulariam a tabela TB_DICA
const DICAS = [
  { id: '1', titulo: 'Vacinação em Dia', desc: 'Mantenha a V10 e a Raiva atualizadas anualmente.' },
  { id: '2', titulo: 'Alimentação', desc: 'Evite dar chocolate ou uvas, são tóxicos para pets.' },
  { id: '3', titulo: 'Exercícios', desc: 'Passeios diários reduzem a ansiedade em 70%.' },
];

const FAQS = [
  { id: '1', q: 'Como convidar família?', a: 'Vá na aba Família e gere um código PET-XXXX.' },
  { id: '2', q: 'O que é XP?', a: 'Pontos ganhos ao completar tarefas diárias do pet.' },
];

export default function SupportScreen() {
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');

  const enviarFeedback = () => {
    if (!mensagem || !email) {
      Alert.alert('Ops!', 'Preencha seu e-mail e a mensagem.');
      return;
    }
    // Aqui simularíamos o salvamento no banco/AsyncStorage
    Alert.alert('Sucesso!', 'Sua mensagem foi enviada para nossa equipe.');
    setMensagem('');
    setEmail('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header title="Suporte e Dicas" />

        {/* 1. SEÇÃO DE DICAS (Usando FlatList horizontal para mostrar domínio da matéria) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dicas da Semana (TB_DICA)</Text>
          <FlatList 
            data={DICAS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#0066FF" />
                <Text style={styles.tipTitle}>{item.titulo}</Text>
                <Text style={styles.tipDesc}>{item.desc}</Text>
              </View>
            )}
          />
        </View>

        {/* 2. FAQ - PERGUNTAS FREQUENTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {FAQS.map(faq => (
            <View key={faq.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* 3. ÁREA DE CONTATO */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <TextInput 
            style={styles.input}
            placeholder="Seu melhor e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput 
            style={[styles.input, { height: 100 }]}
            placeholder="Como podemos ajudar?"
            value={mensagem}
            onChangeText={setMensagem}
            multiline
          />
          <TouchableOpacity style={styles.btnSend} onPress={enviarFeedback}>
            <Text style={styles.btnText}>Enviar Mensagem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 15 },
  tipCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, width: 250, marginRight: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 8 },
  tipDesc: { fontSize: 13, color: '#718096', lineHeight: 18 },
  faqCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#deff9a' },
  faqQuestion: { fontWeight: 'bold', color: '#2D3748', marginBottom: 5 },
  faqAnswer: { color: '#718096', fontSize: 14 },
  contactSection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 20 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, borderRadius: 12, marginBottom: 15 },
  btnSend: { backgroundColor: '#0066FF', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

