'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Droplet, Apple, Beef, Coffee, Moon, Sun, Sunset } from 'lucide-react';

const surgeryNames: Record<string,string> = { sleeve:'Sleeve Gastrectomy', bypass:'Roux-en-Y Bypass', bpdds:'BPD/DS', lapband:'Adjustable Gastric Band', sadis:'SADI-S', revisional:'Revisional Surgery' };

interface Meal { time:string; icon:any; name:string; items:string[]; calories:number; protein:number }
interface DayPlan { day:number; phase:string; phaseColor:string; meals:Meal[] }

function getDietPlan(surgery:string):DayPlan[] {
    const isMinimal = surgery==='lapband';
    const isHeavy = surgery==='bpdds'||surgery==='sadis';
    const base:DayPlan[] = [
        { day:1, phase:'Clear Liquids', phaseColor:'#22d3ee', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Water (sip slowly, 30ml/15min)','Sugar-free gelatin','Clear broth (chicken/vegetable)'], calories:50, protein:2 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Diluted apple juice (no sugar)','Clear protein water','Ice chips'], calories:40, protein:5 },
            { time:'6:00 PM', icon:Sunset, name:'Evening', items:['Warm bone broth','Herbal tea (decaf)','Sugar-free popsicle'], calories:45, protein:4 },
        ]},
        { day:2, phase:'Clear Liquids', phaseColor:'#22d3ee', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Water with electrolytes','Clear protein drink (15g)','Broth'], calories:80, protein:15 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Sugar-free gelatin','Diluted coconut water','Clear soup'], calories:60, protein:5 },
            { time:'6:00 PM', icon:Sunset, name:'Evening', items:['Bone broth (low sodium)','Herbal chamomile tea','Protein water'], calories:70, protein:12 },
        ]},
        { day:3, phase:'Full Liquids', phaseColor:'#a78bfa', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Protein shake (whey isolate, 20g)','Skim milk (60ml)'], calories:140, protein:22 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Cream of chicken soup (strained)','Greek yogurt (plain, thin)'], calories:120, protein:14 },
            { time:'3:00 PM', icon:Sunset, name:'Snack', items:['Sugar-free pudding','Protein water'], calories:80, protein:8 },
            { time:'6:00 PM', icon:Moon, name:'Evening', items:['Cream of mushroom soup (strained)','Protein shake'], calories:150, protein:20 },
        ]},
        { day:4, phase:'Full Liquids', phaseColor:'#a78bfa', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Protein shake with banana (blended thin)','Skim milk'], calories:160, protein:24 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Tomato soup (strained, no chunks)','Cottage cheese (blended)'], calories:130, protein:16 },
            { time:'6:00 PM', icon:Moon, name:'Evening', items:['Split pea soup (strained)','Sugar-free pudding','Protein water'], calories:140, protein:18 },
        ]},
        { day:5, phase:'Pureed Foods', phaseColor:'#f59e0b', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Scrambled egg (pureed, 1 egg)','Applesauce (unsweetened, 2 tbsp)'], calories:120, protein:12 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Pureed chicken (2 oz) with gravy','Mashed sweet potato (2 tbsp)','Protein shake'], calories:180, protein:22 },
            { time:'3:00 PM', icon:Sunset, name:'Snack', items:['Greek yogurt (4 oz, plain)','Pureed banana (1 tbsp)'], calories:90, protein:10 },
            { time:'6:00 PM', icon:Moon, name:'Evening', items:['Pureed fish (2 oz)','Mashed cauliflower (2 tbsp)','Broth'], calories:160, protein:20 },
        ]},
        { day:6, phase:'Pureed Foods', phaseColor:'#f59e0b', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Ricotta cheese (3 tbsp)','Pureed peaches (2 tbsp)','Protein shake'], calories:170, protein:18 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Pureed turkey (2 oz)','Hummus (2 tbsp)','Avocado (pureed, 1 tbsp)'], calories:190, protein:20 },
            { time:'6:00 PM', icon:Moon, name:'Evening', items:['Pureed lentil soup','Mashed banana','Protein water'], calories:160, protein:16 },
        ]},
        { day:7, phase:'Soft Foods Introduction', phaseColor:'#22c55e', meals:[
            { time:'8:00 AM', icon:Coffee, name:'Morning', items:['Soft scrambled egg (1)','Cottage cheese (3 tbsp)','Herbal tea'], calories:140, protein:16 },
            { time:'12:00 PM', icon:Sun, name:'Midday', items:['Soft flaked fish (2 oz)','Well-cooked zucchini (2 tbsp)','Greek yogurt'], calories:200, protein:24 },
            { time:'3:00 PM', icon:Sunset, name:'Snack', items:['String cheese (1 stick)','Applesauce'], calories:100, protein:8 },
            { time:'6:00 PM', icon:Moon, name:'Evening', items:['Ground turkey (2 oz, moist)','Mashed potato (2 tbsp)','Steamed carrots (soft)'], calories:210, protein:22 },
        ]},
    ];
    if(isHeavy) base.forEach(d=>d.meals.forEach(m=>{ m.protein=Math.round(m.protein*1.3); m.items.push('+ Extra protein supplement'); }));
    if(isMinimal) base.forEach(d=>{ d.meals.forEach(m=>{ m.calories=Math.round(m.calories*1.15); }); });
    return base;
}

const guidelines:Record<string,string[]> = {
    sleeve:['Sip water slowly — no gulping, max 30ml every 15 min','No straws for 4 weeks (prevents air swallowing)','Separate food and drink by 30 minutes','Chew each bite 25-30 times when on soft foods','Stop eating at first feeling of fullness','No carbonated beverages for 3 months','Daily protein target: 60-80g','Take bariatric multivitamin daily'],
    bypass:['Sip water slowly — no gulping or straws','Avoid sugar >5g per serving (dumping syndrome risk)','Separate food and drink by 30 minutes','No caffeine for 1 month','Daily protein target: 60-80g','Take bariatric-specific multivitamin with iron','Calcium citrate 1200-1500mg/day in divided doses','Sublingual B12 supplementation'],
    bpdds:['Highest protein requirement: 80-120g/day','Fat-soluble vitamin supplements critical (A, D, E, K)','Separate food and drink by 30 minutes','Expect more frequent bowel movements','Calcium citrate 1800-2400mg/day','Monitor for protein malnutrition signs','No sugar or simple carbohydrates','Drink 64oz+ fluids daily'],
    lapband:['Eat slowly — 20-30 minutes per meal','Small bites, chew thoroughly (20-25 times)','Stop at first sense of restriction','No drinking during meals or 30 min after','Avoid bread, pasta, tough meats initially','If stuck feeling occurs, stop eating immediately','Follow up for band adjustment at 4-6 weeks','Protein target: 60g/day'],
    sadis:['High protein focus: 80-100g/day','Fat-soluble vitamin supplements required','Separate food and drink by 30 minutes','Expect changes in bowel habits','Calcium citrate 1500-2000mg/day','Monitor fat-soluble vitamin levels quarterly','Avoid concentrated sweets','Stay hydrated: 64oz+ daily'],
    revisional:['Follow surgeon-specific guidance closely','Tissue healing may be slower — extend liquid phase if needed','Protein target: 60-80g/day','Monitor for leak symptoms (fever, left shoulder pain)','Anti-nausea medication as prescribed','Gradual progression — do not rush phases','Bariatric multivitamin daily','Report any unusual pain immediately'],
};

function DietContent() {
    const sp = useSearchParams();
    const surgery = sp.get('surgery')||'sleeve';
    const patientName = sp.get('patientName')||'';
    const patientId = sp.get('patientId')||'';
    const [selectedDay, setSelectedDay] = useState(0);
    const plan = getDietPlan(surgery);
    const day = plan[selectedDay];
    const totalCal = day.meals.reduce((a,m)=>a+m.calories,0);
    const totalPro = day.meals.reduce((a,m)=>a+m.protein,0);
    const g = guidelines[surgery]||guidelines.sleeve;

    return (
        <div className="space-y-5 pb-6">
            <div>
                <Link href={`/results?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="page-back"><ArrowLeft className="h-4 w-4" /> Back to Detailed Simulation Report</Link>
                <h1 className="mt-1 text-4xl font-semibold italic tracking-tight text-[#f6e9d3]" style={{ fontFamily:'Georgia, serif' }}>Post Surgery Diet Plan</h1>
                <p className="text-sm text-[#8b8f98] mt-1">Surgery: <span className="text-[#f0dbbe]">{surgeryNames[surgery]||surgery}</span> • Patient: <span className="text-[#f0dbbe]">{decodeURIComponent(patientName)||'Patient'}</span></p>
            </div>

            {/* Day selector */}
            <div className="flex gap-2">
                {plan.map((d,i)=>(
                    <button key={i} onClick={()=>setSelectedDay(i)} className={`flex-1 border p-2 text-center transition ${selectedDay===i?'border-[#d4b891] bg-[#181512]':'border-white/10 bg-[#070707] hover:border-white/20'}`}>
                        <p className={`text-xs font-bold ${selectedDay===i?'text-[#f2dfc3]':'text-[#8b8f98]'}`}>Day {d.day}</p>
                        <p className="text-[8px] uppercase tracking-wider mt-0.5" style={{color:d.phaseColor}}>{d.phase}</p>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
                {/* Meals */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#6f7480]">Day {day.day} — <span style={{color:day.phaseColor}}>{day.phase}</span></p>
                        <div className="flex gap-3 text-xs text-[#8b8f98]">
                            <span>Total: <span className="text-[#f0dbbe] font-bold">{totalCal} cal</span></span>
                            <span>Protein: <span className="text-emerald-400 font-bold">{totalPro}g</span></span>
                        </div>
                    </div>
                    {day.meals.map((meal,i)=>{
                        const Icon = meal.icon;
                        return (
                            <div key={i} className="border border-white/10 bg-[#070707] p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-[#d4c0a2]" />
                                        <span className="text-sm font-semibold text-[#f2dfc3]">{meal.name}</span>
                                        <span className="text-[10px] text-[#6f7480]">{meal.time}</span>
                                    </div>
                                    <div className="flex gap-3 text-[10px]">
                                        <span className="text-[#8b8f98]">{meal.calories} cal</span>
                                        <span className="text-emerald-400">{meal.protein}g protein</span>
                                    </div>
                                </div>
                                <ul className="space-y-1 ml-6">
                                    {meal.items.map((item,j)=>(
                                        <li key={j} className="text-xs text-[#c9c9cb] flex items-start gap-2">
                                            <span className="text-[#6f7480] mt-0.5">•</span>{item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Guidelines sidebar */}
                <div className="space-y-3">
                    <div className="border border-white/10 bg-[#070707] p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480] mb-3 flex items-center gap-2"><Apple className="h-3.5 w-3.5" /> Important Guidelines</p>
                        <div className="space-y-2">
                            {g.map((rule,i)=>(
                                <div key={i} className="flex items-start gap-2 text-xs text-[#c9c9cb]">
                                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>{rule}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border border-white/10 bg-[#070707] p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Phase Progression</p>
                        {['Clear Liquids','Full Liquids','Pureed Foods','Soft Foods'].map((phase,i)=>(
                            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                                <div className="h-2 w-2 rounded-full" style={{backgroundColor:['#22d3ee','#a78bfa','#f59e0b','#22c55e'][i]}} />
                                <span className="text-xs text-[#c9c9cb] flex-1">{phase}</span>
                                <span className="text-[10px] text-[#6f7480]">Day {[1,3,5,7][i]}-{[2,4,6,14][i]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border border-red-500/20 bg-red-500/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">⚠ Warning</p>
                        <p className="text-[11px] text-red-300/80 leading-4">This diet plan is a general guideline. Always follow your bariatric surgeon and dietitian's specific instructions. Report any nausea, vomiting, or inability to tolerate fluids immediately.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DietPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{minHeight:'60vh'}}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
            <DietContent />
        </Suspense>
    );
}
