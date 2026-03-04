import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { COLORS, Header, Badge, Card, AdminSidebar } from "../../components/admin/AdminComponents";
import * as Lucide from "lucide-react-native";
import { adminService } from "../../services/adminService";

export default function FarmerManagement() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [farmers, setFarmers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        loadFarmers();
    }, []);

    const loadFarmers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getUsers("farmer");
            if (res.success) {
                setFarmers(res.users || []);
            }
        } catch (e) {
            console.error("Load Farmers Error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filtered = farmers.filter(f =>
        (f.name?.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase())) &&
        (filter === "All" || (f.status || "approved").toLowerCase() === filter.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.farmerCard}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0) || "U"}</Text>
                    {item.verificationStatus === 'approved' && (
                        <View style={styles.verifiedBadge}>
                            <Lucide.Check size={10} color="#fff" strokeWidth={4} />
                        </View>
                    )}
                </View>
                <View style={styles.headerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.farmerName}>{item.name}</Text>
                    </View>
                    <View style={styles.locRow}>
                        <Lucide.MapPin size={12} color={COLORS.textLight} />
                        <Text style={styles.location}>{item.location || "Location not set"}</Text>
                    </View>
                </View>
                <View style={styles.ratingBox}>
                    <Lucide.ShieldCheck size={14} color="#B45309" />
                    <Text style={styles.ratingText}>{item.trustScore}/10</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.footer}>
                <View>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{item.phone}</Text>
                </View>
                <View>
                    <Text style={styles.label}>Transactions</Text>
                    <Text style={styles.value}>{item.totalTransactions || 0}</Text>
                </View>
                <View>
                    <Text style={styles.label}>Status</Text>
                    <Badge text={item.verificationStatus || "none"} type={item.verificationStatus === 'approved' ? 'success' : item.verificationStatus === 'pending' ? 'warning' : 'danger'} />
                </View>
            </View>

            <View style={styles.actionRow}>
                {item.verificationStatus === 'pending' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.btnText}>Review</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}>
                    <Text style={styles.btnText}>Suspend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.info }]}>
                    <Text style={styles.btnText}>Details</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <View style={styles.root}>
            <Header title="Farmers" subtitle="Manage Provider Network" onMenu={() => setMenuVisible(true)} />
            <AdminSidebar visible={menuVisible} onClose={() => setMenuVisible(false)} />

            <View style={styles.content}>
                <View style={styles.searchBox}>
                    <Lucide.Search size={20} color={COLORS.textLight} />
                    <TextInput
                        placeholder="Search by name or location..."
                        style={styles.input}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <View style={styles.filterRow}>
                            {["All", "Approved", "Pending", "Suspended"].map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                                    onPress={() => setFilter(f)}
                                >
                                    <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <FlatList
                            data={filtered}
                            keyExtractor={item => item._id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFarmers(); }} />
                            }
                        />
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, paddingHorizontal: 20 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.text },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
    filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },
    filterTextActive: { color: '#fff' },
    list: { paddingBottom: 40 },
    farmerCard: { marginBottom: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarLarge: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerInfo: { flex: 1, marginLeft: 16 },
    farmerName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    location: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
    ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
    value: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
    actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
