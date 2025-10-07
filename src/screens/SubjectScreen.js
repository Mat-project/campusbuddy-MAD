import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  List,
  IconButton,
  useTheme,
  Snackbar
} from 'react-native-paper';
import { getSemesterData, addSubject, deleteSubject, updateSubject } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

/**
 * SubjectScreen Component
 * Displays subjects for a selected semester and allows CRUD operations
 */
export default function SubjectScreen({ route, navigation }) {
  const { semester } = route.params;
  const theme = useTheme();
  
  // State management
  const [subjects, setSubjects] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [colorTag, setColorTag] = useState('#6C63FF');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Color palette for subject tags
  const colors = ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'];

  /**
   * Load subjects from storage for the current semester
   */
  const loadSubjects = async () => {
    const data = await getSemesterData(semester);
    const subjectsList = Object.entries(data).map(([name, details]) => ({
      name,
      tasks: details.tasks || [],
      colorTag: details.colorTag || '#6C63FF',
    }));
    setSubjects(subjectsList);
  };

  /**
   * Reload subjects when screen gains focus
   */
  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [semester])
  );

  /**
   * Handle adding a new subject
   */
  const handleAddSubject = async () => {
    if (subjectName.trim()) {
      await addSubject(semester, subjectName.trim(), colorTag);
      setSubjectName('');
      setColorTag('#6C63FF');
      setDialogVisible(false);
      loadSubjects();
    }
  };

  /**
   * Handle editing/updating a subject
   */
  const handleEditSubject = async () => {
    if (subjectName.trim() && editingSubject) {
      try {
        await updateSubject(semester, editingSubject.name, subjectName.trim(), colorTag);
        setSubjectName('');
        setColorTag('#6C63FF');
        setEditingSubject(null);
        setDialogVisible(false);
        loadSubjects();
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarVisible(true);
      }
    }
  };

  /**
   * Handle deleting a subject
   */
  const handleDeleteSubject = async (subjectName) => {
    await deleteSubject(semester, subjectName);
    loadSubjects();
  };

  /**
   * Open dialog to add a new subject
   */
  const openAddDialog = () => {
    setEditingSubject(null);
    setSubjectName('');
    setColorTag('#6C63FF');
    setDialogVisible(true);
  };

  /**
   * Open dialog to edit an existing subject
   */
  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setColorTag(subject.colorTag);
    setDialogVisible(true);
  };

  /**
   * Toggle expansion state of a subject card
   */
  const toggleExpand = (subjectName) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  /**
   * Render a single subject card with collapsible task list
   */
  const renderSubject = ({ item }) => (
    <Card style={[styles.card, { borderLeftColor: item.colorTag, borderLeftWidth: 6 }]}>
      <List.Accordion
        title={item.name}
        expanded={expandedSubjects[item.name]}
        onPress={() => toggleExpand(item.name)}
        right={props => (
          <View style={styles.actions}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={() => openEditDialog(item)}
              iconColor={theme.colors.primary}
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={() => handleDeleteSubject(item.name)}
              iconColor={theme.colors.primary}
            />
          </View>
        )}
      >
        {/* Task preview list */}
        {item.tasks.length > 0 ? (
          item.tasks.map((task, index) => (
            <List.Item
              key={index}
              title={task.title}
              description={`Due: ${task.dueDate}`}
              left={props => (
                <List.Icon 
                  {...props} 
                  icon={task.completed ? 'check-circle' : 'circle-outline'} 
                  color={task.completed ? '#10B981' : '#9CA3AF'}
                />
              )}
              onPress={() => navigation.navigate('Tasks', { 
                semester, 
                subject: item.name,
                colorTag: item.colorTag
              })}
            />
          ))
        ) : (
          <Paragraph style={styles.noTasks}>No tasks yet. Tap to add tasks.</Paragraph>
        )}
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Tasks', { 
            semester, 
            subject: item.name,
            colorTag: item.colorTag
          })}
          style={styles.viewTasksButton}
        >
          View All Tasks
        </Button>
      </List.Accordion>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Paragraph style={styles.emptyText}>No subjects yet. Add one using the + button!</Paragraph>
        }
      />
      
      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={openAddDialog}
      />

      {/* Add/Edit Subject Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingSubject ? 'Edit Subject' : 'Add Subject'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject Name"
              value={subjectName}
              onChangeText={setSubjectName}
              mode="outlined"
              placeholder="e.g., Mathematics, Physics"
              style={styles.input}
            />
            <Title style={styles.colorLabel}>Choose Color:</Title>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <IconButton
                  key={color}
                  icon={colorTag === color ? 'check-circle' : 'circle'}
                  iconColor={color}
                  size={32}
                  onPress={() => setColorTag(color)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={editingSubject ? handleEditSubject : handleAddSubject}>
              {editingSubject ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Error Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noTasks: {
    padding: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#64748B',
  },
  viewTasksButton: {
    marginTop: 8,
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
  colorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
