import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, List, Text, useTheme } from 'react-native-paper';
import debounce from 'lodash/debounce';
import getEnvVars from '../../config/env';
import { theme } from '../../theme/theme';

interface AddressAutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (address: string) => void;
  error?: boolean;
  helperText?: string;
}

interface Prediction {
  description: string;
  place_id: string;
}

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  value,
  onChangeText,
  onSelect,
  error,
  helperText
}) => {
  const theme = useTheme();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);

  const fetchPredictions = async (input: string) => {
    try {
      if (!input.trim()) {
        setPredictions([]);
        return;
      }

      const apiKey = 'AIzaSyAPfhW_pu0x_5XcOPb1FkvswBLkSfKjRWQ';
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&components=country:fr&key=${apiKey}&language=fr&types=address`
      );

      const data = await response.json();
      if (data.status === 'OK') {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        console.error(' Erreur lors de la récupération des prédictions:', data.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error(' Erreur lors de la récupération des prédictions:', error);
      setPredictions([]);
    }
  };

  const debouncedFetchPredictions = debounce(fetchPredictions, 300);

  useEffect(() => {
    return () => {
      debouncedFetchPredictions.cancel();
    };
  }, []);

  const handleInputChange = (text: string) => {
    onChangeText(text);
    setIsAddressSelected(false);
    if (text.length > 2) {
      debouncedFetchPredictions(text);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleSelectAddress = (prediction: Prediction) => {
    onSelect(prediction.description);
    onChangeText(prediction.description);
    setIsAddressSelected(true);
    setPredictions([]);
    setShowPredictions(false);
  };

  const shouldShowError = error && !isAddressSelected;

  return (
    <View style={styles.container}>
      <TextInput
        label="Adresse"
        value={value}
        onChangeText={handleInputChange}
        onFocus={() => value.length > 2 && setShowPredictions(true)}
        error={shouldShowError}
        style={styles.input}
        mode="outlined"
        right={
          isAddressSelected ? (
            <TextInput.Icon 
              icon="check-circle" 
              color={theme.colors.primary}
            />
          ) : undefined
        }
      />
      {shouldShowError && helperText && (
        <Text style={[styles.helperText, styles.errorText]}>
          {helperText}
        </Text>
      )}
      {!shouldShowError && isAddressSelected && (
        <Text style={[styles.helperText, { color: theme.colors.primary }]}>
          Adresse validée
        </Text>
      )}
      {showPredictions && predictions.length > 0 && (
        <View style={[styles.predictionsContainer, { backgroundColor: theme.colors.surface }]}>
          {predictions.map((prediction) => (
            <List.Item
              key={prediction.place_id}
              title={prediction.description}
              onPress={() => handleSelectAddress(prediction)}
              style={styles.predictionItem}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
    backgroundColor: theme.colors.surfaceVariant,
  },
  predictionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderRadius: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  predictionItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  errorText: {
    color: '#B00020',
  },
});

export default AddressAutocompleteInput;
