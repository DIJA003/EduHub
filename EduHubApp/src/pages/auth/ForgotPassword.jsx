import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Screen, Card, Field, Btn, useColors } from '../../components/UI';

export default function ForgotPassword() {
  const navigation        = useNavigation();
  const { forgotPassword } = useAuth();
  const c = useColors();
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

  return (
    <Screen>
      <Card>
        <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Forgot password?</Text>
        <Text style={{ color: c.textSub, fontSize: 14 }}>
          Enter your email and we'll send you a reset link.
        </Text>
        {sent && (
          <Text style={{ color: c.emerald, fontWeight: '700', marginTop: 4 }}>
            ✓ Reset link sent — check your inbox.
          </Text>
        )}
      </Card>
      <Card>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Your registered email"
          keyboardType="email-address"
        />
        <Btn
          label={sent ? 'Resend link' : 'Send reset link'}
          onPress={async () => {
            try {
              await forgotPassword(email);
              setSent(true);
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }}
        />
        <Btn label="Back to login" variant="ghost" small onPress={() => navigation.navigate('Login')} />
      </Card>
    </Screen>
  );
}