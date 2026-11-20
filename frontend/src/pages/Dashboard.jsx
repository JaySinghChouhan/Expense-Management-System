import {useEffect,useState} from "react";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from "recharts";
import api from "../services/api";
export default function Dashboard(){
 const [year,setYear]=useState(new Date().getFullYear());
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{setData(null);api.get("/dashboard/summary",{params:{year}}).then(r=>setData(r.data.data)).catch(e=>setError(e.response?.data?.message||"Could not load dashboard"));},[year]);
 if(error)return <section className="page"><div className="error">{error}</div></section>;
 if(!data)return <section className="page">Loading dashboard...</section>;
 const statuses=Object.fromEntries(data.statuses.map(x=>[x._id,x.count]));
 const years=[year,year-1,year-2];
 return <section className="page"><div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Dashboard</h1><p className="muted">Your expense performance for {data.year}</p></div><select aria-label="Year" value={year} onChange={e=>setYear(Number(e.target.value))}>{[...new Set(years)].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
 <div className="stats"><article className="stat"><span>Total expenses this year</span><strong>₹{data.total.toLocaleString("en-IN")}</strong><small>{data.count} records</small></article><article className="stat"><span>{data.monthLabel?`${data.monthLabel} total`:"Monthly total"}</span><strong>₹{(data.monthlyTotal||0).toLocaleString("en-IN")}</strong><small>Current month in {data.year}</small></article><article className="stat"><span>Highest expense</span><strong>₹{(data.highest?.amount||0).toLocaleString("en-IN")}</strong><small>{data.highest?.title||"No expenses"}</small></article><article className="stat"><span>Approval status</span><strong>{statuses.pending||0} pending</strong><small>{statuses.approved||0} approved · {statuses.rejected||0} rejected</small></article></div>
 <div className="panel"><h2>Monthly expense trend</h2><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="total" fill="#4169e1" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div>
 <div className="panel"><h2>Category summary</h2>{data.categories.map(c=><div className="category-row" key={c._id}><span>{c._id}</span><strong>₹{c.total.toLocaleString("en-IN")}</strong><small>{c.count} expenses</small></div>)}</div></section>;
}
