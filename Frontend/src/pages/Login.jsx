// import { useState, useCallback, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Mail, Lock, Phone, AlertCircle, CheckCircle,
//   UtensilsCrossed, Bike, Shield, ArrowRight, Loader2, Eye, EyeOff, User, Sparkles,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";

// const ROLE_MAP = { 1: "Admin", 2: "Customer", 3: "Restaurant", 4: "Delivery" };
// const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7217";

// const ROLES = [
//   { value: 1, label: "Admin",      Icon: Shield,          desc: "Full control"  },
//   { value: 2, label: "Customer",   Icon: User,            desc: "Order food"    },
//   { value: 3, label: "Restaurant", Icon: UtensilsCrossed, desc: "Manage menu"   },
//   { value: 4, label: "Delivery",   Icon: Bike,            desc: "Deliver orders"},
// ];

// const FOOD_CARDS = [
//   { url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqeu074eBuamsw098-qakk64QfK9a7UiEGA&s",                                                                       label:"Biryani",      rot:-7,  x:1,   y:4,  dur:7,  delay:0   },
//   { url:"https://www.shutterstock.com/image-photo/sliced-mushroom-pizza-herbs-on-600w-2630386341.jpg",                                                                         label:"Pizza",        rot:5,   x:14,  y:55, dur:8,  delay:0.7 },
//   { url:"https://ribbonstopastas.com/wp-content/uploads/2023/03/Blushing-Dahi-Puri-500x500.jpg",                                                                               label:"Dahi Puri",    rot:-4,  x:60,  y:3,  dur:6,  delay:1.2 },
//   { url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvlF-Tf4G7Aafv-G_VOHLTY7bLeccatCyadw&s",                                                                      label:"Dessert",      rot:8,   x:74,  y:50, dur:9,  delay:0.4 },
//   { url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpUs9MdArXSfi5-STMXGoqhtmPiyfAzXlt_Q&s",                                                                      label:"Healthy Bowl", rot:-5,  x:36,  y:70, dur:7,  delay:2   },
//   { url:"https://thumbs.dreamstime.com/b/chef-panda-burger-417828015.jpg",                                                                                                     label:"Chef Panda",   rot:6,   x:80,  y:75, dur:8,  delay:1.5 },
//   { url:"https://thumbs.dreamstime.com/b/cute-panda-eat-delicious-ramen-tempura-vector-illustration-cartoon-design-416440114.jpg",                                              label:"Ramen Panda",  rot:-6,  x:-1,  y:68, dur:6,  delay:3   },
//   { url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB3kKY64J7LcQP275G2VCeRFSD5u4qUmaGjA&s",                                                                      label:"Street Food",  rot:4,   x:48,  y:32, dur:10, delay:0.9 },
//   { url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXFZ1fZmfeVgjHWJ9Re5R2FYEc_wwWlXV0tA&s",                                                                      label:"Noodles",      rot:-3,  x:88,  y:18, dur:7,  delay:1.8 },
// ];

// const DOTS = Array.from({length:16},(_,i)=>({x:Math.round(5+i*5.8+Math.sin(i*1.3)*8), y:Math.round(5+i*5.5+Math.cos(i*1.1)*9), d:0.3+i*0.18}));

// export default function Login() {
//   const [tab,setTab]             = useState("login");
//   const [loginEmail,setLoginEmail] = useState("");
//   const [loginPass,setLoginPass]   = useState("");
//   const [showPass,setShowPass]     = useState(false);
//   const [regName,setRegName]       = useState("");
//   const [regEmail,setRegEmail]     = useState("");
//   const [regPass,setRegPass]       = useState("");
//   const [regPhone,setRegPhone]     = useState("");
//   const [regRole,setRegRole]       = useState(null);
//   const [loading,setLoading]       = useState(false);
//   const [error,setError]           = useState("");
//   const [success,setSuccess]       = useState("");
//   const [mounted,setMounted]       = useState(false);
//   const [mouse,setMouse]           = useState({x:0,y:0});
//   const rootRef = useRef(null);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   useEffect(()=>{ setTimeout(()=>setMounted(true),80); },[]);

//   useEffect(()=>{
//     const h=(e)=>{
//       if(!rootRef.current)return;
//       const r=rootRef.current.getBoundingClientRect();
//       setMouse({x:((e.clientX-r.left)/r.width-.5)*2, y:((e.clientY-r.top)/r.height-.5)*2});
//     };
//     window.addEventListener("mousemove",h);
//     return ()=>window.removeEventListener("mousemove",h);
//   },[]);

//   const switchTab=(t)=>{setTab(t);setError("");setSuccess("");};

//   const handleLogin=useCallback(async(e)=>{
//     e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
//     try{
//       const result=await login(loginEmail,loginPass);
//       if(!result?.success){navigate("/error",{state:{status:result?.status||401}});return;}
//       const stored=localStorage.getItem("userRole");
//       const finalRole=ROLE_MAP[stored]||ROLE_MAP[Number(stored)]||stored?.trim();
//       setSuccess("Welcome back! Redirecting…");
//       setTimeout(()=>{
//         if(finalRole==="Restaurant") navigate("/restaurant/select",{replace:true});
//         else if(finalRole==="Admin") navigate("/admin",{replace:true});
//         else if(finalRole==="Customer") navigate("/customer/all-items",{replace:true});
//         else if(finalRole==="Delivery"){localStorage.setItem("deliveryOnline","true");navigate("/delivery/dashboard",{replace:true});}
//         else setError("Unknown role: "+finalRole);
//       },0);
//     }catch{setError("Login failed. Please try again.");}
//     finally{setLoading(false);}
//   },[loginEmail,loginPass,login,navigate]);

//   const handleRegister=useCallback(async(e)=>{
//     e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
//     if(!regRole){setError("Please pick a role.");setLoading(false);return;}
//     try{
//       const res=await fetch(`${BASE_URL}/api/auth/register`,{
//         method:"POST",headers:{"Content-Type":"application/json"},
//         body:JSON.stringify({UserName:regName.trim(),Email:regEmail.trim(),Password:regPass,Phone:regPhone.trim(),Role:regRole}),
//       });
//       if(!res.ok){setError((await res.text())||"Registration failed.");return;}
//       setSuccess("Account created! Signing you in…");
//       setTimeout(()=>switchTab("login"),1500);
//     }catch(err){setError(err?.message||"Network error.");}
//     finally{setLoading(false);}
//   },[regName,regEmail,regPass,regPhone,regRole]);

//   return(
//     <>
//       <style>{CSS}</style>
//       <div className="lp-root" ref={rootRef}>

//         {/* BG */}
//         <div className="lp-bg">
//           <div className="lp-bg-base"/>
//           <div className="lp-orb lp-orb1"/>
//           <div className="lp-orb lp-orb2"/>
//           <div className="lp-orb lp-orb3"/>
//           {/* decorative dot grid */}
//           {DOTS.map((d,i)=>(
//             <div key={i} className="lp-dot-grid" style={{left:`${d.x}%`,top:`${d.y}%`,animationDelay:`${d.d}s`}}/>
//           ))}
//           {/* food photo cards */}
//           {FOOD_CARDS.map((c,i)=>{
//             const depth=1+i*0.4;
//             const px=mouse.x*(5+depth*2.5);
//             const py=mouse.y*(4+depth*2);
//             return(
//               <div key={i} className={`lp-fcard ${mounted?"vis":""}`}
//                 style={{
//                   left:`${c.x}%`,top:`${c.y}%`,
//                   "--rot":`${c.rot}deg`,
//                   "--dur":`${c.dur}s`,
//                   "--delay":`${c.delay}s`,
//                   transitionDelay:`${i*0.11}s`,
//                   zIndex:i+1,
//                   transform:`rotate(${c.rot}deg) translate(${px}px,${py}px)`,
//                 }}>
//                 <img src={c.url} alt={c.label} loading="lazy"
//                   onError={e=>{e.target.style.opacity="0.3"}}/>
//                 <div className="lp-fcard-footer">{c.label}</div>
//                 <div className="lp-fcard-glare"/>
//               </div>
//             );
//           })}
//           {/* soft white overlay so cards are visible but form is clear */}
//           <div className="lp-overlay"/>
//         </div>

//         {/* FORM PANEL */}
//         <div className="lp-wrap">
//           <div className={`lp-panel ${mounted?"vis":""}`}>

//             {/* logo */}
//             <div className="lp-logorow">
//               <div className="lp-logo-icon"><UtensilsCrossed size={19} color="#fff"/></div>
//               <span className="lp-logo-txt">Food<b>Hub</b></span>
//               <span className="lp-badge-live"><span className="lp-ldot"/>Live</span>
//             </div>

//             {/* headline */}
//             <div className="lp-greet">
//               <h1 className="lp-h1">
//                 {tab==="login"?<>Welcome <em>back</em> 👋</>:<>Join us <em>today</em> 🎉</>}
//               </h1>
//               <p className="lp-p">{tab==="login"?"Sign in to continue your food journey":"Create your account in seconds"}</p>
//             </div>

//             {/* tabs */}
//             <div className="lp-tabs">
//               <div className="lp-tabpill" style={{left:tab==="login"?"4px":"calc(50% + 2px)"}}/>
//               <button className={`lp-tab ${tab==="login"?"on":""}`} onClick={()=>switchTab("login")}>Sign In</button>
//               <button className={`lp-tab ${tab==="register"?"on":""}`} onClick={()=>switchTab("register")}>Register</button>
//             </div>

//             {/* alerts */}
//             {success&&<div className="lp-alert ok"><CheckCircle size={15} style={{flexShrink:0}}/><span>{success}</span></div>}
//             {error&&<div className="lp-alert err"><AlertCircle size={15} style={{flexShrink:0}}/><span>{error}</span></div>}

//             {/* LOGIN */}
//             {tab==="login"&&(
//               <form className="lp-form" onSubmit={handleLogin}>
//                 <div className="lp-field">
//                   <label className="lp-lbl">Email address</label>
//                   <div className="lp-iw">
//                     <Mail size={15} className="lp-ico"/>
//                     <input className="lp-inp" type="email" placeholder="you@example.com"
//                       value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required/>
//                   </div>
//                 </div>
//                 <div className="lp-field">
//                   <label className="lp-lbl">Password</label>
//                   <div className="lp-iw">
//                     <Lock size={15} className="lp-ico"/>
//                     <input className="lp-inp" type={showPass?"text":"password"} placeholder="••••••••"
//                       value={loginPass} onChange={e=>setLoginPass(e.target.value)} required/>
//                     <button type="button" className="lp-eye" onClick={()=>setShowPass(v=>!v)}>
//                       {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
//                     </button>
//                   </div>
//                 </div>
//                 <button type="submit" className="lp-btn" disabled={loading}>
//                   {loading?<Loader2 size={17} className="lp-spin"/>:<ArrowRight size={17}/>}
//                   {loading?"Signing in…":"Sign In"}
//                 </button>
//               </form>
//             )}

//             {/* REGISTER */}
//             {tab==="register"&&(
//               <form className="lp-form" onSubmit={handleRegister}>
//                 <div className="lp-row2">
//                   <div className="lp-field">
//                     <label className="lp-lbl">Full Name</label>
//                     <div className="lp-iw">
//                       <User size={15} className="lp-ico"/>
//                       <input className="lp-inp" placeholder="John Doe"
//                         value={regName} onChange={e=>setRegName(e.target.value)} required/>
//                     </div>
//                   </div>
//                   <div className="lp-field">
//                     <label className="lp-lbl">Phone</label>
//                     <div className="lp-iw">
//                       <Phone size={15} className="lp-ico"/>
//                       <input className="lp-inp" type="tel" placeholder="+91 98765 43210"
//                         value={regPhone} onChange={e=>setRegPhone(e.target.value)} required/>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="lp-field">
//                   <label className="lp-lbl">Email address</label>
//                   <div className="lp-iw">
//                     <Mail size={15} className="lp-ico"/>
//                     <input className="lp-inp" type="email" placeholder="you@example.com"
//                       value={regEmail} onChange={e=>setRegEmail(e.target.value)} required/>
//                   </div>
//                 </div>
//                 <div className="lp-field">
//                   <label className="lp-lbl">Password</label>
//                   <div className="lp-iw">
//                     <Lock size={15} className="lp-ico"/>
//                     <input className="lp-inp" type={showPass?"text":"password"} placeholder="Create a strong password"
//                       value={regPass} onChange={e=>setRegPass(e.target.value)} required/>
//                     <button type="button" className="lp-eye" onClick={()=>setShowPass(v=>!v)}>
//                       {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
//                     </button>
//                   </div>
//                 </div>
//                 <div className="lp-field">
//                   <label className="lp-lbl">Your Role</label>
//                   <div className="lp-roles">
//                     {ROLES.map(({value,label,Icon,desc})=>{
//                       const on=regRole===value;
//                       return(
//                         <button key={value} type="button"
//                           className={`lp-role ${on?"on":""}`}
//                           onClick={()=>setRegRole(value)}>
//                           <div className="lp-role-ico"><Icon size={15}/></div>
//                           <div className="lp-role-info">
//                             <span className="lp-rname">{label}</span>
//                             <span className="lp-rdesc">{desc}</span>
//                           </div>
//                           {on&&<CheckCircle size={13} className="lp-rchk"/>}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 <button type="submit" className="lp-btn" disabled={loading}>
//                   {loading?<Loader2 size={17} className="lp-spin"/>:<Sparkles size={16}/>}
//                   {loading?"Creating account…":"Create Account"}
//                 </button>
//               </form>
//             )}

//             {/* footer roles */}
//             <div className="lp-foot">
//               <div className="lp-foot-line"/>
//               <div className="lp-foot-roles">
//                 {ROLES.map(({Icon,label})=>(
//                   <div key={label} className="lp-fr">
//                     <div className="lp-fr-ico"><Icon size={12}/></div>
//                     <span>{label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Nunito:wght@300;400;500;600;700;800&display=swap');
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

// .lp-root{
//   position:relative;min-height:100svh;width:100%;overflow:hidden;
//   display:flex;align-items:center;justify-content:center;
//   font-family:'Nunito',system-ui,sans-serif;
// }

// /* ── BACKGROUND ── */
// .lp-bg{position:absolute;inset:0;pointer-events:none}
// .lp-bg-base{
//   position:absolute;inset:0;
//   background:linear-gradient(135deg,#fff8f0 0%,#fef3e8 25%,#fff5f5 50%,#fffde8 75%,#f0fdf4 100%);
// }

// /* ambient soft orbs */
// .lp-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
// .lp-orb1{width:600px;height:600px;background:radial-gradient(circle,#fed7aa 0%,transparent 70%);top:-180px;left:-180px;animation:orbF 20s ease-in-out infinite alternate}
// .lp-orb2{width:500px;height:500px;background:radial-gradient(circle,#fecaca 0%,transparent 70%);bottom:-120px;right:-120px;animation:orbF 25s ease-in-out infinite alternate-reverse}
// .lp-orb3{width:400px;height:400px;background:radial-gradient(circle,#bbf7d0 0%,transparent 70%);top:35%;right:30%;animation:orbF 18s ease-in-out 3s infinite alternate}
// @keyframes orbF{0%{transform:translate(0,0)}50%{transform:translate(30px,-25px)}100%{transform:translate(-20px,40px)}}

// /* decorative dots */
// .lp-dot-grid{
//   position:absolute;width:5px;height:5px;border-radius:50%;
//   background:rgba(234,88,12,.18);opacity:0;
//   animation:dotPop 4s ease-in-out infinite;
// }
// @keyframes dotPop{0%,100%{opacity:0;transform:scale(.5)}50%{opacity:.8;transform:scale(1.2)}}

// /* ── FOOD CARDS ── */
// .lp-fcard{
//   position:absolute;
//   width:clamp(110px,11vw,170px);aspect-ratio:4/5;
//   border-radius:20px;overflow:hidden;
//   opacity:0;
//   transition:opacity 1.1s ease, transform 0.9s cubic-bezier(.22,1,.36,1);
//   box-shadow:
//     0 20px 60px rgba(0,0,0,.13),
//     0 6px 16px rgba(0,0,0,.08),
//     0 0 0 2px rgba(255,255,255,.8),
//     0 0 0 3px rgba(234,88,12,.12);
//   animation:fcardFloat var(--dur,8s) ease-in-out var(--delay,0s) infinite alternate;
//   will-change:transform;
// }
// .lp-fcard.vis{opacity:1}
// .lp-fcard img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 6s ease}
// .lp-fcard:hover img{transform:scale(1.1)}
// .lp-fcard-footer{
//   position:absolute;bottom:0;left:0;right:0;
//   padding:18px 10px 8px;
//   background:linear-gradient(to top,rgba(255,255,255,.92) 0%,rgba(255,255,255,.4) 60%,transparent 100%);
//   font-size:9.5px;font-weight:800;color:#92400e;
//   letter-spacing:.07em;text-transform:uppercase;text-align:center;
// }
// .lp-fcard-glare{
//   position:absolute;inset:0;pointer-events:none;
//   background:linear-gradient(135deg,rgba(255,255,255,.3) 0%,transparent 45%,transparent 55%,rgba(255,255,255,.12) 100%);
// }
// @keyframes fcardFloat{
//   0%  {transform:rotate(var(--rot,0deg)) translateY(0px) scale(1)}
//   40% {transform:rotate(calc(var(--rot,0deg) + 1.2deg)) translateY(-14px) scale(1.01)}
//   100%{transform:rotate(calc(var(--rot,0deg) - .8deg)) translateY(-20px) scale(.99)}
// }

// /* light overlay in centre so form panel stands out */
// .lp-overlay{
//   position:absolute;inset:0;
//   background:radial-gradient(ellipse 55% 70% at 50% 50%,
//     rgba(255,252,248,.0) 0%,
//     rgba(255,252,248,.15) 40%,
//     rgba(255,252,248,.35) 65%,
//     rgba(255,252,248,.55) 100%);
// }

// /* ── FORM WRAP ── */
// .lp-wrap{
//   position:relative;z-index:40;
//   width:100%;max-width:460px;padding:16px;
// }

// .lp-panel{
//   background:rgba(255,255,255,.78);
//   backdrop-filter:blur(24px) saturate(1.8);
//   -webkit-backdrop-filter:blur(24px) saturate(1.8);
//   border:1.5px solid rgba(255,255,255,.9);
//   border-radius:28px;
//   padding:30px 32px 26px;
//   box-shadow:
//     0 32px 80px rgba(234,88,12,.12),
//     0 8px 24px rgba(0,0,0,.07),
//     inset 0 1px 0 rgba(255,255,255,1),
//     inset 0 -1px 0 rgba(0,0,0,.04);
//   opacity:0;transform:translateY(26px) scale(.97);
//   transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1);
// }
// .lp-panel.vis{opacity:1;transform:translateY(0) scale(1)}

// /* logo row */
// .lp-logorow{display:flex;align-items:center;gap:10px;margin-bottom:20px}
// .lp-logo-icon{
//   width:38px;height:38px;border-radius:12px;flex-shrink:0;
//   background:linear-gradient(135deg,#f97316,#dc2626);
//   display:flex;align-items:center;justify-content:center;
//   box-shadow:0 5px 16px rgba(249,115,22,.38);
// }
// .lp-logo-txt{
//   font-family:'Lora',serif;font-size:21px;font-weight:700;
//   color:#1c0a00;letter-spacing:-.2px;
// }
// .lp-logo-txt b{color:#f97316;font-weight:700}
// .lp-badge-live{
//   margin-left:auto;display:inline-flex;align-items:center;gap:5px;
//   padding:3px 10px;border-radius:20px;
//   background:#dcfce7;border:1px solid #bbf7d0;
//   font-size:11px;font-weight:700;color:#15803d;
// }
// .lp-ldot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:dotPop 1.8s ease infinite}

// /* greeting */
// .lp-greet{margin-bottom:18px}
// .lp-h1{
//   font-family:'Lora',serif;
//   font-size:clamp(24px,3.5vw,30px);font-weight:700;
//   color:#1c0a00;line-height:1.2;letter-spacing:-.2px;
// }
// .lp-h1 em{font-style:italic;color:#f97316}
// .lp-p{font-size:13px;color:#a16207;margin-top:4px;font-weight:500}

// /* tabs */
// .lp-tabs{
//   position:relative;display:flex;
//   background:#fff3e8;border:1.5px solid #fed7aa;
//   border-radius:14px;padding:4px;margin-bottom:18px;gap:3px;
// }
// .lp-tabpill{
//   position:absolute;top:4px;bottom:4px;width:calc(50% - 6px);
//   background:linear-gradient(135deg,#f97316,#ea580c);
//   border-radius:10px;
//   box-shadow:0 3px 12px rgba(249,115,22,.35);
//   transition:left .28s cubic-bezier(.22,1,.36,1);
//   pointer-events:none;
// }
// .lp-tab{
//   position:relative;z-index:2;flex:1;border:none;background:transparent;
//   font-family:'Nunito',inherit;font-size:13.5px;font-weight:700;
//   color:#c2410c;cursor:pointer;padding:9px;border-radius:10px;
//   transition:color .2s;
// }
// .lp-tab.on{color:#fff}

// /* alerts */
// .lp-alert{
//   display:flex;align-items:flex-start;gap:8px;
//   padding:10px 13px;border-radius:12px;
//   font-size:13px;line-height:1.5;margin-bottom:14px;border:1.5px solid;
// }
// .lp-alert.ok{background:#f0fdf4;border-color:#bbf7d0;color:#15803d}
// .lp-alert.err{background:#fef2f2;border-color:#fecaca;color:#b91c1c}

// /* form */
// .lp-form{display:flex;flex-direction:column;gap:12px}
// .lp-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
// .lp-field{display:flex;flex-direction:column;gap:4px}
// .lp-lbl{font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.07em}

// .lp-iw{position:relative}
// .lp-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#d97706;pointer-events:none;transition:color .2s}
// .lp-iw:focus-within .lp-ico{color:#f97316}
// .lp-inp{
//   width:100%;padding:11px 40px 11px 40px;
//   background:rgba(255,255,255,.85);
//   border:1.5px solid #fde68a;border-radius:12px;
//   font-family:'Nunito',inherit;font-size:14px;color:#1c0a00;
//   outline:none;transition:border-color .2s,background .2s,box-shadow .2s;
// }
// .lp-inp::placeholder{color:#d4a257}
// .lp-inp:focus{
//   border-color:#f97316;background:#fff;
//   box-shadow:0 0 0 4px rgba(249,115,22,.1);
// }
// .lp-eye{
//   position:absolute;right:12px;top:50%;transform:translateY(-50%);
//   background:none;border:none;cursor:pointer;color:#d97706;
//   padding:2px;display:flex;align-items:center;transition:color .15s;
// }
// .lp-eye:hover{color:#f97316}

// /* roles */
// .lp-roles{display:grid;grid-template-columns:1fr 1fr;gap:7px}
// .lp-role{
//   display:flex;align-items:center;gap:9px;padding:9px 11px;
//   border:1.5px solid #fde68a;border-radius:12px;
//   background:rgba(255,255,255,.7);cursor:pointer;
//   font-family:'Nunito',inherit;text-align:left;transition:all .18s;
// }
// .lp-role:hover{border-color:#fb923c;background:#fff7ed;box-shadow:0 3px 12px rgba(249,115,22,.1)}
// .lp-role.on{
//   border-color:#f97316;background:linear-gradient(135deg,#fff7ed,#fff);
//   box-shadow:0 4px 16px rgba(249,115,22,.18);
// }
// .lp-role-ico{
//   width:30px;height:30px;border-radius:9px;flex-shrink:0;
//   display:flex;align-items:center;justify-content:center;
//   background:#fef3c7;color:#d97706;transition:all .18s;
// }
// .lp-role.on .lp-role-ico{background:#fed7aa;color:#ea580c}
// .lp-role-info{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}
// .lp-rname{font-size:13px;font-weight:700;color:#78350f}
// .lp-role.on .lp-rname{color:#c2410c}
// .lp-rdesc{font-size:10px;color:#b45309;font-weight:500}
// .lp-rchk{color:#f97316;flex-shrink:0}

// /* button */
// .lp-btn{
//   width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
//   padding:14px;border-radius:14px;border:none;cursor:pointer;
//   font-family:'Nunito',inherit;font-size:15px;font-weight:800;color:#fff;
//   background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);
//   box-shadow:0 8px 28px rgba(249,115,22,.38),0 2px 6px rgba(0,0,0,.08);
//   position:relative;overflow:hidden;
//   transition:transform .15s,box-shadow .15s,opacity .15s;
//   margin-top:2px;
// }
// .lp-btn::before{
//   content:'';position:absolute;inset:0;
//   background:linear-gradient(135deg,rgba(255,255,255,.2) 0%,transparent 55%);
//   pointer-events:none;
// }
// .lp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 36px rgba(249,115,22,.45)}
// .lp-btn:active:not(:disabled){transform:translateY(0)}
// .lp-btn:disabled{opacity:.55;cursor:not-allowed}
// .lp-spin{animation:spinA .75s linear infinite}
// @keyframes spinA{to{transform:rotate(360deg)}}

// /* footer */
// .lp-foot{margin-top:16px}
// .lp-foot-line{height:1px;background:linear-gradient(to right,transparent,#fde68a,transparent);margin-bottom:12px}
// .lp-foot-roles{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
// .lp-fr{display:flex;align-items:center;gap:5px}
// .lp-fr-ico{
//   width:24px;height:24px;border-radius:7px;
//   background:#fff7ed;border:1px solid #fde68a;
//   display:flex;align-items:center;justify-content:center;color:#d97706;
// }
// .lp-fr span{font-size:10.5px;font-weight:700;color:#a16207}

// @media(max-width:540px){
//   .lp-panel{padding:22px 18px 20px;border-radius:22px}
//   .lp-row2{grid-template-columns:1fr}
//   .lp-fcard{width:clamp(80px,18vw,120px)}
// }
// `;







import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, Lock, Phone, AlertCircle, CheckCircle,
  UtensilsCrossed, Bike, Shield, ArrowRight,
  Loader2, Eye, EyeOff, User, Star, ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ROLE_MAP = { 1:"Admin", 2:"Customer", 3:"Restaurant", 4:"Delivery" };
const BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7217";

const ROLES = [
  // { value:1, label:"Admin",      Icon:Shield,          desc:"Platform control"  },
  { value:2, label:"Customer",   Icon:User,            desc:"Order & enjoy"     },
  { value:3, label:"Restaurant", Icon:UtensilsCrossed, desc:"Manage your menu"  },
  { value:4, label:"Delivery",   Icon:Bike,            desc:"Earn on the road"  },
];

const PHOTOS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEqeu074eBuamsw098-qakk64QfK9a7UiEGA&s",
  "https://www.shutterstock.com/image-photo/sliced-mushroom-pizza-herbs-on-600w-2630386341.jpg",
  "https://ribbonstopastas.com/wp-content/uploads/2023/03/Blushing-Dahi-Puri-500x500.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvlF-Tf4G7Aafv-G_VOHLTY7bLeccatCyadw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpUs9MdArXSfi5-STMXGoqhtmPiyfAzXlt_Q&s",
  "https://thumbs.dreamstime.com/b/chef-panda-burger-417828015.jpg",
  "https://thumbs.dreamstime.com/b/cute-panda-eat-delicious-ramen-tempura-vector-illustration-cartoon-design-416440114.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB3kKY64J7LcQP275G2VCeRFSD5u4qUmaGjA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXFZ1fZmfeVgjHWJ9Re5R2FYEc_wwWlXV0tA&s",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=500&fit=crop&q=80",
];

const COLS = [PHOTOS.slice(0,5), PHOTOS.slice(5,10), PHOTOS.slice(10,15), PHOTOS.slice(15,20)];

export default function Login() {
  const [tab, setTab]               = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [regName, setRegName]       = useState("");
  const [regEmail, setRegEmail]     = useState("");
  const [regPass, setRegPass]       = useState("");
  const [regPhone, setRegPhone]     = useState("");
  const [regRole, setRegRole]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [mounted, setMounted]       = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const switchTab = (t) => { setTab(t); setError(""); setSuccess(""); };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      const result = await login(loginEmail, loginPass);
      if (!result?.success) { navigate("/error", { state: { status: result?.status || 401 } }); return; }
      const stored = localStorage.getItem("userRole");
      const role = ROLE_MAP[stored] || ROLE_MAP[Number(stored)] || stored?.trim();
      setSuccess("Welcome back! Redirecting…");
      setTimeout(() => {
        if      (role === "Restaurant") navigate("/restaurant/select",  { replace: true });
        else if (role === "Admin")      navigate("/admin",              { replace: true });
        else if (role === "Customer")   navigate("/customer/all-items", { replace: true });
        else if (role === "Delivery")   { localStorage.setItem("deliveryOnline","true"); navigate("/delivery/dashboard", { replace: true }); }
        else setError("Unknown role: " + role);
      }, 0);
    } catch { setError("Login failed. Please try again."); }
    finally { setLoading(false); }
  }, [loginEmail, loginPass, login, navigate]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    if (!regRole) { setError("Please select a role."); setLoading(false); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserName: regName.trim(), Email: regEmail.trim(), Password: regPass, Phone: regPhone.trim(), Role: regRole }),
      });
      if (!res.ok) { setError((await res.text()) || "Registration failed."); return; }
      setSuccess("Account created! Please sign in.");
      setTimeout(() => switchTab("login"), 1500);
    } catch (err) { setError(err?.message || "Network error."); }
    finally { setLoading(false); }
  }, [regName, regEmail, regPass, regPhone, regRole]);

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">

        {/* ══ FULL-SCREEN FOOD BACKGROUND ══ */}
        <div className="lp-bg">
          <div className="lp-cols">
            {COLS.map((col, ci) => (
              <div key={ci} className={`lp-col ${ci % 2 === 1 ? "rev" : ""}`}>
                {[...col, ...col].map((src, pi) => (
                  <div key={pi} className="lp-pic">
                    <img src={src} alt="" loading="lazy"
                      onError={e => { e.target.parentElement.style.visibility = "hidden"; }} />
                    {pi % 3 === 1 && (
                      <div className="lp-pic-badge">
                        <Star size={9} fill="#f97316" color="#f97316" />
                        {(4.1 + ((pi + ci) * 0.11) % 0.8).toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="lp-vignette-top" />
          <div className="lp-vignette-bottom" />
          <div className="lp-vignette-left" />
          <div className="lp-fade-right" />
        </div>

        {/* ══ BRAND — top left ══ */}
        <div className="lp-brand">
          <div className="lp-brand-icon"><UtensilsCrossed size={20} color="#fff" /></div>
          <span className="lp-brand-name">Food<em>Hub</em></span>
        </div>

        {/* ══ LEFT TEXT — sits over photos ══ */}
        <div className={`lp-hero-text ${mounted ? "vis" : ""}`}>
          <div className="lp-hero-eyebrow">🔥 India's #1 Food Platform</div>
          <h1 className="lp-hero-h1">
            Crave it.<br />
            <em>Order it.</em><br />
            Love it.
          </h1>
          <p className="lp-hero-p">Hot meals from 1,200+ restaurants,<br />delivered in 30 minutes or less.</p>
          <div className="lp-hero-pills">
            <div className="lp-pill">🍕 1,200+ Restaurants</div>
            <div className="lp-pill">⚡ 30-min delivery</div>
            <div className="lp-pill">⭐ 4.8 rated</div>
          </div>
        </div>

        {/* ══ LOGIN CARD — right side, floats over the cream fade ══ */}
        <div className="lp-form-area">
          <div className={`lp-card ${mounted ? "vis" : ""}`}>

            {/* card header */}
            <div className="lp-card-header">
              <div className="lp-card-icon">
                <UtensilsCrossed size={18} color="#fff" />
              </div>
              <div>
                <h2 className="lp-card-title">
                  {tab === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="lp-card-sub">
                  {tab === "login" ? "Sign in to continue ordering" : "Join FoodHub today"}
                </p>
              </div>
            </div>

            {/* tab switcher */}
            <div className="lp-tabs">
              <button className={`lp-tab ${tab === "login" ? "on" : ""}`} onClick={() => switchTab("login")}>
                Sign In
              </button>
              <button className={`lp-tab ${tab === "register" ? "on" : ""}`} onClick={() => switchTab("register")}>
                Register
              </button>
            </div>

            {/* alerts */}
            {success && <div className="lp-alert ok"><CheckCircle size={14} /><span>{success}</span></div>}
            {error   && <div className="lp-alert err"><AlertCircle size={14} /><span>{error}</span></div>}

            {/* ── LOGIN ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="lp-form">
                <div className="lp-field">
                  <label className="lp-label">Email address</label>
                  <div className="lp-input-wrap">
                    <Mail size={15} className="lp-input-icon" />
                    <input className="lp-input" type="email" placeholder="you@example.com"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="lp-field">
                  <div className="lp-label-row">
                    <label className="lp-label">Password</label>
                    <button type="button" className="lp-link">Forgot?</button>
                  </div>
                  <div className="lp-input-wrap">
                    <Lock size={15} className="lp-input-icon" />
                    <input className="lp-input" type={showPass ? "text" : "password"} placeholder="Enter password"
                      value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                    <button type="button" className="lp-eye" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading
                    ? <><Loader2 size={17} className="lp-spin" /> Signing in…</>
                    : <><span>Sign In</span><ChevronRight size={18} /></>
                  }
                </button>

                <p className="lp-hint">
                  New here?{" "}
                  <button type="button" className="lp-link" onClick={() => switchTab("register")}>
                    Create an account →
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="lp-form">
                <div className="lp-grid2">
                  <div className="lp-field">
                    <label className="lp-label">Full name</label>
                    <div className="lp-input-wrap">
                      <User size={15} className="lp-input-icon" />
                      <input className="lp-input" placeholder="John Doe"
                        value={regName} onChange={e => setRegName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="lp-field">
                    <label className="lp-label">Phone</label>
                    <div className="lp-input-wrap">
                      <Phone size={15} className="lp-input-icon" />
                      <input className="lp-input" type="tel" placeholder="+91 98765 43210"
                        value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Email address</label>
                  <div className="lp-input-wrap">
                    <Mail size={15} className="lp-input-icon" />
                    <input className="lp-input" type="email" placeholder="you@example.com"
                      value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Password</label>
                  <div className="lp-input-wrap">
                    <Lock size={15} className="lp-input-icon" />
                    <input className="lp-input" type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                      value={regPass} onChange={e => setRegPass(e.target.value)} required />
                    <button type="button" className="lp-eye" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">I want to…</label>
                  <div className="lp-roles">
                    {ROLES.map(({ value, label, Icon, desc }) => {
                      const on = regRole === value;
                      return (
                        <button key={value} type="button"
                          className={`lp-role ${on ? "on" : ""}`}
                          onClick={() => setRegRole(value)}>
                          <div className="lp-role-dot">{on ? <CheckCircle size={12} /> : <Icon size={12} />}</div>
                          <div>
                            <div className="lp-role-name">{label}</div>
                            <div className="lp-role-desc">{desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading
                    ? <><Loader2 size={17} className="lp-spin" /> Creating…</>
                    : <><span>Create Account</span><ChevronRight size={18} /></>
                  }
                </button>

                <p className="lp-hint">
                  Already have an account?{" "}
                  <button type="button" className="lp-link" onClick={() => switchTab("login")}>
                    Sign in →
                  </button>
                </p>
              </form>
            )}

            {/* footer */}
            <div className="lp-footer">
              <span>🔒 Secure</span>
              <span className="lp-dot-sep">·</span>
              <span>⚡ Instant access</span>
              <span className="lp-dot-sep">·</span>
              <span>🍕 1,200+ restaurants</span>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }

.lp-root {
  position: relative;
  min-height: 100svh;
  width: 100%;
  overflow: hidden;
  font-family: 'Instrument Sans', system-ui, sans-serif;
}

/* ══ BACKGROUND: full-screen food collage ══════════ */
.lp-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.lp-cols {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
  overflow: hidden;
}

.lp-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: scrollUp 30s linear infinite;
}
.lp-col.rev {
  animation: scrollDown 36s linear infinite;
}
@keyframes scrollUp   { 0% { transform: translateY(0); }    100% { transform: translateY(-50%); } }
@keyframes scrollDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }

.lp-pic {
  position: relative;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  border: 2px solid rgba(255,255,255,0.12);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
}
.lp-pic:nth-child(odd)  { aspect-ratio: 3/4; }
.lp-pic:nth-child(even) { aspect-ratio: 1/1; }
.lp-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lp-pic-badge {
  position: absolute;
  top: 8px; right: 8px;
  display: flex;align-items: center;gap: 3px;
  background: rgba(255,255,255,0.93);
  border-radius: 30px; padding: 3px 8px;
  font-size: 10px; font-weight: 800; color: #92400e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

/* ── VIGNETTE LAYERS ──── */
.lp-vignette-top {
  position: absolute; top: 0; left: 0; right: 0;
  height: 160px; z-index: 2;
  background: linear-gradient(to bottom, rgba(12,5,2,0.82) 0%, transparent 100%);
  pointer-events: none;
}
.lp-vignette-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 140px; z-index: 2;
  background: linear-gradient(to top, rgba(12,5,2,0.7) 0%, transparent 100%);
  pointer-events: none;
}
.lp-vignette-left {
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 200px; z-index: 2;
  background: linear-gradient(to right, rgba(12,5,2,0.6) 0%, transparent 100%);
  pointer-events: none;
}
.lp-fade-right {
  position: absolute; inset: 0; z-index: 3;
  background: radial-gradient(
    ellipse 55% 65% at 50% 50%,
    rgba(20, 8, 4, 0.18) 0%,
    rgba(20, 8, 4, 0.42) 55%,
    rgba(20, 8, 4, 0.65) 100%
  );
  pointer-events: none;
}

/* ══ BRAND ═══════════════════════════════════════ */
.lp-brand {
  position: absolute;
  top: 28px; left: 32px;
  z-index: 20;
  display: flex; align-items: center; gap: 10px;
}
.lp-brand-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(249,115,22,0.55);
}
.lp-brand-name {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px; font-weight: 800; color: #fff;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.lp-brand-name em { font-style: normal; color: #fdba74; }

/* ══ LEFT HERO TEXT ══════════ */
.lp-hero-text {
  position: absolute;
  left: 36px; bottom: 52px;
  z-index: 10;
  max-width: 320px;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(.22,1,.36,1) 0.2s;
}
.lp-hero-text.vis { opacity: 1; transform: translateY(0); }
@media (max-width: 900px) { .lp-hero-text { display: none; } }

.lp-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(8px);
  border-radius: 30px; padding: 5px 14px;
  font-size: 11.5px; font-weight: 700;
  color: #fff; letter-spacing: 0.04em;
  margin-bottom: 16px;
}
.lp-hero-h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(34px, 4vw, 52px);
  font-weight: 800; color: #fff;
  line-height: 1.12; letter-spacing: -0.5px;
  margin-bottom: 14px;
  text-shadow: 0 3px 24px rgba(0,0,0,0.4);
}
.lp-hero-h1 em { font-style: italic; color: #fdba74; }
.lp-hero-p {
  font-size: 14px; color: rgba(255,255,255,0.75);
  line-height: 1.65; margin-bottom: 20px; font-weight: 400;
}
.lp-hero-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.lp-pill {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(8px);
  border-radius: 30px; padding: 6px 14px;
  font-size: 12px; font-weight: 600; color: #fff;
}

/* ══ FORM AREA ══ */
.lp-form-area {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

@media (max-width: 900px) {
  .lp-form-area { padding: 20px 16px; }
  .lp-hero-text { display: none; }
}

/* ══ CARD ════════════════════════════════════════ */
.lp-card {
  width: 100%;
  max-width: 430px;
  background: rgba(255, 248, 242, 0.72);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border-radius: 28px;
  padding: 34px 32px 26px;
  box-shadow:
    0 0 0 1px rgba(255,220,190,0.6),
    0 8px 32px rgba(180,80,20,0.14),
    0 32px 80px rgba(180,80,20,0.10),
    0 2px 4px rgba(0,0,0,0.06);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(.22,1,.36,1) 0.1s;
  position: relative;
  overflow: hidden;
}
.lp-card.vis { opacity: 1; transform: translateY(0); }

/* animated orange top stripe */
.lp-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, #f97316 0%, #fb923c 40%, #ea580c 70%, #f97316 100%);
  background-size: 200% 100%;
  animation: shimmerBar 3s linear infinite;
}
@keyframes shimmerBar {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* card header */
.lp-card-header {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 22px;
}
.lp-card-icon {
  width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, #f97316, #ea580c);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(249,115,22,0.42);
}
.lp-card-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px; font-weight: 800;
  color: #431407; letter-spacing: -0.3px; line-height: 1.15;
}
.lp-card-sub {
  font-size: 12.5px; color: #9a3412; margin-top: 2px; font-weight: 400;
}

/* tabs */
.lp-tabs {
  display: flex; gap: 0;
  background: rgba(249,115,22,0.08);
  border: 1.5px solid rgba(249,115,22,0.25);
  border-radius: 13px; padding: 4px;
  margin-bottom: 18px;
  position: relative;
}
.lp-tab {
  flex: 1; border: none; background: transparent;
  font-family: 'Instrument Sans', inherit;
  font-size: 13.5px; font-weight: 600;
  color: #ea580c; cursor: pointer;
  padding: 9px 12px; border-radius: 9px;
  transition: all 0.22s;
  position: relative; z-index: 1;
}
.lp-tab.on {
  background: rgba(255,255,255,0.9);
  color: #ea580c;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(249,115,22,0.25);
}

/* alerts */
.lp-alert {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 13px; border-radius: 10px;
  font-size: 13px; line-height: 1.5; margin-bottom: 14px;
  border: 1.5px solid;
}
.lp-alert.ok  { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.lp-alert.err { background: #fff1f1; border-color: #fecaca; color: #b91c1c; }

/* form */
.lp-form { display: flex; flex-direction: column; gap: 13px; }
.lp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
.lp-field { display: flex; flex-direction: column; gap: 5px; }
.lp-label-row { display: flex; align-items: center; justify-content: space-between; }
.lp-label {
  font-size: 11.5px; font-weight: 700;
  color: #9a3412; letter-spacing: 0.04em; text-transform: uppercase;
}

.lp-input-wrap { position: relative; }
.lp-input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #fb923c; pointer-events: none; transition: color 0.18s;
}
.lp-input-wrap:focus-within .lp-input-icon { color: #ea580c; }

.lp-input {
  width: 100%;
  padding: 12px 42px 12px 40px;
  background: rgba(255,255,255,0.70);
  border: 1.5px solid rgba(249,115,22,0.28);
  border-radius: 11px;
  font-family: 'Instrument Sans', inherit;
  font-size: 14px; color: #431407;
  outline: none;
  transition: all 0.18s;
}
.lp-input::placeholder { color: #fdba74; }
.lp-input:focus {
  border-color: #f97316;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 0 0 4px rgba(249,115,22,0.14);
}

.lp-eye {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: #fb923c; padding: 3px;
  display: flex; align-items: center; transition: color 0.15s;
}
.lp-eye:hover { color: #ea580c; }

.lp-link {
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 12px; font-weight: 700;
  color: #ea580c; padding: 0;
  transition: opacity 0.15s;
}
.lp-link:hover { opacity: 0.7; }

/* role picker */
.lp-roles {
  display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
}
.lp-role {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 11px;
  border: 1.5px solid rgba(249,115,22,0.22);
  border-radius: 11px;
  background: rgba(255,255,255,0.55);
  cursor: pointer;
  font-family: 'Instrument Sans', inherit; text-align: left;
  transition: all 0.17s;
}
.lp-role:hover {
  border-color: #f97316;
  background: rgba(255,255,255,0.80);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.18);
}
.lp-role.on {
  border-color: #f97316;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 0 0 3px rgba(249,115,22,0.14), 0 4px 16px rgba(249,115,22,0.2);
}
.lp-role-dot {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(249,115,22,0.12); color: #ea580c;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.17s;
}
.lp-role.on .lp-role-dot { background: rgba(249,115,22,0.22); color: #c2410c; }
.lp-role-name { font-size: 12.5px; font-weight: 700; color: #431407; line-height: 1.2; }
.lp-role-desc { font-size: 10px; color: #9a3412; margin-top: 1px; }

/* submit button */
.lp-submit {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  width: 100%; padding: 14px 18px;
  border-radius: 13px; border: none; cursor: pointer;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow:
    0 6px 22px rgba(249,115,22,0.48),
    0 2px 6px rgba(0,0,0,0.10),
    inset 0 1px 0 rgba(255,255,255,0.22);
  position: relative; overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}
.lp-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%);
  pointer-events: none;
}
.lp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(249,115,22,0.52), 0 4px 10px rgba(0,0,0,0.12);
}
.lp-submit:active:not(:disabled) { transform: translateY(0); }
.lp-submit:disabled { opacity: 0.55; cursor: not-allowed; }

.lp-spin { animation: spinA 0.75s linear infinite; }
@keyframes spinA { to { transform: rotate(360deg); } }

.lp-hint {
  text-align: center;
  font-size: 13px; color: #9a3412; margin-top: -2px;
}

/* footer */
.lp-footer {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(249,115,22,0.18);
  font-size: 11.5px; color: #9a3412; font-weight: 600;
}
.lp-dot-sep { color: rgba(249,115,22,0.35); }

@media (max-width: 540px) {
  .lp-card { padding: 24px 18px 20px; border-radius: 20px; }
  .lp-grid2 { grid-template-columns: 1fr; }
  .lp-roles { grid-template-columns: 1fr; }
}
`;