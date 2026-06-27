import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

interface Props { navigation: any }

const SupportCenterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const recentTickets = [
    {
      title: 'App is not syncing data',
      code: 'Ticket ID: #TK12345',
      date: '20 May 2025, 10:30 AM',
      status: 'In Progress',
      statusColor: '#EA580C',
      statusBg: '#FFF7ED'
    },
    {
      title: 'Cleaner not marked present',
      code: 'Ticket ID: #TK12344',
      date: '19 May 2025, 05:15 PM',
      status: 'Resolved',
      statusColor: '#16A34A',
      statusBg: '#ECFDF5'
    },
    {
      title: 'Unable to approve work',
      code: 'Ticket ID: #TK12343',
      date: '18 May 2025, 02:45 PM',
      status: 'Open',
      statusColor: '#2563EB',
      statusBg: '#EFF6FF'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerMenuBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.brandLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.brandSub}>Anything & Everything for your Car</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.notifBtn}>
              <Icon name="bell-outline" size={24} color="#1E293B" />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>12</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileDropdown}>
              <Image source={require('../../assets/cleaner_avatar.png')} style={styles.avatarMini} />
              <View style={{ marginLeft: 6, marginRight: 4 }}>
                <Text style={styles.profileDropdownRole}>Supervisor</Text>
                <Text style={styles.profileDropdownCode}>SUP001</Text>
              </View>
              <Icon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Title Section */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Support Center</Text>
            <Text style={styles.subTitle}>We're here to help you 24/7</Text>
          </View>
        </View>

        {/* 2x2 Support Cards Grid */}
        <View style={styles.gridContainer}>
          {/* Card 1: FAQs */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="help-circle-outline" size={22} color="#2563EB" />
            </View>
            <Text style={styles.gridCardTitle}>FAQs</Text>
            <Text style={styles.gridCardDesc}>Find answers to common questions and solutions.</Text>
            <TouchableOpacity style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkTxt, { color: '#2563EB' }]}>View FAQs</Text>
              <Icon name="arrow-right" size={14} color="#2563EB" />
            </TouchableOpacity>
          </Card>

          {/* Card 2: Raise Ticket */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="file-document-edit-outline" size={22} color="#16A34A" />
            </View>
            <Text style={styles.gridCardTitle}>Raise Ticket</Text>
            <Text style={styles.gridCardDesc}>Facing an issue? Raise a ticket and our team will help you.</Text>
            <TouchableOpacity style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkTxt, { color: '#16A34A' }]}>Raise Ticket</Text>
              <Icon name="arrow-right" size={14} color="#16A34A" />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={[styles.gridContainer, { marginTop: 16 }]}>
          {/* Card 3: Chat Support */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={styles.tagHeaderRow}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FAF5FF' }]}>
                <Icon name="message-text-outline" size={22} color="#8B5CF6" />
              </View>
              <View style={[styles.statusTag, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.statusTagTxt, { color: '#16A34A' }]}>Online</Text>
              </View>
            </View>
            <Text style={styles.gridCardTitle}>Chat Support</Text>
            <Text style={styles.gridCardDesc}>Chat with our support team for quick assistance.</Text>
            <TouchableOpacity style={styles.chatActionBtn}>
              <Text style={styles.chatActionBtnTxt}>Start Chat</Text>
              <Icon name="arrow-right" size={14} color="#8B5CF6" />
            </TouchableOpacity>
          </Card>

          {/* Card 4: Call Support */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={styles.tagHeaderRow}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="phone-outline" size={22} color="#EA580C" />
              </View>
              <View style={[styles.statusTag, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.statusTagTxt, { color: '#16A34A' }]}>Available</Text>
              </View>
            </View>
            <Text style={styles.gridCardTitle}>Call Support</Text>
            <Text style={styles.gridCardDesc}>Call our support team for immediate help.</Text>
            <TouchableOpacity style={styles.callActionBtn}>
              <Text style={styles.callActionBtnTxt}>+91 1800 123 4567</Text>
              <Icon name="phone" size={14} color="#EA580C" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Recent Tickets section header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        <Card variant="elevated" style={styles.listCard}>
          {recentTickets.map((ticket, idx) => (
            <TouchableOpacity key={idx} style={[styles.ticketRow, idx === recentTickets.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.ticketIconBg}>
                <Icon name="file-document-outline" size={18} color="#2563EB" />
              </View>
              
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <Text style={styles.ticketDesc}>{ticket.code}  •  {ticket.date}</Text>
              </View>

              <View style={[styles.ticketStatusTag, { backgroundColor: ticket.statusBg }]}>
                <Text style={[styles.ticketStatusTxt, { color: ticket.statusColor }]}>{ticket.status}</Text>
              </View>

              <Icon name="chevron-right" size={18} color="#94A3B8" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Need Immediate Help Card */}
        <Card variant="elevated" style={styles.immediateHelpCard}>
          <View style={styles.immediateHelpLeft}>
            <View style={styles.immediateHelpIconBg}>
              <Icon name="headphones" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.immediateHelpTitle}>Need Immediate Help?</Text>
              <Text style={styles.immediateHelpDesc}>Our support team is available 24/7 to assist you.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callNowBtn}>
            <Text style={styles.callNowBtnTxt}>Call Now</Text>
          </TouchableOpacity>
        </Card>

        {/* Support Hours Card */}
        <Card variant="elevated" style={styles.hoursCard}>
          <View style={styles.hoursLeft}>
            <View style={styles.hoursIconBg}>
              <Icon name="clock-outline" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.hoursTitle}>Support Hours</Text>
              <Text style={styles.hoursDesc}>Monday - Sunday</Text>
              <Text style={styles.hoursVal}>24 Hours</Text>
            </View>
          </View>
          <View style={[styles.statusTag, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.statusTagTxt, { color: '#16A34A' }]}>Always Open</Text>
          </View>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMenuBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 150,
    height: 36,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBtn: {
    position: 'relative',
    padding: 6,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  profileDropdownRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileDropdownCode: {
    fontSize: 8,
    color: '#64748B',
    marginTop: -1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  subTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  gridCardDesc: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 14,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  actionLinkTxt: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  tagHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagTxt: {
    fontSize: 8,
    fontWeight: '700',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  chatActionBtnTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  callActionBtnTxt: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  viewAllLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
  },
  ticketIconBg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketTitle: {
    fontSize: 11,
    fontWeight: '750',
    color: '#1E293B',
  },
  ticketDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  ticketStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketStatusTxt: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  immediateHelpCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  immediateHelpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  immediateHelpIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  immediateHelpTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  immediateHelpDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  callNowBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callNowBtnTxt: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hoursCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hoursLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hoursIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  hoursDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  hoursVal: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },
});

export default SupportCenterScreen;
