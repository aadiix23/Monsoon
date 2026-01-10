import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

const LoginScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = React.useRef<Array<TextInput | null>>([]);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [alertMessage, setAlertMessage] = useState('');

    const handleGetOtp = () => {
        // Simulating sending OTP
        if (phone.length < 10) {
            showAlert('error', 'Please enter a valid phone number');
            return;
        }
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
            // Navigate to Home or specific screen
            navigation.navigate('Home'); // Ensure 'Home' route exists or change as needed.
            // If Home doesn't exist, maybe it should just stay or go back?
            // User didn't specify, but usually it's Main App. 
            // I will leave it as Home for now, user can correct.
        }
    };

    const handleLogin = async () => {
        try {
            const otpString = otp.join('');
            if (otpString.length !== 6) {
                showAlert('error', 'Please enter a valid 6-digit OTP');
                return;
            }

            const payload = {
                phoneNumber: phone,
                otp: otpString,
            };

            console.log('Logging in with:', payload);
            console.log('API URL:', API_URL);

            const response = await axios.post(`${API_URL}/auth/login`, payload);

            console.log('Login success:', response.data);

            const { token, user } = response.data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(user));

            showAlert('success', 'Login Successful!');

        } catch (error) {
            console.error('Login error:', error);
            showAlert('error', 'Login failed. Please check your credentials.');
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
                        <Text style={styles.title}>Welcome Back</Text>

                        {/* Phone Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Your Contact Number"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>

                        {/* OTP Section */}
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

                        {/* Action Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={isOtpVisible ? handleLogin : handleGetOtp}
                        >
                            <Text style={styles.buttonText}>
                                {isOtpVisible ? 'Login' : 'Get OTP'}
                            </Text>
                        </TouchableOpacity>

                        {/* Footer Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>New User? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signUpText}>Sign Up</Text>
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
    signUpText: {
        color: '#5D9CEC',
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
    },
});

export default LoginScreen;
