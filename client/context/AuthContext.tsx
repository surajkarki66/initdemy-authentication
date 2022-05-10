import {
  useReducer,
  createContext,
  ReactFragment,
  FC,
  Dispatch,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";

import Axios from "../axios-url";

type Props = {
  children: ReactFragment;
};

type AuthContextType = {
  state: any;
  dispatch: Dispatch<{
    type: any;
    payload?: any;
  }>;
  csrfToken: string;
};

const initialState = {
  user: null,
};

const AuthContext = createContext({} as AuthContextType);

const rootReducer = (state: any, action: { type: any; payload?: any }) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };

    default:
      return state;
  }
};

const AuthContextProvider: FC<Props> = (props) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getCsrfToken = async () => {
      const { data } = await Axios.get("/users/csrf-token");
      setCsrfToken(data.csrfToken);
    };
    getCsrfToken();
    dispatch({
      type: "LOGIN",
      payload: JSON.parse(String(window.localStorage.getItem("user"))),
    });
  }, [setCsrfToken]);

  Axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      const res = error.response;
      if (res.status === 401 && res.config && !res.config.__isRetryRequest) {
        return new Promise((_resolve, reject) => {
          Axios.get("/users/logout")
            .then((_data) => {
              dispatch({ type: "LOGOUT" });
              window.localStorage.removeItem("user");
              router.push("/login");
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ state, dispatch, csrfToken }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };