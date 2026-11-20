import {createContext,useContext,useState} from "react";
import api from "../services/api";
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("expense_user"));}catch{return null;}});
 const login=async(email,password)=>{
  const {data}=await api.post("/auth/login",{email,password});
  localStorage.setItem("expense_token",data.data.token);
  localStorage.setItem("expense_user",JSON.stringify(data.data.user));
  setUser(data.data.user);return data.data.user;
 };
 const logout=()=>{localStorage.removeItem("expense_token");localStorage.removeItem("expense_user");setUser(null);};
 return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
