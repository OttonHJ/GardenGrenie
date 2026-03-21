import { Redirect } from "expo-router";

export default function Index() {
  // Cuando se integre Firebase Auth, aquí se verificará si hay sesión activa:
  // const user = auth.currentUser;
  // return <Redirect href={user ? "/tabHome" : "/auth"} />;
  return <Redirect href="/tabHome" />;
}
