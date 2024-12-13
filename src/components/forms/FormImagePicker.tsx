import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button, HelperText, useTheme } from 'react-native-paper';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';

interface FormImagePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: object;
  disabled?: boolean;
  multiple?: boolean;
}

function FormImagePicker<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  disabled,
  multiple = false
}: FormImagePickerProps<T>) {
  const theme = useTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin des permissions pour accéder à vos photos!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: multiple,
    });

    if (!result.canceled) {
      return multiple ? result.assets : result.assets[0];
    }

    return null;
  };

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
          {value && (
            <View style={styles.previewContainer}>
              {multiple ? (
                value.map((image: any, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: image.uri }}
                    style={styles.preview}
                  />
                ))
              ) : (
                <Image
                  source={{ uri: value.uri }}
                  style={styles.preview}
                />
              )}
            </View>
          )}
          
          <Button
            mode="outlined"
            onPress={async () => {
              const result = await pickImage();
              if (result) {
                onChange(result);
              }
            }}
            disabled={disabled}
            icon="camera"
            style={styles.button}
          >
            {label}
          </Button>

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
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  preview: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default FormImagePicker;
