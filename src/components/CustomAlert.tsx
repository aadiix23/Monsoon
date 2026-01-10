import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';

interface CustomAlertProps {
    visible: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, type, message, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={[styles.iconContainer, type === 'success' ? styles.successIcon : styles.errorIcon]}>
                        <Text style={styles.iconText}>{type === 'success' ? '✓' : '!'}</Text>
                    </View>
                    <Text style={styles.modalTitle}>{type === 'success' ? 'Success!' : 'Error!'}</Text>
                    <Text style={styles.modalText}>{message}</Text>
                    <TouchableOpacity
                        style={[styles.button, type === 'success' ? styles.successButton : styles.errorButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>{type === 'success' ? 'Continue' : 'Try Again'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successIcon: {
        backgroundColor: '#E3F8F2', // Light green bg
    },
    errorIcon: {
        backgroundColor: '#FDECEA', // Light red bg
    },
    iconText: {
        fontSize: 30,
        color: '#334E68', // Dark blue text
        fontFamily: 'Quicksand-Bold',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 22,
        fontFamily: 'Quicksand-Bold',
        color: '#102A43',
    },
    modalText: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Quicksand-Regular',
        color: '#486581',
    },
    button: {
        borderRadius: 25,
        padding: 12,
        elevation: 2,
        paddingHorizontal: 30,
        minWidth: 120,
    },
    successButton: {
        backgroundColor: '#5D9CEC', // App Theme Color
    },
    errorButton: {
        backgroundColor: '#EF4E5E', // Red for error
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Quicksand-Bold',
        fontSize: 16,
    },
});

export default CustomAlert;
