'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Pill, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const surgeryNames: Record<string,string> = { sleeve:'Sleeve Gastrectomy', bypass:'Roux-en-Y Bypass', bpdds:'BPD/DS', lapband:'Adjustable Gastric Band', sadis:'SADI-S', revisional:'Revisional Surgery' };

interface Med { name:string; dosage:string; frequency:string; duration:string; purpose:string; category:string; important?:boolean; notes?:string }

const medicationPlans: Record<string, Med[]> = {
    sleeve: [
        { name:'Omeprazole (Prilosec)', dosage:'40 mg', frequency:'Once daily (AM, 30 min before food)', duration:'3–6 months', purpose:'Proton pump inhibitor — prevents gastric ulcers and protects staple line from acid damage', category:'GI Protection', important:true },
        { name:'Ondansetron (Zofran)', dosage:'4 mg', frequency:'Every 8 hours as needed', duration:'1–2 weeks', purpose:'Anti-nausea — controls post-operative nausea and vomiting', category:'Symptom Relief' },
        { name:'Acetaminophen (Tylenol)', dosage:'500 mg', frequency:'Every 6 hours as needed', duration:'2–4 weeks', purpose:'Pain management (avoid NSAIDs — they can damage stomach lining)', category:'Pain Management', important:true, notes:'Do NOT take ibuprofen, aspirin, or naproxen' },
        { name:'Enoxaparin (Lovenox)', dosage:'40 mg subcutaneous', frequency:'Once daily', duration:'10–14 days', purpose:'Blood thinner — prevents deep vein thrombosis (DVT) post-surgery', category:'DVT Prevention', important:true },
        { name:'Bariatric Multivitamin', dosage:'1 chewable tablet', frequency:'Twice daily', duration:'Lifelong', purpose:'Comprehensive vitamin/mineral supplementation for reduced absorption', category:'Nutritional', important:true },
        { name:'Calcium Citrate + Vitamin D3', dosage:'600 mg calcium / 800 IU D3', frequency:'Twice daily (separate from multivitamin by 2 hrs)', duration:'Lifelong', purpose:'Prevents calcium deficiency and osteoporosis', category:'Nutritional' },
        { name:'Vitamin B12 (Sublingual)', dosage:'1000 mcg', frequency:'Once daily', duration:'Lifelong', purpose:'Prevents B12 deficiency — absorption reduced after surgery', category:'Nutritional' },
        { name:'Iron Supplement (Ferrous Sulfate)', dosage:'65 mg elemental iron', frequency:'Once daily (with Vitamin C)', duration:'Lifelong (if deficient)', purpose:'Prevents iron-deficiency anemia', category:'Nutritional', notes:'Take 2 hours apart from calcium' },
        { name:'Ursodiol (Actigall)', dosage:'300 mg', frequency:'Twice daily', duration:'6 months', purpose:'Prevents gallstone formation during rapid weight loss', category:'GI Protection' },
    ],
    bypass: [
        { name:'Omeprazole (Prilosec)', dosage:'40 mg', frequency:'Once daily (AM)', duration:'Lifelong (or as directed)', purpose:'Protects gastric pouch — marginal ulcer prevention', category:'GI Protection', important:true },
        { name:'Ondansetron (Zofran)', dosage:'4 mg ODT', frequency:'Every 8 hours as needed', duration:'1–2 weeks', purpose:'Controls post-operative nausea', category:'Symptom Relief' },
        { name:'Acetaminophen (liquid)', dosage:'500 mg', frequency:'Every 6 hours as needed', duration:'2–4 weeks', purpose:'Pain management — liquid form for easier absorption', category:'Pain Management', important:true, notes:'Absolutely NO NSAIDs — high marginal ulcer risk' },
        { name:'Enoxaparin (Lovenox)', dosage:'40 mg subcutaneous', frequency:'Once daily', duration:'14–21 days', purpose:'DVT prevention — extended due to longer operative time', category:'DVT Prevention', important:true },
        { name:'Bariatric Multivitamin (ASMBS formula)', dosage:'2 chewable tablets', frequency:'Daily (split AM/PM)', duration:'Lifelong', purpose:'Enhanced formula with 200% DV of most micronutrients for malabsorptive procedure', category:'Nutritional', important:true },
        { name:'Calcium Citrate + Vitamin D3', dosage:'600 mg / 1000 IU', frequency:'Three times daily', duration:'Lifelong', purpose:'1500-1800mg/day calcium needed due to duodenal bypass', category:'Nutritional', important:true, notes:'Must be CITRATE form — carbonate not absorbed' },
        { name:'Vitamin B12 (Sublingual)', dosage:'1000 mcg', frequency:'Once daily', duration:'Lifelong', purpose:'Intrinsic factor bypass — sublingual or injection required', category:'Nutritional', important:true },
        { name:'Iron (Ferrous Fumarate)', dosage:'65 mg + 250 mg Vitamin C', frequency:'Once daily', duration:'Lifelong', purpose:'High deficiency risk — duodenum bypassed', category:'Nutritional', important:true, notes:'Menstruating women: 2x daily' },
        { name:'Thiamine (Vitamin B1)', dosage:'100 mg', frequency:'Once daily', duration:'3–6 months (then reassess)', purpose:'Prevents Wernicke encephalopathy during rapid weight loss', category:'Nutritional' },
        { name:'Ursodiol (Actigall)', dosage:'300 mg', frequency:'Twice daily', duration:'6 months', purpose:'Gallstone prevention', category:'GI Protection' },
    ],
    bpdds: [
        { name:'Omeprazole', dosage:'40 mg', frequency:'Once daily', duration:'6–12 months', purpose:'Gastric acid control, staple line protection', category:'GI Protection', important:true },
        { name:'Acetaminophen', dosage:'500 mg', frequency:'Every 6 hours PRN', duration:'2–4 weeks', purpose:'Pain management — NO NSAIDs', category:'Pain Management', important:true },
        { name:'Enoxaparin', dosage:'40 mg SC', frequency:'Once daily', duration:'21–30 days', purpose:'Extended DVT prevention — highest risk procedure', category:'DVT Prevention', important:true },
        { name:'ADEK Vitamin (Fat-Soluble)', dosage:'1 capsule', frequency:'Once daily', duration:'Lifelong', purpose:'Critical fat-soluble vitamin supplementation (A, D, E, K)', category:'Nutritional', important:true, notes:'Most critical medication — deficiency can cause blindness (Vit A), osteoporosis (D), bleeding (K)' },
        { name:'Bariatric Multivitamin', dosage:'2 tablets', frequency:'Daily', duration:'Lifelong', purpose:'Comprehensive micronutrient coverage', category:'Nutritional', important:true },
        { name:'Calcium Citrate + D3', dosage:'600 mg / 1000 IU', frequency:'Three times daily', duration:'Lifelong', purpose:'1800-2400mg/day — highest calcium requirement', category:'Nutritional', important:true },
        { name:'Vitamin B12', dosage:'1000 mcg sublingual (or monthly injection)', frequency:'Daily', duration:'Lifelong', purpose:'B12 deficiency prevention', category:'Nutritional' },
        { name:'Iron + Vitamin C', dosage:'65 mg / 500 mg', frequency:'Twice daily', duration:'Lifelong', purpose:'High malabsorption risk', category:'Nutritional', important:true },
        { name:'Zinc Sulfate', dosage:'220 mg', frequency:'Once daily', duration:'Lifelong', purpose:'Zinc malabsorption — prevents hair loss, immune dysfunction', category:'Nutritional' },
        { name:'Pancreatic Enzyme (Creon)', dosage:'10,000–25,000 units', frequency:'With each meal', duration:'As needed (if steatorrhea)', purpose:'Aids fat digestion if malabsorptive symptoms present', category:'GI Protection', notes:'Only if fatty/oily stools occur' },
        { name:'Ursodiol', dosage:'300 mg', frequency:'Twice daily', duration:'6 months', purpose:'Gallstone prevention', category:'GI Protection' },
    ],
    lapband: [
        { name:'Omeprazole', dosage:'20 mg', frequency:'Once daily', duration:'4–6 weeks', purpose:'Prevents acid reflux around band', category:'GI Protection' },
        { name:'Ondansetron', dosage:'4 mg', frequency:'As needed', duration:'1 week', purpose:'Post-operative nausea control', category:'Symptom Relief' },
        { name:'Acetaminophen', dosage:'500 mg', frequency:'Every 6 hours PRN', duration:'1–2 weeks', purpose:'Mild pain management', category:'Pain Management', notes:'NSAIDs permitted after 2 weeks (no staple line)' },
        { name:'Bariatric Multivitamin', dosage:'1 chewable tablet', frequency:'Once daily', duration:'Lifelong', purpose:'General nutritional supplementation', category:'Nutritional' },
        { name:'Vitamin D3', dosage:'2000 IU', frequency:'Once daily', duration:'Lifelong', purpose:'Maintains bone density during weight loss', category:'Nutritional' },
    ],
    sadis: [
        { name:'Omeprazole', dosage:'40 mg', frequency:'Once daily', duration:'6–12 months', purpose:'Staple line and anastomosis protection', category:'GI Protection', important:true },
        { name:'Acetaminophen', dosage:'500 mg', frequency:'Every 6 hours PRN', duration:'2–4 weeks', purpose:'Pain management — NO NSAIDs', category:'Pain Management', important:true },
        { name:'Enoxaparin', dosage:'40 mg SC', frequency:'Once daily', duration:'14–21 days', purpose:'DVT prevention', category:'DVT Prevention', important:true },
        { name:'ADEK Vitamin', dosage:'1 capsule', frequency:'Once daily', duration:'Lifelong', purpose:'Fat-soluble vitamin supplementation', category:'Nutritional', important:true },
        { name:'Bariatric Multivitamin', dosage:'2 tablets', frequency:'Daily', duration:'Lifelong', purpose:'Comprehensive supplementation', category:'Nutritional', important:true },
        { name:'Calcium Citrate + D3', dosage:'600 mg / 1000 IU', frequency:'Three times daily', duration:'Lifelong', purpose:'1500-2000mg/day calcium requirement', category:'Nutritional', important:true },
        { name:'Vitamin B12', dosage:'1000 mcg', frequency:'Daily (sublingual)', duration:'Lifelong', purpose:'B12 deficiency prevention', category:'Nutritional' },
        { name:'Iron + Vitamin C', dosage:'65 mg / 250 mg', frequency:'Once daily', duration:'Lifelong', purpose:'Iron deficiency prevention', category:'Nutritional' },
        { name:'Ursodiol', dosage:'300 mg', frequency:'Twice daily', duration:'6 months', purpose:'Gallstone prevention', category:'GI Protection' },
    ],
    revisional: [
        { name:'Omeprazole', dosage:'40 mg', frequency:'Once daily', duration:'6–12 months', purpose:'Acid suppression — critical with revised anatomy', category:'GI Protection', important:true },
        { name:'Ondansetron', dosage:'4-8 mg', frequency:'Every 6-8 hours PRN', duration:'2 weeks', purpose:'Nausea control — higher incidence post-revision', category:'Symptom Relief' },
        { name:'Acetaminophen', dosage:'500 mg', frequency:'Every 6 hours PRN', duration:'2–4 weeks', purpose:'Pain management — avoid NSAIDs', category:'Pain Management', important:true },
        { name:'Enoxaparin', dosage:'40 mg SC', frequency:'Once daily', duration:'21–30 days', purpose:'Extended DVT prevention — higher adhesion risk', category:'DVT Prevention', important:true },
        { name:'Bariatric Multivitamin', dosage:'2 tablets', frequency:'Daily', duration:'Lifelong', purpose:'Based on current anatomy — follow specific revision type', category:'Nutritional', important:true },
        { name:'Calcium Citrate + D3', dosage:'600 mg / 800 IU', frequency:'2-3 times daily', duration:'Lifelong', purpose:'Adjusted based on revision type', category:'Nutritional' },
        { name:'Vitamin B12', dosage:'1000 mcg', frequency:'Daily', duration:'Lifelong', purpose:'B12 supplementation', category:'Nutritional' },
        { name:'Carafate (Sucralfate)', dosage:'1 g', frequency:'Four times daily (before meals & bedtime)', duration:'4–6 weeks', purpose:'Coats and protects revised staple line / anastomosis', category:'GI Protection', important:true },
        { name:'Ursodiol', dosage:'300 mg', frequency:'Twice daily', duration:'6 months', purpose:'Gallstone prevention during weight loss', category:'GI Protection' },
    ],
};

const catColors:Record<string,string> = { 'GI Protection':'#22d3ee', 'Symptom Relief':'#a78bfa', 'Pain Management':'#f59e0b', 'DVT Prevention':'#ef4444', 'Nutritional':'#22c55e' };

function MedicationContent() {
    const sp = useSearchParams();
    const surgery = sp.get('surgery')||'sleeve';
    const patientName = sp.get('patientName')||'';
    const patientId = sp.get('patientId')||'';
    const meds = medicationPlans[surgery]||medicationPlans.sleeve;
    const categories = [...new Set(meds.map(m=>m.category))];

    return (
        <div className="space-y-5 pb-6">
            <div>
                <Link href={`/results?patientId=${patientId}&patientName=${patientName}&surgery=${surgery}`} className="page-back"><ArrowLeft className="h-4 w-4" /> Back to Detailed Simulation Report</Link>
                <h1 className="mt-1 text-4xl font-semibold italic tracking-tight text-[#f6e9d3]" style={{ fontFamily:'Georgia, serif' }}>Post-Operative Medication</h1>
                <p className="text-sm text-[#8b8f98] mt-1">Surgery: <span className="text-[#f0dbbe]">{surgeryNames[surgery]||surgery}</span> • Patient: <span className="text-[#f0dbbe]">{decodeURIComponent(patientName)||'Patient'}</span></p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-5 gap-2">
                {categories.map(cat=>{
                    const count = meds.filter(m=>m.category===cat).length;
                    const color = catColors[cat]||'#8b8f98';
                    return (
                        <div key={cat} className="border border-white/10 bg-[#070707] p-3 text-center">
                            <div className="h-2 w-2 rounded-full mx-auto mb-1" style={{backgroundColor:color}} />
                            <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">{cat}</p>
                            <p className="text-lg font-bold" style={{color}}>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Medications by category */}
            {categories.map(cat=>(
                <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:catColors[cat]||'#8b8f98'}} />
                        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{color:catColors[cat]||'#8b8f98'}}>{cat}</p>
                    </div>
                    <div className="space-y-2">
                        {meds.filter(m=>m.category===cat).map((med,i)=>(
                            <div key={i} className={`border bg-[#070707] p-4 ${med.important?'border-[#d4b891]/40':'border-white/10'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                        <Pill className="h-4 w-4 mt-0.5 text-[#d4c0a2]" />
                                        <div>
                                            <p className="text-sm font-semibold text-[#f2dfc3]">{med.name}{med.important && <span className="ml-2 text-[8px] uppercase bg-[#d4b891]/20 text-[#d4b891] px-1.5 py-0.5 rounded-full">Critical</span>}</p>
                                            <p className="text-xs text-[#8b8f98] mt-0.5">{med.purpose}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-3 ml-6">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Dosage</p>
                                        <p className="text-xs font-bold text-[#f0dbbe] mt-0.5">{med.dosage}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Frequency</p>
                                        <p className="text-xs text-[#c9c9cb] mt-0.5">{med.frequency}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Duration</p>
                                        <p className="text-xs text-[#c9c9cb] mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />{med.duration}</p>
                                    </div>
                                </div>
                                {med.notes && (
                                    <div className="mt-2 ml-6 flex items-start gap-1.5 text-[11px] text-amber-400/80 bg-amber-500/5 p-2 border border-amber-500/10">
                                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />{med.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
}

export default function MedicationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{minHeight:'60vh'}}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
            <MedicationContent />
        </Suspense>
    );
}
