import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Props { navigation: any }

const faqs = [
  { q: 'How do I mark attendance?', a: 'Go to Dashboard and tap "Check In" when you arrive at your first task location.' },
  { q: 'What if I miss check-in?', a: 'Contact your supervisor immediately. Late check-in may affect your attendance record.' },
  { q: 'How are incentives calculated?', a: 'Incentives are based on monthly task completion, attendance rate, and customer ratings.' },
  { q: 'How do I reset my password?', a: 'On the login screen, tap "Forgot Password" and follow the OTP verification process.' },
];

const SupportHubScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCall = () => {
    Linking.openURL('tel:+919876543210').catch(() => Alert.alert('Error', 'Cannot make calls on this device'));
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210').catch(() => Alert.alert('Error', 'Cannot open WhatsApp'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Contact */}
        <Card variant="elevated" padding={20} style={styles.contactCard}>
          <Text style={styles.contactEmoji}>💬</Text>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactSub}>Reach out to your supervisor or our support team</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Text style={styles.contactBtnIcon}>📞</Text>
              <Text style={styles.contactBtnLabel}>Call Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
              <Text style={styles.contactBtnIcon}>💬</Text>
              <Text style={styles.contactBtnLabel}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Raise a Ticket */}
        <Card variant="outlined" padding={16} style={styles.ticketCard}>
          <View style={styles.ticketRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Raise a Ticket</Text>
              <Text style={styles.ticketDesc}>Report an issue or request assistance</Text>
            </View>
            <TouchableOpacity style={styles.ticketBtn} onPress={() => navigation.navigate('RaiseTicket')}>
              <Text style={styles.ticketBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Supervisor Info */}
        <Card variant="outlined" padding={16} style={styles.supervisorCard}>
          <Text style={styles.sectionTitle}>Your Supervisor</Text>
          <View style={styles.supervisorRow}>
            <View style={styles.supervisorAvatar}>
              <Text style={styles.supervisorAvatarText}>👤</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.supervisorName}>Rahul Sharma</Text>
              <Text style={styles.supervisorRole}>Area Supervisor</Text>
            </View>
            <TouchableOpacity style={styles.supervisorCall} onPress={handleCall}>
              <Text style={styles.supervisorCallText}>📞</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('RaiseTicket')}>
            <Text style={styles.quickIcon}>📋</Text>
            <Text style={styles.quickLabel}>My Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Text style={styles.quickIcon}>📖</Text>
            <Text style={styles.quickLabel}>Handbook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Text style={styles.quickIcon}>⚠️</Text>
            <Text style={styles.quickLabel}>Safety</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>FAQs</Text>
        {faqs.map((faq, idx) => (
          <TouchableOpacity key={idx} style={styles.faqItem} onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqToggle}>{expandedFaq === idx ? '−' : '+'}</Text>
            </View>
            {expandedFaq === idx && (
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.versionText}>GoMotarCar Cleaner v2.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  contactCard: { alignItems: 'center', marginBottom: 16, backgroundColor: colors.primaryBlue, borderRadius: 24 },
  contactEmoji: { fontSize: 48, marginBottom: 12 },
  contactTitle: { fontSize: 22, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  contactSub: { fontSize: 14, color: colors.lightBlue, marginTop: 4, marginBottom: 20, fontFamily: 'Inter-Regular', textAlign: 'center' },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, gap: 8 },
  contactBtnIcon: { fontSize: 18 },
  contactBtnLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  ticketCard: { marginBottom: 16 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketDesc: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  ticketBtn: { backgroundColor: colors.primaryBlue, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  ticketBtnText: { fontSize: 13, fontWeight: '600', color: colors.white, fontFamily: 'Inter-SemiBold' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  supervisorCard: { marginBottom: 16 },
  supervisorRow: { flexDirection: 'row', alignItems: 'center' },
  supervisorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  supervisorAvatarText: { fontSize: 24 },
  supervisorName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  supervisorRole: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  supervisorCall: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.success + '20', alignItems: 'center', justifyContent: 'center' },
  supervisorCallText: { fontSize: 22 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickBtn: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center' },
  quickIcon: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: 12, color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  faqItem: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 6 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, flex: 1, fontFamily: 'Inter-Medium' },
  faqToggle: { fontSize: 20, color: colors.primaryBlue, marginLeft: 12, fontWeight: '600' },
  faqAnswer: { fontSize: 13, color: colors.textSecondary, marginTop: 10, lineHeight: 18, fontFamily: 'Inter-Regular' },
  versionText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 20, fontFamily: 'Inter-Regular' },
});

export default SupportHubScreen;
