import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { fetchReviews, replyToReview } from '../../redux/slices/reviewSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

const ReviewsRatingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, ratingSummary, loading } = useSelector((state: RootState) => state.review);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useRefreshOnFocus(() => dispatch(fetchReviews({})));
  useEffect(() => { dispatch(fetchReviews({})); }, [dispatch]);

  const handleReply = async (reviewId: string) => {
    if (!replyText[reviewId]) return;
    await dispatch(replyToReview({ id: reviewId, reply: replyText[reviewId] }));
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    setReplyingTo(null);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const summary = ratingSummary || { average: 0, total: 0, distribution: {} };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchReviews({}))} />
        }
      >
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Rating Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingScore}>
                {summary.average?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.stars}>
                {renderStars(summary.average || 0)}
              </Text>
              <Text style={styles.totalReviews}>
                {summary.total || 0} reviews
              </Text>
            </View>
            <View style={styles.distribution}>
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} style={styles.distRow}>
                  <Text style={styles.distLabel}>{star}</Text>
                  <View style={styles.distBar}>
                    <View
                      style={[
                        styles.distFill,
                        {
                          width: `${
                            summary.total > 0
                              ? ((summary.distribution?.[star] || 0) / summary.total) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {reviews.length === 0 ? (
          <EmptyState icon="⭐" title="No Reviews Yet" message="Reviews from customers will appear here." />
        ) : (
          reviews.map((review: any) => (
            <Card key={review._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(review.customerName || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>
                      {review.customerName || 'Anonymous'}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewRating}>
                  {renderStars(review.rating || 0)}
                </Text>
              </View>

              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}

              {review.reply ? (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Your Reply:</Text>
                  <Text style={styles.replyText}>{review.reply}</Text>
                </View>
              ) : (
                <View>
                  {replyingTo === review._id ? (
                    <View style={styles.replyForm}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Write your reply..."
                        placeholderTextColor={colors.textSecondary}
                        value={replyText[review._id] || ''}
                        onChangeText={(text) =>
                          setReplyText((prev) => ({ ...prev, [review._id]: text }))
                        }
                        multiline
                      />
                      <View style={styles.replyActions}>
                        <Button title="Cancel" onPress={() => setReplyingTo(null)}
                          variant="outline" size="small" />
                        <Button title="Send Reply" onPress={() => handleReply(review._id)}
                          variant="primary" size="small" disabled={!replyText[review._id]} />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setReplyingTo(review._id)}>
                      <Text style={styles.replyLink}>Reply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 32 },
  summaryCard: {},
  summaryTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 20 },
  ratingDisplay: { alignItems: 'center', minWidth: 100 },
  ratingScore: { fontSize: 40, fontWeight: '700', color: '#FF9800' },
  stars: { fontSize: 16, marginVertical: 4 },
  totalReviews: { fontSize: 12, color: colors.textSecondary },
  distribution: { flex: 1, justifyContent: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  distLabel: { fontSize: 12, color: colors.textSecondary, width: 12 },
  distBar: {
    flex: 1, height: 10, backgroundColor: '#F5F5F5', borderRadius: 5, overflow: 'hidden',
  },
  distFill: { height: '100%', backgroundColor: '#FF9800', borderRadius: 5 },
  reviewCard: {},
  reviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.white },
  reviewerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  reviewDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  reviewRating: { fontSize: 14 },
  reviewComment: { fontSize: 14, color: colors.text, marginTop: 10, lineHeight: 20 },
  replyBox: {
    backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginTop: 10,
  },
  replyLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  replyText: { fontSize: 13, color: colors.text, lineHeight: 18 },
  replyForm: { marginTop: 10 },
  replyInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 10, minHeight: 60, fontSize: 14, color: colors.text,
    textAlignVertical: 'top', marginBottom: 8,
  },
  replyActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  replyLink: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 10 },
});

export default ReviewsRatingsScreen;
