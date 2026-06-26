import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  
  const quickTopics = [
    { id: 1, title: 'Account\n& Profile', icon: 'text-box-outline', color: '#2563EB', bg: '#EFF6FF' },
    { id: 2, title: 'Payments &\nPayouts', icon: 'wallet-outline', color: '#16A34A', bg: '#F0FDF4' },
    { id: 3, title: 'Tasks &\nAttendance', icon: 'clipboard-check-outline', color: '#9333EA', bg: '#FAF5FF' },
    { id: 4, title: 'Training &\nCertificates', icon: 'school-outline', color: '#EA580C', bg: '#FFF7ED' },
    { id: 5, title: 'Safety &\nPolicies', icon: 'shield-alert-outline', color: '#DC2626', bg: '#FEF2F2' },
  ];

  const contactOptions = [
    { id: 1, title: 'Chat with Support', sub: 'Chat live with our support team', icon: 'chat-processing', color: '#FFF', bg: '#2563EB', status: 'Online', actionText: null },
    { id: 2, title: 'Call Support', sub: 'Speak with our support executive', icon: 'phone', color: '#FFF', bg: '#16A34A', status: null, actionText: '0120-456-7890', actionSub: '24/7 Available' },
    { id: 3, title: 'Email Support', sub: "Send us an email and we'll respond", icon: 'email', color: '#FFF', bg: '#C084FC', status: null, actionText: 'support@company.com', actionSub: 'Response within 24 hrs' },
    { id: 4, title: 'Raise a Ticket', sub: 'Submit your query and track status', icon: 'ticket-confirmation-outline', color: '#FFF', bg: '#FDBA74', status: null, actionText: null },
  ];

  const faqs = [
    '1. How do I update my profile information?',
    '2. When will I receive my salary?',
    '3. How can I check my task history?',
    '4. How do I download my training certificate?',
    '5. What should I do in case of an emergency?',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Help & Support</Text>
            <Text style={styles.mainSubTitle}>We're here to help you</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.hcTopHalf}>
            <View style={styles.hcAvatarWrapper}>
              <Image source={{uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.hcAvatar} />
            </View>
            <View style={styles.hcInfo}>
              <View style={styles.hcNameRow}>
                <Text style={styles.hcName}>Raj Kumar</Text>
                <Icon name="check-decagram" size={16} color="#2563EB" style={{marginLeft: 4}} />
              </View>
              <Text style={styles.hcRole}>Housekeeping Staff</Text>
              
              <View style={styles.hcMetaRow}>
                <Icon name="map-marker-outline" size={12} color="#64748B" />
                <Text style={styles.hcMetaTxt}>Sector 62, Noida</Text>
              </View>
              <View style={styles.hcMetaRow}>
                <Icon name="star" size={12} color="#EAB308" />
                <Text style={[styles.hcMetaTxt, {color: '#2563EB', fontWeight: '700'}]}>4.6 <Text style={{color: '#64748B', fontWeight: '500'}}>(126 Reviews)</Text></Text>
              </View>
            </View>

            <View style={styles.hcRightCol}>
              <View style={styles.verticalDivider} />
              <Icon name="headset" size={24} color="#2563EB" style={{marginBottom: 4}} />
              <Text style={styles.hcRightLbl}>Need immediate help?</Text>
              <Text style={styles.hcRightLink}>Contact Support</Text>
              <Text style={styles.hcRightStatus}>We are online 24/7</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#94A3B8" />
          <TextInput placeholder="Search for help topics..." placeholderTextColor="#94A3B8" style={styles.searchInput} />
        </View>

        {/* Quick Help Topics */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Help Topics</Text>
          <TouchableOpacity><Text style={styles.viewAllTxt}>View All ›</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll}>
          {quickTopics.map(topic => (
            <TouchableOpacity key={topic.id} style={styles.topicCard}>
              <View style={[styles.topicIconBg, {backgroundColor: topic.bg}]}><Icon name={topic.icon} size={28} color={topic.color} /></View>
              <Text style={styles.topicTxt} numberOfLines={2}>{topic.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Contact Support */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
        </View>
        <View style={styles.listContainer}>
          {contactOptions.map((opt, i) => (
            <TouchableOpacity key={opt.id} style={[styles.contactRow, i !== contactOptions.length - 1 && styles.borderBtm]}>
              <View style={[styles.contactIconBg, {backgroundColor: opt.bg}]}><Icon name={opt.icon} size={20} color={opt.color} /></View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{opt.title}</Text>
                <Text style={styles.contactSub}>{opt.sub}</Text>
              </View>
              <View style={styles.contactRight}>
                {opt.status && (
                  <View style={styles.onlinePill}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineTxt}>{opt.status}</Text>
                  </View>
                )}
                {opt.actionText && (
                  <View style={{alignItems: 'flex-end', marginRight: 8}}>
                    <Text style={styles.actionTxtMain}>{opt.actionText}</Text>
                    <Text style={styles.actionTxtSub}>{opt.actionSub}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={[styles.sectionHeaderRow, {marginTop: 16}]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity><Text style={styles.viewAllTxt}>View All ›</Text></TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          {faqs.map((faq, i) => (
            <TouchableOpacity key={i} style={[styles.faqRow, i !== faqs.length - 1 && styles.borderBtm]}>
              <Text style={styles.faqTxt}>{faq}</Text>
              <Icon name="chevron-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.bbIconBg}><Icon name="lightbulb-on-outline" size={24} color="#2563EB" /></View>
          <View style={styles.bbInfo}>
            <Text style={styles.bbTitle}>Still need help?</Text>
            <Text style={styles.bbSub}>Our support team is always ready to assist you.</Text>
          </View>
          <TouchableOpacity style={styles.bbBtn}>
            <Text style={styles.bbBtnTxt}>Get in Touch</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0A2540',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
    position: 'relative',
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  headerTitles: { flex: 1, marginLeft: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },

  scrollView: { flex: 1, marginTop: -15, position: 'relative', zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  hcTopHalf: { flexDirection: 'row', alignItems: 'center' },
  hcAvatarWrapper: { marginRight: 12 },
  hcAvatar: { width: 56, height: 56, borderRadius: 28 },
  hcInfo: { flex: 1, justifyContent: 'center' },
  hcNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcName: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  hcRole: { fontSize: 11, color: '#475569', fontFamily: 'Inter-Medium', marginBottom: 6 },
  hcMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  hcMetaTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 4 },
  
  hcRightCol: { width: 120, alignItems: 'center', paddingLeft: 12, position: 'relative' },
  verticalDivider: { position: 'absolute', left: 0, top: -10, bottom: -10, width: 1, backgroundColor: '#E2E8F0' },
  hcRightLbl: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium', marginBottom: 2 },
  hcRightLink: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginBottom: 2 },
  hcRightStatus: { fontSize: 8, color: '#16A34A', fontWeight: '600' },

  searchBox: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', height: 48, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A', fontFamily: 'Inter-Regular' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  topicsScroll: { paddingBottom: 16, marginBottom: 8 },
  topicCard: { width: 80, alignItems: 'center', marginRight: 12 },
  topicIconBg: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  topicTxt: { fontSize: 10, fontWeight: '700', color: '#475569', fontFamily: 'Inter-Bold', textAlign: 'center', lineHeight: 14 },

  listContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, marginBottom: 16 },
  borderBtm: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  contactIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 2 },
  contactSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  contactRight: { flexDirection: 'row', alignItems: 'center' },
  
  onlinePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A', marginRight: 4 },
  onlineTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },
  
  actionTxtMain: { fontSize: 10, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginBottom: 2 },
  actionTxtSub: { fontSize: 8, color: '#64748B', fontFamily: 'Inter-Medium' },

  faqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, justifyContent: 'space-between' },
  faqTxt: { fontSize: 12, fontWeight: '700', color: '#1E293B', fontFamily: 'Inter-Bold', flex: 1, paddingRight: 16 },

  bottomBanner: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', marginTop: 8 },
  bbIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bbInfo: { flex: 1 },
  bbTitle: { fontSize: 13, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  bbSub: { fontSize: 10, color: '#1E3A8A', fontFamily: 'Inter-Medium', lineHeight: 14 },
  bbBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  bbBtnTxt: { fontSize: 11, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
});

export default HelpSupportScreen;
