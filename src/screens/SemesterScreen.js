import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';

export default function SemesterScreen({ navigation }) {
  const theme = useTheme();
  const semesters = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);

  const renderSemester = ({ item }) => (
    <Card 
      style={styles.card} 
      onPress={() => navigation.navigate('Subjects', { semester: item })}
    >
      <Card.Content>
        <Title>{item}</Title>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
});
