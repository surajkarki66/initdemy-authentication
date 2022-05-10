import {
  useEffect,
  useState,
  useContext,
  useCallback,
  ReactChild,
  FC,
} from "react";
import { useRouter } from "next/router";
import { SyncOutlined } from "@ant-design/icons";

import Axios from "../../axios-url";
import { AuthContext } from "../../context/AuthContext";

type Props = { children: ReactChild };

const UserRoute: FC<Props> = (props) => {
  const [ok, setOk] = useState(false);
  const { csrfToken, accessToken } = useContext(AuthContext);

  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      Axios.defaults.headers.post["X-CSRF-Token"] = csrfToken;
      const { data } = await Axios.get("/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (data.data) {
        setOk(true);
      }
    } catch (error) {
      setOk(false);
      router.push("/login");
    }
  }, [accessToken, csrfToken, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      {!ok ? (
        <SyncOutlined
          spin
          className="d-flex justify-content-center display-1 text-primary p-5"
        />
      ) : (
        <>{props.children}</>
      )}
    </>
  );
};

export default UserRoute;
