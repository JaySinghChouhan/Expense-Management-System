import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
export default function Login(){
 const [email,setEmail]=useState("admin@example.com"),[password,setPassword]=useState("Admin@12345"),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const {login}=useAuth();const navigate=useNavigate();
 async function submit(e){e.preventDefault();setError("");setBusy(true);try{await login(email,password);navigate("/");}catch(err){setError(err.response?.data?.message||"Unable to sign in");}finally{setBusy(false);}}
 return <div className="login-wrap"><form className="login-card" onSubmit={submit}><div className="brand-mark">EF</div><h1>Welcome back</h1><p className="muted">Sign in to manage your expenses</p>
 {error&&<div className="error">{error}</div>}<label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
 <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
 <button className="primary full" disabled={busy}>{busy?"Signing in...":"Sign in"}</button><small>Demo admin: admin@example.com / Admin@12345 (seed database first)</small></form></div>;
}
