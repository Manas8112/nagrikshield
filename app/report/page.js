'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '../lib/seedData';
import { runFusionPipeline } from '../lib/aiEngine';
import { generateDNA, isDuplicate } from '../lib/issueDNA';
import { getCascadeTree, flattenCascade, getPreventionSavings } from '../lib/cascadeEngine';
import { getResolution, fillTemplate, getSeverityLevel } from '../lib/resolutionKB';
import { generateDescription, generateTitle } from '../lib/nlgEngine';
import { addIssue, getIssues, processUserAction, updateNeighborhoodVitals } from '../lib/storage';
import { useAuth } from '../lib/authProvider';
import { Camera, Folder, Brain, Zap, ClipboardList, Send, MapPin, ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, UploadCloud, CheckCircle, Droplets, Trash2, Lightbulb, Hammer } from 'lucide-react';

const STEPS = [
  { label: 'Capture', icon: Camera },
  { label: 'Category', icon: Folder },
  { label: 'Fusion Pipeline', icon: Brain },
  { label: 'Cascade', icon: Zap },
  { label: 'Resolution', icon: ClipboardList },
  { label: 'Submit', icon: Send },
];

const CATEGORY_LIST = Object.values(CATEGORIES);

const DynamicLocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [imageData, setImageData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [cascadeData, setCascadeData] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [customDescription, setCustomDescription] = useState('');
  const [stakeAmount, setStakeAmount] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState(null);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  
  // Pipeline Animation State
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0); // 0 to 4

  const [landmark, setLandmark] = useState('');
  const [location, setLocation] = useState({ lat: 12.9352, lng: 77.6245 });
  const fileInputRef = useRef(null);

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} 
      );
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageData(ev.target.result);
        getLocation();
      };
      reader.readAsDataURL(file);
    }
  };

  const executeFusionPipeline = async () => {
    setAnalyzing(true);
    setPipelineProgress(1); // Layer 1: MobileNet Loading

    const img = new Image();
    img.src = imageData;
    await new Promise(resolve => img.onload = resolve);
    
    // Artificial delay purely for demo visual effect to show the complexity
    await new Promise(r => setTimeout(r, 800)); 
    setPipelineProgress(2); // Layer 2: Pixel Math
    
    await new Promise(r => setTimeout(r, 600)); 
    setPipelineProgress(3); // Layer 3: Geo-Temporal
    
    const result = await runFusionPipeline(img, location, selectedCategory?.id);
    
    await new Promise(r => setTimeout(r, 500)); 
    setPipelineProgress(4); // Layer 4: Fusion Matrix Output
    
    result.area = { value: 10, unit: 'sq meters' }; // stub
    setAnalysis(result);
    
    const desc = generateDescription({
      category: result.category,
      severity: result.severity,
      landmark: landmark || 'Reported Location',
      area: result.area,
    });
    setCustomDescription(desc);
    
    const tree = getCascadeTree(result.category);
    const flat = flattenCascade(tree);
    const savings = getPreventionSavings(result.category, result.severity);
    setCascadeData({ tree, flat, savings });
    
    const res = getResolution(result.category, result.severity);
    setResolution(res);
    
    setTimeout(() => {
      setAnalyzing(false);
      setStep(2);
    }, 1000);
  };

  const handleSubmit = async () => {
    const cat = selectedCategory || CATEGORIES.OTHER;
    const area = analysis?.area || { value: 10, unit: 'sq meters' };
    const issueTitle = generateTitle(cat.id, landmark || 'Reported Location');
    
    // Construct new issue
    const newIssue = {
      id: `iss-${Date.now()}`,
      category: cat.id,
      title: issueTitle,
      description: customDescription || generateDescription({
        category: cat.id,
        severity: analysis?.severity || 5,
        landmark: landmark || 'Reported Location',
        area: area,
      }),
      severity: analysis?.severity || 5,
      status: 'reported',
      reportedBy: user?.id || 'u1',
      lat: location.lat + (Math.random() - 0.5) * 0.005,
      lng: location.lng + (Math.random() - 0.5) * 0.005,
      neighborhood: 'koramangala',
      landmark: landmark || 'Reported Location',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validators: [],
      disputes: [],
      swarmConfidence: 0,
      stakeTotal: stakeAmount,
      timeline: [
        { action: 'reported', by: user?.id || 'u1', at: new Date().toISOString(), note: 'Issue reported via CivicTech Command' },
      ],
      imageColor: '#606060',
      dna: '',
      image: imageData, // Save image to DB so it renders
    };

    newIssue.dna = generateDNA(newIssue);
    
    // DNA Duplicate Detection (Check against unresolved issues)
    const existingIssues = await getIssues();
    const unresolved = existingIssues.filter(i => i.status === 'reported' || i.status === 'validated');
    const existingDNAs = unresolved.map(i => i.dna);
    
    if (!ignoreDuplicate && isDuplicate(newIssue.dna, existingDNAs)) {
      // Find the specific issue it matches
      const { computeSimilarity } = require('../lib/issueDNA');
      const matchedIssue = unresolved.find(i => computeSimilarity(newIssue.dna, i.dna) > 0.8);
      if (matchedIssue && matchedIssue.reportedBy !== user?.id) {
        setDuplicateIssue(matchedIssue);
        return; // Halt submission
      }
    }

    // Proceed with submission
    await addIssue(newIssue);
    
    // Wire up the disconnected backend logic
    if (user?.id) {
      await processUserAction(user.id, 'report_issue', cat.id);
    }
    await updateNeighborhoodVitals('koramangala', false); // lower score
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card text-center animate-fade-in" style={{ maxWidth: 500, margin: '80px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ShieldCheck size={64} className="text-success" color="var(--status-success)" />
        </div>
        <h2 className="title-lg mb-2">Issue Reported Securely</h2>
        <p className="text-muted mb-6">
          Data committed to the global registry. You earned +50 XP and staked {stakeAmount} SP.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>Dashboard</button>
          <button className="btn btn-primary" onClick={() => {
            setStep(0); setImageData(null); setSelectedCategory(null);
            setAnalysis(null); setSubmitted(false); setCustomDescription(''); setDuplicateIssue(null); setIgnoreDuplicate(false);
          }}><RefreshCw size={16} /> New Report</button>
        </div>
      </div>
    );
  }

  if (duplicateIssue) {
    return (
      <div className="card text-center animate-fade-in" style={{ maxWidth: 550, margin: '80px auto', border: '2px solid var(--status-warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <AlertTriangle size={64} className="text-warning" color="var(--status-warning)" />
        </div>
        <h2 className="title-lg mb-2">DNA Match Detected</h2>
        <p className="text-muted mb-6">
          Our Swarm Intelligence engine detected that an almost identical issue (<strong>{duplicateIssue.title}</strong>) was already reported near this location. 
        </p>
        <div className="card-elevated text-left mb-6" style={{ background: 'var(--surface-hover)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="text-secondary" style={{ fontWeight: 600 }}>Existing Report</span>
            <span className="badge badge-warning">Similarity &gt; 80%</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-main)', marginBottom: 8 }}>{duplicateIssue.description.substring(0, 100)}...</p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><MapPin size={12}/> {duplicateIssue.landmark}</div>
        </div>
        <p className="text-muted mb-6" style={{ fontSize: 14 }}>
          Instead of fracturing the community's voting power, you should pool your Shield Points by validating the existing report. This pushes it to the government faster!
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => {
            setIgnoreDuplicate(true);
            setDuplicateIssue(null);
            setTimeout(() => handleSubmit(), 100);
          }}>Ignore & Submit Duplicate</button>
          <button className="btn btn-primary" onClick={() => router.push(`/issue/${duplicateIssue.id}`)}><ShieldCheck size={16} /> Validate Existing Report</button>
        </div>
      </div>
    );
  }

  const sevInfo = analysis ? getSeverityLevel(analysis.severity) : null;

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <h1 className="display-sm mb-2">Initialize <span className="text-primary">Report</span></h1>
        <p className="text-muted">Capture, analyze, and track with the Hyperlocal Fusion Engine</p>
        {!user && (
          <div style={{ padding: '12px 24px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--status-warning)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, fontWeight: 500 }}>
            <AlertTriangle size={18} /> You must be logged in to submit a report and earn XP.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, borderBottom: '1px solid var(--border-light)', paddingBottom: 16, overflowX: 'auto' }}>
        {STEPS.map((s, i) => {
          const IconComponent = s.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: i === step ? 'var(--primary)' : i < step ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 500 }}>
              <span>{i < step ? <CheckCircle size={18} className="text-success" color="var(--status-success)" /> : <IconComponent size={18} />}</span>
              <span style={{ fontSize: 14 }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {step === 0 && (
        <div className="card-elevated animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
          {!imageData ? (
            <>
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><UploadCloud size={48} className="text-muted" /></div>
                <div className="title-sm mb-1">Click to upload photo</div>
                <div className="text-muted" style={{ fontSize: 13 }}>Supports JPG, PNG, WEBP • Max 10MB</div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </>
          ) : (
            <>
              <img src={imageData} alt="Captured issue" style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px solid var(--border-light)' }} />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setImageData(null)}><RefreshCw size={16} /> Retake</button>
                <button className="btn btn-primary" onClick={() => setStep(1)}>Confirm Image <Send size={16} /></button>
              </div>
            </>
          )}

          <div className="input-group" style={{ marginTop: 32 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> Pinpoint Location</label>
            <div style={{ marginBottom: 12 }}>
              <DynamicLocationPicker location={location} setLocation={setLocation} onGetLocation={getLocation} />
            </div>
            <input className="input" placeholder="e.g., Near Main Street Junction" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
            <div className="number-sm text-muted" style={{ marginTop: 6 }}>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h3 className="title-md mb-4 text-center">Select Base Category</h3>
          <div className="grid-2">
            {CATEGORY_LIST.map(cat => {
              const icons = { AlertTriangle, Droplets, Trash2, Lightbulb, Hammer };
              const IconComp = icons[cat.icon] || AlertTriangle;
              
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: 24, border: `2px solid ${selectedCategory?.id === cat.id ? 'var(--primary)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                    background: selectedCategory?.id === cat.id ? 'var(--surface-hover)' : 'transparent',
                    boxShadow: selectedCategory?.id === cat.id ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {selectedCategory?.id === cat.id && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--primary)' }} />}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <div style={{ padding: 12, background: selectedCategory?.id === cat.id ? 'var(--primary)' : 'var(--border-light)', borderRadius: '50%', color: selectedCategory?.id === cat.id ? 'white' : 'var(--text-main)', transition: 'all 0.2s' }}>
                      <IconComp size={28} />
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: selectedCategory?.id === cat.id ? 'var(--primary)' : 'var(--text-main)' }}>{cat.label}</div>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" disabled={!selectedCategory || analyzing} onClick={executeFusionPipeline}>
              {analyzing ? <><RefreshCw size={16} className="spin" /> Analyzing Infrastructure...</> : <><Brain size={16} /> Run AI Analysis</>}
            </button>
          </div>

          {analyzing && (
            <div style={{ marginTop: 32, background: 'var(--bg-main)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={20} className="text-primary" /> Hyperlocal Fusion Pipeline Active</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ opacity: pipelineProgress >= 1 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                    <span className="text-primary">Step 1: Visual Recognition</span>
                    <span>{pipelineProgress >= 1 ? 'Identifying Scene Context...' : 'Waiting...'}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: pipelineProgress >= 2 ? '100%' : pipelineProgress === 1 ? '50%' : '0%', height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ opacity: pipelineProgress >= 2 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                    <span className="text-primary">Step 2: Damage Assessment</span>
                    <span>{pipelineProgress >= 2 ? 'Scanning for Structural Issues...' : 'Waiting...'}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: pipelineProgress >= 3 ? '100%' : pipelineProgress === 2 ? '50%' : '0%', height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ opacity: pipelineProgress >= 3 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                    <span className="text-primary">Step 3: Environmental Context</span>
                    <span>{pipelineProgress >= 3 ? 'Applying Time/Location Risk Multipliers...' : 'Waiting...'}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: pipelineProgress >= 4 ? '100%' : pipelineProgress === 3 ? '50%' : '0%', height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && analysis && (
        <div className="card animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h2 className="display-sm mb-2">Fusion Complete</h2>
              <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Brain size={18} /> Multi-modal severity scoring</div>
            </div>
            <div className="text-center" style={{ background: 'var(--bg-main)', padding: '16px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Final Severity</div>
              <div className={`number-display badge-${sevInfo.level}`} style={{ background: 'transparent' }}>
                {analysis.severity.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid-3 mb-6">
            <div className="card-elevated text-center">
              <div className="title-sm text-primary mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>Detection</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Identified Issue</div>
              <div className="number-md mt-1 mb-4">{analysis.matrixDetails.semantic.baseCategory}</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Confidence</div>
              <div className="number-md mt-1">{(analysis.matrixDetails.semantic.semanticConfidence * 100).toFixed(1)}%</div>
            </div>
            
            <div className="card-elevated text-center">
              <div className="title-sm text-primary mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>Structural Damage</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Edge Density Risk</div>
              <div className="number-md mt-1 mb-4">{analysis.matrixDetails.pixels.edgeDensity.toFixed(3)}</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Material Hazard</div>
              <div className="number-md mt-1">{analysis.matrixDetails.pixels.isWaterSignature ? 'Water' : analysis.matrixDetails.pixels.isRustSignature ? 'Rust' : 'Normal'}</div>
            </div>

            <div className="card-elevated text-center">
              <div className="title-sm text-primary mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>Environment</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Time Multiplier</div>
              <div className="number-md mt-1 mb-4">{analysis.matrixDetails.geo.timeMultiplier}x</div>
              <div className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Zone Risk</div>
              <div className="number-md mt-1">{analysis.matrixDetails.geo.zoneMultiplier}x</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>View Cascade ROI <Zap size={16} /></button>
          </div>
        </div>
      )}

      {step === 3 && cascadeData && (
        <div className="card animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 className="title-lg mb-6 text-center">Cascade Prediction Model</h2>
          
          <div className="card-elevated mb-6" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={20} className="text-primary" /> {cascadeData.tree.name} (Unresolved)</div>
            {cascadeData.flat.map((node, idx) => (
              <div key={idx} style={{ marginLeft: node.depth * 24, marginTop: 16, paddingLeft: 16, borderLeft: '2px dashed var(--border-medium)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="title-sm text-secondary">{node.name}</span>
                  <span className="number-md text-primary" style={{ color: 'var(--status-critical)' }}>{node.displayProbability}% Prob</span>
                </div>
                <div className="text-muted number-sm mt-2">Cost: {node.cost} • Timeframe: {node.timeframe}</div>
              </div>
            ))}
          </div>

          <div className="input-group mt-6">
            <label className="label">Issue Description (AI Generated)</label>
            <textarea 
              className="input" 
              style={{ minHeight: 120, resize: 'vertical' }} 
              value={customDescription} 
              onChange={(e) => setCustomDescription(e.target.value)}
            />
            <p className="text-muted mt-2" style={{ fontSize: 12 }}>You can edit this description to provide more specific details for the authorities.</p>
          </div>

          <div className="grid-3 mb-6 mt-6">
            <div className="card text-center" style={{ background: 'var(--bg-main)' }}>
              <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Fix Now Cost</div>
              <div className="number-md mt-2" style={{ color: 'var(--status-success)' }}>{cascadeData.savings.fixNow}</div>
            </div>
            <div className="card text-center" style={{ background: 'var(--bg-main)' }}>
              <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>If Cascades</div>
              <div className="number-md mt-2" style={{ color: 'var(--status-critical)' }}>{cascadeData.savings.ifCascades}</div>
            </div>
            <div className="card text-center" style={{ background: 'rgba(13, 148, 136, 0.05)', border: '1px solid var(--primary)' }}>
              <div className="text-primary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>ROI Multiplier</div>
              <div className="number-display text-primary mt-2">{cascadeData.savings.savingsMultiplier}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Resolution Advisor <ClipboardList size={16} /></button>
          </div>
        </div>
      )}

      {step === 4 && resolution && (
        <div className="card animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 className="title-lg mb-6 text-center">Resolution Advisor</h2>
          
          <table className="data-table mb-6">
            <tbody>
              <tr>
                <td>Responsible Dept</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{resolution.department}</td>
              </tr>
              <tr>
                <td>Estimated Cost</td>
                <td style={{ textAlign: 'right' }} className="number-md">{resolution.estimatedCost}</td>
              </tr>
              <tr>
                <td>Helpline</td>
                <td style={{ textAlign: 'right' }} className="number-md">{resolution.helplineNumbers?.[0] || '1533'}</td>
              </tr>
            </tbody>
          </table>

          <div className="card-elevated mb-6" style={{ background: 'var(--bg-main)' }}>
            <h3 className="title-sm mb-4 text-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Automated Draft Complaint</h3>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
              {fillTemplate(resolution.draftComplaint, {
                location: landmark || 'Reported Location',
                area: '10 sq meters',
                reporter_name: user?.name || 'Citizen',
                ward: 'Ward 150',
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN'),
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep(3)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>Proceed to Stake <ShieldCheck size={16} /></button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card text-center animate-fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><ShieldCheck size={48} className="text-primary" /></div>
          <h2 className="title-lg mb-2">Stake & Submit</h2>
          <p className="text-muted mb-6">
            Stake Shield Points to vouch for this report. Correct stakes earn 2x return when validated by the vanguard.
          </p>

          <div className="card-elevated mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '32px 0' }}>
            <button className="btn btn-secondary" style={{ width: 48, height: 48, padding: 0, borderRadius: '50%' }} onClick={() => setStakeAmount(Math.max(1, stakeAmount - 5))}>-</button>
            <div className="number-display text-primary" style={{ width: 100 }}>{stakeAmount}</div>
            <button className="btn btn-secondary" style={{ width: 48, height: 48, padding: 0, borderRadius: '50%' }} onClick={() => setStakeAmount(Math.min(50, stakeAmount + 5))}>+</button>
          </div>
          
          <div className="text-muted number-sm mb-6" style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            Potential Return: <span style={{ color: 'var(--status-success)' }}>+{stakeAmount * 2} SP</span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep(4)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary" style={{ width: 220 }} onClick={handleSubmit} disabled={!user}>
              Confirm Submission <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
