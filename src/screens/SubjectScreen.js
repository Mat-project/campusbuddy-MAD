import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme 
} from 'react-native-paper';
import { getSemesterData, addSubject, deleteSubject, updateSubject } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function SubjectScreen({ route, navigation }) {
  const { semester } = route.params;
  const theme = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [colorTag, setColorTag] = useState('#6200ee');
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const colors = ['#6200ee', '#03dac6', '#f44336', '#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#e91e63'];

  const loadSubjects = async () => {
    const data = await getSemesterData(semester);
    const subjectsList = Object.entries(data).map(([name, details]) => ({
      name,
      tasks: details.tasks || [],
      colorTag: details.colorTag || '#6200ee',
    }));
    setSubjects(subjectsList);
  };

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [semester])
  );

  const handleAddSubject = async () => {
    if (subjectName.trim()) {
      await addSubject(semester, subjectName.trim(), colorTag);
      setSubjectName('');
      setColorTag('#6200ee');
      setDialogVisible(false);
      loadSubjects();
    }
  };

  const handleEditSubject = async () => {
    if (subjectName.trim() && editingSubject) {
      await updateSubject(semester, editingSubject.name, subjectName.trim(), colorTag);
      setSubjectName('');
      setColorTag('#6200ee');
      setEditingSubject(null);
      setDialogVisible(false);
      loadSubjects();
    }
  };

  const handleDeleteSubject = async (subjectName) => {
    await deleteSubject(semester, subjectName);
    loadSubjects();
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    setSubjectName('');
    setColorTag('#6200ee');
    setDialogVisible(true);
  };

  const openEditDialog = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setColorTag(subject.colorTag);
    setDialogVisible(true);
  };

  const toggleExpand = (subjectName) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  const renderSubject = ({ item }) => (
    <Card style={[styles.card, { borderLeftColor: item.colorTag, borderLeftWidth: 6 }]}>
      <List.Accordion
        title={item.name}
        expanded={expandedSubjects[item.name]}
        onPress={() => toggleExpand(item.name)}
        right={props => (
          <View style={styles.actions}>
            <IconButton icon="pencil" size={20} onPress={() => openEditDialog(item)} />
            <IconButton icon="delete" size={20} onPress={() => handleDeleteSubject(item.name)} />
          </View>
        )}
      >
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
                  color={task.completed ? '#4caf50' : '#9e9e9e'}
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
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddDialog}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingSubject ? 'Edit Subject' : 'Add Subject'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Subject Name"
              value={subjectName}
              onChangeText={setSubjectName}
              mode="outlined"
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
  },
  viewTasksButton: {
    marginTop: 8,
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
