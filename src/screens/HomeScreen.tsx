import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Platform,
    Alert, // Keep Alert for now, but replace calls
    Image,
    PermissionsAndroid,
    ActivityIndicator,
    Modal,
    RefreshControl,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Logo from '../assets/images/Logo.svg';

const HomeScreen = ({ navigation }: any) => {
    const [gpsLocation, setGpsLocation] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [reportType, setReportType] = useState<'waterLog' | 'drainageBlock'>('waterLog');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [severity, setSeverity] = useState<'low' | 'moderate' | 'high'>('low');
    const [description, setDescription] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
        actions?: { text: string; onPress: () => void; style?: 'cancel' | 'default' | 'destructive' }[];
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'info' = 'info',
        actions?: { text: string; onPress: () => void; style?: 'cancel' | 'default' | 'destructive' }[]
    ) => {
        setAlertConfig({ visible: true, title, message, type, actions });
    };

    const closeAlert = () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Refresh Time
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB');
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDateTime(`${formattedDate} ${formattedTime}`);

        // Refresh Location
        getLocation(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        // Set Date and Time
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDateTime(`${formattedDate} ${formattedTime}`);

        // Fetch Location
        getLocation();
    }, []);

    const getLocation = async (onComplete?: () => void) => {
        setIsLoadingLocation(true);
        const finish = () => {
            setIsLoadingLocation(false);
            if (onComplete) onComplete();
        };

        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'App needs access to your location to report issues properly.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Helper function to get position
                    const getCurrentPositionHelper = (highAccuracy: boolean) => {
                        Geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                let locationString = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;

                                try {
                                    const response = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                                        {
                                            headers: {
                                                'User-Agent': 'MonsoonApp/1.0',
                                            },
                                        }
                                    );
                                    const data = await response.json();
                                    if (data && data.display_name) {
                                        locationString += `\n${data.display_name}`;
                                    }
                                } catch (error) {
                                    console.log('Error fetching address:', error);
                                }

                                setGpsLocation(locationString);
                                finish();
                            },
                            (error) => {
                                console.log(`Error (HighAccuracy: ${highAccuracy}):`, error.code, error.message);
                                if (highAccuracy) {
                                    // If high accuracy failed, try low accuracy
                                    console.log('Retrying with low accuracy...');
                                    getCurrentPositionHelper(false);
                                } else {
                                    showAlert('Error', 'Failed to get location. Please ensure GPS is on.', 'error');
                                    finish();
                                }
                            },
                            { enableHighAccuracy: highAccuracy, timeout: 20000, maximumAge: 10000 }
                        );
                    };

                    getCurrentPositionHelper(true);

                } else {
                    console.log('Location permission denied');
                    finish();
                }
            } catch (err) {
                console.warn(err);
                finish();
            }
        } else {
            finish();
        }
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const grantedCamera = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );

                let grantedStorage = PermissionsAndroid.RESULTS.GRANTED;
                if (Platform.Version >= 33) {
                    grantedStorage = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    );
                } else {
                    grantedStorage = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );
                }

                return (
                    grantedCamera === PermissionsAndroid.RESULTS.GRANTED &&
                    grantedStorage === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleImagePick = () => {
        showAlert('Upload Photo', 'Choose an option', 'info', [
            { text: 'Camera', onPress: openCamera },
            { text: 'Gallery', onPress: openGallery },
            { text: 'Cancel', onPress: closeAlert, style: 'cancel' },
        ]);
    };

    const openCamera = async () => {
        closeAlert(); // Close selection menu

        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            showAlert('Permission Denied', 'Camera and Storage permissions are required.', 'error');
            return;
        }

        const options = {
            mediaType: 'photo' as const,
            includeBase64: false,
            saveToPhotos: true,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                showAlert('Error', 'Failed to open camera', 'error');
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (uri) setSelectedImage(uri);
            }
        });
    };

    const openGallery = async () => {
        closeAlert(); // Close selection menu

        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            showAlert('Permission Denied', 'Storage permission is required to access gallery.', 'error');
            return;
        }

        const options = {
            mediaType: 'photo' as const,
            includeBase64: false,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                showAlert('Error', 'Failed to open gallery', 'error');
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                if (uri) setSelectedImage(uri);
            }
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... (rest of methods)

    const handleSubmit = async () => {
        if (!selectedImage) {
            showAlert('Error', 'Please upload an image first.', 'error');
            return;
        }
        if (!gpsLocation.includes('Lat:')) {
            showAlert('Error', 'GPS Location not found.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Retrieve Token
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                showAlert('Error', 'Session expired, please login again', 'error');
                setIsSubmitting(false);
                // Optionally navigate to Login
                return;
            }

            // 1. Upload Image
            const formData = new FormData();
            formData.append('image', {
                uri: selectedImage,
                type: 'image/jpeg', // Adjust based on actual image type if possible, or assume jpeg
                name: 'upload.jpg',
            });

            // Note: Use environment variable or hardcode for now based on previous context if env not working perfectly in snippets
            // Using logic from passed instructions to use user provided exact endpoints if needed, but assuming API_URL is valid base.
            // User provided "http://monsoon-backend.onrender.com/uploads..." in example, so likely API_URL is "https://monsoon-backend.onrender.com"

            const BASE_URL = 'https://monsoon-backend.onrender.com';

            const uploadResponse = await fetch(`${BASE_URL}/upload/image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.imageUrl) {
                throw new Error('Image upload failed');
            }

            const uploadedImageUrl = uploadResult.imageUrl;

            // 2. Prepare Report Data
            // Parse Lat/Long
            const latLongMatch = gpsLocation.match(/Lat: ([0-9.-]+), Long: ([0-9.-]+)/);
            if (!latLongMatch) throw new Error('Invalid location format');

            const lat = parseFloat(latLongMatch[1]);
            const lon = parseFloat(latLongMatch[2]);

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Invalid latitude or longitude parsed from GPS location.');
            }

            // Use current time for report (since field is non-editable)
            const now = new Date();
            const eventDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const eventTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

            const reportPayload = {
                lat: lat,
                lon: lon,
                severity: severity.charAt(0).toUpperCase() + severity.slice(1), // "Low" | "Moderate" | "High"
                reportType: reportType === 'waterLog' ? 'Water Log' : 'Drainage Block',
                eventDate: eventDate,
                eventTime: eventTime,
                imageUrl: uploadedImageUrl,
                description: description
            };

            console.log('Sending Report Payload:', JSON.stringify(reportPayload, null, 2));

            // 3. Submit Report
            const reportResponse = await fetch(`${BASE_URL}/map/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(reportPayload),
            });

            const reportResult = await reportResponse.json();
            console.log('Report Response:', reportResult);

            if (reportResponse.ok) {
                showAlert('Success', 'Report submitted successfully!', 'success');
                // Reset form
                setSelectedImage(null);
                setDescription('');
                setSeverity('low');
                setReportType('waterLog');
                // Optional: Refresh location or date?
            } else {
                // detailed error message from backend
                const errorMessage = reportResult.message || JSON.stringify(reportResult);
                throw new Error(errorMessage);
            }

        } catch (error: any) {
            console.error(error);
            showAlert('Error', error.message || 'Something went wrong', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Header Logo */}
                <View style={styles.logoContainer}>
                    <Logo width={120} height={100} />
                </View>

                {/* Upload Area */}
                <View style={styles.uploadContainer}>
                    <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
                        {selectedImage ? (
                            <Image source={{ uri: selectedImage }} style={styles.uploadedImage} resizeMode="cover" />
                        ) : (
                            <>
                                <View style={styles.uploadIconCircle}>
                                    <Svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <Path d="M12 19V5" />
                                        <Path d="M5 12l7-7 7 7" />
                                    </Svg>
                                </View>
                                <Text style={styles.uploadText}>Report Problem</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* GPS Location */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <Circle cx="12" cy="10" r="3" />
                        </Svg>
                        <Text style={styles.label}>GPS Location</Text>
                    </View>
                    {isLoadingLocation ? (
                        <View style={[styles.input, styles.loadingContainer]}>
                            <ActivityIndicator size="small" color="#5D9CEC" />
                            <Text style={styles.loadingText}>Fetching location...</Text>
                        </View>
                    ) : (
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={gpsLocation}
                            editable={false}
                            placeholder="Location not found"
                            multiline
                        />
                    )}
                </View>

                {/* Date & Time */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <Circle cx="12" cy="12" r="10" />
                            <Path d="M12 6v6l4 2" />
                        </Svg>
                        <Text style={styles.label}>Date & Time</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={dateTime}
                        editable={false}
                        placeholder=""
                    />
                </View>

                {/* Radio Buttons (Report Type) */}
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setReportType('waterLog')}
                    >
                        <View style={[styles.radioCircle, reportType === 'waterLog' && styles.radioSelected]}>
                            {reportType === 'waterLog' && <View style={styles.radioInnerCircle} />}
                        </View>
                        <Text style={styles.radioText}>Water Log</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setReportType('drainageBlock')}
                    >
                        <View style={[styles.radioCircle, reportType === 'drainageBlock' && styles.radioSelected]}>
                            {reportType === 'drainageBlock' && <View style={styles.radioInnerCircle} />}
                        </View>
                        <Text style={styles.radioText}>Drainage Block</Text>
                    </TouchableOpacity>
                </View>

                {/* Severity */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <Path d="M12 9v4" />
                            <Path d="M12 17h.01" />
                        </Svg>
                        <Text style={styles.label}>Severity</Text>
                    </View>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity style={styles.radioOption} onPress={() => setSeverity('low')}>
                            <View style={[styles.radioCircle, severity === 'low' && styles.radioSelected]}>
                                {severity === 'low' && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Text style={styles.radioText}>Low</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioOption} onPress={() => setSeverity('moderate')}>
                            <View style={[styles.radioCircle, severity === 'moderate' && styles.radioSelected]}>
                                {severity === 'moderate' && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Text style={styles.radioText}>Moderate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioOption} onPress={() => setSeverity('high')}>
                            <View style={[styles.radioCircle, severity === 'high' && styles.radioSelected]}>
                                {severity === 'high' && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Text style={styles.radioText}>High</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </Svg>
                        <Text style={styles.label}>Description</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter Description"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <Circle cx="12" cy="12" r="3" />
                        <Path d="M12 8v8" fill="none" stroke="none" /> {/* Placeholder */}
                    </Svg>
                    <Text style={[styles.navText, styles.navTextActive]}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Map')}
                >
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                        <Path d="M8 2v16" />
                        <Path d="M16 6v16" />
                    </Svg>
                    <Text style={styles.navText}>Map</Text>
                </TouchableOpacity>
            </View>

            {/* Custom Alert Modal */}
            <Modal
                transparent={true}
                visible={alertConfig.visible}
                animationType="fade"
                onRequestClose={closeAlert}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {alertConfig.type === 'success' && (
                            <View style={[styles.iconContainer, { backgroundColor: '#E6FFFA' }]}>
                                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38B2AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Path d="M20 6L9 17l-5-5" />
                                </Svg>
                            </View>
                        )}
                        {alertConfig.type === 'error' && (
                            <View style={[styles.iconContainer, { backgroundColor: '#FFF5F5' }]}>
                                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Circle cx="12" cy="12" r="10" />
                                    <Path d="M15 9l-6 6" />
                                    <Path d="M9 9l6 6" />
                                </Svg>
                            </View>
                        )}
                        {alertConfig.type === 'info' && (
                            <View style={[styles.iconContainer, { backgroundColor: '#EBF8FF' }]}>
                                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <Circle cx="12" cy="12" r="10" />
                                    <Path d="M12 16v-4" />
                                    <Path d="M12 8h.01" />
                                </Svg>
                            </View>
                        )}

                        <Text style={styles.modalTitle}>{alertConfig.title}</Text>
                        <Text style={styles.modalMessage}>{alertConfig.message}</Text>

                        <View style={styles.modalActions}>
                            {alertConfig.actions ? (
                                alertConfig.actions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.modalButton,
                                            action.style === 'cancel' ? styles.modalButtonSecondary : styles.modalButtonPrimary,
                                            index > 0 && { marginTop: 10 }
                                        ]}
                                        onPress={() => {
                                            action.onPress();
                                            // closeAlert(); // Close alert after action, unless action handles it
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalButtonText,
                                            action.style === 'cancel' ? styles.modalButtonTextSecondary : styles.modalButtonTextPrimary
                                        ]}>{action.text}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={closeAlert}>
                                    <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>OK</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD', // Very light blue background
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    scrollContainer: {
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    uploadContainer: {
        marginBottom: 30,
        marginTop: 10,
    },
    uploadBox: {
        height: 180,
        borderWidth: 2,
        borderColor: '#B0C4DE',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    uploadIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#FFF',
    },
    uploadText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '600',
        fontFamily: 'Quicksand-Bold', // Assuming font is available
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginLeft: 8,
        fontWeight: '600',
        fontFamily: 'Quicksand-Bold',
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1E3F6',
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Quicksand-Regular',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#999',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: '#FFF',
    },
    radioSelected: {
        borderColor: '#5D9CEC',
    },
    radioInnerCircle: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#5D9CEC',
    },
    radioText: {
        fontSize: 16,
        color: '#555',
        fontWeight: '600',
        fontFamily: 'Quicksand-Medium',
    },
    submitButton: {
        backgroundColor: '#6A9BE8', // Slightly lighter blue than pure primary for a softer look
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#6A9BE8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Quicksand-Bold',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 10, // For safe area
    },
    navItem: {
        alignItems: 'center',
        padding: 10,
    },
    navItemActive: {
        backgroundColor: '#EDF5FF',
        borderRadius: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
    },
    navText: {
        fontSize: 12,
        color: '#A0A0A0',
        marginTop: 4,
        fontFamily: 'Quicksand-Regular',
    },
    navTextActive: {
        color: '#5D9CEC',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        marginTop: 0,
        fontFamily: 'Quicksand-Bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        marginLeft: 10,
        color: '#829AB1',
        fontFamily: 'Quicksand-Regular',
        fontSize: 14,
    },
    disabledInput: {
        backgroundColor: '#F0F4F8',
        color: '#486581',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Quicksand-Bold',
    },
    modalMessage: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        fontFamily: 'Quicksand-Regular',
    },
    modalActions: {
        width: '100%',
    },
    modalButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    modalButtonPrimary: {
        backgroundColor: '#5D9CEC', // Using primary blue color
    },
    modalButtonSecondary: {
        backgroundColor: '#E2E8F0',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Quicksand-Bold',
    },
    modalButtonTextPrimary: {
        color: '#FFFFFF',
    },
    modalButtonTextSecondary: {
        color: '#4A5568',
    },
});

export default HomeScreen;
