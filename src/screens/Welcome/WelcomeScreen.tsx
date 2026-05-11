import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STORAGE_KEYS } from '../../constants/Keys'; 

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  
  useEffect(() => {
    const verificarLogin = async () => {
      try {
    
        const logado = await AsyncStorage.getItem(STORAGE_KEYS.LOGADO);
        if (logado === 'sim') {
          navigation.replace('Tabs');
        }
      } catch (error) {
        console.error("Erro ao verificar login:", error);
      }
    };
    verificarLogin();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <View style={styles.content}>
        
        <Animated.View
          entering={ZoomIn.duration(800)}
          style={styles.heroSection}
        >
          <View style={styles.iconWrapper}>
            <View style={styles.iconRingOuter} />
            <View style={styles.iconRingInner} />
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🐾</Text>
            </View>
          </View>

          <View style={styles.versionBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>v1.0 · Novo</Text>
          </View>

          <Text style={styles.brandName}>PetGuardian</Text>
          <Text style={styles.tagline}>
            A rotina do seu pet,{'\n'}organizada em família.
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureChip}>
              <Text style={styles.featureChipIcon}>🏥</Text>
              <Text style={styles.featureChipText}>Saúde</Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureChipIcon}>📅</Text>
              <Text style={styles.featureChipText}>Rotina</Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureChipIcon}>👨‍👩‍👧</Text>
              <Text style={styles.featureChipText}>Família</Text>
            </View>
          </View>
        </Animated.View>

        
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.actionsBlock}
        >
          <TouchableOpacity
            style={[styles.btnPrimary, styles.btnShadow]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.btnPrimaryText}>Criar conta grátis</Text>
            <Text style={styles.btnArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>já tenho conta</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnSecondaryText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao continuar, você concorda com os nossos{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text>
          </Text>
        </Animated.View>

      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: '#0F2447',
    top: -width * 0.4,
    left: -width * 0.05,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1A3A6B',
    bottom: height * 0.25,
    right: -60,
    opacity: 0.5,
  },
  bgCircle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0066FF',
    bottom: height * 0.15,
    left: -50,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
    paddingHorizontal: 28,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconRingOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  iconRingInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.35)',
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#1A3A6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  iconEmoji: { fontSize: 30 },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 22,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4D94FF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4D94FF',
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#8FA3C4',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    fontWeight: '400',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  featureChipIcon: { fontSize: 14 },
  featureChipText: {
    fontSize: 13,
    color: '#A0B4CC',
    fontWeight: '500',
  },
  actionsBlock: {
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: '#0066FF',
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  btnShadow: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: 13,
    color: '#4A6080',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnSecondaryText: {
    color: '#CBD5E0',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#3A506B',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4A6FA5',
    fontWeight: '500',
  },
});