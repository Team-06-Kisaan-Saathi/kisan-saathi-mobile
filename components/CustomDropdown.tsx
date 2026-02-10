import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DropdownProps = {
    selectedValue: string;
    onValueChange: (value: string) => void;
    items: Array<{ label: string; value: string }>;
    placeholder?: string;
    enabled?: boolean;
    style?: any;
};

export default function CustomDropdown({
    selectedValue,
    onValueChange,
    items,
    placeholder = "Select an option",
    enabled = true,
    style,
}: DropdownProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedItem = items.find((item) => item.value === selectedValue);
    const displayText = selectedItem ? selectedItem.label : placeholder;

    const handleSelect = (value: string) => {
        onValueChange(value);
        setModalVisible(false);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                onPress={() => enabled && setModalVisible(true)}
                style={[
                    styles.selector,
                    !enabled && styles.disabled,
                ]}
                disabled={!enabled}
            >
                <Text
                    style={[
                        styles.selectedText,
                        !selectedValue && styles.placeholderText,
                    ]}
                >
                    {displayText}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={24}
                    color={enabled ? "#64748b" : "#cbd5e1"}
                />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.value === selectedValue && styles.selectedOption,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === selectedValue && styles.selectedOptionText,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === selectedValue && (
                                        <Ionicons name="checkmark" size={20} color="#1a4b84" />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={styles.optionsList}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },

    selector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        backgroundColor: "white",
        minHeight: 50,
    },

    disabled: {
        backgroundColor: "#f8fafc",
        opacity: 0.6,
    },

    selectedText: {
        fontSize: 16,
        color: "#1a4b84",
        flex: 1,
    },

    placeholderText: {
        color: "#94a3b8",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        width: "100%",
        maxHeight: "70%",
        overflow: "hidden",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a4b84",
    },

    optionsList: {
        maxHeight: 400,
    },

    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },

    selectedOption: {
        backgroundColor: "#f0f9ff",
    },

    optionText: {
        fontSize: 16,
        color: "#334155",
        flex: 1,
    },

    selectedOptionText: {
        color: "#1a4b84",
        fontWeight: "600",
    },
});
