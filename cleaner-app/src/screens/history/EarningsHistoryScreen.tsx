import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const EarningsHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const transactions = [
    { id: 1, date: '15 May 2025', time: '10:05 AM', type: 'Premium Wash', plate: 'DL 01 AB 1234', prop: 'Green Valley', subProp: 'Apartments', amount: '350.00', status: 'Completed', color: '#2563EB', bg: '#EFF6FF', icon: 'water-outline' },
    { id: 2, date: '14 May 2025', time: '04:30 PM', type: 'Standard Wash', plate: 'UP 16 CD 5678', prop: 'Sunshine', subProp: 'Residency', amount: '250.00', status: 'Completed', color: '#9333EA', bg: '#FAF5FF', icon: 'star-four-points-outline' },
    { id: 3, date: '13 May 2025', time: '11:20 AM', type: 'Deep Cleaning', plate: 'DL 02 EF 9012', prop: 'Maple Heights', subProp: '', amount: '500.00', status: 'Completed', color: '#16A34A', bg: '#F0FDF4', icon: 'vacuum-outline' },
    { id: 4, date: '12 May 2025', time: '09:15 AM', type: 'Interior Detailing', plate: 'HR 26 GH 3456', prop: 'Palm Retreat', subProp: 'Villas', amount: '600.00', status: 'Completed', color: '#EA580C', bg: '#FFF7ED', icon: 'shield-check-outline' },
    { id: 5, date: '11 May 2025', time: '02:40 PM', type: 'Premium Wash', plate: 'UP 16 GH 3456', prop: 'Green Valley', subProp: 'Apartments', amount: '350.00', status: 'Completed', color: '#2563EB', bg: '#EFF6FF', icon: 'water-outline' },
    { id: 6, date: '10 May 2025', time: '05:10 PM', type: 'Standard Wash', plate: 'UP 14 IJ 7890', prop: 'Sunshine', subProp: 'Residency', amount: '250.00', status: 'Completed', color: '#9333EA', bg: '#FAF5FF', icon: 'star-four-points-outline' },
    { id: 7, date: '09 May 2025', time: '10:00 AM', type: 'Deep Cleaning', plate: 'DL 03 JK 2345', prop: 'Maple Heights', subProp: '', amount: '500.00', status: 'Completed', color: '#16A34A', bg: '#F0FDF4', icon: 'vacuum-outline' },
    { id: 8, date: '08 May 2025', time: '01:25 PM', type: 'Interior Detailing', plate: 'HR 51 KL 6789', prop: 'Palm Retreat', subProp: 'Villas', amount: '600.00', status: 'Paid', color: '#EA580C', bg: '#FFF7ED', icon: 'shield-check-outline' },
    { id: 9, date: '07 May 2025', time: '11:45 AM', type: 'Premium Wash', plate: 'DL 01 AB 1234', prop: 'Green Valley', subProp: 'Apartments', amount: '350.00', status: 'Paid', color: '#2563EB', bg: '#EFF6FF', icon: 'water-outline' },
    { id: 10, date: '06 May 2025', time: '03:30 PM', type: 'Standard Wash', plate: 'UP 16 CD 5678', prop: 'Sunshine', subProp: 'Residency', amount: '250.00', status: 'Paid', color: '#9333EA', bg: '#FAF5FF', icon: 'star-four-points-outline' },
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
            <Text style={styles.mainTitle}>Earnings History</Text>
            <Text style={styles.mainSubTitle}>View your past earnings and payouts</Text>
          </View>
          <TouchableOpacity style={styles.monthSelector}>
            <Icon name="calendar-month-outline" size={16} color="#FFF" />
            <Text style={styles.monthSelectorTxt}>May 2025</Text>
            <Icon name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderContent}>
            <Text style={styles.tcTitle}>Summary for May 2025</Text>
            <TouchableOpacity><Text style={styles.viewSummaryTxt}>View Summary ›</Text></TouchableOpacity>
          </View>

          <View style={styles.tcFooterGrid}>
            <View style={styles.tcFooterCol}>
              <View style={[styles.ftIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="wallet-outline" size={18} color="#16A34A" /></View>
              <Text style={styles.ftLbl}>Total Earnings</Text>
              <Text style={styles.ftVal}>₹8,450.00</Text>
              <Text style={styles.ftTrend}>↑ 18.6%</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={[styles.ftIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="clipboard-text-outline" size={18} color="#9333EA" /></View>
              <Text style={styles.ftLbl}>Completed Tasks</Text>
              <Text style={styles.ftVal}>28</Text>
              <Text style={styles.ftTrend}>↑ 12%</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={[styles.ftIconBg, {backgroundColor: '#FFF7ED'}]}><Icon name="clock-outline" size={18} color="#EA580C" /></View>
              <Text style={styles.ftLbl}>Hours Worked</Text>
              <Text style={styles.ftVal}>42h 15m</Text>
              <Text style={styles.ftTrend}>↑ 15%</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={[styles.ftIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="wallet-bifold-outline" size={18} color="#2563EB" /></View>
              <Text style={styles.ftLbl}>Avg. Per Task</Text>
              <Text style={styles.ftVal}>₹301.79</Text>
              <Text style={styles.ftTrend}>↑ 10%</Text>
            </View>
          </View>
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color="#94A3B8" />
            <TextInput style={styles.searchInput} placeholder="Search transactions" placeholderTextColor="#94A3B8" />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="filter-variant" size={16} color="#64748B" />
            <Text style={styles.filterBtnTxt}>All Types</Text>
            <Icon name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="sort" size={16} color="#64748B" />
            <Text style={styles.filterBtnTxt}>Latest First</Text>
            <Icon name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* List Header */}
        <View style={styles.listHeaderRow}>
          <View style={[styles.lhCol, {width: 70}]}><Text style={styles.lhTxt}>Date <Icon name="swap-vertical" size={10}/></Text></View>
          <View style={[styles.lhCol, {width: 110}]}><Text style={styles.lhTxt}>Service Type</Text></View>
          <View style={[styles.lhCol, {flex: 1}]}><Text style={styles.lhTxt}>Property / Customer</Text></View>
          <View style={[styles.lhCol, {width: 50}]}><Text style={styles.lhTxt}>Amount</Text></View>
          <View style={[styles.lhCol, {width: 60, alignItems: 'center'}]}><Text style={styles.lhTxt}>Status</Text></View>
        </View>

        {/* Transactions List */}
        <View style={styles.listContainer}>
          {transactions.map((tx, index) => (
            <TouchableOpacity key={tx.id} style={styles.txRow}>
              
              <View style={[styles.txCol, {width: 70}]}>
                <Text style={styles.txDate}>{tx.date}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>

              <View style={[styles.txCol, {width: 110, flexDirection: 'row', alignItems: 'center'}]}>
                <View style={[styles.txIconBg, {backgroundColor: tx.bg}]}><Icon name={tx.icon} size={16} color={tx.color} /></View>
                <View style={{flex: 1, paddingRight: 4}}>
                  <Text style={styles.txType} numberOfLines={1}>{tx.type}</Text>
                  <Text style={styles.txPlate} numberOfLines={1}>{tx.plate}</Text>
                </View>
              </View>

              <View style={[styles.txCol, {flex: 1, paddingRight: 4}]}>
                <Text style={styles.txProp} numberOfLines={1}>{tx.prop}</Text>
                {!!tx.subProp && <Text style={styles.txSubProp} numberOfLines={1}>{tx.subProp}</Text>}
              </View>

              <View style={[styles.txCol, {width: 55}]}>
                <Text style={styles.txAmnt}>₹{tx.amount}</Text>
              </View>

              <View style={[styles.txCol, {width: 70, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end'}]}>
                <View style={[styles.statusBadge, {backgroundColor: tx.status === 'Completed' ? '#DCFCE7' : '#EFF6FF'}]}>
                  <Text style={[styles.statusBadgeTxt, {color: tx.status === 'Completed' ? '#16A34A' : '#2563EB'}]}>{tx.status}</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#CBD5E1" style={{marginLeft: 4}} />
              </View>
              
            </TouchableOpacity>
          ))}
        </View>

        {/* Pagination */}
        <View style={styles.paginationRow}>
          <TouchableOpacity style={styles.pageBtn}><Icon name="chevron-left" size={16} color="#94A3B8" /></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtnActive}><Text style={styles.pageBtnActiveTxt}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnTxt}>2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnTxt}>3</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnTxt}>...</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnTxt}>10</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn}><Icon name="chevron-right" size={16} color="#64748B" /></TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payouts are processed every Monday.</Text>
            <Text style={styles.infoSub}>You will receive your earnings directly in your bank account.</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.phLink}>Payout History ›</Text>
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
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  monthSelectorTxt: { fontSize: 13, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginHorizontal: 6 },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  tcHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tcTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewSummaryTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  tcFooterGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  tcFooterCol: { flex: 1, alignItems: 'center' },
  ftIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  ftLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', textAlign: 'center' },
  ftVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  ftTrend: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', textAlign: 'center' },
  gridDivider: { width: 1, height: '70%', backgroundColor: '#F1F5F9', marginHorizontal: 4, alignSelf: 'center' },

  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, height: 36, marginRight: 8 },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 12, color: '#0F172A', fontFamily: 'Inter-Regular' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 8, height: 36, marginRight: 8 },
  filterBtnTxt: { fontSize: 11, fontWeight: '600', color: '#475569', fontFamily: 'Inter-SemiBold', marginHorizontal: 4 },

  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  lhCol: { justifyContent: 'center' },
  lhTxt: { fontSize: 9, fontWeight: '700', color: '#64748B', fontFamily: 'Inter-Bold' },

  listContainer: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 4, marginBottom: 16 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  txCol: { justifyContent: 'center' },
  
  txDate: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  txTime: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  
  txIconBg: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  txType: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  txPlate: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },

  txProp: { fontSize: 10, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold' },
  txSubProp: { fontSize: 9, color: '#1E3A8A', fontFamily: 'Inter-Medium', marginTop: 2 },

  txAmnt: { fontSize: 11, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },

  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeTxt: { fontSize: 8, fontWeight: '700', fontFamily: 'Inter-Bold' },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  pageBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  pageBtnTxt: { fontSize: 12, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },
  pageBtnActive: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  pageBtnActiveTxt: { fontSize: 12, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20 },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', fontFamily: 'Inter-Bold', lineHeight: 16 },
  infoSub: { fontSize: 10, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 2 },
  phLink: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },
});

export default EarningsHistoryScreen;
