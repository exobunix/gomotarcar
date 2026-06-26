import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import { Button, Input, LoadingOverlay } from '../../components/common';
import { createComplaint } from '../../redux/slices/complaintSlice';
import { AppDispatch } from '../../redux/store';

interface Props {
  navigation: any;
}

const categories = ['service', 'cleaner', 'billing', 'vehicle', 'other'];

const CreateComplaintScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('service');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) { Alert.alert('Required', 'Please enter a subject'); return; }
    if (!description.trim()) { Alert.alert('Required', 'Please describe your issue'); return; }

    setLoading(true);
    try {
      await dispatch(createComplaint({
        subject: subject.trim(),
        description: description.trim(),
        category,
      })).unwrap();
      Alert.alert('Submitted', 'Your complaint has been registered. Our team will get back to you soon.', [
        { text: 'View Complaints', onPress: () => navigation.navigate('ComplaintList') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', typeof err === 'string' ? err : 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Submitting complaint..." />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a Complaint</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Subject"
          placeholder="Brief summary of your issue"
          value={subject}
          onChangeText={setSubject}
        />

        <Input
          label="Description"
          placeholder="Describe your complaint in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />

        <Button
          title="Submit Complaint"
          onPress={handleSubmit}
          size="lg"
          loading={loading}
          disabled={!subject.trim() || !description.trim()}
          style={styles.submitBtn}
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
  fieldLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter-Medium', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.lightBlue, borderColor: colors.primaryBlue },
  chipText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Inter-Medium' },
  chipTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  submitBtn: { marginTop: 8 },
});

export default CreateComplaintScreen;
