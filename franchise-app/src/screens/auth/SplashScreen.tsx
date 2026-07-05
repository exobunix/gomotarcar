import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Navigate to Onboarding stack after loaded
          setTimeout(() => {
            navigation.replace('Onboarding');
          }, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [navigation]);

  return (
    <LinearGradient colors={['#050A1E', '#090D1A', '#02040A']} style={styles.container}>
      <View style={styles.content}>
        {/* Logo block */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <View style={styles.logoInfo}>
            <Text style={styles.brandTitle}>Go<Text style={styles.blueText}>Motar</Text>Car</Text>
            <Text style={styles.brandSub}>ANYTHING & EVERYTHING FOR YOUR CAR</Text>
          </View>
        </View>

        {/* Center Graphic */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Loading progress */}
        <View style={styles.loaderContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>

        {/* Footer features list */}
        <View style={styles.footerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🛡️</Text>
            <Text style={styles.badgeText}>Trusted Service</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✨</Text>
            <Text style={styles.badgeText}>Premium Care</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⏱️</Text>
            <Text style={styles.badgeText}>On-Time Service</Text>
          </View>
        </View>
        <Text style={styles.footerClaim}>We Care Your Car</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40, gap: 12 },
  logoBox: { width: 44, height: 44, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, fontWeight: '900', color: '#3B82F6' },
  logoInfo: { justifyContent: 'center' },
  brandTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  blueText: { color: '#3B82F6' },
  brandSub: { fontSize: 7, fontWeight: '700', color: '#64748B', letterSpacing: 1.2, marginTop: 1 },
  imageContainer: { width: width - 48, height: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  image: { width: '105%', height: '100%' },
  loaderContainer: { width: '100%', alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 8 },
  progressBarBg: { width: '80%', height: 5, backgroundColor: '#1E293B', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 10 },
  progressPercent: { fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, width: '100%', flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  footerClaim: { fontSize: 12, color: '#3B82F6', fontStyle: 'italic', fontWeight: '700', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#3B82F6', paddingBottom: 2 },
});

export default SplashScreen;
