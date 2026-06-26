import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { reviewService } from '../../services/review.service';
import { ReviewData } from '../../types/navigation';
import { formatDate } from '../../utils/helpers';

interface Props {
  navigation: any;
}

const MyReviewsScreen: React.FC<Props> = ({ navigation }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewService.getMyReviews();
      setReviews(res.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation, load]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <Text style={styles.count}>{reviews.length}</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primaryBlue} />}
        ListHeaderComponent={
          reviews.length > 0 ? (
            <Card variant="elevated" padding={16} style={styles.statsCard}>
              <Text style={styles.statsAvg}>{avgRating}</Text>
              <View style={styles.statsStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={[styles.statsStar, s <= Math.round(Number(avgRating)) && { color: '#F59E0B' }]}>★</Text>
                ))}
              </View>
              <Text style={styles.statsCount}>{reviews.length} review{reviews.length > 1 ? 's' : ''}</Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon="⭐" title="No Reviews Yet" description="Your reviews for completed services will appear here" />
        }
        renderItem={({ item }) => (
          <Card variant="outlined" padding={14} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={[styles.reviewStar, s <= item.rating && { color: '#F59E0B' }]}>★</Text>
                ))}
              </View>
              <Text style={styles.reviewDate}>{formatDate(item.createdAt, 'short')}</Text>
            </View>
            {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
            {item.categories && (
              <View style={styles.reviewCats}>
                {item.categories.punctuality > 0 && <Text style={styles.catLabel}>Punctual: {item.categories.punctuality}/5</Text>}
                {item.categories.quality > 0 && <Text style={styles.catLabel}>Quality: {item.categories.quality}/5</Text>}
                {item.categories.behavior > 0 && <Text style={styles.catLabel}>Behavior: {item.categories.behavior}/5</Text>}
              </View>
            )}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primaryBlue, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold' },
  count: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  listContent: { padding: 20, paddingBottom: 40 },
  statsCard: { alignItems: 'center', marginBottom: 12 },
  statsAvg: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, fontFamily: 'Inter-Bold' },
  statsStars: { flexDirection: 'row', gap: 4, marginVertical: 8 },
  statsStar: { fontSize: 18, color: colors.border },
  statsCount: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  reviewCard: { marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewStar: { fontSize: 16, color: colors.border },
  reviewDate: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  reviewComment: { fontSize: 14, color: colors.textPrimary, lineHeight: 20, fontFamily: 'Inter-Regular', marginBottom: 8 },
  reviewCats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catLabel: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter-Regular', backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});

export default MyReviewsScreen;
