import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Logo from '../assets/images/Logo.svg';
import Svg, { Path, Circle } from 'react-native-svg';

import axios from 'axios';
import { API_URL } from '@env';
import CustomAlert from '../components/CustomAlert';

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isOtpVisible, setIsOtpVisible] = React.useState(false);
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef<Array<TextInput | null>>([]);

  // Alert State
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertType, setAlertType] = React.useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = React.useState('');

  const handleVerify = () => {
    setIsOtpVisible(true);
  };

  const handleChangeOtp = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    if (alertType === 'success') {
      navigation.navigate('Login');
    }
  };

  const handleSignup = async () => {
    try {
      const otpString = otp.join('');
      const payload = {
        name: name,
        phoneNumber: phone,
        otp: otpString,
      };

      console.log('Signing up with:', payload);
      console.log('API URL:', API_URL);

      const response = await axios.post(`${API_URL}/auth/signup`, payload);

      console.log('Signup success:', response.data);
      showAlert('success', 'Account created successfully!');

    } catch (error) {
      console.error('Signup error:', error);
      showAlert('error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E3F2FD" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo */}
          <View style={styles.headerSection}>
            <Logo width={100} height={100} />
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Join us to report and track monsoon updates</Text>
          </View>

          {/* Form Section - Direct Integration */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <View style={styles.iconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <Circle cx="12" cy="7" r="4" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#A0A0A0"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <View style={styles.iconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <Path d="M22 6l-10 7L2 6" />
                  </Svg>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <View style={styles.iconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </Svg>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                {phone.length > 0 && !isOtpVisible && (
                  <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* OTP Input - Conditionally Rendered */}
            {isOtpVisible && (
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                <Text style={styles.otpInfoText}>
                  Code sent to +91 {phone.slice(0, 5)}*****{phone.slice(-2)}
                </Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <View key={index} style={styles.otpBox}>
                      <TextInput
                        ref={(ref) => { otpRefs.current[index] = ref; }}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChangeOtp(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        textAlign="center"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'Quicksand-Bold',
    color: '#102A43',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: 'Quicksand-Regular',
    color: '#486581',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E8ED',
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#102A43',
    fontFamily: 'Quicksand-Medium',
    paddingVertical: 0,
  },
  verifyButton: {
    backgroundColor: '#5D9CEC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  otpSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
    color: '#102A43',
    marginBottom: 8,
  },
  otpInfoText: {
    fontSize: 13,
    color: '#486581',
    fontFamily: 'Quicksand-Regular',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 50,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E1E8ED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInput: {
    fontSize: 22,
    fontFamily: 'Quicksand-Bold',
    color: '#102A43',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: 0,
  },
  button: {
    backgroundColor: '#5D9CEC',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#5D9CEC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#486581',
    fontSize: 15,
    fontFamily: 'Quicksand-Regular',
  },
  signInText: {
    color: '#5D9CEC',
    fontSize: 15,
    fontFamily: 'Quicksand-Bold',
  },
});

export default SignupScreen;
