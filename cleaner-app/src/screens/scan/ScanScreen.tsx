import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera, CameraType } from 'react-native-camera-kit';

interface Props { navigation: any; route: any }

const ScanScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [scanState, setScanState] = useState<'scan' | 'verify'>('scan');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const returnTo = route.params?.returnTo;

  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (err) {
          console.warn(err);
          setHasPermission(false);
        }
      } else {
        setHasPermission(true);
      }
    };
    requestCameraPermission();
  }, []);

  const handleScanSuccess = async (event: any) => {
    if (loading || scanState === 'verify') return;
    const code = event.nativeEvent.codeStringValue;
    setLoading(true);
    try {
      // For now, if API is not fully ready, we just move to verify
      setScanResult({ code, customer: { name: 'Customer', apartmentName: 'Green Valley', flat: 'Tower A - 101' }, vehicle: { model: 'Sedan', number: 'DL 01 AB 1234' } });
      setScanState('verify');
    } catch (err) {
      console.warn(err);
      Alert.alert('Scan Failed', 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (returnTo) {
      navigation.navigate('Tasks', { screen: 'Checklist', params: { taskId: returnTo } });
    } else {
      Alert.alert('Task Started', 'Navigating to checklist...', [{ text: 'OK' }]);
    }
  };

  if (scanState === 'verify') {
    return (
      <View style={styles.container}>
        <View style={[styles.blueHeaderBg, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
          <View style={styles.topHeaderRow}>
            <TouchableOpacity onPress={() => setScanState('scan')} style={{ padding: 4 }}>
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.mainTitle}>QR Verification</Text>
              <Text style={styles.mainSubTitle}>Verify customer and location details</Text>
            </View>
            <TouchableOpacity style={{ padding: 4 }}>
              <Icon name="help-circle-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.blueFiller} />
          {/* Success Banner */}
          <View style={styles.successBanner}>
            <View style={styles.successIconBg}>
              <Icon name="check" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.successTitle}>QR Code Verified Successfully!</Text>
              <Text style={styles.successDesc}>You're at the right location. Please review the details below.</Text>
            </View>
          </View>

          {/* Customer Details */}
          <View style={styles.cardBlock}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="account-outline" size={16} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>Customer Details</Text>
            </View>
            <View style={styles.customerContent}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9', marginRight: 12 }]}>
                <Icon name="office-building" size={16} color="#0F172A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>Green Valley Apartments</Text>
                <Text style={styles.customerFlat}>Tower A • Flat 101</Text>
                <View style={styles.customerLocRow}>
                  <Icon name="map-marker-outline" size={12} color="#2563EB" />
                  <Text style={styles.customerLocTxt}>Green Valley, Sector 62, Noida, UP 201301</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Icon name="phone-outline" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Task Details */}
          <View style={styles.cardBlock}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="clipboard-text-outline" size={16} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>Task Details</Text>
            </View>

            <View style={styles.taskRow}>
              <View style={styles.taskRowLeft}>
                <Icon name="car-wash" size={16} color="#94A3B8" />
                <Text style={styles.taskLabel}>Service Type</Text>
              </View>
              <View style={styles.taskTag}><Text style={styles.taskTagTxt}>Premium Wash</Text></View>
            </View>
            <View style={styles.taskDivider} />

            <View style={styles.taskRow}>
              <View style={styles.taskRowLeft}>
                <Icon name="spray-bottle" size={16} color="#F59E0B" />
                <Text style={styles.taskLabel}>Cleaning Type</Text>
              </View>
              <Text style={styles.taskValue}>Interior + Exterior</Text>
            </View>
            <View style={styles.taskDivider} />

            <View style={styles.taskRow}>
              <View style={styles.taskRowLeft}>
                <Icon name="calendar-outline" size={16} color="#8B5CF6" />
                <Text style={styles.taskLabel}>Scheduled Date</Text>
              </View>
              <Text style={styles.taskValue}>15 May 2025</Text>
            </View>
            <View style={styles.taskDivider} />

            <View style={styles.taskRow}>
              <View style={styles.taskRowLeft}>
                <Icon name="clock-outline" size={16} color="#3B82F6" />
                <Text style={styles.taskLabel}>Scheduled Time</Text>
              </View>
              <Text style={styles.taskValue}>09:00 AM — 10:00 AM</Text>
            </View>
            <View style={styles.taskDivider} />

            <View style={styles.taskRow}>
              <View style={styles.taskRowLeft}>
                <Icon name="pound" size={16} color="#3B82F6" />
                <Text style={styles.taskLabel}>Task ID</Text>
              </View>
              <Text style={styles.taskValue}>DL 01 AB 1234</Text>
            </View>
          </View>

          {/* Location Verification */}
          <View style={styles.cardBlock}>
            <View style={styles.locVerifyInner}>
              <View style={{ flex: 1 }}>
                <View style={styles.locHeaderRow}>
                  <Icon name="shield-check-outline" size={18} color="#2563EB" />
                  <Text style={styles.locHeaderTxt}>Location Verification</Text>
                </View>
                <View style={styles.locStatusRow}>
                  <View style={styles.successIconBgSmall}>
                    <Icon name="check" size={10} color="#FFF" />
                  </View>
                  <Text style={styles.locStatusTxt}>You are within the allowed range</Text>
                </View>
                <Text style={styles.locDistanceTxt}>Distance to location: <Text style={{color: '#16A34A', fontWeight: '700'}}>12 m</Text></Text>
              </View>
              <View style={styles.mapThumbContainer}>
                {/* Mock map thumbnail with radar circle */}
                <View style={styles.mapThumbBg}>
                  <View style={styles.radarCircle}>
                    <View style={styles.radarDot} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Next Step */}
          <View style={[styles.cardBlock, { backgroundColor: '#F8FAFC' }]}>
            <View style={styles.nextStepRow}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <Icon name="information-variant" size={18} color="#4F46E5" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nextStepTitle}>Next Step</Text>
                <Text style={styles.nextStepDesc}>Start the cleaning task to begin.</Text>
              </View>
              <TouchableOpacity style={styles.viewChecklistBtn}>
                <Icon name="clipboard-text-outline" size={14} color="#2563EB" />
                <Text style={styles.viewChecklistTxt}>View Checklist</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.btnStartClean} onPress={handleStartTask}>
            <Icon name="play-outline" size={20} color="#FFF" />
            <Text style={styles.btnStartCleanTxt}>Start Cleaning Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={() => setScanState('scan')}>
            <Text style={styles.btnCancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // default: 'scan'
  return (
    <View style={styles.container}>
      {/* Camera fills the screen */}
      <View style={StyleSheet.absoluteFill}>
        {hasPermission === null ? (
          <View style={styles.cameraPlaceholder}><Text style={{color: '#FFF', fontFamily: 'Inter-Medium'}}>Requesting permission...</Text></View>
        ) : hasPermission === false ? (
          <View style={styles.cameraPlaceholder}><Text style={{color: '#FFF', fontFamily: 'Inter-Medium'}}>No camera access</Text></View>
        ) : (
          <Camera
            style={StyleSheet.absoluteFill}
            cameraType={CameraType.Back}
            scanBarcode={true}
            onReadCode={handleScanSuccess}
            showFrame={true}
            laserColor="#2563EB"
            frameColor="#FFF"
            torchMode={isFlashOn ? 'on' : 'off'}
          />
        )}
      </View>

      {/* Floating Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top > 0 ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)) }]}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnOverlay}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitleScan}>Scan QR Code</Text>
            <Text style={styles.mainSubTitleScan}>Scan customer QR to start cleaning</Text>
          </View>
          <TouchableOpacity style={styles.flashBtnOverlay} onPress={() => setIsFlashOn(!isFlashOn)}>
            <Icon name={isFlashOn ? "flashlight-off" : "flashlight"} size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Info & Actions at the Bottom */}
      <View style={styles.bottomOverlay}>
        <View style={styles.scanInfoBannerOverlay}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Icon name="information-variant" size={18} color="#2563EB" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.scanInfoTitle}>Verify Customer Location</Text>
            <Text style={styles.scanInfoDesc}>Position the QR code within the screen frame to scan automatically.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.enterCodeBtnOverlay}>
          <Icon name="keyboard-outline" size={18} color="#FFF" />
          <Text style={[styles.enterCodeTxt, {color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 8}]}>Enter Code Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollView: { flex: 1 },
  blueHeaderBg: {
    backgroundColor: '#0D5BD7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  blueFiller: {
    backgroundColor: '#0D5BD7',
    height: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: -16,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: {
    flex: 1,
    paddingLeft: 12,
  },
  mainTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter-Medium', marginTop: 2 },
  
  // VERIFY STATE
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  successIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', fontFamily: 'Inter-Bold' },
  successDesc: { fontSize: 11, color: '#047857', fontFamily: 'Inter-Medium', marginTop: 2 },

  cardBlock: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginLeft: 10 },

  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  customerFlat: { fontSize: 12, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 4 },
  customerLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  customerLocTxt: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Regular', marginLeft: 4 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  taskRowLeft: { flexDirection: 'row', alignItems: 'center' },
  taskLabel: { fontSize: 13, color: '#475569', fontFamily: 'Inter-Medium', marginLeft: 10 },
  taskValue: { fontSize: 13, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold' },
  taskDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 0 },
  taskTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  taskTagTxt: { fontSize: 12, color: '#2563EB', fontWeight: '600', fontFamily: 'Inter-SemiBold' },

  locVerifyInner: { flexDirection: 'row', alignItems: 'center' },
  locHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locHeaderTxt: { fontSize: 14, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 8 },
  locStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  successIconBgSmall: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  locStatusTxt: { fontSize: 13, fontWeight: '600', color: colors.darkNavy, fontFamily: 'Inter-SemiBold' },
  locDistanceTxt: { fontSize: 12, color: '#64748B', fontFamily: 'Inter-Medium', marginLeft: 24 },
  
  mapThumbContainer: {
    width: 100,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  mapThumbBg: { flex: 1, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  radarCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#A5B4FC', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
  radarDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB', borderWidth: 2, borderColor: '#FFF' },

  nextStepRow: { flexDirection: 'row', alignItems: 'center' },
  nextStepTitle: { fontSize: 14, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  nextStepDesc: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  viewChecklistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewChecklistTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },

  bottomActions: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnStartClean: {
    flexDirection: 'row',
    backgroundColor: '#0D5BD7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnStartCleanTxt: { color: '#FFF', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold', marginLeft: 8 },
  btnCancel: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnCancelTxt: { color: '#0D5BD7', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },


  // SCAN STATE
  scrollContentScan: {
    paddingBottom: 40,
  },
  scanInfoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 20,
    alignItems: 'center',
  },
  scanInfoTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  scanInfoDesc: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },

  cameraOuterContainer: {
    height: 400,
    width: '100%',
    position: 'relative',
    marginTop: -20,
    zIndex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPreview: {
    flex: 1,
  },
  enterCodeBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  enterCodeTxt: { color: '#FFF', fontSize: 13, fontWeight: '600', fontFamily: 'Inter-SemiBold', marginLeft: 8 },

  howItWorksCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hiwHeader: { fontSize: 14, fontWeight: '800', color: colors.darkNavy, fontFamily: 'Inter-Bold', marginBottom: 16 },
  hiwRow: { flexDirection: 'row', alignItems: 'center' },
  hiwTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  hiwDesc: { fontSize: 11, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  hiwDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginLeft: 19, marginVertical: 4 },

  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  supportTitle: { fontSize: 13, fontWeight: '700', color: colors.darkNavy, fontFamily: 'Inter-Bold' },
  supportDesc: { fontSize: 10, color: '#64748B', fontFamily: 'Inter-Medium', marginTop: 2 },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  supportBtnTxt: { fontSize: 11, fontWeight: '700', color: '#2563EB', fontFamily: 'Inter-Bold', marginLeft: 4 },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 37, 64, 0.85)', // Premium dark blue translucent overlay
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  mainTitleScan: { fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Inter-Bold' },
  mainSubTitleScan: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter-Medium', marginTop: 2 },
  backBtnOverlay: { padding: 4 },
  flashBtnOverlay: { padding: 4 },
  bottomOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  scanInfoBannerOverlay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  enterCodeBtnOverlay: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#0D5BD7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    justifyContent: 'center',
  },
});

export default ScanScreen;
