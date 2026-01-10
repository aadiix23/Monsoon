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
  ImageBackground,
} from 'react-native';
import Logo from '../assets/images/Logo.svg';

import axios from 'axios';
import { API_URL } from '@env';
import { Alert } from 'react-native';
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
    // In a real app, this would likely trigger sending an OTP to the phone
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
    <ImageBackground
      source={require('../assets/images/homebg.webp')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Logo width={140} height={140} />
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Get Started</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Name"
                  placeholderTextColor="#A0A0A0"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Email Adress"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center' }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter Your Contact Number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                {phone.length > 0 && !isOtpVisible && (
                  <TouchableOpacity onPress={handleVerify}>
                    <Text style={styles.verifyText}>Verify !</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* OTP Input - Conditionally Rendered */}
            {isOtpVisible && (
              <View style={styles.otpSection}>
                <Text style={styles.otpInfoText}>
                  *Input the code has been sent to phone number +91{phone.slice(0, 5)}*****{phone.slice(-2)}
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
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already a User ! </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <CustomAlert
          visible={alertVisible}
          type={alertType}
          message={alertMessage}
          onClose={handleAlertClose}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#334E68',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#486581',
    marginBottom: 8,
    fontFamily: 'Quicksand-Medium',
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#102A43',
    padding: 0,
    fontFamily: 'Quicksand-Regular',
  },
  verifyText: {
    color: '#5D9CEC',
    fontSize: 12,
    fontFamily: 'Quicksand-Bold',
  },
  button: {
    backgroundColor: '#5D9CEC',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#5D9CEC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#829AB1',
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
  },
  signInText: {
    color: '#5D9CEC',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  otpSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  otpInfoText: {
    fontSize: 12,
    color: '#829AB1',
    fontFamily: 'Quicksand-Regular',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    color: '#334E68',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: 0,
  },
});

export default SignupScreen;
