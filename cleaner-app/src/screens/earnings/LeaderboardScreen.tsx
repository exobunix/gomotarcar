import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { fetchLeaderboard } from '../../redux/slices/incentivesSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props { navigation: any }

const LeaderboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboard, loading } = useSelector((s: RootState) => s.incentives);
  const [activeTab, setActiveTab] = useState<'Global' | 'My Zone'>('Global');

  const load = useCallback(() => { dispatch(fetchLeaderboard('month')); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  // Reorder for podium (2, 1, 3)
  const podiumData = [
    top3[1] || null,
    top3[0] || null,
    top3[2] || null
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Top Performers</Text>
          <View style={styles.monthSelector}>
            <Text style={styles.monthText}>October 2023</Text>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </View>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="history" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Global' && styles.tabActive]}
          onPress={() => setActiveTab('Global')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'Global' && styles.tabTextActive]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'My Zone' && styles.tabActive]}
          onPress={() => setActiveTab('My Zone')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'My Zone' && styles.tabTextActive]}>My Zone</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={others}
        keyExtractor={(item) => item.cleanerId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          <>
            {/* Podium Area */}
            <View style={styles.podiumContainer}>
              {podiumData.map((item, index) => {
                if (!item) return <View key={`empty-${index}`} style={styles.podiumColumn} />;
                
                const isFirst = index === 1;
                const positionText = index === 0 ? '2' : index === 1 ? '1' : '3';
                const medalColor = index === 0 ? '#94A3B8' : index === 1 ? '#F59E0B' : '#CD7F32';
                
                return (
                  <View key={item.cleanerId} style={[styles.podiumColumn, isFirst && styles.podiumColumnFirst]}>
                    <View style={styles.avatarContainer}>
                      {isFirst && <Icon name="crown" size={28} color="#F59E0B" style={styles.crownIcon} />}
                      <View style={[styles.avatarWrap, isFirst ? styles.avatarWrapFirst : styles.avatarWrapOther, { borderColor: medalColor }]}>
                        <Image source={require('../../assets/images/car-placeholder.png')} style={styles.avatar} />
                      </View>
                      <View style={[styles.rankBadge, { backgroundColor: medalColor }]}>
                        <Text style={styles.rankBadgeText}>{positionText}</Text>
                      </View>
                    </View>
                    <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                    <View style={styles.ptsBadge}>
                      <Text style={styles.ptsText}>{item.tasksCompleted * 10} pts</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* My Rank Card */}
            <View style={styles.myRankCard}>
              <Text style={styles.myRankNum}>42</Text>
              <View style={styles.myRankInfo}>
                <Text style={styles.myRankTitle}>Your Current Rank</Text>
                <Text style={styles.myRankSubtitle}>140 pts to reach top 10!</Text>
              </View>
              <View style={styles.myRankScoreBox}>
                <Text style={styles.myRankScore}>850 pts</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.rankRow}>
            <Text style={styles.rankNum}>{item.rank}</Text>
            <View style={styles.rankAvatarBox}>
              <Image source={require('../../assets/images/car-placeholder.png')} style={styles.rankAvatar} />
            </View>
            <View style={styles.rankDetails}>
              <Text style={styles.rankName}>{item.name}</Text>
              <Text style={styles.rankZone}>{item.zone || 'North Zone'}</Text>
            </View>
            <Text style={styles.rankPoints}>{item.tasksCompleted * 10} pts</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  iconButton: { padding: 4 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold', marginBottom: 2 },
  monthSelector: { flexDirection: 'row', alignItems: 'center' },
  monthText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Medium', marginRight: 4 },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primaryBlue },
  tabText: { fontSize: 15, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  tabTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  
  listContent: { paddingBottom: 40 },
  
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  podiumColumn: { alignItems: 'center', width: '30%', paddingBottom: 16 },
  podiumColumnFirst: { width: '36%', paddingBottom: 0 },
  avatarContainer: { position: 'relative', alignItems: 'center', marginBottom: 12 },
  crownIcon: { position: 'absolute', top: -24, zIndex: 10 },
  avatarWrap: { 
    borderRadius: 50, 
    borderWidth: 3, 
    overflow: 'hidden',
    backgroundColor: colors.lightBlue
  },
  avatarWrapFirst: { width: 84, height: 84 },
  avatarWrapOther: { width: 64, height: 64 },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  rankBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  podiumName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 6 },
  podiumNameFirst: { fontSize: 16, fontFamily: 'Inter-Bold' },
  ptsBadge: { backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  ptsText: { fontSize: 12, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },

  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBlue,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  myRankNum: { fontSize: 24, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold', width: 40 },
  myRankInfo: { flex: 1, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)', paddingLeft: 16 },
  myRankTitle: { fontSize: 15, fontWeight: '600', color: colors.white, fontFamily: 'Inter-SemiBold', marginBottom: 2 },
  myRankSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Regular' },
  myRankScoreBox: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  myRankScore: { fontSize: 14, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankNum: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, fontFamily: 'Inter-Bold', width: 32, textAlign: 'center' },
  rankAvatarBox: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', marginHorizontal: 12 },
  rankAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  rankDetails: { flex: 1 },
  rankName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 2 },
  rankZone: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  rankPoints: { fontSize: 15, fontWeight: '700', color: colors.primaryBlue, fontFamily: 'Inter-Bold' },
});

export default LeaderboardScreen;
