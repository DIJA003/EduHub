/**
 * pages/auth/Register.jsx
 */
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Screen, Card, Field, Btn, C, st } from '../../components/UI';

export default function Register() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);

  return (
    <Screen>
      <Card>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: C.blueBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Text style={{ color: C.blueLight, fontSize: 26, fontWeight: '800' }}>E</Text>
        </View>
        <Text style={st.pageTitle}>Create account</Text>
        <Text style={{ color: C.textSub, fontSize: 14 }}>Register to get started with EduHub</Text>
      </Card>
      <Card>
        <Field label="Full name"        value={name}            onChangeText={setName}            placeholder="Full name" />
        <Field label="Email"            value={email}           onChangeText={setEmail}           placeholder="College email address" keyboardType="email-address" />
        <Field label="Password"         value={password}        onChangeText={setPassword}        placeholder="Password (min. 6 characters)" secure />
        <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secure />
        <Btn
          label={loading ? 'Creating account…' : 'Create account'}
          disabled={loading}
          onPress={async () => {
            if (password !== confirmPassword) { Alert.alert('Validation', 'Passwords do not match.'); return; }
            try {
              setLoading(true);
              await register({ name, email, password });
            } catch (e) {
              Alert.alert('Register failed', e.message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <Btn label="Back to login" variant="ghost" small onPress={() => navigation.navigate('Login')} />
      </Card>
    </Screen>
  );
}