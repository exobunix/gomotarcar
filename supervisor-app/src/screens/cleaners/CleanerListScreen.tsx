import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, Image, Platform, Dimensions,
  StatusBar, Alert, Linking, ActivityIndicator, Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import {
  fetchCleaners,
  fetchCleanerStats,
  approveCleaner,
} from '../../redux/slices/cleanerSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type FilterTab = 'All' | 'Active' | 'On Leave' | 'Pending';

interface Props { navigation: any }

const FILTER_TABS: FilterTab[] = ['All', 'Active', 'On Leave', 'Pending'];

const CleanerListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const { cleaners, loading, stats, approving } = useSelector((s: RootState) => s.cleaners);
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const load = useCallback(() => {
    dispatch(fetchCleaners({ limit: 1000 }));
    dispatch(fetchCleanerStats());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // --- Derive stats from Redux state (real data) ---
  const totalCleaners = stats?.totalCleaners?.value ?? cleaners.length;
  const activeCleaners = stats?.activeCleaners?.value ??
    cleaners.filter(c => c.isActive && c.verificationStatus === 'verified').length;
  const onLeaveCount = stats?.onLeave?.value ?? 0;
  const pendingCount = stats?.pendingApprovals?.value ??
    cleaners.filter(c => c.verificationStatus === 'pending').length;

  const totalChange = stats?.totalCleaners?.change ?? 0;
  const activeChange = stats?.activeCleaners?.change ?? 0;
  const pendingChange = stats?.pendingApprovals?.change ?? 0;

  // --- Filter cleaners ---
  const filtered = cleaners.filter((c) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      const phone = c.userId?.phone || c.phone || '';
      const cid = c.cleanerId || '';
      if (!fullName.includes(q) && !phone.includes(q) && !cid.toLowerCase().includes(q)) {
        return false;
      }
    }
    // Status filter
    if (activeFilter === 'Active') return c.isActive && c.verificationStatus === 'verified';
    if (activeFilter === 'Pending') return c.verificationStatus === 'pending';
    // "On Leave" — we don't have per-cleaner leave info in the list response,
    // so show inactive cleaners that are verified (best approximation without extra API call)
    if (activeFilter === 'On Leave') return !c.isActive && c.verificationStatus === 'verified';
    return true; // 'All'
  });

  // --- Helpers ---
  const getStatusInfo = (item: any): { text: string; color: string; bg: string } => {
    if (item.verificationStatus === 'pending') {
      return { text: 'Pending', color: '#8B5CF6', bg: '#F5F3FF' };
    }
    if (!item.isActive) {
      return { text: 'On Leave', color: '#F97316', bg: '#FFF7ED' };
    }
    return { text: 'Active', color: '#16A34A', bg: '#ECFDF5' };
  };

  const getCleanerPhone = (item: any): string => {
    return item.userId?.phone || item.phone || '—';
  };

  const getCleanerName = (item: any): string => {
    const firstName = item.firstName || '';
    const lastName = item.lastName || '';
    return `${firstName} ${lastName}`.trim() || item.name || 'Unknown';
  };

  // --- Actions ---
  const handleCall = (item: any) => {
    const phone = getCleanerPhone(item).replace(/\s+/g, '');
    if (phone === '—') {
      Alert.alert('No Phone', 'This cleaner does not have a phone number on record.');
      return;
    }
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open dialer.');
      }
    });
  };

  const handleApprove = (item: any) => {
    if (item.verificationStatus !== 'pending') {
      Alert.alert('Already Verified', 'This cleaner is already approved.');
      return;
    }
    Alert.alert(
      'Approve Cleaner',
      `Approve ${getCleanerName(item)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            dispatch(approveCleaner(item._id)).then(() => {
              Alert.alert('Success', `${getCleanerName(item)} has been approved!`);
              dispatch(fetchCleanerStats());
            });
          },
        },
      ],
    );
  };

  const handleAssignCars = (item: any) => {
    navigation.navigate('CleanerAllocation', { cleanerId: item._id, cleanerName: getCleanerName(item) });
  };

  const handleAddCleaner = () => {
    navigation.navigate('CleanerDetail', { mode: 'create' });
  };

  // --- Render item ---
  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusInfo(item);
    const phone = getCleanerPhone(item);
    const name = getCleanerName(item);
    const cleanerIdDisplay = item.cleanerId || '—';
    const aptCount = item.apartmentsCount ?? 0;
    const carCount = item.assignedCarsCount ?? 0;
    const isApproving = approving === item._id;

    return (
      <Card variant="elevated" style={styles.cleanerCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.avatarStatusDot, { backgroundColor: status.color }]} />
          </View>

          {/* Name + Phone + Stats */}
          <View style={styles.detailsCol}>
            <Text style={styles.cleanerId}>{cleanerIdDisplay}</Text>
            {/* Name ABOVE mobile number */}
            <Text style={styles.cleanerName} numberOfLines={1}>{name}</Text>
            <Text style={styles.cleanerPhone}>{phone}</Text>

            <View style={styles.cardStatsRow}>
              <View style={styles.statTag}>
                <Icon name="office-building" size={12} color="#64748B" />
                <Text style={styles.statTagTxt}>{aptCount} Apt</Text>
              </View>
              <View style={styles.statTag}>
                <Icon name="car" size={12} color="#64748B" />
                <Text style={styles.statTagTxt}>{carCount} Cars</Text>
              </View>
            </View>
          </View>

          {/* Status badge on right */}
          <View style={styles.rightInfoCol}>
            <View style={[styles.statusCapsule, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusCapsuleTxt, { color: status.color }]}>{status.text}</Text>
            </View>
            {item.verificationStatus === 'verified' && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={14} color="#10B981" />
              </View>
            )}
          </View>
        </View>

        {/* Bottom Action Row */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('CleanerDetail', { cleanerId: item._id })}
          >
            <Icon name="eye-outline" size={16} color="#2563EB" />
            <Text style={styles.actionBtnTxt}>View</Text>
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleAssignCars(item)}
          >
            <Icon name="car-cog" size={16} color="#7C3AED" />
            <Text style={[styles.actionBtnTxt, { color: '#7C3AED' }]}>Assign Cars</Text>
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={[styles.actionBtn, item.verificationStatus !== 'pending' && styles.actionBtnDisabled]}
            onPress={() => handleApprove(item)}
            disabled={isApproving}
          >
            {isApproving ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <>
                <Icon
                  name="check-circle-outline"
                  size={16}
                  color={item.verificationStatus === 'pending' ? '#10B981' : '#94A3B8'}
                />
                <Text style={[styles.actionBtnTxt, {
                  color: item.verificationStatus === 'pending' ? '#10B981' : '#94A3B8',
                }]}>
                  Approve
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerV} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCall(item)}
          >
            <Icon name="phone" size={16} color="#F97316" />
            <Text style={[styles.actionBtnTxt, { color: '#F97316' }]}>Call</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  // --- Metric cards data ---
  const metricCards = [
    {
      icon: 'account-group',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      value: totalCleaners,
      label: 'Total Cleaners',
      trend: totalChange >= 0 ? `↑ ${Math.abs(totalChange)}` : `↓ ${Math.abs(totalChange)}`,
      trendColor: totalChange >= 0 ? '#16A34A' : '#EF4444',
      onPress: () => setActiveFilter('All'),
    },
    {
      icon: 'account-check',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      value: activeCleaners,
      label: 'Active Cleaners',
      trend: activeChange >= 0 ? `↑ ${Math.abs(activeChange)}` : `↓ ${Math.abs(activeChange)}`,
      trendColor: activeChange >= 0 ? '#16A34A' : '#EF4444',
      onPress: () => setActiveFilter('Active'),
    },
    {
      icon: 'account-clock',
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      value: onLeaveCount,
      label: 'On Leave',
      trend: '—',
      trendColor: '#64748B',
      onPress: () => setActiveFilter('On Leave'),
    },
    {
      icon: 'clipboard-text-clock-outline',
      iconBg: '#FAF5FF',
      iconColor: '#8B5CF6',
      value: pendingCount,
      label: 'Pending Approval',
      trend: pendingChange >= 0 ? `↑ ${Math.abs(pendingChange)}` : `↓ ${Math.abs(pendingChange)}`,
      trendColor: pendingChange >= 0 ? '#EF4444' : '#16A34A',
      onPress: () => setActiveFilter('Pending'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.headerContainer, {
        paddingTop: insets.top > 0 ? insets.top + 4 : (Platform.OS === 'ios' ? 44 : 12),
      }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerMenuBtn}
            onPress={() => navigation.openDrawer?.()}
          >
            <Icon name="menu" size={26} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandSub}>Anything &amp; Everything for your Car</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="bell-outline" size={24} color="#1E293B" />
              {(unreadCount > 0) && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Icon name="account-search-outline" size={52} color="#CBD5E1" />
                <Text style={styles.emptyText}>No cleaners found</Text>
                <Text style={styles.emptySubText}>
                  {activeFilter !== 'All' ? `No cleaners with "${activeFilter}" status` : 'Add your first cleaner using the + button'}
                </Text>
              </>
            )}
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Page Title */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Car Cleaner Management</Text>
              <Text style={styles.subTitle}>
                {loading ? 'Syncing...' : `${cleaners.length} cleaners · ${filtered.length} shown`}
              </Text>
            </View>

            {/* Metric Cards */}
            <View style={styles.analyticsGrid}>
              {metricCards.map((card, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.82}
                  onPress={card.onPress}
                  style={[
                    styles.analyticsCard,
                    activeFilter === FILTER_TABS[idx] && styles.analyticsCardActive,
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <View style={[styles.metricIconBg, { backgroundColor: card.iconBg }]}>
                      <Icon name={card.icon} size={18} color={card.iconColor} />
                    </View>
                    <View>
                      <Text style={styles.metricVal}>{card.value}</Text>
                      <Text style={styles.metricLbl}>{card.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.metricTrend, { color: card.trendColor }]}>
                    {card.trend}{' '}
                    <Text style={styles.trendLabel}>from last month</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search + Filter Tabs */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchBoxWrap}>
                <Icon name="magnify" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, ID or mobile..."
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Icon name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {FILTER_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
                  onPress={() => setActiveFilter(tab)}
                >
                  <Text style={[styles.filterChipTxt, activeFilter === tab && styles.filterChipTxtActive]}>
                    {tab}
                    {tab === 'All' && ` (${cleaners.length})`}
                    {tab === 'Active' && ` (${activeCleaners})`}
                    {tab === 'On Leave' && ` (${onLeaveCount})`}
                    {tab === 'Pending' && ` (${pendingCount})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
      />

      {/* FAB - Add Cleaner */}
      <TouchableOpacity style={styles.fabBtn} onPress={handleAddCleaner} activeOpacity={0.85}>
        <Icon name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
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
  brandLogo: { width: 150, height: 36 },
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
  notifBadgeText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },

  // Title
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter-Bold',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Metric cards grid
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  analyticsCardActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
    width: '48%',
    marginBottom: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconBg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -1,
  },
  metricTrend: { fontSize: 9, fontWeight: '700' },
  trendLabel: { fontWeight: '500', color: '#64748B' },

  // Search
  searchBarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBoxWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    marginLeft: 8,
    padding: 0,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTxtActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Cleaner card
  cleanerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 4,
  },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  detailsCol: { flex: 1 },
  cleanerId: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  // Name is displayed ABOVE phone number
  cleanerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 1,
  },
  cleanerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  cardStatsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  statTagTxt: { fontSize: 9, fontWeight: '600', color: '#475569' },
  rightInfoCol: { alignItems: 'flex-end', gap: 6 },
  statusCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCapsuleTxt: { fontSize: 10, fontWeight: '700' },
  verifiedBadge: { marginTop: 4 },

  // Action row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  actionBtnDisabled: { opacity: 0.45 },
  actionBtnTxt: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2563EB',
  },
  dividerV: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // FAB
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default CleanerListScreen;
