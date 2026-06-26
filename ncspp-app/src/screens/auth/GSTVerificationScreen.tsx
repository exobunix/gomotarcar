import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { colors } from '../../theme/colors';
import { verifyGst } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const GSTVerificationScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [gstNumber, setGstNumber] = useState('');
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [skipMode, setSkipMode] = useState(false); // eslint-disable-line

  const handleVerify = async () => {
    if (!gstNumber || gstNumber.length < 15) return;
    const result = await dispatch(verifyGst(gstNumber));
    if (verifyGst.fulfilled.match(result)) {
      setVerified(true);
      setVerificationResult(result.payload);
    }
  };

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={loading} message="Verifying GST..." />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.title}>GST Verification</Text>
          <Text style={styles.subtitle}>
            Verify your business GST to unlock all features
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!verified ? (
          <Card style={styles.formCard}>
            <Input
              label="GST Number"
              value={gstNumber}
              onChangeText={setGstNumber}
              placeholder="e.g., 27ABCDE1234F1Z5"
              autoCapitalize="characters"
              maxLength={15}
            />

            <Button
              title="Verify GST"
              onPress={handleVerify}
              variant="primary"
              size="large"
              disabled={gstNumber.length < 15}
              style={styles.verifyButton}
            />

            <Button
              title="Skip for now"
              onPress={handleContinue}
              variant="outline"
              size="medium"
              style={styles.skipButton}
            />
          </Card>
        ) : (
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>GST Verified!</Text>
            {verificationResult && (
              <View style={styles.resultDetails}>
                <Text style={styles.resultText}>
                  GSTIN: {verificationResult.gstin || gstNumber}
                </Text>
                {verificationResult.businessName && (
                  <Text style={styles.resultText}>
                  Business: {verificationResult.businessName}
                  </Text>
                )}
                {verificationResult.tradeName && (
                  <Text style={styles.resultText}>
                    Trade: {verificationResult.tradeName}
                  </Text>
                )}
              </View>
            )}
            <Button
              title="Continue to Dashboard"
              onPress={handleContinue}
              variant="primary"
              size="large"
              style={styles.continueButton}
            />
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 12,
  },
  skipButton: {
    marginTop: 12,
  },
  successCard: {
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
  },
  resultDetails: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  continueButton: {
    width: '100%',
  },
});

export default GSTVerificationScreen;
