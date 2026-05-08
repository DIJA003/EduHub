/**
 * pages/auth/ForgotPassword.jsx
 */
import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Screen, Card, Field, Btn, C, st } from '../../components/UI';

export default function ForgotPassword() {
  const navigation    = useNavigation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  return (
    <Screen>
      <Card>
        <Text style={st.pageTitle}>Forgot password?</Text>
        <Text style={{ color: C.textSub, fontSize: 14 }}>
          Enter your registered email and we will send a reset link.
        </Text>
      </Card>
      <Card>
        {sent ? (
          <>
            <Text style={{ color: C.emerald, fontWeight: '700' }}>
              ✓ Check your inbox for the reset link.
            </Text>
            <Btn label="Use another email" variant="ghost" small onPress={() => { setSent(false); setEmail(''); }} />
          </>
        ) : (
          <>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="Enter your college email" keyboardType="email-address" />
            <Btn label="Send reset link" onPress={async () => {
              if (!email.trim()) return;
              try {
                await forgotPassword(email);
                setSent(true);
              } catch (e) {
                Alert.alert('Error', e.message);
              }
            }} />
            <Btn label="Back to login" variant="ghost" small onPress={() => navigation.navigate('Login')} />
          </>
        )}
      </Card>
    </Screen>
  );
}