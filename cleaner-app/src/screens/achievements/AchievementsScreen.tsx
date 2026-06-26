import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import { fetchPerformance } from '../../redux/slices/performanceSlice';
import { AppDispatch, RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

const predefinedAchievements = [
  { id: '1', icon: '🏆', title: 'First Task', desc: 'Complete your first cleaning task', threshold: 1, category: 'task' },
  { id: '2', icon: '⭐', title: 'Rising Star', desc: 'Complete 10 tasks', threshold: 10, category: 'task' },
  { id: '3', icon: '💎', title: 'Diamond Cleaner', desc: 'Complete 50 tasks', threshold: 50, category: 'task' },
  { id: '4', icon: '📅', title: 'Perfect Week', desc: '7 days perfect attendance', threshold: 7, category: 'attendance' },
  { id: '5', icon: '🔥', title: 'Streak Master', desc: '30 days consecutive attendance', threshold: 30, category: 'attendance' },
  { id: '6', icon: '👏', title: 'Top Rated', desc: 'Average rating of 4.5+', threshold: 4.5, category: 'rating' },
  { id: '7', icon: '💰', title: 'Earning Star', desc: 'Earn ₹10,000 total', threshold: 10000, category: 'earnings' },
  { id: '8', icon: '🎓', title: 'Learner', desc: 'Complete 3 training modules', threshold: 3, category: 'training' },
  { id: '9', icon: '🏅', title: 'Gold Cleaner', desc: 'Achieve gold tier', threshold: 1, category: 'tier' },
  { id: '10', icon: '💯', title: 'Perfect Score', desc: '100% on a training quiz', threshold: 100, category: 'quiz' },
];

interface Props { navigation: any }

const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cleaner } = useSelector((s: RootState) => s.auth);
  const { performance } = useSelector((s: RootState) => s.performance);

  const load = useCallback(() => {
    if (cleaner?._id) {
      dispatch(fetchPerformance({ cleanerId: cleaner._id }));
    }
  }, [dispatch, cleaner?._id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const earnedAchievements = performance?.achievements || [];
  const earnedIds = new Set(earnedAchievements.map((a: any) => a.achievementId || a._id));

  // Determine which achievements are earned based on metrics
  const achievements = predefinedAchievements.map((ach) => {
    let earned = false;
    const completedTasks = performance?.completedTasks || 0;
    const activeDays = performance?.activeDays || 0;
    const overallRating = performance?.overallRating || 0;
    const totalEarnings = performance?.totalEarnings || 0;
    const trainingCompleted = performance?.trainingCompleted || 0;
    const currentTier = performance?.currentTier || '';

    switch (ach.id) {
      case '1': earned = completedTasks >= 1; break;
      case '2': earned = completedTasks >= 10; break;
      case '3': earned = completedTasks >= 50; break;
      case '4': earned = activeDays >= 7; break;
      case '5': earned = activeDays >= 30; break;
      case '6': earned = overallRating >= 4.5; break;
      case '7': earned = totalEarnings >= 10000; break;
      case '8': earned = trainingCompleted >= 3; break;
      case '9': earned = ['gold', 'platinum'].includes(currentTier.toLowerCase()); break;
      case '10': earned = false; break; // quiz-based
    }
    earned = earned || earnedIds.has(ach.id) || earnedIds.has(ach.title);
    return { ...ach, earned };
  });

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;
  const progress = (earnedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Card */}
        <Card variant="elevated" padding={20} style={styles.progressCard}>
          <Text style={styles.progressEmoji}>
            {progress === 100 ? '🏆' : progress >= 50 ? '🌟' : '🚀'}
          </Text>
          <Text style={styles.progressTitle}>{earnedCount}/{totalCount} Earned</Text>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          <Text style={styles.progressSub}>
            {progress === 100 ? 'All achievements unlocked!' : `${totalCount - earnedCount} more to go`}
          </Text>
        </Card>

        {/* Achievement Grid */}
        <View style={styles.achievementGrid}>
          {achievements.map((ach) => (
            <View key={ach.id} style={[styles.achievementCard, ach.earned && styles.achievementEarned]}>
              <Text style={[styles.achievementIcon, !ach.earned && styles.achievementLocked]}>
                {ach.earned ? ach.icon : '🔒'}
              </Text>
              <Text style={[styles.achievementTitle, ach.earned && styles.achievementTitleEarned]}>
                {ach.title}
              </Text>
              <Text style={styles.achievementDesc} numberOfLines={2}>{ach.desc}</Text>
              {ach.earned && <Text style={styles.achievementCheck}>✓</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  progressCard: { alignItems: 'center', marginBottom: 20, backgroundColor: colors.darkNavy, borderRadius: 24 },
  progressEmoji: { fontSize: 48, marginBottom: 12 },
  progressTitle: { fontSize: 22, fontWeight: '700', color: colors.white, fontFamily: 'Inter-Bold' },
  progressBarWrap: { width: '100%', paddingHorizontal: 20, marginTop: 16 },
  progressBar: { height: 10, backgroundColor: colors.white + '30', borderRadius: 5 },
  progressFill: { height: 10, backgroundColor: colors.gold, borderRadius: 5 },
  progressSub: { fontSize: 13, color: colors.textSecondary, marginTop: 8, fontFamily: 'Inter-Regular' },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { width: (width - 50) / 2, backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  achievementEarned: { borderColor: colors.gold, backgroundColor: colors.gold + '08' },
  achievementIcon: { fontSize: 36, marginBottom: 8 },
  achievementLocked: { opacity: 0.4 },
  achievementTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', textAlign: 'center' },
  achievementTitleEarned: { color: colors.darkNavy },
  achievementDesc: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 4, fontFamily: 'Inter-Regular' },
  achievementCheck: { fontSize: 14, color: colors.success, fontWeight: '700', marginTop: 8 },
});

export default AchievementsScreen;
