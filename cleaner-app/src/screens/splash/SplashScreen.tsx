import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { checkAuth } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isInitialized } = useSelector((s: RootState) => s.auth);

  useEffect(() => { dispatch(checkAuth()); }, []);

  useEffect(() => {
    if (isInitialized) {
      setTimeout(() => { navigation.replace(isAuthenticated ? 'Main' : 'Login'); }, 2000);
    }
  }, [isInitialized, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.topLogoSection}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>• CLEANER APP •</Text>
        </View>
      </View>

      <Image source={require('../../assets/cleaner_wash.png')} style={styles.illustration} resizeMode="contain" />

      <View style={styles.textSection}>
        <Text style={styles.welcomeText}>Welcome To</Text>
        <Text style={styles.brandTitle}>GoMotarCar</Text>
        <Text style={styles.appTitle}>Cleaner App</Text>
        <Text style={styles.subtitle}>Manage your daily cleaning tasks efficiently.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  topLogoSection: { alignItems: 'center', marginTop: 20 },
  logoImage: { width: width * 0.5, height: 60 },
  badgeContainer: { backgroundColor: colors.primaryBlue, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 1 },
  illustration: { width: width * 0.85, height: width * 0.75, marginVertical: 10 },
  textSection: { alignItems: 'center', paddingHorizontal: 30 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  brandTitle: { fontSize: 32, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold', marginTop: 4 },
  appTitle: { fontSize: 32, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginTop: -2 },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  footer: { alignItems: 'center', marginBottom: 20 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  activeDot: { backgroundColor: colors.primaryBlue, width: 24 },
  loadingText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
});

export default SplashScreen;
