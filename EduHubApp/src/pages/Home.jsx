import { Image, Text, View } from "react-native";
import { Screen, Card, Tag, Btn, s, C } from "../components/UI";

export default function Home({ navigation }) {
  return (
    <Screen>
      <Card>
        <Image
          source={{ uri: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" }}
          style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 14 }}
          resizeMode="cover"
        />
        <Tag label="CONNECTING MINDS" />
        <Text style={[s.pageTitle, { marginTop: 8 }]}>Empowering Students{"\n"}& Mentors</Text>
        <Text style={{ color: C.slate600, fontSize: 14, lineHeight: 20, marginTop: 4 }}>
          A unified platform for collaboration and academic growth.
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Btn label="Login" onPress={() => navigation.navigate("Login")} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn label="Register" variant="outline" onPress={() => navigation.navigate("Register")} />
          </View>
        </View>
      </Card>
    </Screen>
  );
}