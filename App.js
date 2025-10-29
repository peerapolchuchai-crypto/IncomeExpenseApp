import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('รายรับ'); // รายรับ หรือ รายจ่าย
  const [records, setRecords] = useState([]);
  const [balance, setBalance] = useState(0);

  // โหลดข้อมูลจาก Storage ตอนเปิดแอป
  useEffect(() => {
    loadData();
  }, []);

  // ฟังก์ชันโหลดข้อมูล
  const loadData = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('records');
      if (storedRecords !== null) {
        const parsed = JSON.parse(storedRecords);
        setRecords(parsed);
        calculateBalance(parsed);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // ฟังก์ชันบันทึกข้อมูล
  const saveData = async (newRecords) => {
    try {
      await AsyncStorage.setItem('records', JSON.stringify(newRecords));
    } catch (e) {
      console.log(e);
    }
  };

  // ฟังก์ชันคำนวณยอดคงเหลือ
  const calculateBalance = (data) => {
    let total = 0;
    data.forEach(item => {
      if (item.type === 'รายรับ') total += item.amount;
      else total -= item.amount;
    });
    setBalance(total);
  };

  // เมื่อกดปุ่มบันทึก
  const addRecord = () => {
    if (!amount) {
      Alert.alert('กรุณาใส่จำนวนเงิน');
      return;
    }

    const newRecord = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type: type,
      date: new Date().toLocaleDateString(),
    };

    const newRecords = [...records, newRecord];
    setRecords(newRecords);
    saveData(newRecords);
    calculateBalance(newRecords);
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💙 บัญชีของฉัน 💙</Text>
      <Text style={styles.balance}>ยอดคงเหลือ: {balance} บาท</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="จำนวนเงิน"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.typeContainer}>
        <Button title="รายรับ" onPress={() => setType('รายรับ')} color={type === 'รายรับ' ? 'green' : 'gray'} />
        <Button title="รายจ่าย" onPress={() => setType('รายจ่าย')} color={type === 'รายจ่าย' ? 'red' : 'gray'} />
      </View>

      <Button title="บันทึก" onPress={addRecord} />

      <FlatList
        style={styles.list}
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.date} - {item.type}: {item.amount} บาท
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FF',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0066CC',
    textAlign: 'center',
    marginBottom: 20,
  },
  balance: {
    fontSize: 22,
    color: '#003366',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  list: {
    marginTop: 20,
  },
  item: {
    fontSize: 16,
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
});

