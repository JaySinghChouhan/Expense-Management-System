import {useEffect,useState} from "react";
import api from "../services/api";
export default function Approvals(){
 const [items,setItems]=useState([]),[error,setError]=useState("");
 async function load(){try{const r=await api.get("/expenses",{params:{status:"pending",limit:100}});setItems(r.data.data);}catch(e){setError(e.response?.data?.message||"Unable to load approvals");}}
 useEffect(()=>{load();},[]);
 async function review(id,action){const comment=prompt(action==="approve"?"Optional approval comment":"Reason for rejection")||"";try{await api.post(`/expenses/${id}/${action}`,{comment});load();}catch(e){setError(e.response?.data?.message||"Review failed");}}
 return <section className="page"><p className="eyebrow">ADMIN</p><h1>Expense approvals</h1><p className="muted">Review submitted expense claims</p>{error&&<div className="error">{error}</div>}<div className="table-wrap"><table><thead><tr><th>Title</th><th>Created by</th><th>Category</th><th>Date</th><th>Amount</th><th>Action</th></tr></thead><tbody>{items.map(x=><tr key={x._id}><td>{x.title}</td><td>{x.createdBy?.name||"User"}</td><td>{x.category}</td><td>{new Date(x.date).toLocaleDateString()}</td><td>₹{x.amount.toLocaleString("en-IN")}</td><td><button className="link-btn" onClick={()=>review(x._id,"approve")}>Approve</button><button className="link-btn danger-text" onClick={()=>review(x._id,"reject")}>Reject</button></td></tr>)}</tbody></table>{items.length===0&&<p className="empty">No pending expenses.</p>}</div></section>;
}
