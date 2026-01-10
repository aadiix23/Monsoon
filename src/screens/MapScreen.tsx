import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, TextInput, Alert, Keyboard, Platform, PermissionsAndroid, FlatList } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import Svg, { Path, Circle as SvgCircle, Rect, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

const MapScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [waterLogData, setWaterLogData] = useState<any>(null);
    const [drainageData, setDrainageData] = useState<any>(null);
    const [hotspotData, setHotspotData] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                const BASE_URL = 'https://monsoon-backend.onrender.com';

                // Fetch Water Log
                try {
                    const wlRes = await fetch(`${BASE_URL}/map/water-log`, { headers });
                    const wlJson = await wlRes.json();
                    setWaterLogData(wlJson);
                } catch (e) { console.log('Error fetching water logs', e); }

                // Fetch Drainage Block
                try {
                    const dbRes = await fetch(`${BASE_URL}/map/drainage-block`, { headers });
                    const dbJson = await dbRes.json();
                    setDrainageData(dbJson);
                } catch (e) { console.log('Error fetching drainage', e); }

                // Fetch Hotspots
                try {
                    const hsRes = await fetch(`${BASE_URL}/map/hotspots`, { headers });
                    const hsJson = await hsRes.json();
                    setHotspotData(hsJson);
                } catch (e) { console.log('Error fetching hotspots', e); }

            } catch (e) {
                console.log("Error in data fetching setup", e);
            }
        }
        fetchData();
    }, []);

    const handleCurrentLocation = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "Monsoon App needs access to your location so you can see your position on the map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
                    return;
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            },
            (error) => {
                console.log(error.code, error.message);
                Alert.alert('Error', 'Could not fetch location. Please ensure GPS is on.');
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        );
    };

    const fetchSuggestions = async (text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5&countrycodes=in`,
                {
                    headers: {
                        'User-Agent': 'MonsoonApp/1.0'
                    }
                }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (e) {
            console.log("Suggestion error", e);
        }
    };

    const handleSelectSuggestion = (item: any) => {
        setSearchQuery(item.display_name);
        setSuggestions([]);
        Keyboard.dismiss();
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 1000);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        Keyboard.dismiss();
        setSuggestions([]); // Clear suggestions on manual search submit

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`,
                {
                    headers: {
                        'User-Agent': 'MonsoonApp/1.0'
                    }
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            } else {
                Alert.alert('Not Found', 'Location not found');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong while searching');
        }
    };

    const drainageKeys = new Set();
    if (drainageData?.features) {
        drainageData.features.forEach((f: any) => {
            if (f.geometry?.type === 'Point') {
                drainageKeys.add(`${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`);
            }
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />

            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude: 28.6139,
                        longitude: 77.2090, // Default to New Delhi
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {/* Water Logs - Blue Markers (Filtered to avoid overlap with Drainage) */}
                    {waterLogData?.features?.map((feature: any, index: number) => {
                        if (feature.geometry.type !== 'Point') return null;
                        const key = `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`;
                        if (drainageKeys.has(key)) return null;

                        return (
                            <Marker
                                key={`wl-${feature.properties.id || index}`}
                                coordinate={{
                                    latitude: feature.geometry.coordinates[1],
                                    longitude: feature.geometry.coordinates[0],
                                }}
                                title="Water Log"
                                description={feature.properties.severity}
                                pinColor="blue"
                                zIndex={1}
                            />
                        );
                    })}

                    {/* Drainage Blocks - Red Markers */}
                    {drainageData?.features?.map((feature: any, index: number) => (
                        feature.geometry.type === 'Point' && (
                            <Marker
                                key={`db-${feature.properties.id || index}`}
                                coordinate={{
                                    latitude: feature.geometry.coordinates[1],
                                    longitude: feature.geometry.coordinates[0],
                                }}
                                title="Drainage Block"
                                description={feature.properties.severity}
                                pinColor="red"
                                zIndex={2}
                            />
                        )
                    ))}

                    {/* Hotspots - Area Circles (Orange/Yellow) */}
                    {hotspotData?.features?.map((feature: any, index: number) => (
                        feature.geometry.type === 'Point' && (
                            <Circle
                                key={`hs-${feature.properties.id || index}`}
                                center={{
                                    latitude: feature.geometry.coordinates[1],
                                    longitude: feature.geometry.coordinates[0],
                                }}
                                radius={500} // radius in meters, adjust 'a little bit larger area'
                                fillColor="rgba(255, 165, 0, 0.4)" // Orange with opacity
                                strokeColor="rgba(255, 165, 0, 0.8)"
                            />
                        )
                    ))}
                </MapView>

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <SvgCircle cx="11" cy="11" r="8" />
                        <Line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </Svg>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search For Area, Sector, Etc"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={fetchSuggestions}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Line x1="18" y1="6" x2="6" y2="18" />
                                <Line x1="6" y1="6" x2="18" y2="18" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.place_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
                                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
                                        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <SvgCircle cx="12" cy="10" r="3" />
                                    </Svg>
                                    <Text style={styles.suggestionText} numberOfLines={1}>{item.display_name}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                )}

                {/* Current Location FAB */}
                <TouchableOpacity style={styles.locationFab} onPress={handleCurrentLocation}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <SvgCircle cx="12" cy="12" r="10" />
                        <Line x1="12" y1="2" x2="12" y2="6" />
                        <Line x1="12" y1="18" x2="12" y2="22" />
                        <Line x1="2" y1="12" x2="6" y2="12" />
                        <Line x1="18" y1="12" x2="22" y2="12" />
                        <SvgCircle cx="12" cy="12" r="3" />
                    </Svg>
                </TouchableOpacity>

                {/* Filter Buttons */}
                <View style={styles.filtersContainer}>
                    <TouchableOpacity style={styles.filterPill}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                            <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </Svg>
                        <Text style={[styles.filterText, { color: '#2F80ED' }]}>Water Log</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.filterPill, { marginTop: 10 }]}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <Line x1="12" y1="9" x2="12" y2="13" />
                            <Line x1="12" y1="17" x2="12.01" y2="17" />
                        </Svg>
                        <Text style={[styles.filterText, { color: '#EA4335' }]}>Drain Block</Text>
                    </TouchableOpacity>
                </View>

                {/* Future Button */}
                <TouchableOpacity style={styles.futureButton}>
                    <Text style={styles.futureButtonText}>Future</Text>
                </TouchableOpacity>

            </View>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <SvgCircle cx="12" cy="12" r="3" />
                        <Path d="M12 8v8" fill="none" stroke="none" />
                    </Svg>
                    <Text style={styles.navText}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5D9CEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                        <Path d="M8 2v16" />
                        <Path d="M16 6v16" />
                    </Svg>
                    <Text style={[styles.navText, styles.navTextActive]}>Map</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    map: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 10,
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
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    searchBarContainer: {
        position: 'absolute',
        top: 45,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Quicksand-Regular',
        height: 40,
    },
    locationFab: {
        position: 'absolute',
        top: 120, // Positioned below search bar
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    filtersContainer: {
        position: 'absolute',
        bottom: 30, // Adjust as needed
        left: 20,
    },
    filterPill: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        maxWidth: 160,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Quicksand-Medium',
    },
    futureButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#6A9BE8',
        borderRadius: 12,
        paddingHorizontal: 25,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        minWidth: 100,
        alignItems: 'center',
    },
    futureButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Quicksand-Bold',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 115, // searchBarContainer (50 start + 60 height) + 5 spacing
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 10,
        zIndex: 10,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontFamily: 'Quicksand-Regular',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});

export default MapScreen;
