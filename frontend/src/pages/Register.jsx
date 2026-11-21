import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function Register(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const {register}=useAuth();
 const navigate=useNavigate();

 async function submit(e){
  e.preventDefault();
  setError("");
  setBusy(true);
  try{
   await register(name,email,password);
   navigate("/",{replace:true});
  }catch(err){
   setError(err.response?.data?.message||"Unable to create account");
  }finally{
   setBusy(false);
  }
 }

 return <div className="login-wrap"><form className="login-card" onSubmit={submit}>
  <div className="brand-mark">EF</div>
  <h1>Create account</h1>
  <p className="muted">Create a user account to manage expenses</p>
  {error&&<div className="error">{error}</div>}
  <label htmlFor="register-name">Name</label>
  <input id="register-name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required maxLength="80"/>
  <label htmlFor="register-email">Email</label>
  <input id="register-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
  <label htmlFor="register-password">Password</label>
  <input id="register-password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="8"/>
  <button className="primary full" disabled={busy}>{busy?"Creating account...":"Create account"}</button>
  <small>Already have an account? <Link to="/login">Sign in</Link></small>
 </form></div>;
}
