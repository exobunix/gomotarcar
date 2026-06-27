import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const SalaryIncentivesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState('May 2025');

  // High-fidelity Mock data matching the table exactly
  const earningsList = [
    { name: 'Ramesh Kumar', code: 'CLN001', jobs: 28, incentive: '₹ 7,850', penalty: '₹ 350', net: '₹ 7,500', netColor: '#16A34A' },
    { name: 'Suresh Yadav', code: 'CLN002', jobs: 25, incentive: '₹ 6,750', penalty: '₹ 200', net: '₹ 6,550', netColor: '#16A34A' },
    { name: 'Vikram Singh', code: 'CLN003', jobs: 22, incentive: '₹ 6,100', penalty: '₹ 0', net: '₹ 6,100', netColor: '#16A34A' },
    { name: 'Amit Verma', code: 'CLN004', jobs: 20, incentive: '₹ 5,600', penalty: '₹ 300', net: '₹ 5,300', netColor: '#16A34A' },
    { name: 'Arjun Patel', code: 'CLN005', jobs: 18, incentive: '₹ 4,950', penalty: '₹ 150', net: '₹ 4,800', netColor: '#16A34A' },
    { name: 'Priya Singh', code: 'CLN006', jobs: 17, incentive: '₹ 4,500', penalty: '₹ 250', net: '₹ 4,250', netColor: '#16A34A' },
    { name: 'Deepak Sharma', code: 'CLN007', jobs: 15, incentive: '₹ 4,100', penalty: '₹ 400', net: '₹ 3,700', netColor: '#16A34A' },
    { name: 'Neha Gupta', code: 'CLN008', jobs: 12, incentive: '₹ 3,250', penalty: '₹ 200', net: '₹ 3,050', netColor: '#16A34A' },
    { name: 'Pankaj Mehta', code: 'CLN009', jobs: 10, incentive: '₹ 2,800', penalty: '₹ 100', net: '₹ 2,700', netColor: '#16A34A' },
    { name: 'Imran Khan', code: 'CLN010', jobs: 9, incentive: '₹ 2,650', penalty: '₹ 150', net: '₹ 2,500', netColor: '#16A34A' }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Brand Header Bar */}
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerMenuBtn}>
            <Icon name="menu" size={26} color="#1E293B" />
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
            <Text style={styles.mainTitle}>Earnings & Incentives</Text>
            <Text style={styles.subTitle}>Track cleaner earnings, incentives and penalties</Text>
          </View>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>{selectedMonth}</Text>
            <Icon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Top Metrics Cards Row */}
        <View style={styles.metricsGrid}>
          {/* Card 1 */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="gift-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.cardSubText}>Total Incentives</Text>
            <Text style={styles.cardValue}>₹ 48,750</Text>
            <Text style={styles.cardTimeFrame}>This Month</Text>
            <View style={styles.comparisonBadgeGreen}>
              <Icon name="arrow-up" size={10} color="#16A34A" />
              <Text style={styles.comparisonTextGreen}>12.5% vs Apr 2025</Text>
            </View>
          </Card>

          {/* Card 2 */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="medal-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.cardSubText}>Monthly Bonus</Text>
            <Text style={styles.cardValue}>₹ 15,000</Text>
            <Text style={styles.cardTimeFrame}>This Month</Text>
            <View style={styles.comparisonBadgeBlue}>
              <Icon name="arrow-up" size={10} color="#2563EB" />
              <Text style={styles.comparisonTextBlue}>8.3% vs Apr 2025</Text>
            </View>
          </Card>

          {/* Card 3 */}
          <Card variant="elevated" style={styles.metricCard}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="file-document-outline" size={18} color="#DC2626" />
            </View>
            <Text style={styles.cardSubText}>Penalties</Text>
            <Text style={styles.cardValue}>₹ 3,250</Text>
            <Text style={styles.cardTimeFrame}>This Month</Text>
            <View style={styles.comparisonBadgeRed}>
              <Icon name="arrow-down" size={10} color="#DC2626" />
              <Text style={styles.comparisonTextRed}>5.2% vs Apr 2025</Text>
            </View>
          </Card>
        </View>

        {/* Net Payout Banner (Wide Card) */}
        <Card variant="elevated" style={styles.netPayoutCard}>
          <View style={styles.payoutLeftRow}>
            <View style={styles.payoutIconBg}>
              <Icon name="currency-inr" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.payoutLabel}>Net Payout This Month</Text>
              <Text style={styles.payoutVal}>₹ 60,500</Text>
            </View>
          </View>
          <View style={styles.payoutComparisonBadge}>
            <Icon name="arrow-up" size={12} color="#16A34A" />
            <Text style={styles.payoutComparisonTxt}>10.4% vs Apr 2025</Text>
          </View>
        </Card>

        {/* Table Title Row */}
        <View style={styles.tableTitleRow}>
          <Text style={styles.tableSectionTitle}>Cleaner Earnings</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.tableActionBtn}>
              <Icon name="filter-outline" size={16} color="#475569" />
              <Text style={styles.tableActionBtnTxt}>Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tableActionBtn}>
              <Icon name="download-outline" size={16} color="#475569" />
              <Text style={styles.tableActionBtnTxt}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cleaner Earnings Table Card */}
        <Card variant="elevated" style={styles.tableCard}>
          <View style={styles.tableWrapper}>
            {/* Headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCol, { width: '28%' }]}>Cleaner</Text>
              <Text style={[styles.headerCol, { width: '18%', textAlign: 'center' }]}>Jobs Completed</Text>
              <Text style={[styles.headerCol, { width: '18%', textAlign: 'center' }]}>Incentive</Text>
              <Text style={[styles.headerCol, { width: '16%', textAlign: 'center' }]}>Penalty</Text>
              <Text style={[styles.headerCol, { width: '20%', textAlign: 'center' }]}>Net Earnings</Text>
            </View>

            {/* Rows */}
            {earningsList.map((cleaner, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Cleaner */}
                <View style={[styles.rowCell, { width: '28%', flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Image source={require('../../assets/cleaner_avatar.png')} style={styles.tableAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTextBold} numberOfLines={1}>{cleaner.name}</Text>
                    <Text style={styles.tableTextSub}>{cleaner.code}</Text>
                  </View>
                </View>

                {/* Jobs Completed */}
                <View style={[styles.rowCell, { width: '18%', alignItems: 'center' }]}>
                  <Text style={styles.tableJobsTxt}>{cleaner.jobs}</Text>
                </View>

                {/* Incentive */}
                <View style={[styles.rowCell, { width: '18%', alignItems: 'center' }]}>
                  <Text style={styles.tableIncentiveTxt}>{cleaner.incentive}</Text>
                </View>

                {/* Penalty */}
                <View style={[styles.rowCell, { width: '16%', alignItems: 'center' }]}>
                  <Text style={styles.tablePenaltyTxt}>{cleaner.penalty}</Text>
                </View>

                {/* Net Earnings */}
                <View style={[styles.rowCell, { width: '20%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={[styles.tableNetTxt, { color: cleaner.netColor }]}>{cleaner.net}</Text>
                  <Icon name="chevron-right" size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Bottom Banner Info */}
        <View style={styles.bottomInfoBanner}>
          <Icon name="information-outline" size={16} color="#2563EB" />
          <Text style={styles.bottomInfoBannerTxt}>Incentives are calculated based on jobs, ratings and performance.</Text>
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 6,
    fontFamily: 'Inter-Medium',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardSubText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  cardTimeFrame: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  comparisonBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    gap: 2,
  },
  comparisonTextGreen: {
    fontSize: 8,
    fontWeight: '700',
    color: '#16A34A',
  },
  comparisonBadgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    gap: 2,
  },
  comparisonTextBlue: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2563EB',
  },
  comparisonBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    gap: 2,
  },
  comparisonTextRed: {
    fontSize: 8,
    fontWeight: '700',
    color: '#DC2626',
  },
  netPayoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  payoutLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payoutIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  payoutVal: {
    fontSize: 18,
    fontWeight: '850',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  payoutComparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  payoutComparisonTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  tableTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  tableActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tableActionBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCol: {
    fontSize: 9,
    fontWeight: '750',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  rowCell: {
    justifyContent: 'center',
  },
  tableAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tableTextBold: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#1E293B',
  },
  tableTextSub: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  tableJobsTxt: {
    fontSize: 11,
    fontWeight: '850',
    color: '#1E293B',
  },
  tableIncentiveTxt: {
    fontSize: 11,
    fontWeight: '750',
    color: '#16A34A',
  },
  tablePenaltyTxt: {
    fontSize: 11,
    fontWeight: '750',
    color: '#DC2626',
  },
  tableNetTxt: {
    fontSize: 11,
    fontWeight: '850',
  },
  bottomInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 8,
  },
  bottomInfoBannerTxt: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default SalaryIncentivesScreen;
