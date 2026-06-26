import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createTicket } from '../../redux/slices/supportSlice';
import { AppDispatch, RootState } from '../../redux/store';

interface Props { navigation: any; route: any }

const RaiseTicketScreen: React.FC<Props> = ({ navigation }) => {
  const [issueType, setIssueType] = useState('cleaning_quality');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.support);
  
  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the issue.');
      return;
    }
    const catObj = issueCategories.find(c => c.key === issueType);
    const data = {
      subject: catObj?.label || 'Issue',
      description,
      category: issueType,
      priority
    };
    const res = await dispatch(createTicket(data));
    if (res.meta.requestStatus === 'fulfilled') {
      Alert.alert('Success', 'Your ticket has been raised successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', res.payload as string || 'Failed to raise ticket.');
    }
  };

  const issueCategories = [
    { key: 'cleaning_quality', label: 'Cleaning Quality', icon: 'water-outline', color: '#2563EB', bg: '#EFF6FF' },
    { key: 'missed_service', label: 'Missed Service', icon: 'calendar-remove-outline', color: '#EA580C', bg: '#FFF7ED' },
    { key: 'staff_behavior', label: 'Staff Behavior', icon: 'account-outline', color: '#16A34A', bg: '#ECFDF5' },
    { key: 'damage', label: 'Damage / Breakage', icon: 'shield-alert-outline', color: '#9333EA', bg: '#F3E8FF' },
    { key: 'billing', label: 'Billing / Payment', icon: 'receipt-outline', color: '#CA8A04', bg: '#FEF9C3' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal', color: '#64748B', bg: '#F1F5F9' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.blueHeaderBg}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Report Issue</Text>
            <Text style={styles.mainSubTitle}>Let us know what's not right</Text>
          </View>
          <TouchableOpacity style={{ padding: 4 }}>
            <Icon name="information-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Profile Card */}
        <View style={styles.topCard}>
          <View style={styles.tcAvatarBg}>
            <Icon name="office-building" size={28} color="#0F172A" />
          </View>
          <View style={styles.tcInfo}>
            <Text style={styles.tcTitle}>Green Valley Apartments</Text>
            <Text style={styles.tcFlat}>Tower A • Flat 101</Text>
            <View style={styles.tcLocRow}>
              <Icon name="map-marker-outline" size={12} color="#2563EB" />
              <Text style={styles.tcLocTxt}>Green Valley, Sector 62, Noida, UP 201301</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Icon name="pencil-outline" size={14} color="#2563EB" />
            <Text style={styles.editBtnTxt}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Issue Type */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>1. Issue Type</Text>
          <View style={styles.issueGrid}>
            {issueCategories.map(cat => {
              const isSelected = issueType === cat.key;
              return (
                <TouchableOpacity 
                  key={cat.key} 
                  style={[styles.issueCard, isSelected && styles.issueCardActive]}
                  onPress={() => setIssueType(cat.key)}
                >
                  <View style={[styles.issueIconBg, { backgroundColor: cat.bg }]}>
                    <Icon name={cat.icon} size={20} color={cat.color} />
                  </View>
                  <Text style={[styles.issueCardTxt, isSelected && styles.issueCardTxtActive]}>{cat.label}</Text>
                  {isSelected && (
                    <View style={styles.issueCheck}>
                      <Icon name="check-circle" size={20} color="#2563EB" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* 2. Describe the Issue */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>2. Describe the Issue</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Please provide details about the issue..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
        </View>

        {/* 3. Add Photos */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>3. Add Photos <Text style={styles.optionalTxt}>(Optional)</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
            <TouchableOpacity style={styles.addPhotoBtn}>
              <Icon name="camera-outline" size={28} color="#2563EB" />
              <Text style={styles.addPhotoTxt}>Add Photo</Text>
            </TouchableOpacity>
            
            {/* Mock Photos */}
            {[1, 2, 3].map((_, idx) => (
              <View key={idx} style={styles.photoItem}>
                <Image source={{uri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200&h=200'}} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoRemoveBtn}>
                  <Icon name="close" size={14} color="#0F172A" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.photoHintTxt}>You can add up to 4 photos</Text>
        </View>

        {/* 4. When did this happen? */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>4. When did this happen?</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn}>
              <Icon name="calendar-month-outline" size={20} color="#2563EB" />
              <Text style={styles.dateBtnTxt}>15 May 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn}>
              <Icon name="clock-outline" size={20} color="#2563EB" />
              <Text style={styles.dateBtnTxt}>10:30 AM</Text>
              <Icon name="chevron-down" size={20} color="#64748B" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Priority */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>5. Priority</Text>
          <View style={styles.priorityRow}>
            <TouchableOpacity 
              style={[styles.priorityBtn, priority === 'high' && styles.priorityHighActive]}
              onPress={() => setPriority('high')}
            >
              <Icon name="alert-circle-outline" size={18} color={priority === 'high' ? '#DC2626' : '#EF4444'} />
              <Text style={[styles.priorityTxt, priority === 'high' && {color: '#DC2626'}]}>High</Text>
              {priority === 'high' && <Icon name="check-circle" size={16} color="#DC2626" style={{marginLeft: 'auto'}} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.priorityBtn, priority === 'medium' && styles.priorityMediumActive]}
              onPress={() => setPriority('medium')}
            >
              <Icon name="alert-outline" size={18} color="#EA580C" />
              <Text style={[styles.priorityTxt, priority === 'medium' && {color: '#EA580C'}]}>Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.priorityBtn, priority === 'low' && styles.priorityLowActive]}
              onPress={() => setPriority('low')}
            >
              <Icon name="arrow-down-circle-outline" size={18} color="#16A34A" />
              <Text style={[styles.priorityTxt, priority === 'low' && {color: '#16A34A'}]}>Low</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconBg}><Icon name="information-variant" size={20} color="#FFF" /></View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>We will review your issue and get back to you soon.</Text>
            <Text style={styles.infoSub}>You can track the status in the Issues section.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="send-outline" size={18} color="#FFF" style={{transform: [{rotate: '-45deg'}], marginTop: -4}} />
              <Text style={styles.submitBtnTxt}>Submit Issue</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  blueHeaderBg: {
    backgroundColor: '#0D5BD7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    zIndex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },

  scrollView: { flex: 1, marginTop: -40, zIndex: 2, elevation: 5 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
    zIndex: 20,
  },
  tcAvatarBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  tcInfo: { flex: 1, marginLeft: 16 },
  tcTitle: { fontSize: 15, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  tcFlat: { fontSize: 13, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  tcLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tcLocTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  editBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },

  sectionBlock: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 12 },
  
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  issueCard: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 12 },
  issueCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  issueIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  issueCardTxt: { flex: 1, fontSize: 12, fontWeight: '600', color: '#475569', fontFamily: 'Inter-SemiBold' },
  issueCardTxtActive: { color: '#2563EB', fontWeight: '700' },
  issueCheck: { position: 'absolute', right: 8 },

  inputWrapper: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, height: 140 },
  textInput: { flex: 1, fontSize: 14, color: colors.darkNavy, fontFamily: 'Inter-Regular' },
  charCount: { fontSize: 11, color: '#94A3B8', fontFamily: 'Inter-Medium', textAlign: 'right', marginTop: 8 },

  optionalTxt: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  photoScroll: { paddingBottom: 8 },
  addPhotoBtn: { width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderColor: '#2563EB', borderStyle: 'dashed', backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addPhotoTxt: { fontSize: 12, fontWeight: '600', color: '#2563EB', fontFamily: 'Inter-SemiBold', marginTop: 8 },
  photoItem: { width: 100, height: 100, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoRemoveBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 },
  photoHintTxt: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },

  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16 },
  dateBtnTxt: { fontSize: 13, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold', marginLeft: 10 },

  priorityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priorityBtn: { width: '31%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, paddingHorizontal: 12 },
  priorityHighActive: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  priorityMediumActive: { borderColor: '#EA580C', backgroundColor: '#FFF7ED' },
  priorityLowActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  priorityTxt: { fontSize: 13, fontWeight: '700', color: '#64748B', fontFamily: 'Inter-Bold', marginLeft: 8 },

  infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: '#BFDBFE' },
  infoIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', lineHeight: 20 },
  infoSub: { fontSize: 12, color: '#475569', fontFamily: 'Inter-Medium', marginTop: 4 },

  bottomActions: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D5BD7', borderRadius: 12, paddingVertical: 16 },
  submitBtnTxt: { fontSize: 16, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold', marginLeft: 12 },
});

export default RaiseTicketScreen;
