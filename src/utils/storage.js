import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@semester_task_manager';

export const loadData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error loading data:', e);
    return {};
  }
};

export const saveData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

export const getSemesterData = async (semester) => {
  const data = await loadData();
  return data[semester] || {};
};

export const saveSemesterData = async (semester, semesterData) => {
  const data = await loadData();
  data[semester] = semesterData;
  await saveData(data);
};

export const addSubject = async (semester, subjectName, colorTag = '#6200ee') => {
  const semesterData = await getSemesterData(semester);
  if (!semesterData[subjectName]) {
    semesterData[subjectName] = { tasks: [], colorTag };
    await saveSemesterData(semester, semesterData);
  }
};

export const deleteSubject = async (semester, subjectName) => {
  const semesterData = await getSemesterData(semester);
  delete semesterData[subjectName];
  await saveSemesterData(semester, semesterData);
};

export const updateSubject = async (semester, oldSubjectName, newSubjectName, colorTag) => {
  const semesterData = await getSemesterData(semester);
  if (oldSubjectName !== newSubjectName) {
    semesterData[newSubjectName] = { ...semesterData[oldSubjectName], colorTag };
    delete semesterData[oldSubjectName];
  } else {
    semesterData[oldSubjectName].colorTag = colorTag;
  }
  await saveSemesterData(semester, semesterData);
};

export const addTask = async (semester, subject, task) => {
  const semesterData = await getSemesterData(semester);
  if (!semesterData[subject]) {
    semesterData[subject] = { tasks: [], colorTag: '#6200ee' };
  }
  semesterData[subject].tasks.push(task);
  await saveSemesterData(semester, semesterData);
};

export const updateTask = async (semester, subject, taskIndex, updatedTask) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject] && semesterData[subject].tasks[taskIndex]) {
    semesterData[subject].tasks[taskIndex] = updatedTask;
    await saveSemesterData(semester, semesterData);
  }
};

export const deleteTask = async (semester, subject, taskIndex) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject]) {
    semesterData[subject].tasks.splice(taskIndex, 1);
    await saveSemesterData(semester, semesterData);
  }
};

export const toggleTaskCompletion = async (semester, subject, taskIndex) => {
  const semesterData = await getSemesterData(semester);
  if (semesterData[subject] && semesterData[subject].tasks[taskIndex]) {
    semesterData[subject].tasks[taskIndex].completed = !semesterData[subject].tasks[taskIndex].completed;
    await saveSemesterData(semester, semesterData);
  }
};
