import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import Button from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    type: 'features',
    title: "India's Complete\nCar Services Platform",
    subtitle: 'One app for all your car needs',
    features: [
      { icon: '🚗', title: 'Hire Car Cleaner', desc: 'Professional cleaners for regular car cleaning at your doorstep.' },
      { icon: '🔍', title: 'Search Services', desc: 'Find A2Z car services near you with verified service providers.' },
      { icon: '📅', title: 'Book Services', desc: 'Book car & maintenance services with easy scheduling.' },
      { icon: '💳', title: 'FastTag Recharge', desc: 'Recharge FastTag instantly and enjoy seamless travel.' },
      { icon: '⚙️', title: 'A2Z Car Services', desc: 'From battery to bodyshop, get all car services in one place.' },
    ],
  },
  {
    id: '2',
    type: 'brand',
    title: 'One App For\nEvery Car Need',
    subtitle: 'Clean, service, recharge and more -\nall in one place.',
    illustration: '🚘',
    featuresSummary: [
      { label: 'Expert Cleaners', icon: '👤' },
      { label: 'Trusted Service Centers', icon: '⚙️' },
      { label: 'Quality Assured', icon: '✅' },
    ]
  }
];

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    if (item.type === 'features') {
      return (
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>{item.title.replace('\n', '\n')}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          
          <View style={styles.featuresContainer}>
            {item.features?.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <View style={styles.arrowBox}>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.slide}>
        <View style={styles.brandHeader}>
          <Text style={styles.logoText}>GOMOTARCAR</Text>
        </View>
        <Text style={styles.slideTitle}>{item.title.replace('\n', '\n')}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle.replace('\n', '\n')}</Text>

        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationCircle}>
            <Text style={styles.carIllustration}>{item.illustration}</Text>
          </View>
          
          {/* Mock UI illustration points from PDF */}
          <View style={[styles.badgePoint, { top: 20, left: -20 }]}>
            <Text style={styles.badgeText}>👤 Expert Cleaners</Text>
          </View>
          <View style={[styles.badgePoint, { top: 30, right: -25 }]}>
            <Text style={styles.badgeText}>⚙️ Service Centers</Text>
          </View>
          <View style={[styles.badgePoint, { bottom: 10, left: 10 }]}>
            <Text style={styles.badgeText}>✅ Quality Assured</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      />

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomContainer}>
        {currentIndex === 0 ? (
          <>
            <Button
              title="Next"
              onPress={handleNext}
              size="lg"
              style={styles.actionBtn}
            />
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Button
            title="Get Started"
            onPress={handleNext}
            size="lg"
            style={styles.actionBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    width,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    alignItems: 'center',
  },
  brandHeader: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryBlue,
    letterSpacing: 1.5,
    fontFamily: 'Inter-Bold',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    lineHeight: 32,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 20,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 14,
  },
  arrowBox: {
    paddingLeft: 8,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIllustration: {
    fontSize: 72,
  },
  badgePoint: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    position: 'absolute',
    bottom: height * 0.20,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primaryBlue,
    borderRadius: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    gap: 12,
  },
  actionBtn: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryBlue,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
});

export default OnboardingScreen;
