import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import {
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  SubmitErrorHandler
} from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  submitLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
}

function Form<T extends FieldValues>({
  form,
  onSubmit,
  onError,
  submitLabel = 'Enregistrer',
  loading = false,
  children
}: FormProps<T>) {
  const { handleSubmit } = form;

  return (
    <View style={styles.container}>
      {children}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit, onError)}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default Form;
