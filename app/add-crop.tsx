import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavFarmer from "../components/navigation/NavFarmer";

type CropData = {
  [key: string]: string[];
};

export type CropListing = {
  id: string;
  category: string;
  crop: string;
  quantity: string;
  price: string;
  createdAt: string;
};

const cropData: CropData = {
  "Food Grains / Cereals": [
    "Mushk Budji Rice", "Amaranth Seed", "Arhar", "Arhar Dal Split", "Bajra", "Barley",
    "Barnyard Millet", "Basmati rice", "Broken Rice", "Browntop Millet", "Buck Wheat",
    "Chakhao Or Black Rice", "Chana Dal Split", "Chana whole", "Foxtail Millet", "Horse Gram",
    "Jowar", "Kabuli Chana Whole", "Katarni Rice", "Khesari Dal", "Kodo Millet", "Little Millet",
    "Lobia", "Maize", "Marcha Rice", "Masoor whole", "Moong Dal Split", "Moong whole", "Moth",
    "Oats Raw", "Paddy", "Proso Millet", "Ragi", "Rajma", "Urad Dal Split", "Urad whole",
    "Wheat", "White Peas"
  ],
  "Oilseeds": [
    "Castor seed", "Cotton Seed", "Kusum seed", "Linseed", "Mustard seed", "Neem Seeds",
    "Nigar Seed", "Peanut kernel", "Pongam seeds", "Rapeseed", "Sal Seed", "Sesame seed",
    "Soyabean", "Sunflower seed"
  ],
  "Fruits": [
    "Amla", "Apple", "Apricot", "Avocado", "Baji Banana", "Banana", "Ber", "Bilimbi",
    "Breadfruit", "Cherry Red / Black", "Custard apple", "DRAGON FRUIT", "Garcinia",
    "Grapefruit", "Grapes", "Guava", "Jackfruit", "Jamun", "Kinnow", "Kiwi",
    "Lady Finger Banana", "Lemon", "Litchi", "Mango", "Mangosteen", "Mootty Fruit",
    "Musk melon", "Mysore Banana", "Orange", "Papaya", "Papaya Raw", "Passion Fruit",
    "Peach", "Pear", "Pineapple", "Plum", "Pomegranate", "Rambutan", "Raw Mango",
    "Red Banana", "Sapota", "Sarda", "Shahi Litchi", "Soursop", "Stawberries",
    "Sweet orange", "Watermelon", "Zardalu Mango"
  ],
  "Vegetables": [
    "Aloe Vera", "Arrowroot", "Banana Raw", "Beetroot", "Bhindi/Okra", "Bitter gourd",
    "Bottle gourd", "Brinjal", "Broccoli/Calabrese", "Button Mushroom", "Cabbage",
    "Capsicum", "Carrots", "Cauliflower", "Cluster beans", "Colocasia vegetable",
    "Coriander leaves", "Cucumber", "Curry Leaves", "Drumstick", "Fenugreek Leaves",
    "Garlic", "Gherkin", "Ginger", "Green Amaranthus", "Green chillies", "Ivy gourd",
    "Jimikand (Suran)", "Lesser yam", "Lobia Pods", "Lotus Stem", "Mint Leaves",
    "Mustard leaf", "Onion", "Oyster Mushroom", "Pea", "Pointed gourd", "Potato",
    "Pumpkin", "Raw Turmeric", "Red Amaranthus", "Reddish", "Ribbed celery",
    "Ridge Gourd", "Round chilli", "Safed Petha", "Sem", "Snake Guard",
    "Snow Mountain Garlic", "Spinach", "Sponge Gourd", "Spring Onion",
    "Sugar Snap Peas", "Sweet Corn", "Sweet potato", "Tapioca", "Tinda",
    "Tomato", "Winged bean"
  ],
  "Spices": [
    "Ajwain", "ASAFOETIDA (HING)", "Black Pepper Whole", "Cardamoms Whole",
    "Cloves Whole", "Coriander whole", "Cumin", "Dried Raw Mango Slices",
    "Dry Ginger", "Fennel seed", "Fenugreek seed", "Large cardamom", "Mace Whole",
    "Poppy Seed", "Red chilli", "Tejpata", "Turmeric"
  ]
};

export default function AddCrop() {
  const { t } = useTranslation();
  const router = useRouter();

  const [category, setCategory] = useState<string>("");
  const [crop, setCrop] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const handleCategoryChange = (value: string): void => {
    setCategory(value);
    setCrop("");
  };

  const handleSubmit = async (): Promise<void> => {
    if (!category || !crop || !quantity || !price) {
      if (Platform.OS === 'web') {
        alert(t("alerts.fill_all_fields"));
      } else {
        Alert.alert(t("alerts.error"), t("alerts.fill_all_fields"));
      }
      return;
    }

    try {
      // Create new listing with unique ID
      const newListing: CropListing = {
        id: Date.now().toString(),
        category,
        crop,
        quantity,
        price,
        createdAt: new Date().toISOString(),
      };

      // Get existing listings
      const existingListings = await AsyncStorage.getItem("cropListings");
      const listings: CropListing[] = existingListings
        ? JSON.parse(existingListings)
        : [];

      // Add new listing
      listings.push(newListing);

      // Save to AsyncStorage
      await AsyncStorage.setItem("cropListings", JSON.stringify(listings));

      // Reset form
      setCategory("");
      setCrop("");
      setQuantity("");
      setPrice("");

      // Show success message
      if (Platform.OS === 'web') {
        alert(t("alerts.crop_saved"));
      } else {
        Alert.alert(t("alerts.success"), t("alerts.crop_saved"));
      }

      // Navigate to my-listings page
      router.push("/my-listings");
    } catch (error) {
      console.error("Error saving crop listing:", error);
      if (Platform.OS === 'web') {
        alert(t("alerts.crop_save_failed"));
      } else {
        Alert.alert(t("alerts.error"), t("alerts.crop_save_failed"));
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NavFarmer />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>{t("listing.add_crop_listings")}</Text>

            <View style={styles.form}>
              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Picker
                  selectedValue={category}
                  onValueChange={handleCategoryChange}
                  style={styles.picker}
                >
                  <Picker.Item label={t("listing.select_category")} value="" />
                  {Object.keys(cropData).map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              {/* Crop Picker */}
              <View style={[styles.inputGroup, !category && styles.disabled]}>
                <Picker
                  selectedValue={crop}
                  onValueChange={(value) => setCrop(value)}
                  enabled={!!category}
                  style={styles.picker}
                >
                  <Picker.Item label={t("listing.select_crop")} value="" />
                  {category &&
                    cropData[category].map((c) => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                </Picker>
              </View>

              {/* Quantity Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder={t("listing.quantity")}
                  placeholderTextColor="#94a3b8"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>

              {/* Price Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder={t("listing.price")}
                  placeholderTextColor="#94a3b8"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                ]}
              >
                <Text style={styles.submitButtonText}>{t("listing.save")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf5e6",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: "#fffcf9",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: "#1a4b84",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(26, 75, 132, 0.05)",
  },

  title: {
    color: "#1a4b84",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  form: {
    gap: 16,
  },

  inputGroup: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "white",
    overflow: "hidden",
  },

  disabled: {
    backgroundColor: "#f8fafc",
    opacity: 0.6,
  },

  picker: {
    width: "100%",
    height: 50,
    color: "#1a4b84",
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    fontSize: 16,
    color: "#1a4b84",
    backgroundColor: "white",
  },

  submitButton: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#1a4b84",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1a4b84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  submitButtonPressed: {
    transform: [{ translateY: -2 }],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
  },

  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
