import React, {useEffect, useState} from 'react';
import {
  AsyncStorage,
  Button,
  FlatList, Modal,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {BottomSheet, FAB, Header, Icon, Input, ListItem, Overlay} from "react-native-elements";

export default function App() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [formTask, setFormTask] = useState({ title: '' })
  const [formVisible, setFormVisible] = useState(false)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {

    getTasks()
  }, [])

  const list = [
    {
      title: tasks[selectedIndex] && tasks[selectedIndex].status ? 'Todo' : 'Done',
      style: { backgroundColor: tasks[selectedIndex] && tasks[selectedIndex].status ? 'blue' : 'green' },
      onPress: async () => {
        await setStatusTask(selectedIndex, !tasks[selectedIndex].status)
      }
    },
    {
      title: 'Delete',
      style: { backgroundColor: 'red' },
      onPress: async () => {
        await removeTask(selectedIndex)
      }
    },
  ];

  const getTasks = async () => {
    try {
      setIsLoading(true)
      const value = await AsyncStorage.getItem('TASKS');
      if (value !== null) {
        // We have data!!
        setTasks(JSON.parse(value))
      }
      setIsLoading(false)
    } catch (error) {
      // Error retrieving data
      setIsLoading(false)
    }
  };

  const addTask = async () => {
    const tempTasks = tasks.reverse()
    tempTasks.push({ ...formTask, status: false, timestamp: new Date().toISOString() })
    setIsLoading(true)
    await AsyncStorage.setItem('TASKS', JSON.stringify(tempTasks.reverse()))
    setIsLoading(false)
    setFormVisible(false)
    setTasks(tempTasks)
    setFormTask({ title: '' })
  }

  const removeTask = async (idx) => {
    const tempTasks = tasks
    tempTasks.splice(idx, 1)
    setTasks(tempTasks)
    await AsyncStorage.setItem('TASKS', JSON.stringify(tempTasks))
    setBottomSheetVisible(false)
  }

  const setStatusTask = async (idx, status) => {
    const tempTasks = tasks
    tempTasks[idx].status = status
    setTasks(tempTasks)
    await AsyncStorage.setItem('TASKS', JSON.stringify(tempTasks))
    setBottomSheetVisible(false)
  }

  const showBottomSheet = (idx) => {
    setSelectedIndex(idx)
    setBottomSheetVisible(true)
  }

  const renderItem = ({ item, index }) => (
    <ListItem onPress={() => showBottomSheet(index)} bottomDivider>
      <Icon name={item.status ? 'check-circle' : 'watch-later'} />
      <ListItem.Content>
        <ListItem.Title h4 numberOfLines={1} style={{ textDecorationLine: item.status ? 'line-through' : 'none' }}>{item.title}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header
          centerComponent={{ text: 'TODO APP', style: { color: '#fff' } }}
        />
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.timestamp}
        />
        {/*<StatusBar style="auto" />*/}
        <FAB
          placement={"right"}
          icon={() => <Icon name='add' color='white' />}
          color='blue'
          onPress={() => setFormVisible(true)}
        />
        <Overlay isVisible={formVisible} onBackdropPress={() => setFormVisible(!formVisible)} overlayStyle={{ width: '100%' }}>
          <Input label='Title' value={formTask.title} onChangeText={val => setFormTask({ ...formTask, title: val })} />
          <Button
            title="Add"
            onPress={addTask}
            buttonStyle={{ marginBottom: 10 }}
            loading={isLoading}
          />
        </Overlay>
        <Modal
          animationType="slide"
          transparent={true}
          visible={bottomSheetVisible}
          onRequestClose={() => {
            setBottomSheetVisible(!bottomSheetVisible);
          }}
        >
          <TouchableWithoutFeedback onPress={() => setBottomSheetVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            {
              list.map((item, i) => (
                <ListItem onPress={item.onPress} key={i} containerStyle={item.style} bottomDivider>
                  {/*<Icon name={item.icon} />*/}
                  <ListItem.Content>
                    <ListItem.Title style={{ color: 'white' }}>{item.title}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))
            }
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end'
  }
});
