import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Manage Your\nFranchise\nEfficiently',
    desc: 'Handle your operations, staff, services and customers all in one place.',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80', // Replace with dynamic mock assets as needed
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
    <LinearGradient colors={['#050A1E', '#090D1A', '#02040A']} style={styles.container}>
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
              <Text style={styles.logoText}>G</Text>
            </View>
            <View style={styles.logoInfo}>
              <Text style={styles.brandTitle}>Go<Text style={styles.blueText}>Motar</Text>Car</Text>
              <Text style={styles.brandSub}>FRANCHISE</Text>
            </View>
          </View>
        )}

        <h1 style={styles.title}>{current.title}</h1>
        <p style={styles.desc}>{current.desc}</p>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center', marginTop: 10 },
  skipText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  stepIndicator: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 15 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoBox: { width: 36, height: 36, backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '900', color: '#3B82F6' },
  logoInfo: { justifyContent: 'center' },
  brandTitle: { fontSize: 16, fontWeight: '950', color: '#fff', letterSpacing: -0.5 },
  blueText: { color: '#3B82F6' },
  brandSub: { fontSize: 6.5, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 36 },
  desc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 12, lineHeight: 18 },
  imageContainer: { width: width - 48, height: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B', marginTop: 10 },
  image: { width: '100%', height: '100%' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#334155' },
  activeDot: { backgroundColor: '#3B82F6', width: 14 },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.25)' },
  nextText: { color: '#3B82F6', fontSize: 13, fontWeight: '700' },
  nextArrow: { color: '#3B82F6', fontSize: 14, fontWeight: '700' },
});

export default OnboardingScreen;
