import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Image,
    SafeAreaView
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Logo from '../assets/images/onboarding1.svg';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
    userInfo: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        profileImage?: string;
    } | null;
    onLogout: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose, userInfo, onLogout }) => {
    const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

    useEffect(() => {

        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -MENU_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1} />

                <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>

                    <View style={styles.header}>

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M18 6L6 18" />
                                <Path d="M6 6l12 12" />
                            </Svg>
                        </TouchableOpacity>


                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                {userInfo?.profileImage ? (
                                    <Image source={{ uri: userInfo.profileImage }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.logoWrapper}>
                                        <Logo width={80} height={80} preserveAspectRatio="xMidYMid slice" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.userName}>{userInfo?.name || 'User Name'}</Text>
                        </View>
                    </View>


                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>Personal Information :-</Text>

                        <View style={styles.infoRow}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <Path d="M22 6l-10 7L2 6" />
                            </Svg>
                            <Text style={styles.infoText}>{userInfo?.email || 'email@example.com'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </Svg>
                            <Text style={styles.infoText}>{userInfo?.phoneNumber || '1234567890'}</Text>
                        </View>
                    </View>


                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#486581" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <Path d="M16 17l5-5-5-5" />
                                <Path d="M21 12H9" />
                            </Svg>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
    },
    overlayTouch: {
        flex: 1,
        width: width - MENU_WIDTH,
    },
    menuContainer: {
        width: MENU_WIDTH,
        backgroundColor: '#FFF',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        height: 200,
        backgroundColor: '#A0D2EB',
        padding: 20,
        justifyContent: 'flex-end',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    profileSection: {
        alignItems: 'flex-start',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FFF',
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#DDD',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    logoWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: 'Quicksand-Bold',
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F7FA',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#102A43',
        marginBottom: 20,
        fontFamily: 'Quicksand-Bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#5D9CEC',
        fontFamily: 'Quicksand-Medium',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E1E8ED',
        backgroundColor: '#FFF',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',


    },
    logoutText: {
        fontSize: 18,
        color: '#486581',
        marginLeft: 10,
        fontFamily: 'Quicksand-Bold',
    },
});

export default SideMenu;
