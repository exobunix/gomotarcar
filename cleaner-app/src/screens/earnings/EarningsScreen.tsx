import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { fetchEarnings } from '../../redux/slices/earningsSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props { navigation: any }

const { width } = Dimensions.get('window');

const EarningsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [chartRange, setChartRange] = useState('Month');
  
  const dispatch = useDispatch<AppDispatch>();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { summary, loading } = useSelector((s: RootState) => s.earnings);

  useEffect(() => {
    if (cleaner?._id) {
      dispatch(fetchEarnings({ cleanerId: cleaner._id, period: chartRange.toLowerCase() as any }));
    }
  }, [dispatch, cleaner?._id, chartRange]);

  // Dummy Chart Data Points (Simulated Line Graph)
  const chartData = [
    { label: 'Dec', value: 6240, height: 40 },
    { label: 'Jan', value: 6980, height: 50 },
    { label: 'Feb', value: 7120, height: 52 },
    { label: 'Mar', value: 8100, height: 75 },
    { label: 'Apr', value: 7130, height: 52 },
    { label: 'May', value: summary?.totalEarnings || 8450, height: 85 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.blueHeaderBg, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
        <View style={styles.topHeaderRow}>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Earnings Dashboard</Text>
            <Text style={styles.mainSubTitle}>Track your earnings and payouts</Text>
          </View>
          <TouchableOpacity style={styles.monthSelector}>
            <Icon name="calendar-month-outline" size={16} color="#FFF" />
            <Text style={styles.monthSelectorTxt}>May 2025</Text>
            <Icon name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.blueFiller} />
        {/* Total Earnings Card */}
        <View style={styles.topCard}>
          <View style={styles.tcHeaderContent}>
            <View style={styles.tcLeft}>
              <Text style={styles.tcTitle}>Total Earnings</Text>
              <Text style={styles.tcAmount}>₹{summary?.totalEarnings?.toLocaleString() || '8,450.00'}</Text>
              <View style={styles.tcTrendRow}>
                <Icon name="arrow-up" size={12} color="#16A34A" />
                <Text style={styles.tcTrendTxt}>18.6% vs Apr 2025</Text>
              </View>
            </View>
            <View style={styles.tcRightImage}>
              {/* Wallet illustration mockup using nested views/icons since we don't have the exact asset */}
              <View style={styles.mockWallet}>
                <View style={styles.mockCash} />
                <View style={styles.mockWalletBody}>
                  <View style={styles.mockWalletClip} />
                </View>
                <View style={styles.mockCoin}>
                  <Icon name="currency-inr" size={12} color="#CA8A04" />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tcFooterGrid}>
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="calendar-check-outline" size={16} color="#2563EB" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Completed Tasks</Text>
                  <Text style={styles.ftVal}>{summary?.taskCount || 28}</Text>
                  <Text style={styles.ftTrend}>↑ 12%</Text>
                </View>
              </View>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#F3E8FF'}]}><Icon name="clock-outline" size={16} color="#9333EA" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Hours Worked</Text>
                  <Text style={styles.ftVal}>42h 15m</Text>
                  <Text style={styles.ftTrend}>↑ 15%</Text>
                </View>
              </View>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.tcFooterCol}>
              <View style={styles.ftIconRow}>
                <View style={[styles.ftIconBg, {backgroundColor: '#ECFDF5'}]}><Icon name="cash-multiple" size={16} color="#16A34A" /></View>
                <View style={{marginLeft: 8}}>
                  <Text style={styles.ftLbl}>Avg. Per Task</Text>
                  <Text style={styles.ftVal}>₹301.79</Text>
                  <Text style={styles.ftTrend}>↑ 10%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Earnings Overview */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Earnings Overview</Text>
            <View style={styles.rangeSelector}>
              <TouchableOpacity style={styles.rangeBtn}><Text style={styles.rangeTxt}>Week</Text></TouchableOpacity>
              <TouchableOpacity style={styles.rangeBtnActive}><Text style={styles.rangeTxtActive}>Month</Text></TouchableOpacity>
              <TouchableOpacity style={styles.rangeBtn}><Text style={styles.rangeTxt}>Year</Text></TouchableOpacity>
            </View>
          </View>

          {/* Pseudo Bar Chart Simulation */}
          <View style={styles.chartContainer}>
            {/* Y Axis Labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisTxt}>₹12K</Text>
              <Text style={styles.yAxisTxt}>₹9K</Text>
              <Text style={styles.yAxisTxt}>₹6K</Text>
              <Text style={styles.yAxisTxt}>₹3K</Text>
              <Text style={styles.yAxisTxt}>₹0</Text>
            </View>
            {/* Chart Area */}
            <View style={styles.chartArea}>
              {chartData.map((pt, i) => (
                <View key={i} style={styles.chartCol}>
                  <Text style={styles.chartDataLbl}>₹{pt.value.toLocaleString()}</Text>
                  <View style={styles.chartBarTrack}>
                    <View style={[styles.chartBarFill, { height: `${pt.height}%` }]} />
                    {/* The little dot on top of the bar */}
                    <View style={[styles.chartDot, { bottom: `${pt.height}%` }]} />
                  </View>
                  <Text style={styles.chartXAxisTxt}>{pt.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Breakdown & Payout Cards */}
        <View style={styles.splitCardsRow}>
          
          {/* Earnings Breakdown */}
          <View style={[styles.sectionBlock, { flex: 1, marginRight: 8, padding: 12 }]}>
            <Text style={[styles.sectionTitle, { fontSize: 13 }]}>Earnings Breakdown</Text>
            <View style={styles.donutContainer}>
              {/* Pseudo Donut Chart */}
              <View style={styles.donutMock}>
                <View style={[styles.donutSlice, styles.sliceBlue]} />
                <View style={[styles.donutSlice, styles.slicePurple]} />
                <View style={[styles.donutSlice, styles.sliceGreen]} />
                <View style={[styles.donutSlice, styles.sliceOrange]} />
                <View style={styles.donutHole}>
                  <Text style={styles.donutTotal}>₹8,450</Text>
                  <Text style={styles.donutLbl}>Total</Text>
                </View>
              </View>
              
              <View style={styles.donutLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#2563EB'}]} />
                  <View>
                    <Text style={styles.legendTitle}>Premium Wash</Text>
                    <Text style={styles.legendSub}>₹5,100 (60%)</Text>
                  </View>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#9333EA'}]} />
                  <View>
                    <Text style={styles.legendTitle}>Standard Wash</Text>
                    <Text style={styles.legendSub}>₹2,200 (26%)</Text>
                  </View>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#16A34A'}]} />
                  <View>
                    <Text style={styles.legendTitle}>Deep Cleaning</Text>
                    <Text style={styles.legendSub}>₹750 (9%)</Text>
                  </View>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#EA580C'}]} />
                  <View>
                    <Text style={styles.legendTitle}>Other Services</Text>
                    <Text style={styles.legendSub}>₹400 (5%)</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Payout Summary */}
          <View style={[styles.sectionBlock, { flex: 1, marginLeft: 8, padding: 12, justifyContent: 'space-between' }]}>
            <Text style={[styles.sectionTitle, { fontSize: 13 }]}>Payout Summary</Text>
            
            <View style={styles.payoutBlockTop}>
              <View style={styles.payoutIconBg}><Icon name="wallet-outline" size={24} color="#16A34A" /></View>
              <View style={{marginLeft: 12, flex: 1}}>
                <Text style={styles.payoutLbl}>Next Payout</Text>
                <Text style={styles.payoutAmnt}>₹6,850.00</Text>
                <Text style={styles.payoutSub}>Expected on 20 May 2025</Text>
              </View>
            </View>
            
            <View style={styles.dividerLight} />

            <View style={styles.payoutBlockBottom}>
              <Text style={styles.payoutLbl}>Last Payout</Text>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutAmntSm}>₹6,200.00</Text>
                <View style={styles.paidBadge}><Text style={styles.paidBadgeTxt}>Paid</Text></View>
              </View>
              <Text style={styles.payoutSub}>05 May 2025</Text>
            </View>
          </View>

        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity><Text style={styles.viewAllTxt}>View All</Text></TouchableOpacity>
          </View>

          <View style={styles.txItem}>
            <View style={[styles.txIconBg, { backgroundColor: '#F0FDF4' }]}><Icon name="check-circle-outline" size={20} color="#16A34A" /></View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>Premium Wash</Text>
              <Text style={styles.txSub}>Green Valley Apartments • DL 01 AB 1234</Text>
            </View>
            <View style={styles.txAmntCol}>
              <Text style={styles.txAmnt}>₹350.00</Text>
              <Text style={[styles.txStatus, {color: '#16A34A'}]}>Completed</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.txItem}>
            <View style={[styles.txIconBg, { backgroundColor: '#FAF5FF' }]}><Icon name="check-circle-outline" size={20} color="#9333EA" /></View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>Standard Wash</Text>
              <Text style={styles.txSub}>Sunshine Residency • UP 16 CD 5678</Text>
            </View>
            <View style={styles.txAmntCol}>
              <Text style={styles.txAmnt}>₹250.00</Text>
              <Text style={[styles.txStatus, {color: '#16A34A'}]}>Completed</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.txItem}>
            <View style={[styles.txIconBg, { backgroundColor: '#FFF7ED' }]}><Icon name="check-circle-outline" size={20} color="#EA580C" /></View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>Deep Cleaning</Text>
              <Text style={styles.txSub}>Maple Heights • DL 02 EF 9012</Text>
            </View>
            <View style={styles.txAmntCol}>
              <Text style={styles.txAmnt}>₹500.00</Text>
              <Text style={[styles.txStatus, {color: '#16A34A'}]}>Completed</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.txItem}>
            <View style={[styles.txIconBg, { backgroundColor: '#EFF6FF' }]}><Icon name="check-circle-outline" size={20} color="#2563EB" /></View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>Premium Wash</Text>
              <Text style={styles.txSub}>Green Valley Apartments • UP 16 GH 3456</Text>
            </View>
            <View style={styles.txAmntCol}>
              <Text style={styles.txAmnt}>₹350.00</Text>
              <Text style={[styles.txStatus, {color: '#16A34A'}]}>Completed</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#CBD5E1" style={{marginLeft: 8}} />
          </View>
        </View>

        {/* Quick Links Grid */}
        <View style={styles.quickLinksGrid}>
          <TouchableOpacity style={styles.qlItem}>
            <View style={[styles.qlIconBg, {backgroundColor: '#EFF6FF'}]}><Icon name="chart-pie" size={24} color="#2563EB" /></View>
            <Text style={styles.qlTxt}>Earnings Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qlItem}>
            <View style={[styles.qlIconBg, {backgroundColor: '#FAF5FF'}]}><Icon name="file-document-outline" size={24} color="#9333EA" /></View>
            <Text style={styles.qlTxt}>Payout History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qlItem}>
            <View style={[styles.qlIconBg, {backgroundColor: '#F0FDF4'}]}><Icon name="bank-outline" size={24} color="#16A34A" /></View>
            <Text style={styles.qlTxt}>Bank Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qlItem}>
            <View style={[styles.qlIconBg, {backgroundColor: '#FFF7ED'}]}><Icon name="help-circle-outline" size={24} color="#EA580C" /></View>
            <Text style={styles.qlTxt}>Help & Support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollView: { flex: 1 },
  blueHeaderBg: {
    backgroundColor: '#0A2540', // Very dark blue for Earnings screen
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  blueFiller: {
    backgroundColor: '#0A2540',
    height: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: -16,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitles: { flex: 1 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 4 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  monthSelectorTxt: { fontSize: 13, fontWeight: '600', color: '#FFF', fontFamily: 'Inter-SemiBold', marginHorizontal: 6 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: { backgroundColor: '#FFF', borderRadius: 16, marginTop: -40, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20, zIndex: 20 },
  tcHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tcLeft: { flex: 1 },
  tcTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  tcAmount: { fontSize: 32, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 6 },
  tcTrendRow: { flexDirection: 'row', alignItems: 'center' },
  tcTrendTxt: { fontSize: 11, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginLeft: 4 },
  
  tcRightImage: { width: 100, height: 80, alignItems: 'center', justifyContent: 'center' },
  mockWallet: { width: 70, height: 50, position: 'relative' },
  mockWalletBody: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: '#2563EB', borderRadius: 8, zIndex: 2 },
  mockWalletClip: { position: 'absolute', top: 15, right: 8, width: 8, height: 10, backgroundColor: '#0F172A', borderRadius: 4 },
  mockCash: { position: 'absolute', top: -5, left: 10, width: 40, height: 20, backgroundColor: '#22C55E', borderRadius: 4, transform: [{rotate: '-15deg'}], zIndex: 1 },
  mockCoin: { position: 'absolute', bottom: -5, left: -10, width: 24, height: 24, borderRadius: 12, backgroundColor: '#EAB308', borderWidth: 2, borderColor: '#FEF08A', alignItems: 'center', justifyContent: 'center', zIndex: 3 },

  tcFooterGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  tcFooterCol: { flex: 1 },
  ftIconRow: { flexDirection: 'row', alignItems: 'center' },
  ftIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  ftLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  ftVal: { fontSize: 13, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginTop: 2 },
  ftTrend: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold', marginTop: 2 },
  gridDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9', marginHorizontal: 6 },

  sectionBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  viewAllTxt: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold' },

  rangeSelector: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, padding: 2 },
  rangeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  rangeTxt: { fontSize: 10, fontWeight: '600', color: '#64748B', fontFamily: 'Inter-SemiBold' },
  rangeBtnActive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#2563EB' },
  rangeTxtActive: { fontSize: 10, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },

  chartContainer: { flexDirection: 'row', height: 180, marginTop: 10 },
  yAxis: { justifyContent: 'space-between', paddingRight: 10, paddingBottom: 20 },
  yAxisTxt: { fontSize: 10, color: '#94A3B8', fontFamily: 'Inter-Medium' },
  chartArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, position: 'relative' },
  chartCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBarTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', alignItems: 'center', position: 'relative' },
  chartBarFill: { width: '100%', backgroundColor: 'rgba(37,99,235,0.1)', borderTopLeftRadius: 4, borderTopRightRadius: 4 }, // Area below line
  chartDataLbl: { fontSize: 9, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', marginBottom: 4 },
  chartDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#2563EB', zIndex: 10, marginLeft: -4, left: '50%' },
  chartXAxisTxt: { position: 'absolute', bottom: -20, fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },

  splitCardsRow: { flexDirection: 'row', marginBottom: 16 },
  donutContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  donutMock: { width: 90, height: 90, borderRadius: 45, borderWidth: 16, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  // Fake slices using absolute positioning & borders (CSS hack for React Native views)
  donutSlice: { position: 'absolute', width: '100%', height: '100%', borderRadius: 45, borderWidth: 16, borderColor: 'transparent' },
  sliceBlue: { borderTopColor: '#2563EB', borderRightColor: '#2563EB', transform: [{rotate: '45deg'}] },
  slicePurple: { borderLeftColor: '#9333EA', borderBottomColor: '#9333EA', transform: [{rotate: '15deg'}] },
  sliceGreen: { borderTopColor: '#16A34A', transform: [{rotate: '-45deg'}] },
  sliceOrange: { borderBottomColor: '#EA580C', transform: [{rotate: '-75deg'}] },
  donutHole: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  donutTotal: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  donutLbl: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  donutLegend: { flex: 1, marginLeft: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginRight: 6 },
  legendTitle: { fontSize: 10, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  legendSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Regular' },

  payoutBlockTop: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  payoutIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  payoutLbl: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium' },
  payoutAmnt: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold', marginVertical: 2 },
  payoutAmntSm: { fontSize: 16, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  payoutSub: { fontSize: 9, color: '#64748B', fontFamily: 'Inter-Medium' },
  dividerLight: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  payoutBlockBottom: { },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  paidBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  paidBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#16A34A', fontFamily: 'Inter-Bold' },

  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  txIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold' },
  txSub: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  txAmntCol: { alignItems: 'flex-end' },
  txAmnt: { fontSize: 14, fontWeight: '800', color: '#0F172A', fontFamily: 'Inter-Bold' },
  txStatus: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', marginTop: 2 },
  itemDivider: { height: 1, backgroundColor: '#F1F5F9' },

  quickLinksGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  qlItem: { width: '23%', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  qlIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qlTxt: { fontSize: 9, fontWeight: '700', color: '#0F172A', fontFamily: 'Inter-Bold', textAlign: 'center' },
});

export default EarningsScreen;
