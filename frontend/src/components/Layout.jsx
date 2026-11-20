import {NavLink,Outlet,useNavigate} from "react-router-dom";
import {LayoutDashboard,Receipt,LogOut,Download,CheckSquare} from "lucide-react";
import {useAuth} from "../context/AuthContext";
export default function Layout(){
 const {user,logout}=useAuth();const navigate=useNavigate();
 const signOut=()=>{logout();navigate("/login");};
 return <div className="shell"><aside className="sidebar"><h2>ExpenseFlow</h2><p className="muted">MANAGEMENT</p>
 <NavLink to="/"><LayoutDashboard size={18}/> Dashboard</NavLink>
 <NavLink to="/expenses"><Receipt size={18}/> Expenses</NavLink>
 {user?.role==="admin"&&<NavLink to="/approvals"><CheckSquare size={18}/> Approvals</NavLink>}
 <button className="logout" onClick={signOut}><LogOut size={18}/> Sign out</button></aside>
 <main className="main"><header className="topbar"><span>Expense Management</span><span className="who">{user?.name} · {user?.role}<button className="link-btn top-signout" onClick={signOut}>Sign out</button></span></header><Outlet/></main></div>;
}
