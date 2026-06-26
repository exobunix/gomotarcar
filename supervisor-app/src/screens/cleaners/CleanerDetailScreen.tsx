import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchCleanerById } from '../../redux/slices/cleanerSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any; route: any }

const CleanerDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cleanerId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCleaner: cleaner } = useSelector((s: RootState) => s.cleaners);

  useEffect(() => { dispatch(fetchCleanerById(cleanerId)); }, [dispatch, cleanerId]);

  if (!cleaner) return <View style={styles.container}><Header title="Cleaner" onBack={() => navigation.goBack()} /></View>;

  return (
    <View style={styles.container}>
      <Header title="Cleaner Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={20}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(cleaner.name || '?')[0]}</Text></View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.name}>{cleaner.name}</Text>
                <StatusBadge status={cleaner.isActive ? 'active' : 'inactive'} />
              </View>
              <Text style={styles.id}>{cleaner.cleanerId}</Text>
              <Text style={styles.phone}>{cleaner.phone}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Performance</Text>
        <Card variant="outlined" padding={16}>
          <View style={styles.metricsRow}>
            <View style={styles.metric}><Text style={styles.metricValue}>{cleaner.rating?.toFixed(1) || '-'}</Text><Text style={styles.metricLabel}>Rating</Text></View>
            <View style={styles.metricDiv} />
            <View style={styles.metric}><Text style={styles.metricValue}>{cleaner.completedTasks || 0}</Text><Text style={styles.metricLabel}>Tasks Done</Text></View>
            <View style={styles.metricDiv} />
            <View style={styles.metric}><Text style={styles.metricValue}>{cleaner.totalTasks || 0}</Text><Text style={styles.metricLabel}>Total Tasks</Text></View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Actions</Text>
        <Card variant="outlined" padding={16}>
          <Button title="View Salary & Incentives" variant="outline" onPress={() => navigation.navigate('SalaryDetail', { cleanerId })} style={{ marginBottom: 10 }} />
          <Button title="Assign to Task" variant="outline" onPress={() => navigation.navigate('CleanerAllocation')} style={{ marginBottom: 10 }} />
          {cleaner.isActive ? (
            <Button title="Deactivate Cleaner" variant="danger" onPress={() => {}} />
          ) : (
            <Button title="Reactivate Cleaner" onPress={() => {}} />
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  id: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter-Regular' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12, marginTop: 20 },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  metricLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontFamily: 'Inter-Regular' },
  metricDiv: { width: 1, height: 40, backgroundColor: colors.border },
});

export default CleanerDetailScreen;
