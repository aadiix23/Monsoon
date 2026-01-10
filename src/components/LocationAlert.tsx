import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface LocationAlertProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LocationAlert: React.FC<LocationAlertProps> = ({
    visible,
    onClose,
    onConfirm
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>!</Text>
                    </View>
                    <Text style={styles.modalTitle}>Location Disabled</Text>
                    <Text style={styles.modalText}>
                        Location services are disabled. Please turn on GPS for the best experience.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.textStyle}>Open Settings</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#FDECEA', // Light red bg
    },
    iconText: {
        fontSize: 30,
        color: '#334E68',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 12,
        elevation: 0, // No elevation for flat look or managed manually
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    confirmButton: {
        backgroundColor: '#5D9CEC', // Primary Theme Color
        elevation: 2,
        marginLeft: 10,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EF4E5E',
        marginRight: 10,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Quicksand-Bold',
        fontSize: 14, // Slightly smaller to fit
    },
    secondaryButtonText: {
        color: '#EF4E5E',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Quicksand-Bold',
        fontSize: 14,
    },
});

export default LocationAlert;
