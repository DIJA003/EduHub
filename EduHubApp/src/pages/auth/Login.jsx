import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Screen, Card, Field, Btn, useColors } from '../../components/UI';

export default function Login() {
  const navigation = useNavigation();
  const { login }  = useAuth();
  const c          = useColors();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Screen>
        <Card>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
            style={{ width: '100%', height: 180, borderRadius: 12 }}
            resizeMode="cover"
          />
        </Card>
        <Card>
          <Text style={{ color: c.blueLight, fontWeight: '700', fontSize: 12 }}>CONNECTING MINDS</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Welcome Back!</Text>
          <Text style={{ color: c.textSub, fontSize: 14 }}>Login to your account</Text>
        </Card>
        <Card>
          <Field label="Email"    value={email}    onChangeText={setEmail}    placeholder="Email address" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Password" secure />
          <Btn
            label={loading ? 'Logging in…' : 'Login'}
            disabled={loading}
            onPress={async () => {
              try {
                setLoading(true);
                await login(email, password);
              } catch (e) {
                Alert.alert('Login failed', e.message);
              } finally {
                setLoading(false);
              }
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Btn label="Forgot password?" variant="ghost" small onPress={() => navigation.navigate('ForgotPassword')} />
            <Btn label="Create account"   variant="ghost" small onPress={() => navigation.navigate('Register')} />
          </View>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}