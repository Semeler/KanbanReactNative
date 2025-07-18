
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, Modal, Alert, SafeAreaView, ScrollView } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const initialData = {
  todo: [ { key: '1', label: 'Implementar movimentação com botões' }, ],
  inProgress: [ { key: '2', label: 'Simplificar o código do app' }, ],
  done: [ { key: '3', label: 'Finalizar o app com sucesso! 🎉' }, ],
};

const columnMapping = { todo: 'A Fazer', inProgress: 'Em Andamento', done: 'Concluído' };
const COLUMNS = Object.keys(initialData);

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = {};
    for (const columnId in data) {
      filtered[columnId] = data[columnId].filter(task => task.label.toLowerCase().includes(lowercasedQuery));
    }
    return filtered;
  }, [data, searchQuery]);
  
  const handleAddTask = () => { if (newTaskText.trim() === '') return; const newTask = { key: `task-${Date.now()}`, label: newTaskText }; setData(d => ({ ...d, todo: [newTask, ...d.todo] })); setNewTaskText(''); };
  const handleOpenEditModal = (task, columnId) => { setEditingTask({ ...task, columnId }); setEditedText(task.label); setIsModalVisible(true); };
  const handleSaveEdit = () => { if (!editingTask) return; const { key, columnId } = editingTask; setData(d => { const newCol = d[columnId].map(t => t.key === key ? { ...t, label: editedText } : t); return { ...d, [columnId]: newCol }; }); setIsModalVisible(false); setEditingTask(null); };
  const handleDeleteTask = (taskToDelete, columnId) => { Alert.alert("Excluir Tarefa", `Tens a certeza?`, [{ text: "Cancelar" }, { text: "Excluir", style: "destructive", onPress: () => { setData(d => ({ ...d, [columnId]: d[columnId].filter(t => t.key !== taskToDelete.key) })); }}]); };
  
  const handleMoveTask = (taskToMove, currentColumnId, direction) => {
    const currentColumnIndex = COLUMNS.indexOf(currentColumnId);
    
    let targetColumnIndex;
    if (direction === 'next') {
      targetColumnIndex = currentColumnIndex + 1;
    } else {
      targetColumnIndex = currentColumnIndex - 1;
    }

    if (targetColumnIndex < 0 || targetColumnIndex >= COLUMNS.length) {
      return; 
    }

    const targetColumnId = COLUMNS[targetColumnIndex];

    setData(currentData => {
      const sourceColumn = currentData[currentColumnId].filter(task => task.key !== taskToMove.key);
      
      const destinationColumn = [taskToMove, ...currentData[targetColumnId]];

      return {
        ...currentData,
        [currentColumnId]: sourceColumn,
        [targetColumnId]: destinationColumn,
      };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.inputContainer}><TextInput style={styles.textInput} placeholder="Adicionar tarefa..." value={newTaskText} onChangeText={setNewTaskText} onSubmitEditing={handleAddTask} /><TouchableOpacity style={styles.addButton} onPress={handleAddTask}><Text style={styles.addButtonText}>Adicionar</Text></TouchableOpacity></View>
      <View style={styles.searchContainer}><TextInput style={styles.searchInput} placeholder="Pesquisar tarefas..." value={searchQuery} onChangeText={setSearchQuery} /></View>
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}><View style={styles.modalContainer}><View style={styles.modalView}><Text style={styles.modalTitle}>Editar Tarefa</Text><TextInput style={styles.modalInput} value={editedText} onChangeText={setEditedText} autoFocus={true} /><View style={styles.modalActions}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveEdit}><Text style={styles.modalButtonText}>Salvar</Text></TouchableOpacity></View></View></View></Modal>

      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.kanbanContainer}>
          {COLUMNS.map((columnId) => {
            const columnIndex = COLUMNS.indexOf(columnId);
            return (
              <View key={columnId} style={styles.column}>
                <Text style={styles.columnTitle}>{columnMapping[columnId]}</Text>
                <ScrollView>
                  {filteredData[columnId]?.map((task) => (
                    <View key={task.key} style={styles.taskCard}>
                      <Text style={styles.taskText}>{task.label}</Text>
                      {}
                      <View style={styles.taskActions}>
                        <TouchableOpacity onPress={() => handleOpenEditModal(task, columnId)}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteTask(task, columnId)}><Text style={[styles.actionText, { color: '#FF3B30' }]}>Excluir</Text></TouchableOpacity>
                      </View>
                      {}
                      <View style={styles.moveActions}>
                        {}
                        {columnIndex > 0 ? (
                          <TouchableOpacity style={styles.moveButton} onPress={() => handleMoveTask(task, columnId, 'prev')}>
                            <Text style={styles.moveButtonText}>{"<"}</Text>
                          </TouchableOpacity>
                        ) : <View style={styles.moveButtonPlaceholder} /> }
                        
                        {}
                        {columnIndex < COLUMNS.length - 1 ? (
                          <TouchableOpacity style={styles.moveButton} onPress={() => handleMoveTask(task, columnId, 'next')}>
                            <Text style={styles.moveButtonText}>{">"}</Text>
                          </TouchableOpacity>
                        ) : <View style={styles.moveButtonPlaceholder} /> }
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  kanbanContainer: { flexDirection: 'row', paddingHorizontal: 5, paddingBottom: 10 },
  column: { width: SCREEN_WIDTH * 0.85, marginHorizontal: 5, backgroundColor: '#ffffff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 5 },
  columnTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginHorizontal: 5 },
  taskText: { fontSize: 16, color: '#333' },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, marginBottom: 10 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', marginRight: 10 },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 10, marginBottom: 10 },
  searchInput: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#fff' },
  taskActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  actionText: { fontSize: 14, color: '#007AFF', marginLeft: 15, fontWeight: '500' },
  moveActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  moveButton: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5 },
  moveButtonText: { fontWeight: 'bold', color: '#555' },
  moveButtonPlaceholder: { width: 60 }, 
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row' },
  modalButton: { borderRadius: 8, padding: 12, elevation: 2, flex: 1, marginHorizontal: 10 },
  cancelButton: { backgroundColor: '#6c757d' },
  saveButton: { backgroundColor: '#007AFF' },
  modalButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});