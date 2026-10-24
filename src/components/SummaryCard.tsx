import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
}

export function SummaryCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#f1eef7', borderRadius: 12, padding: 14 },
  label: { color: '#555', fontSize: 13 },
  value: { fontSize: 22, fontWeight: '600', marginTop: 4 },
});