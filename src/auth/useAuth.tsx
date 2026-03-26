import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";

export function useAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId:
      "990735411747-q6fjehof4iods2mcmjd98ivdllcj1omu.apps.googleusercontent.com",
    //isidCliente: "", - Esta seria la infomacion para iOS
  });

  useEffect(() => {
    if (response) {
      if (response.type === "success") {
        console.log(response.authentication);
      } else {
        console.log("Error al autenticar con google");
      }
    }
  }, [response]);

  const authGoogle = () => {
    promptAsync().catch((e) => {
      console.error("Error al iniciar la sesión : ", e);
    });
  };

  return { authGoogle };
}
