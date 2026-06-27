import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeReportTab, setActiveReportTab] = useState('Attendance');

  const reportTabs = [
    { name: 'Attendance', label: 'Attendance Report', icon: 'calendar-check' },
    { name: 'Cleaning', label: 'Cleaning Report', icon: 'broom' },
    { name: 'Performance', label: 'Cleaner Performance', icon: 'account-badge-outline' },
    { name: 'Apartment', label: 'Apartment Report', icon: 'office-building' },
    { name: 'Complaint', label: 'Complaint Report', icon: 'message-alert-outline' },
  ];

  // High fidelity metrics
  const staffMetrics = [
    { val: '128', label: 'Total Staff', icon: 'account-group', color: '#2563EB', bg: '#EFF6FF', pct: null },
    { val: '98', label: 'Present', icon: 'check-circle-outline', color: '#16A34A', bg: '#ECFDF5', pct: '76.6%' },
    { val: '18', label: 'Late', icon: 'clock-outline', color: '#D97706', bg: '#FFF7ED', pct: '14.1%' },
    { val: '10', label: 'Absent', icon: 'close-circle-outline', color: '#DC2626', bg: '#FEF2F2', pct: '7.8%' },
    { val: '2', label: 'On Leave', icon: 'airplane-takeoff', color: '#8B5CF6', bg: '#FAF5FF', pct: '1.5%' },
  ];

  // Attendance Trend Mock Data points for Custom chart
  // Points layout: 14 May, 15 May, 16 May, 17 May, 18 May, 19 May, 20 May
  const trendLabels = ['14 May', '15 May', '16 May', '17 May', '18 May', '19 May', '20 May'];
  const presentTrend = [70, 85, 92, 88, 95, 98, 98];
  const lateTrend = [16, 10, 8, 10, 12, 14, 18];
  const absentTrend = [12, 8, 6, 9, 5, 6, 10];

  const cleanerAttendance = [
    { name: 'Ramesh Kumar', ratio: '25 / 30', pct: 83 },
    { name: 'Suresh Yadav', ratio: '25 / 30', pct: 83 },
    { name: 'Vikram Singh', ratio: '24 / 30', pct: 80 },
    { name: 'Amit Verma', ratio: '22 / 30', pct: 73 },
    { name: 'Arjun Patel', ratio: '21 / 30', pct: 70 },
  ];

  // Render simulated Line Chart
  const renderLineChart = () => {
    const chartHeight = 150;
    const padding = 30;
    // Map values to coordinates inside height 150
    const getY = (val: number) => chartHeight - (val / 120) * chartHeight;

    return (
      <View style={styles.chartWrapper}>
        <View style={styles.chartYAxis}>
          <Text style={styles.axisLabel}>120</Text>
          <Text style={styles.axisLabel}>100</Text>
          <Text style={styles.axisLabel}>80</Text>
          <Text style={styles.axisLabel}>60</Text>
          <Text style={styles.axisLabel}>40</Text>
          <Text style={styles.axisLabel}>20</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <View style={styles.chartPlotArea}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[styles.gridLine, { top: (chartHeight / 6) * i }]} />
          ))}

          {/* Render Present Trend Nodes */}
          <View style={styles.nodesContainer}>
            {presentTrend.map((val, idx) => (
              <View key={`pres-${idx}`} style={[styles.chartNodeWrapper, { left: `${(idx / 6) * 90}%`, top: getY(val) }]}>
                <View style={[styles.chartDot, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.dotValueTxt}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Render Late Trend Nodes */}
          <View style={styles.nodesContainer}>
            {lateTrend.map((val, idx) => (
              <View key={`late-${idx}`} style={[styles.chartNodeWrapper, { left: `${(idx / 6) * 90}%`, top: getY(val) }]}>
                <View style={[styles.chartDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.dotValueTxt}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Render Absent Trend Nodes */}
          <View style={styles.nodesContainer}>
            {absentTrend.map((val, idx) => (
              <View key={`abs-${idx}`} style={[styles.chartNodeWrapper, { left: `${(idx / 6) * 90}%`, top: getY(val) }]}>
                <View style={[styles.chartDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.dotValueTxt}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* X Axis Labels */}
        <View style={styles.xAxisRow}>
          {trendLabels.map((lbl, idx) => (
            <Text key={idx} style={[styles.xAxisLabel, { left: `${(idx / 6) * 80 + 8}%` }]}>{lbl}</Text>
          ))}
        </View>
      </View>
    );
  };

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
            <Text style={styles.mainTitle}>Reports</Text>
            <Text style={styles.subTitle}>Analyze performance and activities</Text>
          </View>
          <TouchableOpacity style={styles.datePickerBtn}>
            <Icon name="calendar-month-outline" size={16} color="#2563EB" />
            <Text style={styles.datePickerTxt}>20 May 2025 - 20 May 2025</Text>
            <Icon name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector Buttons Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reportTabsRow}>
          {reportTabs.map((tab) => {
            const isActive = activeReportTab === tab.name;
            return (
              <TouchableOpacity 
                key={tab.name} 
                style={[styles.reportTabItem, isActive && styles.reportTabActiveItem]}
                onPress={() => setActiveReportTab(tab.name)}
              >
                <Icon name={tab.icon} size={16} color={isActive ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.reportTabTxt, isActive && styles.reportTabActiveTxt]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Staff Attendance Metrics Row */}
        <View style={styles.metricsRow}>
          {staffMetrics.map((metric, idx) => (
            <Card key={idx} variant="elevated" style={styles.metricCard}>
              <View style={[styles.metricIconBg, { backgroundColor: metric.bg }]}>
                <Icon name={metric.icon} size={16} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.val}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              {metric.pct && (
                <View style={[styles.pctBadge, { backgroundColor: metric.bg }]}>
                  <Text style={[styles.pctBadgeTxt, { color: metric.color }]}>{metric.pct}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* Attendance Trend Section */}
        <Card variant="elevated" style={styles.trendCard}>
          <View style={styles.trendHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Attendance Trend</Text>
            <TouchableOpacity style={styles.trendDailyDropdown}>
              <Text style={styles.dropdownTxt}>Daily</Text>
              <Icon name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Graph Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.legendTxt}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendTxt}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.legendTxt}>Late</Text>
            </View>
          </View>

          {/* Simulated Line Chart */}
          {renderLineChart()}
        </Card>

        {/* Attendance List and Pie Chart Split Panel */}
        <View style={styles.splitRow}>
          {/* Attendance by Cleaner */}
          <Card variant="elevated" style={styles.splitCard}>
            <View style={styles.splitHeaderRow}>
              <Text style={styles.splitCardTitle}>Attendance by Cleaner</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cleanerBarList}>
              {cleanerAttendance.map((cleaner, idx) => (
                <View key={idx} style={styles.cleanerBarRow}>
                  <View style={styles.cleanerBarInfo}>
                    <Text style={styles.cleanerBarName}>{cleaner.name}</Text>
                    <Text style={styles.cleanerBarRatio}>{cleaner.ratio}</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${cleaner.pct}%`, backgroundColor: '#16A34A' }]} />
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Attendance % Distribution */}
          <Card variant="elevated" style={styles.splitCard}>
            <Text style={styles.splitCardTitle}>Attendance % Distribution</Text>
            
            <View style={styles.donutChartWrapper}>
              {/* Simulated Donut shape */}
              <View style={styles.donutShape}>
                <View style={styles.donutHole}>
                  <Text style={styles.donutHoleText}>76.6%</Text>
                </View>
              </View>

              {/* Legend details */}
              <View style={styles.donutLegendCol}>
                <View style={styles.legendRowItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.donutLegendTxt}>Present (76.6%)</Text>
                </View>
                <View style={styles.legendRowItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
                  <Text style={styles.donutLegendTxt}>Late (14.1%)</Text>
                </View>
                <View style={styles.legendRowItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                  <Text style={styles.donutLegendTxt}>Absent (7.8%)</Text>
                </View>
                <View style={styles.legendRowItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.donutLegendTxt}>On Leave (1.5%)</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Summary and Exports Split Panel */}
        <View style={[styles.splitRow, { marginTop: 16 }]}>
          {/* Summary Card */}
          <Card variant="elevated" style={styles.splitCard}>
            <Text style={styles.splitCardTitle}>Summary</Text>
            
            <View style={styles.summaryList}>
              <View style={styles.summaryRowItem}>
                <Icon name="clock-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Average Attendance</Text>
                <Text style={[styles.summaryValBold, { color: '#16A34A' }]}>86.2%</Text>
              </View>

              <View style={styles.summaryRowItem}>
                <Icon name="calendar-check-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Best Attendance Day</Text>
                <Text style={[styles.summaryValBold, { color: '#16A34A' }]}>19 May 2025 (98%)</Text>
              </View>

              <View style={styles.summaryRowItem}>
                <Icon name="calendar-remove-outline" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Lowest Attendance Day</Text>
                <Text style={[styles.summaryValBold, { color: '#DC2626' }]}>14 May 2025 (70%)</Text>
              </View>

              <View style={styles.summaryRowItem}>
                <Icon name="calendar-range" size={16} color="#64748B" />
                <Text style={styles.summaryLabel}>Total Working Days</Text>
                <Text style={styles.summaryVal}>7 Days</Text>
              </View>
            </View>
          </Card>

          {/* Export Report Card */}
          <Card variant="elevated" style={styles.splitCard}>
            <Text style={styles.splitCardTitle}>Export Report</Text>
            
            <View style={styles.exportList}>
              <TouchableOpacity style={styles.exportItem}>
                <View style={[styles.exportIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="file-pdf-box" size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.exportTitle}>Export as PDF</Text>
                  <Text style={styles.exportDesc}>Download report in PDF format</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportItem}>
                <View style={[styles.exportIconBg, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="file-excel-box" size={20} color="#16A34A" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.exportTitle}>Export as Excel</Text>
                  <Text style={styles.exportDesc}>Download report in Excel format</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportItem}>
                <View style={[styles.exportIconBg, { backgroundColor: '#F0FDF4' }]}>
                  <Icon name="file-document-outline" size={20} color="#16A34A" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.exportTitle}>Export as CSV</Text>
                  <Text style={styles.exportDesc}>Download report in CSV format</Text>
                </View>
                <Icon name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Bottom Banner info */}
        <View style={styles.bottomInfoBanner}>
          <Icon name="information-outline" size={16} color="#2563EB" />
          <Text style={styles.bottomInfoBannerTxt}>Reports are updated daily at 11:59 PM</Text>
          <TouchableOpacity style={{ marginLeft: 'auto' }}>
            <Icon name="refresh" size={16} color="#2563EB" />
          </TouchableOpacity>
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
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 6,
    fontFamily: 'Inter-Medium',
  },
  reportTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  reportTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  reportTabActiveItem: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  reportTabTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  reportTabActiveTxt: {
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  metricIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 4,
  },
  pctBadgeTxt: {
    fontSize: 8,
    fontWeight: '700',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  trendDailyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  dropdownTxt: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 170,
    position: 'relative',
  },
  chartYAxis: {
    width: 25,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    height: 150,
  },
  axisLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chartPlotArea: {
    flex: 1,
    height: 150,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  nodesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chartNodeWrapper: {
    position: 'absolute',
    alignItems: 'center',
    width: 20,
    marginLeft: -10,
    marginTop: -5,
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dotValueTxt: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: -16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 2,
    borderRadius: 3,
  },
  xAxisRow: {
    position: 'absolute',
    left: 25,
    right: 0,
    bottom: 0,
    height: 20,
    flexDirection: 'row',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 16,
  },
  splitCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  viewAllLink: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  cleanerBarList: {
    gap: 12,
  },
  cleanerBarRow: {
    gap: 4,
  },
  cleanerBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cleanerBarName: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#1E293B',
  },
  cleanerBarRatio: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  donutChartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  donutShape: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHoleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  donutLegendCol: {
    flex: 1,
    gap: 6,
  },
  legendRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donutLegendTxt: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '600',
  },
  summaryList: {
    gap: 10,
    marginTop: 6,
  },
  summaryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  summaryVal: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryValBold: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  exportList: {
    gap: 8,
    marginTop: 6,
  },
  exportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
  },
  exportIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportTitle: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#1E293B',
  },
  exportDesc: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 1,
  },
  bottomInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 16,
  },
  bottomInfoBannerTxt: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default ReportsScreen;
