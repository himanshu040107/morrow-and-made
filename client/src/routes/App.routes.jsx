import {createBrowserRouter} from "react-router";
import Login from "../auth/pages/Login.jsx";
import Register from "../auth/pages/Register.jsx";
import Home from "../main/pages/Home.jsx";
const router=createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
]);
export default router;
