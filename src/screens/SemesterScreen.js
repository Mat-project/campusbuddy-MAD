import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  IconButton, 
  Paragraph,
  Snackbar,
  useTheme 
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { 
  loadSemesters, 
  addSemester, 
  deleteSemester, 
  updateSemester 
} from '../utils/storage';

/**
 * SemesterScreen Component
 * Displays list of semesters and allows CRUD operations
 */
export default function SemesterScreen({ navigation }) {
  const theme = useTheme();
  
  // State management
  const [semesters, setSemesters] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [semesterName, setSemesterName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  /**
   * Load semesters from storage when screen gains focus
   */
  const loadSemestersData = async () => {
    const data = await loadSemesters();
    setSemesters(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadSemestersData();
    }, [])
  );

  /**
   * Handle adding a new semester
   */
  const handleAddSemester = async () => {
    if (semesterName.trim()) {
      await addSemester(semesterName.trim());
      setSemesterName('');
      setDialogVisible(false);
      loadSemestersData();
    }
  };

  /**
   * Handle editing/renaming a semester
   */
  const handleEditSemester = async () => {
    if (semesterName.trim() && editingSemester) {
      try {
        await updateSemester(editingSemester, semesterName.trim());
        setSemesterName('');
        setEditingSemester(null);
        setDialogVisible(false);
        loadSemestersData();
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarVisible(true);
      }
    }
  };

  /**
   * Handle deleting a semester
   */
  const handleDeleteSemester = async (semesterName) => {
    await deleteSemester(semesterName);
    loadSemestersData();
  };

  /**
   * Open dialog to add a new semester
   */
  const openAddDialog = () => {
    setEditingSemester(null);
    setSemesterName('');
    setDialogVisible(true);
  };

  /**
   * Open dialog to edit an existing semester
   */
  const openEditDialog = (semester) => {
    setEditingSemester(semester);
    setSemesterName(semester);
    setDialogVisible(true);
  };

  /**
   * Render a single semester card
   */
  const renderSemester = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('Subjects', { semester: item })}
    >
      <Card.Content style={styles.cardContent}>
        <Title style={styles.semesterTitle}>{item}</Title>
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
            onPress={() => handleDeleteSemester(item)}
            iconColor={theme.colors.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={semesters}
        renderItem={renderSemester}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Paragraph style={styles.emptyText}>
            No semesters yet. Add one using the + button!
          </Paragraph>
        }
      />
      
      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={openAddDialog}
      />

      {/* Add/Edit Semester Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingSemester ? 'Edit Semester' : 'Add Semester'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Semester Name"
              value={semesterName}
              onChangeText={setSemesterName}
              mode="outlined"
              placeholder="e.g., Fall 2024, Semester 1"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={editingSemester ? handleEditSemester : handleAddSemester}>
              {editingSemester ? 'Update' : 'Add'}
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  semesterTitle: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 8,
  },
});
