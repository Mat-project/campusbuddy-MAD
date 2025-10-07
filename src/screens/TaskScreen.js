import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { 
  Card, 
  Paragraph, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  List,
  IconButton,
  Checkbox,
  useTheme 
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  getSemesterData, 
  addTask, 
  deleteTask, 
  updateTask, 
  toggleTaskCompletion 
} from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function TaskScreen({ route, navigation }) {
  const { semester, subject, colorTag } = route.params;
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTasks = async () => {
    const data = await getSemesterData(semester);
    if (data[subject]) {
      setTasks(data[subject].tasks || []);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      navigation.setOptions({ title: subject });
    }, [semester, subject])
  );

  const handleAddTask = async () => {
    if (taskTitle.trim()) {
      const newTask = {
        title: taskTitle.trim(),
        dueDate: dueDate.toISOString().split('T')[0],
        completed: false,
      };
      await addTask(semester, subject, newTask);
      setTaskTitle('');
      setDueDate(new Date());
      setDialogVisible(false);
      loadTasks();
    }
  };

  const handleEditTask = async () => {
    if (taskTitle.trim() && editingTask !== null) {
      const updatedTask = {
        title: taskTitle.trim(),
        dueDate: dueDate.toISOString().split('T')[0],
        completed: tasks[editingTask].completed,
      };
      await updateTask(semester, subject, editingTask, updatedTask);
      setTaskTitle('');
      setDueDate(new Date());
      setEditingTask(null);
      setDialogVisible(false);
      loadTasks();
    }
  };

  const handleDeleteTask = async (index) => {
    await deleteTask(semester, subject, index);
    loadTasks();
  };

  const handleToggleTask = async (index) => {
    await toggleTaskCompletion(semester, subject, index);
    loadTasks();
  };

  const openAddDialog = () => {
    setEditingTask(null);
    setTaskTitle('');
    setDueDate(new Date());
    setDialogVisible(true);
  };

  const openEditDialog = (task, index) => {
    setEditingTask(index);
    setTaskTitle(task.title);
    setDueDate(new Date(task.dueDate));
    setDialogVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const renderTask = ({ item, index }) => (
    <Card 
      style={[
        styles.card, 
        { borderLeftColor: colorTag, borderLeftWidth: 6 },
        item.completed && styles.completedCard
      ]}
    >
      <Card.Content>
        <View style={styles.taskContent}>
          <Checkbox
            status={item.completed ? 'checked' : 'unchecked'}
            onPress={() => handleToggleTask(index)}
            color={colorTag}
          />
          <View style={styles.taskInfo}>
            <Paragraph 
              style={[
                styles.taskTitle,
                item.completed && styles.completedText
              ]}
            >
              {item.title}
            </Paragraph>
            <Paragraph style={styles.taskDate}>Due: {item.dueDate}</Paragraph>
          </View>
          <View style={styles.actions}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={() => openEditDialog(item, index)}
              disabled={item.completed}
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={() => handleDeleteTask(index)} 
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Paragraph style={styles.emptyText}>No tasks yet. Add one using the + button!</Paragraph>
        }
      />
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colorTag }]}
        onPress={openAddDialog}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingTask !== null ? 'Edit Task' : 'Add Task'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Task Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              mode="outlined"
              style={styles.input}
            />
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              Due Date: {dueDate.toISOString().split('T')[0]}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={editingTask !== null ? handleEditTask : handleAddTask}>
              {editingTask !== null ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  taskDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginTop: 8,
  },
});
