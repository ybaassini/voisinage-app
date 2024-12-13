import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, List, Menu, TextInput, useTheme } from 'react-native-paper';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: Option[];
  rules?: object;
  disabled?: boolean;
}

function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  rules,
  disabled
}: FormSelectProps<T>) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, value },
        fieldState: { error }
      }) => (
        <View style={styles.container}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TextInput
                label={label}
                value={options.find(option => option.value === value)?.label || ''}
                mode="outlined"
                right={<TextInput.Icon icon="menu-down" />}
                onTouchStart={openMenu}
                disabled={disabled}
                error={!!error}
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.background }
                ]}
              />
            }
          >
            {options.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  closeMenu();
                }}
                title={option.label}
              />
            ))}
          </Menu>
          {error && (
            <HelperText type="error" visible={!!error}>
              {error.message}
            </HelperText>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
  },
});

export default FormSelect;
