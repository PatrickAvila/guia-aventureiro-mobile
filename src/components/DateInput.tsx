import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColors } from '../hooks/useColors';
import { format, parse, isValid } from 'date-fns';

interface DateInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder = 'DD/MM/AAAA',
}) => {
  const colors = useColors();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const inputRef = useRef<TextInput>(null);

  const parseDateFromString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const getPickerDate = (): Date => {
    const parsed = parseDateFromString(value);
    return parsed || new Date();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      if (event.type === 'set' && selectedDate) {
        const formatted = format(selectedDate, 'dd/MM/yyyy');
        onChangeText(formatted);
      }
    } else {
      // iOS - armazena temporariamente
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirmIOS = () => {
    if (tempDate) {
      const formatted = format(tempDate, 'dd/MM/yyyy');
      onChangeText(formatted);
    }
    setShowPicker(false);
    setTempDate(null);
  };

  const handleCancelIOS = () => {
    setShowPicker(false);
    setTempDate(null);
  };

  const handleTextChange = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    
    formatted = formatted.slice(0, 10);
    onChangeText(formatted);
  };

  const openPicker = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    
    // Inicializa tempDate com a data atual ou valor do campo
    const initialDate = parseDateFromString(value) || new Date();
    setTempDate(initialDate);
    
    setTimeout(() => {
      setShowPicker(true);
    }, 150);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: error ? (colors.error || '#DC2626') : colors.border,
              color: colors.text,
            },
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={10}
        />
        
        <TouchableOpacity
          style={[styles.calendarButton, { backgroundColor: colors.primary }]}
          onPress={openPicker}
        >
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error || '#DC2626' }]}>
          {error}
        </Text>
      ) : null}

      {showPicker && (
        <>
          <DateTimePicker
            value={tempDate || getPickerDate()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            locale="pt-BR"
            minimumDate={new Date()}
          />

          {Platform.OS === 'ios' && (
            <View style={styles.iosButtonContainer}>
              <TouchableOpacity
                style={[styles.iosButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelIOS}
              >
                <Text style={[styles.iosButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.iosButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirmIOS}
              >
                <Text style={[styles.iosButtonText, { color: '#FFFFFF' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  iosButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  iosButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    // backgroundColor vem do colors.primary
  },
  iosButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
