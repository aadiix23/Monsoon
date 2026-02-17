import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import Onboarding1 from '../assets/images/onboarding1.svg';
import Onboarding2 from '../assets/images/onboarding2.svg';
import Onboarding3 from '../assets/images/onboarding3.svg';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Report Water Logging Instantly',
        description: 'Capture and share water-logged locations with a single tap using your phone.',
        image: Onboarding1,
    },
    {
        id: '2',
        title: 'Faster Action by Authorities',
        description: 'Your reports help local authorities respond quickly and fix issues on time.',
        image: Onboarding2,
    },
    {
        id: '3',
        title: 'Predict. Prepare. Prevent.',
        description: 'Identify future water-logging hotspots and stay prepared before rain begins.',
        image: Onboarding3,
    },
];

const OnboardingScreen = ({ navigation }: any) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef<FlatList>(null);

    const updateCurrentSlideIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex !== slides.length) {
            const offset = nextSlideIndex * width;
            ref.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        }
    };

    const skip = () => {
        navigation.replace('Signup');

    };

    const handleNext = () => {
        if (currentSlideIndex === slides.length - 1) {
            navigation.replace('Signup');
        } else {
            goToNextSlide();
        }
    };

    const Slide = ({ item }: any) => {
        return (
            <View style={styles.slide}>
                <View style={styles.imageContainer}>
                    <item.image width={width * 0.8} height={height * 0.45} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#F0F8FF" barStyle="dark-content" />
            <FlatList
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                contentContainerStyle={{ height: height * 0.75 }}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={slides}
                pagingEnabled
                renderItem={({ item }) => <Slide item={item} />}
                keyExtractor={(item) => item.id}
            />


            <View style={styles.footer}>

                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex === index && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>


                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={skip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 60,
        height: height * 0.5,
        width: width,
    },
    textContainer: {
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2F5979',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'Quicksand-Bold',
    },
    description: {
        fontSize: 16,
        color: '#7B8D9E',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'Quicksand-Regular',
        paddingHorizontal: 10,
    },
    footer: {
        height: height * 0.20,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    indicator: {
        height: 8,
        width: 8,
        backgroundColor: '#D1E3F6',
        borderRadius: 4,
        marginHorizontal: 4,
    },
    indicatorActive: {
        backgroundColor: '#5D9CEC',
        width: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,

    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        fontFamily: 'Quicksand-Medium',
    },
    nextButton: {
        backgroundColor: '#6A9BE8',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        shadowColor: '#6A9BE8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Quicksand-Bold',
    },
});

export default OnboardingScreen;
