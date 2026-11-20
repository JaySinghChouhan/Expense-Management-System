import {Routes,Route,Navigate} from "react-router-dom";
import {useAuth} from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Approvals from "./pages/Approvals";
export default function App(){
 const {user}=useAuth();
 return <Routes><Route path="/login" element={user?<Navigate to="/" replace/>:<Login/>}/>
 <Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route index element={<Dashboard/>}/><Route path="/expenses" element={<Expenses/>}/></Route></Route>
 <Route element={<ProtectedRoute admin/>}><Route element={<Layout/>}><Route path="/approvals" element={<Approvals/>}/></Route></Route>
 <Route path="*" element={<Navigate to={user?"/":"/login"} replace/>}/></Routes>;
}
