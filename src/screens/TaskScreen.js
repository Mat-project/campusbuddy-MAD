import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { 
  Card, 
  Paragraph, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
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

/**
 * TaskScreen Component
 * Displays and manages tasks for a specific subject within a semester
 */
export default function TaskScreen({ route, navigation }) {
  const { semester, subject, colorTag } = route.params;
  const theme = useTheme();
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  /**
   * Load tasks from storage for the current subject
   */
  const loadTasks = async () => {
    const data = await getSemesterData(semester);
    if (data[subject]) {
      setTasks(data[subject].tasks || []);
    }
  };

  /**
   * Reload tasks when screen gains focus and set navigation title
   */
  useFocusEffect(
    useCallback(() => {
      loadTasks();
      navigation.setOptions({ title: subject });
    }, [semester, subject])
  );

  /**
   * Handle adding a new task
   */
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

  /**
   * Handle editing/updating an existing task
   */
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

  /**
   * Handle deleting a task
   */
  const handleDeleteTask = async (index) => {
    await deleteTask(semester, subject, index);
    loadTasks();
  };

  /**
   * Handle toggling task completion status
   */
  const handleToggleTask = async (index) => {
    await toggleTaskCompletion(semester, subject, index);
    loadTasks();
  };

  /**
   * Open dialog to add a new task
   */
  const openAddDialog = () => {
    setEditingTask(null);
    setTaskTitle('');
    setDueDate(new Date());
    setDialogVisible(true);
  };

  /**
   * Open dialog to edit an existing task
   */
  const openEditDialog = (task, index) => {
    setEditingTask(index);
    setTaskTitle(task.title);
    setDueDate(new Date(task.dueDate));
    setDialogVisible(true);
  };

  /**
   * Handle date picker changes
   */
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  /**
   * Render a single task card
   */
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
          {/* Completion checkbox */}
          <Checkbox
            status={item.completed ? 'checked' : 'unchecked'}
            onPress={() => handleToggleTask(index)}
            color={colorTag}
          />
          
          {/* Task details */}
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
          
          {/* Edit/Delete actions */}
          <View style={styles.actions}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={() => openEditDialog(item, index)}
              disabled={item.completed}
              iconColor={theme.colors.primary}
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={() => handleDeleteTask(index)}
              iconColor={theme.colors.primary}
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
      
      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colorTag }]}
        onPress={openAddDialog}
      />

      {/* Add/Edit Task Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingTask !== null ? 'Edit Task' : 'Add Task'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Task Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              mode="outlined"
              placeholder="e.g., Complete Assignment 1"
              style={styles.input}
            />
            <Button 
              mode="outlined" 
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              Due Date: {dueDate.toISOString().split('T')[0]}
            </Button>
            {/* Date picker component */}
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
    color: '#1E293B',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
    color: '#64748B',
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
