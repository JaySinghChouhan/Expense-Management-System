import {createContext,useContext,useState} from "react";
import api from "../services/api";
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("expense_user"));}catch{return null;}});
 const saveSession=(data)=>{
  localStorage.setItem("expense_token",data.token);
  localStorage.setItem("expense_user",JSON.stringify(data.user));
  setUser(data.user);
  return data.user;
 };
 const login=async(email,password)=>{
  const {data}=await api.post("/auth/login",{email,password});
  return saveSession(data.data);
 };
 const register=async(name,email,password)=>{
  const {data}=await api.post("/auth/register",{name,email,password});
  return saveSession(data.data);
 };
 const logout=()=>{localStorage.removeItem("expense_token");localStorage.removeItem("expense_user");setUser(null);};
 return <AuthContext.Provider value={{user,login,register,logout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
