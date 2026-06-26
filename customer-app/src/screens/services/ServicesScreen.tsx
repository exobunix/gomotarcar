import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Card from '../../components/common/Card';
import { colors } from '../../theme/colors';

interface Props {
  navigation: any;
}

const serviceLinks = [
  { id: 'payments', icon: '💳', title: 'Payment History', desc: 'View all your transactions', screen: 'PaymentHistory', color: '#059669' },
  { id: 'complaints', icon: '📝', title: 'Support Tickets', desc: 'Raise & track complaints', screen: 'ComplaintList', color: '#D97706' },
  { id: 'fasttag', icon: '⚡', title: 'FastTag', desc: 'Recharge and history', screen: '', color: '#7C3AED', comingSoon: true },
  { id: 'offers', icon: '🎁', title: 'Offers', desc: 'Exclusive deals for you', screen: '', color: '#EC4899', comingSoon: true },
];

const ServicesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        {serviceLinks.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.linkCard}
            onPress={() => {
              if (!item.comingSoon && item.screen) {
                navigation.navigate(item.screen);
              }
            }}
            disabled={item.comingSoon}
          >
            <View style={[styles.linkIcon, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.linkEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>{item.title}</Text>
              <Text style={styles.linkDesc}>{item.desc}</Text>
            </View>
            {item.comingSoon ? (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            ) : (
              <Text style={styles.linkArrow}>→</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Need Help?</Text>
        <Card variant="elevated" padding={20} style={styles.helpCard}>
          <Text style={styles.helpEmoji}>💬</Text>
          <Text style={styles.helpTitle}>Contact Support</Text>
          <Text style={styles.helpDesc}>Our team is available 24/7 to help you with any issues</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpBtnText}>Chat with Us</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  linkIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  linkEmoji: { fontSize: 20 },
  linkInfo: { flex: 1 },
  linkTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  linkDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  linkArrow: { fontSize: 18, color: colors.textSecondary },
  comingSoonBadge: { backgroundColor: colors.warning + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  comingSoonText: { fontSize: 11, fontWeight: '600', color: colors.warning, fontFamily: 'Inter-SemiBold' },
  helpCard: { alignItems: 'center' },
  helpEmoji: { fontSize: 40, marginBottom: 12 },
  helpTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  helpDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16, fontFamily: 'Inter-Regular' },
  helpBtn: { paddingHorizontal: 32, paddingVertical: 12, backgroundColor: colors.lightBlue, borderRadius: 14 },
  helpBtnText: { fontSize: 15, fontWeight: '600', color: colors.primaryBlue, fontFamily: 'Inter-SemiBold' },
});

export default ServicesScreen;
