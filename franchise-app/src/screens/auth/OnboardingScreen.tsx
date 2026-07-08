import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Manage Your\nFranchise\nEfficiently',
    desc: 'Handle your operations, staff, services and customers all in one place.',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Track Bookings\n& Revenue',
    desc: 'Monitor bookings, services, revenue and performance in real-time from your dashboard.',
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Grow Your\nCar Business',
    desc: 'Expand your franchise, keep your customers happy and grow your brand with GoMotorCar.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const current = slides[activeIndex];

  return (
    <View style={styles.container}>
      {/* Header Skip button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>{activeIndex + 1} / {slides.length}</Text>
      </View>

      {/* Center Image illustration */}
      <View style={styles.content}>
        {activeIndex === 0 && (
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Image source={{ uri: 'https://franchise-website-lovat.vercel.app/logo.png' }} style={styles.logoImg} resizeMode="contain" />
            </View>
            <View style={styles.logoInfo}>
              <Text style={styles.brandTitle}>Go<Text style={styles.blueText}>Motor</Text>Car</Text>
              <Text style={styles.brandSub}>FRANCHISE</Text>
            </View>
          </View>
        )}

        <Text style={styles.title}>{current.title.replace('\n', '\n')}</Text>
        <Text style={styles.desc}>{current.desc}</Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: current.image }} style={styles.image} resizeMode="cover" />
        </View>
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <View style={styles.dotRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Text style={styles.nextArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'space-between', paddingVertical: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center', marginTop: 10 },
  skipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  stepIndicator: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 15 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoBox: { width: 36, height: 36, backgroundColor: '#E0F2FE', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 3 },
  logoImg: { width: '100%', height: '100%' },
  logoInfo: { justifyContent: 'center' },
  brandTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  blueText: { color: '#0D5BD7' },
  brandSub: { fontSize: 7, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', textAlign: 'center', lineHeight: 32 },
  desc: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 12, lineHeight: 18 },
  imageContainer: { width: width - 48, height: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10 },
  image: { width: '100%', height: '100%' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  activeDot: { backgroundColor: '#0D5BD7', width: 14 },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E0F2FE', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: '#BAE6FD' },
  nextText: { color: '#0D5BD7', fontSize: 13, fontWeight: '700' },
  nextArrow: { color: '#0D5BD7', fontSize: 14, fontWeight: '700' },
});

export default OnboardingScreen;
