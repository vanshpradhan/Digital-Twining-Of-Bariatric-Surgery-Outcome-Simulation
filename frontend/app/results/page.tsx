'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    AlertTriangle, CheckCircle, Download, Share2, Printer, TrendingDown, Activity, Loader2,
    Eye, EyeOff, ArrowLeft, User, Home, Shield, Clock, Droplet, HeartPulse, Bone,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend } from 'recharts';

const StomachViewer = dynamic(
    () => import('@/components/three/StomachViewer'),
    { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ height: 256 }}><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div> }
);

const surgeryNames: Record<string,string> = { sleeve:'Sleeve Gastrectomy', bypass:'Roux-en-Y Bypass', bpdds:'BPD/DS', lapband:'Adjustable Gastric Band', sadis:'SADI-S', revisional:'Revisional Surgery' };

function getSurgeryData(surgery: string) {
    const stressProfiles: Record<string, {region:string;stress:number;threshold:number}[]> = {
        sleeve: [{region:'EG Junction',stress:22,threshold:50},{region:'Fundus',stress:31,threshold:50},{region:'Body',stress:45,threshold:50},{region:'Antrum',stress:28,threshold:50},{region:'Staple Line',stress:47,threshold:50}],
        bypass: [{region:'EG Junction',stress:18,threshold:50},{region:'Pouch',stress:38,threshold:50},{region:'Anastomosis',stress:52,threshold:50},{region:'Roux Limb',stress:24,threshold:50},{region:'Remnant',stress:12,threshold:50}],
        bpdds: [{region:'Sleeve Line',stress:42,threshold:50},{region:'Duodenal Division',stress:55,threshold:50},{region:'Ileal Anastomosis',stress:48,threshold:50},{region:'Common Channel',stress:30,threshold:50},{region:'Pylorus',stress:20,threshold:50}],
        lapband: [{region:'Supra-band',stress:15,threshold:50},{region:'Band Zone',stress:22,threshold:50},{region:'Sub-band',stress:10,threshold:50},{region:'Fundus',stress:8,threshold:50},{region:'Body',stress:6,threshold:50}],
        sadis: [{region:'Sleeve Line',stress:40,threshold:50},{region:'Duodenal Div.',stress:50,threshold:50},{region:'Anastomosis',stress:46,threshold:50},{region:'Body',stress:25,threshold:50},{region:'Pylorus',stress:18,threshold:50}],
        revisional: [{region:'Old Staple Line',stress:35,threshold:50},{region:'New Staple Line',stress:48,threshold:50},{region:'Adhesion Zone',stress:42,threshold:50},{region:'Anastomosis',stress:38,threshold:50},{region:'Body',stress:20,threshold:50}],
    };
    const weightLoss: Record<string, {month:string;weight:number;target:number}[]> = {
        sleeve: [{month:'0',weight:130,target:130},{month:'1',weight:122,target:124},{month:'3',weight:110,target:112},{month:'6',weight:95,target:98},{month:'9',weight:88,target:90},{month:'12',weight:82,target:85}],
        bypass: [{month:'0',weight:130,target:130},{month:'1',weight:118,target:120},{month:'3',weight:102,target:105},{month:'6',weight:88,target:90},{month:'9',weight:80,target:82},{month:'12',weight:76,target:78}],
        bpdds: [{month:'0',weight:130,target:130},{month:'1',weight:116,target:118},{month:'3',weight:98,target:100},{month:'6',weight:82,target:85},{month:'9',weight:74,target:76},{month:'12',weight:70,target:72}],
        lapband: [{month:'0',weight:130,target:130},{month:'1',weight:127,target:128},{month:'3',weight:120,target:122},{month:'6',weight:112,target:114},{month:'9',weight:106,target:108},{month:'12',weight:100,target:102}],
        sadis: [{month:'0',weight:130,target:130},{month:'1',weight:117,target:119},{month:'3',weight:100,target:103},{month:'6',weight:86,target:88},{month:'9',weight:78,target:80},{month:'12',weight:74,target:76}],
        revisional: [{month:'0',weight:120,target:120},{month:'1',weight:114,target:116},{month:'3',weight:106,target:108},{month:'6',weight:96,target:98},{month:'9',weight:90,target:92},{month:'12',weight:86,target:88}],
    };
    const metabolicRadar: Record<string, {metric:string;value:number;max:number}[]> = {
        sleeve: [{metric:'Diabetes',value:60,max:100},{metric:'Hypertension',value:52,max:100},{metric:'Sleep Apnea',value:55,max:100},{metric:'Dyslipidemia',value:48,max:100},{metric:'GERD',value:30,max:100},{metric:'Joint Pain',value:65,max:100}],
        bypass: [{metric:'Diabetes',value:83,max:100},{metric:'Hypertension',value:68,max:100},{metric:'Sleep Apnea',value:70,max:100},{metric:'Dyslipidemia',value:72,max:100},{metric:'GERD',value:85,max:100},{metric:'Joint Pain',value:75,max:100}],
        bpdds: [{metric:'Diabetes',value:95,max:100},{metric:'Hypertension',value:78,max:100},{metric:'Sleep Apnea',value:82,max:100},{metric:'Dyslipidemia',value:88,max:100},{metric:'GERD',value:70,max:100},{metric:'Joint Pain',value:80,max:100}],
        lapband: [{metric:'Diabetes',value:45,max:100},{metric:'Hypertension',value:35,max:100},{metric:'Sleep Apnea',value:40,max:100},{metric:'Dyslipidemia',value:30,max:100},{metric:'GERD',value:10,max:100},{metric:'Joint Pain',value:45,max:100}],
        sadis: [{metric:'Diabetes',value:88,max:100},{metric:'Hypertension',value:72,max:100},{metric:'Sleep Apnea',value:75,max:100},{metric:'Dyslipidemia',value:78,max:100},{metric:'GERD',value:65,max:100},{metric:'Joint Pain',value:78,max:100}],
        revisional: [{metric:'Diabetes',value:50,max:100},{metric:'Hypertension',value:40,max:100},{metric:'Sleep Apnea',value:45,max:100},{metric:'Dyslipidemia',value:42,max:100},{metric:'GERD',value:35,max:100},{metric:'Joint Pain',value:55,max:100}],
    };
    const riskBreakdown = [
        {name:'Tissue Quality',value:25,color:'#22c55e'},{name:'Compression',value:35,color:'#f59e0b'},
        {name:'Stapler Fit',value:20,color:'#3b82f6'},{name:'Patient Factors',value:20,color:'#8b5cf6'},
    ];
    const recommendations: Record<string, {type:string;text:string}[]> = {
        sleeve: [{type:'success',text:'Stapler selection appropriate for tissue thickness'},{type:'info',text:'Consider buttress reinforcement along staple line'},{type:'warning',text:'Monitor fundus region — thinnest wall area'},{type:'success',text:'Leak risk within acceptable limits'},{type:'info',text:'Post-op upper GI series recommended at 24h'}],
        bypass: [{type:'success',text:'Pouch size optimal at ~30mL'},{type:'warning',text:'Anastomotic stress slightly elevated — monitor closely'},{type:'info',text:'Ensure Roux limb length 100-150cm for optimal absorption'},{type:'success',text:'Marginal ulcer prophylaxis initiated'},{type:'warning',text:'High risk for dumping syndrome — dietary education critical'}],
        bpdds: [{type:'warning',text:'Highest complexity procedure — consider ICU monitoring 24h'},{type:'warning',text:'Duodenal division stress above threshold — reinforce'},{type:'info',text:'Common channel 75-100cm verified'},{type:'success',text:'Sleeve component within parameters'},{type:'warning',text:'Lifelong ADEK monitoring mandatory — schedule quarterly labs'}],
        lapband: [{type:'success',text:'Minimally invasive — lowest complication risk'},{type:'info',text:'Schedule first band adjustment at 4-6 weeks'},{type:'success',text:'No staple line — zero leak risk'},{type:'warning',text:'40% revision rate at 5 years — counsel patient'},{type:'info',text:'Monitor for band slippage/erosion symptoms'}],
        sadis: [{type:'success',text:'Simplified approach vs. BPD/DS — single anastomosis'},{type:'warning',text:'Duodenal division stress near threshold'},{type:'info',text:'Ileal loop length 250-300cm from ileocecal valve'},{type:'success',text:'Expected metabolic benefit comparable to BPD/DS'},{type:'warning',text:'Fat-soluble vitamin monitoring essential'}],
        revisional: [{type:'warning',text:'Adhesion density higher than primary — extended operative time'},{type:'warning',text:'Scarred tissue planes increase leak risk'},{type:'info',text:'Consider drain placement at revision site'},{type:'success',text:'Converted anatomy biomechanically sound'},{type:'warning',text:'Extended DVT prophylaxis recommended (21-30 days)'}],
    };
    return {
        stress: stressProfiles[surgery]||stressProfiles.sleeve,
        weight: weightLoss[surgery]||weightLoss.sleeve,
        metabolic: metabolicRadar[surgery]||metabolicRadar.sleeve,
        risk: riskBreakdown,
        recs: recommendations[surgery]||recommendations.sleeve,
    };
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const patientName = searchParams.get('patientName') || 'John Smith';
    const patientId = searchParams.get('patientId') || '';
    const surgery = searchParams.get('surgery') || 'sleeve';
    const [showDetailed, setShowDetailed] = useState(false);
    const data = getSurgeryData(surgery);

    const leakRisk = surgery==='lapband'?0.4:surgery==='bpdds'?5.6:surgery==='revisional'?6.1:surgery==='bypass'?4.8:3.2;
    const maxStress = Math.max(...data.stress.map(s=>s.stress));
    const successRate = Math.max(82, Math.min(98, 96 - leakRisk * 2.5));

    const tooltipStyle = { backgroundColor:'#111', border:'1px solid #2a2a2a', borderRadius:4, fontSize:12 };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center gap-4">
                <Link href={`/simulation?patientId=${patientId}&patientName=${patientName}`} className="page-back" style={{ marginBottom:0 }}><ArrowLeft className="w-4 h-4" /> Back to Simulation</Link>
                <Link href="/" className="page-back" style={{ marginBottom:0 }}><Home className="w-4 h-4" /> Home</Link>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title" style={{ marginBottom:4 }}>Detailed Simulation Report</h1>
                    <p className="text-[#94a3b8] flex items-center gap-1 text-sm">
                        <User className="w-3.5 h-3.5" />
                        {decodeURIComponent(patientName)} • {surgeryNames[surgery]||surgery}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="np-nav-btn np-nav-btn--secondary flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
                    <button className="np-nav-btn np-nav-btn--secondary flex items-center gap-2"><Share2 className="w-4 h-4" />Share</button>
                    <button className="np-nav-btn np-nav-btn--primary flex items-center gap-2"><Printer className="w-4 h-4" />Print Report</button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="page-glass">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Success Rate</span>
                        <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-400">{successRate.toFixed(1)}%</div>
                    <div className="h-1.5 w-full bg-white/10 rounded mt-2"><div className="h-full bg-emerald-500/60 rounded" style={{width:`${successRate}%`}} /></div>
                </motion.div>
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="page-glass">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Leak Risk</span>
                        {leakRisk<4?<CheckCircle className="w-5 h-5 text-green-400" />:<AlertTriangle className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div className={`text-3xl font-bold ${leakRisk<4?'text-green-400':'text-amber-400'}`}>{leakRisk}%</div>
                    <div className="text-sm text-[#64748b] mt-1">{leakRisk<4?'Low risk':'Moderate risk'}</div>
                </motion.div>
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="page-glass">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Max Stress</span>
                        <Activity className={`w-5 h-5 ${maxStress>50?'text-red-400':'text-amber-400'}`} />
                    </div>
                    <div className={`text-3xl font-bold ${maxStress>50?'text-red-400':'text-amber-400'}`}>{maxStress} MPa</div>
                    <div className="text-sm text-[#64748b] mt-1">{maxStress>50?'Above threshold':'Below threshold (50)'}</div>
                </motion.div>
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="page-glass">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Surgery Type</span>
                        <Bone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400">{surgeryNames[surgery]?.split(' ')[0]||'Sleeve'}</div>
                    <div className="text-sm text-[#64748b] mt-1">{surgeryNames[surgery]||surgery}</div>
                </motion.div>
            </div>

            {/* 3D + Risk chart row */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 page-glass">
                    <h3 className="font-semibold mb-4 text-white">Stress Visualization</h3>
                    <div style={{ height:320 }}><StomachViewer showStress={true} showStapleLine={true} surgeryType={surgery} /></div>
                    <div className="mt-4 p-3 rounded-lg flex items-center justify-between" style={{background:'rgba(255,255,255,0.04)'}}>
                        <div className="flex items-center gap-4">
                            {[['#0ea5e9','Low'],['#22c55e','Safe'],['#eab308','Medium'],['#dc2626','High']].map(([c,l])=>(
                                <div key={l} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:c as string}} /><span className="text-sm text-[#cbd5e1]">{l}</span></div>
                            ))}
                        </div>
                        <span className="text-sm text-[#64748b]">Drag to rotate • Scroll to zoom</span>
                    </div>
                </div>
                <div className="page-glass">
                    <h3 className="font-semibold mb-4 text-white">Risk Factor Breakdown</h3>
                    <div style={{height:192}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={data.risk} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                                {data.risk.map((e,i)=><Cell key={i} fill={e.color} />)}
                            </Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                        {data.risk.map(item=>(
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:item.color}} /><span className="text-sm text-[#cbd5e1]">{item.name}</span></div>
                                <span className="text-sm font-medium text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toggle + Action buttons */}
            <div className="flex justify-center gap-3">
                <button onClick={()=>setShowDetailed(!showDetailed)} className="np-nav-btn np-nav-btn--primary flex items-center gap-2 !px-6 !py-3">
                    {showDetailed?<EyeOff className="w-4 h-4" />:<Eye className="w-4 h-4" />}
                    {showDetailed?'Hide Detailed Analysis':'View Detailed Analysis'}
                </button>
                <Link href={`/diet?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="np-nav-btn np-nav-btn--secondary flex items-center gap-2 !px-6 !py-3" style={{borderColor:'rgba(52,211,153,0.4)',color:'#6ee7b7'}}>
                    <Droplet className="w-4 h-4" /> Post Surgery Diet
                </Link>
                <Link href={`/medication?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="np-nav-btn np-nav-btn--secondary flex items-center gap-2 !px-6 !py-3" style={{borderColor:'rgba(96,165,250,0.4)',color:'#93c5fd'}}>
                    <HeartPulse className="w-4 h-4" /> Medication
                </Link>
            </div>

            {showDetailed && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="space-y-6">
                    {/* Stress by Region */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Regional Stress Analysis</h3>
                        <div style={{height:280}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.stress}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="region" stroke="#a0a0a0" tick={{fontSize:11}} />
                                    <YAxis stroke="#a0a0a0" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="stress" fill="#3b82f6" radius={[4,4,0,0]} />
                                    <Bar dataKey="threshold" fill="#ef4444" fillOpacity={0.2} radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weight Loss Projection + Metabolic Radar */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="page-glass">
                            <h3 className="font-semibold mb-4 text-white">12-Month Weight Projection (kg)</h3>
                            <div style={{height:280}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.weight}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                        <XAxis dataKey="month" stroke="#a0a0a0" label={{value:'Month',position:'bottom',fill:'#64748b',fontSize:11}} />
                                        <YAxis stroke="#a0a0a0" />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Legend />
                                        <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{fill:'#22c55e'}} name="Projected" />
                                        <Line type="monotone" dataKey="target" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Target" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="page-glass">
                            <h3 className="font-semibold mb-4 text-white">Comorbidity Resolution (%)</h3>
                            <div style={{height:280}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={data.metabolic}>
                                        <PolarGrid stroke="#2a2a2a" />
                                        <PolarAngleAxis dataKey="metric" stroke="#a0a0a0" tick={{fontSize:10}} />
                                        <PolarRadiusAxis angle={90} domain={[0,100]} stroke="#2a2a2a" tick={{fontSize:9}} />
                                        <Radar name="Resolution %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Clinical Recommendations</h3>
                        <div className="space-y-3">
                            {data.recs.map((rec,i)=>(
                                <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                                    className="flex items-start gap-3 p-4 rounded-lg"
                                    style={{background: rec.type==='success'?'rgba(34,197,94,0.08)':rec.type==='warning'?'rgba(245,158,11,0.08)':'rgba(59,130,246,0.08)'}}>
                                    {rec.type==='success'&&<CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                    {rec.type==='warning'&&<AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                                    {rec.type==='info'&&<Activity className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                                    <span className="text-[#cbd5e1]">{rec.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href={`/diet?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="page-glass flex items-center gap-3 hover:border-emerald-500/30 transition group">
                            <Droplet className="w-8 h-8 text-emerald-400" />
                            <div><p className="text-white font-semibold group-hover:text-emerald-300 transition">Post Surgery Diet Plan</p><p className="text-sm text-[#64748b]">7-day phased recovery diet →</p></div>
                        </Link>
                        <Link href={`/medication?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="page-glass flex items-center gap-3 hover:border-blue-500/30 transition group">
                            <HeartPulse className="w-8 h-8 text-blue-400" />
                            <div><p className="text-white font-semibold group-hover:text-blue-300 transition">Medication Protocol</p><p className="text-sm text-[#64748b]">Full prescription plan →</p></div>
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{minHeight:'60vh'}}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
            <ResultsContent />
        </Suspense>
    );
}
