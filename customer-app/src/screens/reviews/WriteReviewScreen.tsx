import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, Input, Card, LoadingOverlay } from '../../components/common';
import { reviewService } from '../../services/review.service';
import { AppDispatch } from '../../redux/store';

interface Props {
  navigation: any;
  route: any;
}

const WriteReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId, cleanerName } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [punctuality, setPunctuality] = useState(0);
  const [quality, setQuality] = useState(0);
  const [behavior, setBehavior] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Required', 'Please select a rating'); return; }
    setLoading(true);
    try {
      await reviewService.create({ bookingId, rating, comment: comment.trim() || undefined, punctuality, quality, behavior });
      Alert.alert('Thank You!', 'Your review has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarSelector: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => (
    <View style={styles.starRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Submitting review..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding={24} style={styles.overallCard}>
          <Text style={styles.overallTitle}>Overall Rating</Text>
          <View style={styles.bigStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.bigStar, star <= rating && styles.bigStarActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
          </Text>
        </Card>

        <Card variant="outlined" padding={16} style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>Rate Specifics</Text>
          <StarSelector value={punctuality} onChange={setPunctuality} label="Punctuality" />
          <StarSelector value={quality} onChange={setQuality} label="Quality of Work" />
          <StarSelector value={behavior} onChange={setBehavior} label="Cleaner Behavior" />
        </Card>

        <Input
          label="Comments (Optional)"
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button
          title="Submit Review"
          onPress={handleSubmit}
          size="lg"
          loading={loading}
          disabled={rating === 0}
        />
      </ScrollView>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  overallCard: { alignItems: 'center', marginBottom: 16 },
  overallTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 16 },
  bigStars: { flexDirection: 'row', gap: 8 },
  bigStar: { fontSize: 36, color: colors.border },
  bigStarActive: { color: '#F59E0B' },
  ratingLabel: { marginTop: 8, fontSize: 14, color: colors.textSecondary, fontFamily: 'Inter-Regular' },
  categoryCard: { marginBottom: 16 },
  categoryTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter-SemiBold', marginBottom: 12 },
  starRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  starLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Inter-Medium' },
  stars: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 22, color: colors.border },
  starActive: { color: '#F59E0B' },
});

export default WriteReviewScreen;
