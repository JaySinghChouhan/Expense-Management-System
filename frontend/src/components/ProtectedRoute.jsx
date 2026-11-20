import {Navigate,Outlet} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
export default function ProtectedRoute({admin=false}){
 const {user}=useAuth();
 if(!user || !localStorage.getItem("expense_token")) return <Navigate to="/login" replace/>;
 if(admin && user.role!=="admin") return <Navigate to="/" replace/>;
 return <Outlet/>;
}
