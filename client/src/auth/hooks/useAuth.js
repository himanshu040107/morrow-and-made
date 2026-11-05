import {useContext} from "react";
import { AuthContext } from "./AuthContext.jsx";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;