import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for the app
const STORAGE_KEY = '@semester_task_manager';
const SEMESTERS_KEY = '@semesters_list';

/**
 * Load all semester data from AsyncStorage
 * @returns {Object} All semester data
 */
export const loadData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error loading data:', e);
    return {};
  }
};

/**
 * Load the list of semesters from AsyncStorage
 * @returns {Array} Array of semester names
 */
export const loadSemesters = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SEMESTERS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading semesters:', e);
    return [];
  }
};

/**
 * Save the list of semesters to AsyncStorage
 * @param {Array} semesters - Array of semester names
 */
export const saveSemesters = async (semesters) => {
  try {
    const jsonValue = JSON.stringify(semesters);
    await AsyncStorage.setItem(SEMESTERS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving semesters:', e);
  }
};

/**
 * Save all semester data to AsyncStorage
 * @param {Object} data - All semester data
 */
export const saveData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

/**
 * Add a new semester
 * @param {string} semesterName - Name of the semester to add
 */
export const addSemester = async (semesterName) => {
  const semesters = await loadSemesters();
  if (!semesters.includes(semesterName)) {
    semesters.push(semesterName);
    await saveSemesters(semesters);
  }
};

/**
 * Delete a semester and all its data
 * @param {string} semesterName - Name of the semester to delete
 */
export const deleteSemester = async (semesterName) => {
  // Remove from semesters list
  const semesters = await loadSemesters();
  const updatedSemesters = semesters.filter(s => s !== semesterName);
  await saveSemesters(updatedSemesters);
  
  // Remove all data for this semester
  const data = await loadData();
  delete data[semesterName];
  await saveData(data);
};

/**
 * Update/rename a semester
 * @param {string} oldName - Current name of the semester
 * @param {string} newName - New name for the semester
 */
export const updateSemester = async (oldName, newName) => {
  if (oldName === newName) return;
  
  // Check if new name already exists
  const semesters = await loadSemesters();
  if (semesters.includes(newName)) {
    throw new Error('A semester with this name already exists');
  }
  
  // Update semester name in list
  const updatedSemesters = semesters.map(s => s === oldName ? newName : s);
  await saveSemesters(updatedSemesters);
  
  // Move data to new semester name
  const data = await loadData();
  if (data[oldName]) {
    data[newName] = data[oldName];
    delete data[oldName];
    await saveData(data);
  }
};

/**
 * Get data for a specific semester
 * @param {string} semester - Name of the semester
 * @returns {Object} Semester data containing subjects and tasks
 */
export const getSemesterData = async (semester) => {
  const data = await loadData();
  return data[semester] || {};
};

/**
 * Save data for a specific semester
 * @param {string} semester - Name of the semester
 * @param {Object} semesterData - Data to save for the semester
 */
export const saveSemesterData = async (semester, semesterData) => {
  const data = await loadData();
  data[semester] = semesterData;
  await saveData(data);
};

/**
 * Add a new subject to a semester
 * @param {string} semester - Name of the semester
 * @param {string} subjectName - Name of the subject
 * @param {string} colorTag - Color tag for the subject (default: #6C63FF)
 */
export const addSubject = async (semester, subjectName, colorTag = '#6C63FF') => {
  const semesterData = await getSemesterData(semester);
  if (!semesterData[subjectName]) {
    semesterData[subjectName] = { tasks: [], colorTag };
    await saveSemesterData(semester, semesterData);
  }
};

/**
 * Delete a subject from a semester
 * @param {string} semester - Name of the semester
 * @param {string} subjectName - Name of the subject to delete
 */
export const deleteSubject = async (semester, subjectName) => {
  const semesterData = await getSemesterData(semester);
  delete semesterData[subjectName];
  await saveSemesterData(semester, semesterData);
};

/**
 * Update/rename a subject
 * @param {string} semester - Name of the semester
 * @param {string} oldSubjectName - Current name of the subject
 * @param {string} newSubjectName - New name for the subject
 * @param {string} colorTag - Color tag for the subject
 * @throws {Error} If a subject with the new name already exists
 */
export const updateSubject = async (semester, oldSubjectName, newSubjectName, colorTag) => {
  const semesterData = await getSemesterData(semester);
  if (oldSubjectName !== newSubjectName) {
    if (semesterData[newSubjectName]) {
      throw new Error('A subject with this name already exists');
    }
    semesterData[newSubjectName] = { ...semesterData[oldSubjectName], colorTag };
    delete semesterData[oldSubjectName];
  } else {
    semesterData[oldSubjectName].colorTag = colorTag;
  }
  await saveSemesterData(semester, semesterData);
};

/**
 * Add a new task to a subject
 * @param {string} semester - Name of the semester
 * @param {string} subject - Name of the subject
 * @param {Object} task - Task object with title, dueDate, and completed properties
 */
export const addTask = async (semester, subject, task) => {
  const semesterData = await getSemesterData(semester);
  if (!semesterData[subject]) {
    semesterData[subject] = { tasks: [], colorTag: '#6C63FF' };
  }
  semesterData[subject].tasks.push(task);
  await saveSemesterData(semester, semesterData);
};

/**
 * Update an existing task
 * @param {string} semester - Name of the semester
 * @param {string} subject - Name of the subject
 * @param {number} taskIndex - Index of the task to update
 * @param {Object} updatedTask - Updated task object
 */
export const updateTask = async (semester, subject, taskIndex, updatedTask) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject] && semesterData[subject].tasks[taskIndex]) {
    semesterData[subject].tasks[taskIndex] = updatedTask;
    await saveSemesterData(semester, semesterData);
  }
};

/**
 * Delete a task from a subject
 * @param {string} semester - Name of the semester
 * @param {string} subject - Name of the subject
 * @param {number} taskIndex - Index of the task to delete
 */
export const deleteTask = async (semester, subject, taskIndex) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject]) {
    semesterData[subject].tasks.splice(taskIndex, 1);
    await saveSemesterData(semester, semesterData);
  }
};

/**
 * Toggle the completion status of a task
 * @param {string} semester - Name of the semester
 * @param {string} subject - Name of the subject
 * @param {number} taskIndex - Index of the task to toggle
 */
export const toggleTaskCompletion = async (semester, subject, taskIndex) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject] && semesterData[subject].tasks[taskIndex]) {
    semesterData[subject].tasks[taskIndex].completed = !semesterData[subject].tasks[taskIndex].completed;
    await saveSemesterData(semester, semesterData);
  }
};
