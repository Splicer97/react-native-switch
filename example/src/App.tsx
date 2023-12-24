import React, { useState } from 'react';

import { Button, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Switch from '@splicer97/react-native-switch';

export default function App() {
  const [value, onValueChange] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
        <Button title="switch disable" onPress={() => setDisabled(!disabled)} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
