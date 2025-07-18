
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Alert, Dimensions } from 'react-native'; // Adicionado Dimensions
import { DraxProvider, DraxView } from 'react-native-drax';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const initialTasks = {
  todo: [{ id: '1', text: 'Testar a rolagem horizontal' }, { id: '2', text: 'Testar o long press para arrastar' }],
  inProgress: [{ id: '3', text: 'Finalizar os ajustes de UX' }],
  done: [{ id: '4', text: 'Beber um café ☕' }],
};
const columnMapping = { todo: 'A Fazer', inProgress: 'Em Andamento', done: 'Concluído' };

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = {};
    for (const columnId in tasks) {
      filtered[columnId] = tasks[columnId].filter(task =>
        task.text.toLowerCase().includes(lowercasedQuery)
      );
    }
    return filtered;
  }, [tasks, searchQuery]);

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    const newTask = { id: Date.now().toString(), text: newTaskText };
    setTasks(currentTasks => ({ ...currentTasks, todo: [newTask, ...currentTasks.todo] }));
    setNewTaskText('');
  };
  const handleDeleteTask = (columnId, taskId) => {
    Alert.alert("Excluir Tarefa", "Tens a certeza?",
      [{ text: "Cancelar" }, { text: "Excluir", onPress: () => {
        setTasks(currentTasks => ({...currentTasks, [columnId]: currentTasks[columnId].filter(task => task.id !== taskId)}));
      }}]
    );
  };
  const handleOpenEditModal = (task, columnId) => {
    setEditingTask({ ...task, columnId }); setEditedText(task.text); setIsModalVisible(true);
  };
  const handleSaveEdit = () => {
    if (!editingTask || editedText.trim() === '') return;
    const { id, columnId } = editingTask;
    const updatedColumnTasks = tasks[columnId].map(task => task.id === id ? { ...task, text: editedText } : task);
    setTasks(currentTasks => ({ ...currentTasks, [columnId]: updatedColumnTasks }));
    setIsModalVisible(false); setEditingTask(null);
  };

  return (
    <DraxProvider>
      <View style={styles.container}>
        {}
        <View style={styles.inputContainer}>
          <TextInput style={styles.textInput} placeholder="Adicionar uma nova tarefa..." value={newTaskText} onChangeText={setNewTaskText} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}><Text style={styles.addButtonText}>Adicionar</Text></TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Pesquisar tarefas..." value={searchQuery} onChangeText={setSearchQuery}/>
        </View>

        {}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kanbanContainer}
          contentContainerStyle={{ paddingHorizontal: 5 }}
        >
          {Object.keys(columnMapping).map((columnId) => (
            <DraxView
              key={columnId}
              style={styles.column} 
              id={columnId}
              onReceiveDragDrop={({ dragged: { payload } }) => {
                const { task, fromColumn } = payload;
                if (fromColumn === columnId) return;
                const sourceTasks = tasks[fromColumn].filter(t => t.id !== task.id);
                const destinationTasks = [task, ...tasks[columnId]];
                setTasks(currentTasks => ({...currentTasks, [fromColumn]: sourceTasks, [columnId]: destinationTasks}));
              }}
            >
              <Text style={styles.columnTitle}>{columnMapping[columnId]}</Text>
              {}
              <ScrollView>
                {filteredTasks[columnId]?.map((task) => (
                  <DraxView
                    key={task.id}
                    style={styles.taskCard}
                    draggingStyle={styles.dragging}
                    dragReleasedStyle={styles.dragging}
                    payload={{ task, fromColumn: columnId }}
                    longPressDelay={150} 
                  >
                    <Text style={styles.taskText}>{task.text}</Text>
                    <View style={styles.taskActions}>
                      <TouchableOpacity onPress={() => handleOpenEditModal(task, columnId)}><Text style={styles.actionText}>Editar</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteTask(columnId, task.id)}><Text style={[styles.actionText, { color: '#FF3B30' }]}>Excluir</Text></TouchableOpacity>
                    </View>
                  </DraxView>
                ))}
              </ScrollView>
            </DraxView>
          ))}
        </ScrollView>

        {}
        <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
            <View style={styles.modalContainer}><View style={styles.modalView}>
                <Text style={styles.modalTitle}>Editar Tarefa</Text>
                <TextInput style={styles.modalInput} value={editedText} onChangeText={setEditedText} autoFocus={true} />
                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveEdit}><Text style={styles.modalButtonText}>Salvar</Text></TouchableOpacity>
                </View>
            </View></View>
        </Modal>
      </View>
    </DraxProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', marginRight: 10 },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 10, marginTop: 15, marginBottom: 5 },
  searchInput: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#fff' },
  kanbanContainer: { flex: 1, flexDirection: 'row', marginTop: 10 },
  

  column: {
    width: SCREEN_WIDTH * 0.85, 
    backgroundColor: '#e3e3e3',
    marginHorizontal: 5,
    borderRadius: 8,
    padding: 10,
    height: '98%', // Para garantir que a coluna tenha uma altura definida dentro da ScrollView
  },

  columnTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#444' },
  taskCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  taskText: { fontSize: 16, color: '#333', marginBottom: 10 },
  dragging: { opacity: 0.5, transform: [{ scale: 1.05 }] },
  taskActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  actionText: { fontSize: 14, color: '#007AFF', marginLeft: 15, fontWeight: '500' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { borderRadius: 8, padding: 10, elevation: 2, flex: 1, marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#6c757d' },
  saveButton: { backgroundColor: '#007AFF' },
  modalButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});