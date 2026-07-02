import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  FlatList, Dimensions, StatusBar, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

const slides = [
  {
    id: '1',
    image: require('../../assets/onboarding1.png'),
    title: 'Manage Operations',
    titleBlue: 'Smartly & Efficiently',
    subtitle: 'Track cleaning, attendance, inventory, complaints,\nand performance – all in one place.',
    features: [
      { icon: 'clipboard-list-outline', label: 'Real-time Overview', desc: 'Get instant insights into daily operations\nand team performance.' },
      { icon: 'account-group-outline', label: 'Team & Task Management', desc: 'Assign tasks, monitor attendance,\nand streamline workflows.' },
      { icon: 'chart-bar', label: 'Analytics & Reports', desc: 'Make data-driven decisions with\npowerful reports and analytics.' },
    ],
    btnLabel: 'Next',
  },
  {
    id: '2',
    image: require('../../assets/onboarding2.png'),
    title: 'Stay in Control',
    titleBlue: 'Anytime, Anywhere',
    subtitle: 'Manage your team and operations seamlessly\nfrom the palm of your hand.',
    features: [
      { icon: 'cellphone-check', label: 'Mobile-First Design', desc: 'Designed for supervisors on the go.\nFast, intuitive and responsive.' },
      { icon: 'bell-ring-outline', label: 'Push Notifications', desc: 'Get instant alerts for new tasks,\nattendance issues and complaints.' },
      { icon: 'qrcode-scan', label: 'QR Code Verification', desc: 'Verify cleaning tasks with QR codes\nfor tamper-proof records.' },
    ],
    btnLabel: 'Next',
  },
  {
    id: '3',
    image: require('../../assets/onboarding3.png'),
    title: 'Monitor Performance',
    titleBlue: 'Every Step of the Way',
    subtitle: 'Get complete visibility of your team, services,\nand performance in real time.',
    features: [
      { icon: 'trending-up', label: 'Live Performance Tracking', desc: 'Monitor cleaning jobs, attendance,\nand productivity in real time.' },
      { icon: 'bell-outline', label: 'Instant Alerts & Notifications', desc: 'Get notified about issues, pending tasks,\nand important updates instantly.' },
      { icon: 'shield-check-outline', label: 'Smart Approvals', desc: 'Review and approve jobs, attendance,\nand requests on the go.' },
    ],
    btnLabel: 'Get Started',
  },
];

const OnboardingScreen: React.FC<Props> = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('onboardingDone', 'true');
      onDone();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    onDone();
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoRow}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
        <View style={styles.logoTextCol}>
          <Text style={styles.logoName}>GOMOTORCAR</Text>
          <Text style={styles.logoTagline}>Anything & Everything for your Car</Text>
        </View>
      </View>

      {/* Slide content using FlatList for swipe support */}
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            <View style={styles.textSection}>
              <Text style={styles.titleDark}>{item.title}</Text>
              <Text style={styles.titleBlue}>{item.titleBlue}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Feature bullets */}
      <View style={styles.featuresSection}>
        {slide.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIconBox, { backgroundColor: i === 0 ? '#EEF2FF' : i === 1 ? '#ECFDF5' : '#FFF7ED' }]}>
              <Icon name={f.icon} size={22} color={i === 0 ? '#4F46E5' : i === 1 ? '#10B981' : '#F59E0B'} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity style={styles.ctaBtn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.ctaBtnText}>{slide.btnLabel}</Text>
        <Icon name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Page count */}
      <Text style={styles.pageCount}>{currentIndex + 1} / {slides.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 24,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 54,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 10,
  },
  logoImg: {
    width: 48,
    height: 48,
  },
  logoTextCol: {
    flexDirection: 'column',
  },
  logoName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a56c4',
    letterSpacing: 1,
    fontFamily: 'Inter-Bold',
  },
  logoTagline: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  slideContainer: {
    width,
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.88,
    height: height * 0.28,
    marginBottom: 8,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleDark: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  titleBlue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563EB',
  },
  featuresSection: {
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    fontFamily: 'Inter-Regular',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  pageCount: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default OnboardingScreen;
