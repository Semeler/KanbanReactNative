// Localização: /App.js

import 'react-native-gesture-handler'; // IMPORTANTE: Deve ser a primeira linha
import React from 'react';
import { StyleSheet, Text, SafeAreaView, StatusBar } from 'react-native';
import KanbanBoard from './components/KanbanBoard.android'; // Importa o componente KanbanBoard

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Meu Quadro Kanban</Text>
      <KanbanBoard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
});