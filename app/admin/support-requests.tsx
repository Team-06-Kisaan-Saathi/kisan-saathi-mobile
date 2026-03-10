import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native";
import { COLORS, Header, Card, AdminSidebar } from "../../components/admin/AdminComponents";
import { adminService } from "../../services/adminService";
import * as Lucide from "lucide-react-native";

export default function SupportRequestsScreen() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await adminService.getSupportRequests();
            if (res.success) setRequests(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await adminService.updateSupportRequestStatus(id, status);
            if (res.success) {
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
            }
        } catch (_) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View>
                    <Text style={styles.userName}>{item.userId?.name || "Unknown User"}</Text>
                    <Text style={styles.userRole}>{item.userId?.role?.toUpperCase() || "N/A"}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'resolved' ? '#DCFCE7' : '#FEF9C3' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'resolved' ? '#166534' : '#854D0E' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                <Lucide.Phone size={16} color={COLORS.textLight} />
                <Text style={styles.infoValue}>{item.phone}</Text>
            </View>

            <View style={styles.infoRow}>
                <Lucide.AlertCircle size={16} color={COLORS.textLight} />
                <Text style={styles.infoValue}>{item.issueType}</Text>
            </View>

            <View style={styles.infoRow}>
                <Lucide.Clock size={16} color={COLORS.textLight} />
                <Text style={styles.infoValue}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.phone)}>
                    <Lucide.PhoneCall size={18} color="#FFF" />
                    <Text style={styles.callText}>Call Now</Text>
                </TouchableOpacity>

                {item.status !== 'resolved' && (
                    <TouchableOpacity style={styles.resolveBtn} onPress={() => handleUpdateStatus(item._id, 'resolved')}>
                        <Lucide.CheckCircle size={18} color={COLORS.primary} />
                        <Text style={styles.resolveText}>Mark Resolved</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );

    return (
        <View style={styles.root}>
            <Header title="Support Requests" subtitle="Manage callback requests" onMenu={() => setMenuVisible(true)} />
            <AdminSidebar visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    onRefresh={() => { setRefreshing(true); loadRequests(); }}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Lucide.MessageSquare size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>No support requests found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    requestCard: { marginBottom: 16, padding: 16 },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    userRole: { fontSize: 11, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    infoValue: { fontSize: 14, color: COLORS.textLight },
    actions: { flexDirection: 'row', marginTop: 12, gap: 12 },
    callBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
    callText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    resolveBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
    resolveText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textLight, fontWeight: '600' }
});
