import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { fetchLeadAnalytics } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const { width } = Dimensions.get('window');

const LeadAnalyticsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading } = useSelector((state: RootState) => state.lead);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useRefreshOnFocus(() => dispatch(fetchLeadAnalytics({ period })));

  useEffect(() => {
    dispatch(fetchLeadAnalytics({ period }));
  }, [dispatch, period]);

  const data = analytics || {
    total: 0, new: 0, contacted: 0, interested: 0,
    converted: 0, lost: 0, conversionRate: 0,
    monthlyTrend: [],
  };

  const statCards = [
    { label: 'Total Leads', value: data.total?.toString() || '0', icon: '📋', color: '#2196F3' },
    { label: 'New', value: data.new?.toString() || '0', icon: '🆕', color: '#9C27B0' },
    { label: 'Converted', value: data.converted?.toString() || '0', icon: '✅', color: '#4CAF50' },
    { label: 'Lost', value: data.lost?.toString() || '0', icon: '❌', color: '#F44336' },
  ];

  const ConversionBar = ({ label, value, total, color }: any) => {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.barValue}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.periodRow}>
          {['week', 'month', 'quarter'].map((p) => (
            <View
              key={p}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
            >
              <Text
                style={[styles.periodText, period === p && styles.periodTextActive]}
                onPress={() => setPeriod(p as any)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statGrid}>
          {statCards.map((stat) => (
            <Card key={stat.label} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Conversion Analysis</Text>
          <View style={styles.conversionRate}>
            <Text style={styles.conversionValue}>
              {data.conversionRate?.toFixed(1) || '0'}%
            </Text>
            <Text style={styles.conversionLabel}>Conversion Rate</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Lead Distribution</Text>
          <ConversionBar label="New" value={data.new || 0} total={data.total || 1} color="#9C27B0" />
          <ConversionBar label="Contacted" value={data.contacted || 0} total={data.total || 1} color="#2196F3" />
          <ConversionBar label="Interested" value={data.interested || 0} total={data.total || 1} color="#FF9800" />
          <ConversionBar label="Converted" value={data.converted || 0} total={data.total || 1} color="#4CAF50" />
          <ConversionBar label="Lost" value={data.lost || 0} total={data.total || 1} color="#F44336" />
        </Card>

        {data.monthlyTrend && data.monthlyTrend.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Trend</Text>
            {data.monthlyTrend.map((item: any, idx: number) => (
              <View key={idx} style={styles.monthRow}>
                <Text style={styles.monthLabel}>
                  {item.month || `Month ${idx + 1}`}
                </Text>
                <View style={styles.monthBar}>
                  <View
                    style={[
                      styles.monthBarFill,
                      {
                        width: `${Math.min((item.count / Math.max(...data.monthlyTrend.map((m: any) => m.count || 1))) * 100, 100)}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.monthValue}>{item.count || 0}</Text>
              </View>
            ))}
          </Card>
        )}

        {!data.total && (
          <EmptyState icon="📊" title="No Data Yet" message="Analytics will appear once you start receiving leads." />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 32 },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodChip: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  periodTextActive: { color: colors.white },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', borderLeftWidth: 3, padding: 14, margin: 0,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  card: {},
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 12 },
  conversionRate: { alignItems: 'center', paddingVertical: 12 },
  conversionValue: { fontSize: 36, fontWeight: '700', color: colors.primary },
  conversionLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  barRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8, gap: 8,
  },
  barLabel: { width: 80, fontSize: 13, color: colors.textSecondary },
  barTrack: {
    flex: 1, height: 20, backgroundColor: '#F5F5F5',
    borderRadius: 10, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 10 },
  barValue: { width: 30, textAlign: 'right', fontSize: 13, fontWeight: '600', color: colors.text },
  monthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  monthLabel: { width: 60, fontSize: 12, color: colors.textSecondary },
  monthBar: {
    flex: 1, height: 16, backgroundColor: '#F5F5F5',
    borderRadius: 8, overflow: 'hidden',
  },
  monthBarFill: { height: '100%', borderRadius: 8 },
  monthValue: { width: 30, textAlign: 'right', fontSize: 12, fontWeight: '600', color: colors.text },
});

export default LeadAnalyticsScreen;
