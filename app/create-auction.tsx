import React, { useState } from "react";
import { useTheme } from '../hooks/ThemeContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../services/api";
import NavFarmer from "../components/navigation/NavFarmer";
import { useTranslation } from "react-i18next";

// Mocking icons to avoid web text node errors during development
const Ionicons = (props: any) => <View {...props} />;
const FontAwesome5 = (props: any) => <View {...props} />;

export default function CreateAuction() {
    const { highContrast } = useTheme();
    const router = useRouter();
    const { t } = useTranslation();

    // Section A: Crop Details State
    const [cropName, setCropName] = useState("");
    const [variety, setVariety] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("Quintal");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [quality, setQuality] = useState("A");
    const [harvestDate, setHarvestDate] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);

    // Section B: Pricing Strategy State
    const [startingPrice, setStartingPrice] = useState("");
    const [reservePrice, setReservePrice] = useState("");
    const [minIncrement, setMinIncrement] = useState("50");

    // Section C: Auction Timing State
    const [duration, setDuration] = useState("24h");

    // Section D: Logistics State
    const [pickupLocation, setPickupLocation] = useState("");
    const [deliveryType, setDeliveryType] = useState("Buyer Pickup");

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotos(prev => [...prev, result.assets[0].uri]);
        }
    };

    const handleStartAuction = async () => {
        // Validate required fields
        if (!cropName || !quantity || !startingPrice || !pickupLocation || !harvestDate || !unit || !quality || !minIncrement || !duration || !deliveryType) {
            Alert.alert(t("common.error") || "Missing Details", t("create_auction.missing_fields") || "Please fill in all required fields.");
            return;
        }

        let multiplier = 1;
        if (unit.toLowerCase() === "quintal") multiplier = 100;
        if (unit.toLowerCase() === "ton") multiplier = 1000;

        const payload = {
            crop: cropName,
            variety,
            quantityKg: Number(quantity) * multiplier,
            grade: quality,
            harvestDate,
            basePrice: Number(startingPrice),
            reservePrice: reservePrice ? Number(reservePrice) : undefined,
            minBidIncrement: Number(minIncrement),
            duration,
            pickupLocation,
            deliveryType,
            transportIncluded: deliveryType === "Farmer Delivery"
        };

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Auth Error", t("create_auction.auth_err") || "You must be logged in to create an auction.");
                return;
            }

            const res = await fetch(ENDPOINTS.AUCTIONS.CREATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("Auction Recorded", t("create_auction.success") || "Your crop is now live for buyers to bid!");
                router.replace("/farmer-auctions");
            } else {
                Alert.alert("Error", data.message || t("create_auction.err") || "Could not create auction. Please try again.");
            }
        } catch (error) {
            console.error("Auction Creation Error:", error);
            Alert.alert("Error", t("create_auction.err") || "Check your network connection and try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <NavFarmer />
            <View style={[styles.header, highContrast && { backgroundColor: "#000", borderBottomColor: "#333" }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={highContrast ? "#FFF" : "#0F172A"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("create_auction.title") || "Create Live Auction"}</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            <ScrollView style={[styles.container, highContrast && { backgroundColor: "#000" }]} contentContainerStyle={styles.scrollContent}>

                {/* SECTION A: CROP DETAILS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("create_auction.section_a") || "A. CROP DETAILS"}</Text>
                </View>
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.crop_name") || "Crop Name"} <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("create_auction.crop_ph") || "e.g. Wheat, Basmati Rice"}
                        value={cropName}
                        onChangeText={setCropName}
                        placeholderTextColor="#94A3B8"
                    />

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.variety") || "Variety (Optional)"}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("create_auction.variety_ph") || "e.g. Sharbati, 1121"}
                        value={variety}
                        onChangeText={setVariety}
                        placeholderTextColor="#94A3B8"
                    />

                    <View style={[styles.row, { zIndex: 10 }]}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.quantity") || "Quantity"} <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 50"
                                keyboardType="numeric"
                                value={quantity}
                                onChangeText={setQuantity}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8, zIndex: 10 }}>
                            <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.unit") || "Unit"} <Text style={styles.required}>*</Text></Text>
                            <TouchableOpacity
                                style={[styles.input, styles.dropdownInput]}
                                onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                            >
                                <Text style={{ color: "#0F172A", fontSize: 15 }}>{unit}</Text>
                                <Text style={{ fontSize: 12, color: "#64748B" }}>{showUnitDropdown ? "▲" : "▼"}</Text>
                            </TouchableOpacity>

                            {showUnitDropdown && (
                                <View style={styles.dropdownMenu}>
                                    {["Quintal", "Kg", "Ton"].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setUnit(option);
                                                setShowUnitDropdown(false);
                                            }}
                                        >
                                            <Text style={[styles.dropdownOptionText, unit === option && styles.dropdownOptionTextActive]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.quality") || "Quality Grade"} <Text style={styles.required}>*</Text></Text>
                    <View style={styles.radioGroup}>
                        {["A", "B", "C"].map(grade => (
                            <TouchableOpacity
                                key={grade}
                                style={[styles.radioBtn, quality === grade && styles.radioBtnActive]}
                                onPress={() => setQuality(grade)}
                            >
                                <Text style={[styles.radioText, quality === grade && styles.radioTextActive]}>
                                    Grade {grade}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.harvest_date") || "Harvest Date"} <Text style={styles.required}>*</Text></Text>
                    {Platform.OS === "web" ? (
                        <View style={styles.input}>
                            {React.createElement('input', {
                                type: 'date',
                                value: harvestDate,
                                onChange: (e: any) => setHarvestDate(e.target.value),
                                style: {
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '15px',
                                    color: '#0F172A',
                                    fontFamily: 'inherit'
                                }
                            })}
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/YYYY"
                            value={harvestDate}
                            onChangeText={setHarvestDate}
                            placeholderTextColor="#94A3B8"
                        />
                    )}

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.upload_photos") || "Upload Photos (Optional)"}</Text>

                    {photos.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
                            {photos.map((uri, index) => (
                                <Image key={index} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }} />
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={24} color="#16A34A" />
                        <Text style={styles.uploadText}>{t("create_auction.tap_add_photos") || "Tap to add photos"}</Text>
                    </TouchableOpacity>
                </View>

                {/* SECTION B: PRICING STRATEGY */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("create_auction.section_b") || "B. PRICING STRATEGY"}</Text>
                </View>
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.start_price") || "Starting Price"} ({t("create_auction.per") || "per"} {unit.toLowerCase()}) <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                            style={styles.inputWithPrefix}
                            placeholder="1500"
                            keyboardType="numeric"
                            value={startingPrice}
                            onChangeText={setStartingPrice}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.reserve_price") || "Reserve Price (Optional)"}</Text>
                    <Text style={styles.helperText}>{t("create_auction.reserve_help") || "Minimum acceptable price. Auction only completes if highest bid ≥ reserve price."}</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                            style={styles.inputWithPrefix}
                            placeholder="e.g. 1800"
                            keyboardType="numeric"
                            value={reservePrice}
                            onChangeText={setReservePrice}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.min_increment") || "Minimum Bid Increment"} <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.helperText}>{t("create_auction.min_help") || "Prevents ₹1 increments."}</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                            style={styles.inputWithPrefix}
                            placeholder="50"
                            keyboardType="numeric"
                            value={minIncrement}
                            onChangeText={setMinIncrement}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                </View>

                {/* SECTION C: AUCTION TIMING */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("create_auction.section_c") || "C. AUCTION TIMING"}</Text>
                </View>
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.duration") || "Duration"} <Text style={styles.required}>*</Text></Text>
                    <View style={styles.durationGroup}>
                        {[
                            { key: "30m", label: "30 Mins" },
                            { key: "1h", label: "1 Hour" },
                            { key: "6h", label: "6 Hours" },
                            { key: "24h", label: "24 Hours" }
                        ].map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.durationBtn, duration === opt.key && styles.durationBtnActive]}
                                onPress={() => setDuration(opt.key)}
                            >
                                <Text style={[styles.durationText, duration === opt.key && styles.durationTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.warningBox}>
                        <Ionicons name="warning-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                        <Text style={styles.warningText}>{t("create_auction.duration_warn") || "Warning: Short auctions (< 1 hour) often attract fewer buyers."}</Text>
                    </View>
                </View>

                {/* SECTION D: LOGISTICS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t("create_auction.section_d") || "D. LOGISTICS"}</Text>
                </View>
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.pickup") || "Pickup Location (Village/District)"} <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ludhiana, Punjab"
                        value={pickupLocation}
                        onChangeText={setPickupLocation}
                        placeholderTextColor="#94A3B8"
                    />

                    <Text style={[styles.label, highContrast && { color: "#CCC" }]}>{t("create_auction.delivery_type") || "Delivery Type"} <Text style={styles.required}>*</Text></Text>
                    <View style={styles.radioGroupVertical}>
                        {["Buyer Pickup", "Farmer Delivery"].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.radioItemRow, deliveryType === type && styles.radioItemRowActive]}
                                onPress={() => setDeliveryType(type)}
                            >
                                <View style={[styles.radioCircle, deliveryType === type && styles.radioCircleActive]} />
                                <Text style={[styles.radioItemText, deliveryType === type && styles.radioItemTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>

            {/* STICKY FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleStartAuction}>
                    <Ionicons name="flash" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>{t("create_auction.start_btn") || "Start Auction"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    scrollContent: { padding: 16, paddingBottom: 40 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
        paddingTop: Platform.OS === "ios" ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0"
    },
    backButton: { padding: 8, marginLeft: -8 },
    /* Spacer */
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },

    sectionHeader: { marginTop: 24, marginBottom: 8, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 13, fontWeight: "800", color: "#64748B", letterSpacing: 1 },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2
    },

    label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 12 },
    required: { color: "#EF4444" },
    helperText: { fontSize: 12, color: "#94A3B8", marginBottom: 8, marginTop: -4 },

    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: "#0F172A",
    },

    dropdownInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF"
    },
    dropdownMenu: {
        position: "absolute",
        top: 76, // Below the input
        left: 0,
        right: 0,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 100 // High z-index to overlay next inputs
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9"
    },
    dropdownOptionText: { fontSize: 15, color: "#334155" },
    dropdownOptionTextActive: { color: "#16A34A", fontWeight: "700" },

    row: { flexDirection: "row" },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        backgroundColor: "#FFF",
    },
    currencyPrefix: { paddingLeft: 16, paddingRight: 8, fontSize: 16, color: "#64748B", fontWeight: "600" },
    inputWithPrefix: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 16,
        fontSize: 15,
        color: "#0F172A",
    },

    radioGroup: { flexDirection: "row", gap: 8 },
    radioBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    radioBtnActive: { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
    radioText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
    radioTextActive: { color: "#16A34A" },

    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#16A34A",
        borderStyle: "dashed",
        borderRadius: 8,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: "#F0FDF4"
    },
    uploadText: { fontSize: 14, fontWeight: "600", color: "#16A34A" },

    durationGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    durationBtn: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#FFF"
    },
    durationBtnActive: { borderColor: "#0F172A", backgroundColor: "#0F172A" },
    durationText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    durationTextActive: { color: "#FFF" },

    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 8,
        padding: 12,
        marginTop: 16
    },
    warningText: { flex: 1, fontSize: 13, color: "#B45309", fontWeight: "500" },

    radioGroupVertical: { gap: 12, marginTop: 4 },
    radioItemRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        padding: 14,
        borderRadius: 8
    },
    radioItemRowActive: { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        marginRight: 12
    },
    radioCircleActive: { borderColor: "#16A34A", borderWidth: 6 },
    radioItemText: { fontSize: 15, fontWeight: "500", color: "#334155" },
    radioItemTextActive: { color: "#0F172A", fontWeight: "700" },

    footer: {
        backgroundColor: "#FFF",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10
    },
    submitBtn: {
        backgroundColor: "#16A34A",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12
    },
    submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 }
});
