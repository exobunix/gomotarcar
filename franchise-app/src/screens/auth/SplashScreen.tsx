import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
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
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo block */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image source={{ uri: 'https://franchise-website-lovat.vercel.app/logo.png' }} style={styles.logoImg} resizeMode="contain" />
          </View>
          <View style={styles.logoInfo}>
            <Text style={styles.brandTitle}>Go<Text style={styles.blueText}>Motor</Text>Car</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40, gap: 12 },
  logoBox: { width: 44, height: 44, backgroundColor: '#E0F2FE', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 4 },
  logoImg: { width: '100%', height: '100%' },
  logoInfo: { justifyContent: 'center' },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  blueText: { color: '#0D5BD7' },
  brandSub: { fontSize: 7, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginTop: 2 },
  imageContainer: { width: width - 48, height: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  image: { width: '100%', height: '100%' },
  loaderContainer: { width: '100%', alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  progressBarBg: { width: '80%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0D5BD7', borderRadius: 10 },
  progressPercent: { fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, width: '100%', flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  footerClaim: { fontSize: 12, color: '#0D5BD7', fontStyle: 'italic', fontWeight: '800', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#0D5BD7', paddingBottom: 2 },
});

export default SplashScreen;
