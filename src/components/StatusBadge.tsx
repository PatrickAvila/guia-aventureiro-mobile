// mobile/src/components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';

interface StatusBadgeProps {
    status: 'rascunho' | 'planejando' | 'confirmado' | 'em_andamento' | 'concluido';
    size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
    const colors = useColors();
    
    const config = {
        rascunho: { label: 'Rascunho', color: colors.textSecondary, icon: '📝' },
        planejando: { label: 'Planejando', color: colors.info || colors.primary, icon: '🗓️' },
        confirmado: { label: 'Confirmado', color: colors.success || '#10B981', icon: '✅' },
        em_andamento: { label: 'Em andamento', color: colors.accent || colors.primary, icon: '✈️' },
        concluido: { label: 'Concluído', color: colors.textSecondary, icon: '🎉' },
    };

    const { label, color, icon } = config[status];
    const sizeStyle = size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

    return (
        <View style={[styles.badge, { backgroundColor: color }, sizeStyle]}>
            <Text style={[styles.icon, sizeStyle]}>{icon}</Text>
            <Text style={[styles.text, sizeStyle, { color: '#FFFFFF' }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    icon: {
        fontSize: 14,
    },
    text: {
        // color aplicado dinamicamente
        fontSize: 12,
        fontWeight: '600',
    },
    small: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    medium: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    large: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
});