'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getIssues, getUsers, addValidation, toggleUpvote, addComment, updateIssueStatus, addNotification, updateNeighborhoodVitals, updateIssue } from '../../lib/storage';
import { CATEGORIES } from '../../lib/seedData';
import { getValidationStatus, simulateSwarmNodes, canValidate } from '../../lib/swarmAlgorithm';
import { getSeverityLevel, getDynamicSeverity } from '../../lib/resolutionKB';
import { useAuth } from '../../lib/authProvider';
import { Dna, ShieldCheck, Check, X, Clock, Users, User, AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle, ArrowLeft, ArrowUp, MessageSquare, Lock, Camera, Loader2, CheckCircle, Flame } from 'lucide-react';
import Link from 'next/link';
import XboxAvatar from '../../components/XboxAvatar';

// Xbox style avatar generator
function getAvatarHue(id) {
  if (!id) return 0;
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
}

const IconMap = {
  AlertTriangle, Droplets, Trash2, Lightbulb, Hammer, AlertCircle
};

function CostOfInactionEngine({ issue }) {
  const [coi, setCoi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issue || issue.status === 'resolved') return;

    if (issue.coi) {
      setCoi(issue.coi);
      return;
    }

    let isMounted = true;
    const fetchCOI = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/inaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: issue.title,
            description: issue.description,
            category: issue.category,
            severity: issue.severity
          })
        });
        const data = await res.json();
        if (isMounted) {
          setCoi(data);
          await updateIssue(issue.id, { coi: data });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCOI();
    return () => { isMounted = false; };
  }, [issue?.id, issue?.status, issue?.coi]);

  if (issue?.status === 'resolved') return null;

  return (
    <div className="card" style={{ border: '1px solid var(--status-critical)', background: 'rgba(225, 29, 72, 0.03)', marginTop: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'var(--status-critical)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Flame size={20} color="var(--status-critical)" />
        <h3 className="title-sm" style={{ color: 'var(--status-critical)', margin: 0 }}>AI Prediction: Cost of Inaction</h3>
      </div>
      
      {loading || !coi ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spin text-critical" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Simulating civic impact...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{coi.summaryText}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <div style={{ flex: 1, background: 'var(--surface-card)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Daily Impact</div>
              <div style={{ fontSize: 14, color: 'var(--status-warning)', fontWeight: 600 }}>{coi.dailyImpact}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface-card)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>30-Day Projection</div>
              <div style={{ fontSize: 14, color: 'var(--status-critical)', fontWeight: 600 }}>{coi.monthlyProjection}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState(null);
  const [users, setUsers] = useState([]);
  const [swarmNodes, setSwarmNodes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Admin State
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [resolutionDescription, setResolutionDescription] = useState('');
  const [dispatchDescription, setDispatchDescription] = useState('');
  const [selectedDeptHead, setSelectedDeptHead] = useState('force_dispatch');
  const { user: currentUser } = useAuth(); // single source of truth — cookie-verified session

  useEffect(() => {
    async function load() {
      const allIssues = await getIssues();
      const found = allIssues.find(i => i.id === id);
      if (!found) {
        router.push('/map');
        return;
      }
      setIssue(found);
      
      const allUsers = await getUsers();
      setUsers(allUsers);
      setSwarmNodes(simulateSwarmNodes(found.validators || [], { lat: found.lat, lng: found.lng }, allUsers));
      setLoaded(true);
    }
    load();
  }, [id, router]);

  const handleValidate = async (isDispute = false) => {
    if (!currentUser || !canValidate(currentUser.id, issue)) return;
    
    const updated = await addValidation(issue.id, currentUser.id, isDispute);
    if (updated) {
      setIssue(updated);
      setSwarmNodes(simulateSwarmNodes(updated.validators || [], { lat: updated.lat, lng: updated.lng }, users));
    }
  };

  const handleUpvote = async () => {
    if (!currentUser) return router.push('/login');
    const updated = await toggleUpvote(issue.id, currentUser.id);
    if (updated) setIssue(updated);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return router.push('/login');
    if (!commentText.trim()) return;
    
    const newComment = {
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText.trim()
    };
    
    const updated = await addComment(issue.id, newComment);
    if (updated) {
      setIssue(updated);
      setCommentText('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDispatch = async () => {
    if (!issue) return;
    
    // Pass dept head and note into updateIssueStatus extraData
    let dispatchNote = dispatchDescription ? `Dispatch Note: ${dispatchDescription}` : '';
    if (selectedDeptHead !== 'force_dispatch') {
      const headUser = users.find(u => u.id === selectedDeptHead);
      dispatchNote = `Assigned to ${headUser?.name || 'Department Head'}. ` + dispatchNote;
    }

    const updated = await updateIssueStatus(issue.id, 'in_progress', { dispatchNote: dispatchNote.trim() });
    
    if (selectedDeptHead !== 'force_dispatch') {
      await addNotification(selectedDeptHead, { message: `DISPATCH ALERT: You have been assigned to coordinate response for "${issue.title}".` });
    }
    
    const reporters = [issue.reportedBy, ...(issue.validators||[])];
    reporters.forEach(async rId => {
      await addNotification(rId, { message: `Govt dispatch deployed for: ${issue.title}` });
    });

    setIssue(updated);
  };

  const runVisionVerification = async () => {
    setVerificationProgress(10); 
    
    const progressInterval = setInterval(() => {
      setVerificationProgress(p => p < 90 ? p + 10 : p);
    }, 500);

    try {
      const res = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: issue.image,
          proofImage: proofImage,
          title: issue.title,
          description: issue.description
        })
      });

      const data = await res.json();
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setVisionResult(data);

      if (data.verified) {
        setTimeout(async () => {
          const updated = await updateIssueStatus(issue.id, 'resolved', { proofImage, resolutionDescription });
          const involved = [...new Set([issue.reportedBy, ...(issue.validators || [])])];
          involved.forEach(async userId => {
            await addNotification(userId, {
              message: `AI-VERIFIED FIX: "${issue.title}" has been permanently resolved. Your staked SP has been returned with a bonus!`,
            });
          });
          await updateNeighborhoodVitals(issue.neighborhood, true);
          setIssue(updated);
        }, 3000);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setVisionResult({ verified: false, error: "Network or AI Error" });
    }
  };

  if (!loaded || !issue) return <div style={{ padding: 40, textAlign: 'center' }}>Loading issue profile...</div>;

  const cat = CATEGORIES[issue.category.toUpperCase()] || CATEGORIES.OTHER;
  const dynSeverity = getDynamicSeverity(issue);
  const sevInfo = getSeverityLevel(dynSeverity);
  const valStatus = getValidationStatus(issue.swarmConfidence);
  const reporter = users.find(u => u.id === issue.reportedBy);
  const CatIcon = IconMap[cat.icon] || AlertCircle;
  const validators = (issue.validators || []).map(vId => users.find(u => u.id === vId)).filter(Boolean);

  return (
    <>
      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={() => router.back()}><ArrowLeft size={16} /> Back</button>
      </div>

      <div className="grid-2">
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--surface-hover)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CatIcon size={32} className="text-primary" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h1 className="title-md mb-2">{issue.title}</h1>
                  <button 
                    onClick={handleUpvote}
                    className={`btn ${issue.upvotedBy?.includes(currentUser?.id) ? 'btn-primary' : 'btn-ghost'}`} 
                    style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ArrowUp size={16} /> <span style={{ fontWeight: 700 }}>{issue.upvotes || 0}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  <span className={`badge badge-${sevInfo.level}`} title="Base Severity + Social Priority Boost">
                    {sevInfo.label} {dynSeverity.toFixed(1)} 
                    {dynSeverity > issue.severity && <span style={{ fontSize: 10, marginLeft: 4 }}> (+{(dynSeverity - issue.severity).toFixed(1)})</span>}
                  </span>
                  <span className={`badge badge-${issue.status === 'resolved' ? 'success' : issue.status === 'in_progress' ? 'info' : 'warning'}`}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Dna size={12} /> {issue.dna}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
              {issue.description}
            </p>

            {issue.image && (
              <div style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <img src={issue.image} alt={issue.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            
            <div className="grid-2">
              <Link href={`/map?lat=${issue.lat}&lng=${issue.lng}&zoom=17`} style={{ textDecoration: 'none', display: 'block', padding: 16, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>{issue.landmark}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</div>
              </Link>
              <div style={{ padding: 16, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <Link href={`/profile/${issue.reportedBy}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                  <XboxAvatar user={reporter} size={40} style={{ borderRadius: '6px' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{reporter?.name || 'Unknown Citizen'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reporter · Lvl {reporter?.level || 1}</div>
                  </div>
                </Link>
              </div>
            </div>
            
            <CostOfInactionEngine issue={issue} />
          </div>

          {/* ─── Validation Action Card — Always Visible ─── */}
          <div className="card" style={{ border: '2px solid var(--primary)', background: 'rgba(13,148,136,0.03)', position: 'relative', overflow: 'hidden' }}>
              {/* Accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(to right, var(--primary), var(--status-info))' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 }}>
                <ShieldCheck size={22} color="var(--primary)" />
                <h3 className="title-sm" style={{ color: 'var(--primary)', margin: 0 }}>Validate This Report</h3>
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                  {issue.validators?.length || 0} validated · {issue.disputes?.length || 0} disputed
                </span>
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Community Confidence</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round((issue.swarmConfidence || 0) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((issue.swarmConfidence || 0) * 100)}%`, background: 'linear-gradient(to right, var(--primary), var(--status-success))', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {issue.status === 'reported' || issue.status === 'validated' ? (
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 20 }}>
                  Are you near <strong>{issue.landmark}</strong>? Confirm if this issue is real — 3+ validations trigger government dispatch.
                </p>
              ) : (
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 20 }}>
                  <strong>Validation Closed:</strong> This issue has been {issue.status.replace('_', ' ')}. The community confidence score is locked.
                </p>
              )}
              
              {issue.status !== 'reported' && issue.status !== 'validated' ? null : !currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <Lock size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>You must be logged in to validate reports.</span>
                  <Link href="/login" className="btn btn-primary" style={{ padding: '8px 20px', whiteSpace: 'nowrap' }}>Log In</Link>
                </div>
              ) : currentUser && !canValidate(currentUser.id, issue) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(13,148,136,0.08)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                  <Check size={18} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>You've already validated or disputed this report — thank you!</span>
                </div>
              ) : currentUser && issue.reportedBy === currentUser.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={18} />
                  <span style={{ fontSize: 14 }}>You reported this issue — others will validate it.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn"
                    style={{ flex: 1, background: 'var(--status-success)', color: 'white', height: 48, fontSize: 15, fontWeight: 600 }}
                    onClick={() => handleValidate(false)}
                  >
                    <Check size={18} /> Confirm — It's Real
                  </button>
                  <button
                    className="btn"
                    style={{ flex: 1, background: 'transparent', color: 'var(--text-secondary)', border: '2px solid var(--border-medium)', height: 48, fontSize: 15, fontWeight: 600 }}
                    onClick={() => handleValidate(true)}
                  >
                    <X size={18} /> Dispute — Fixed / Fake
                  </button>
                </div>
              )}
            </div>

          {currentUser?.role === 'admin' && issue.status !== 'resolved' && (
            <div className="card" style={{ border: `1px solid ${issue.status === 'validated' ? 'var(--status-warning)' : 'var(--status-info)'}`, background: 'var(--surface-card)', marginTop: 24 }}>
              <h3 className="title-sm" style={{ color: issue.status === 'validated' ? 'var(--status-warning)' : 'var(--status-info)', marginBottom: 16 }}>
                {issue.status === 'validated' ? 'Admin: Dispatch Govt Resources' : 'Admin: Verify Resolution'}
              </h3>
              
              {issue.status === 'validated' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>Assign Department Head</label>
                    <select 
                      className="input" 
                      value={selectedDeptHead} 
                      onChange={e => setSelectedDeptHead(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="force_dispatch">General Govt Dispatch (No specific head)</option>
                      {users.filter(u => u.role === 'department_head').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>Dispatch Note (Optional)</label>
                    <textarea 
                      className="input" 
                      placeholder="e.g. Sent BBMP crew with cold patch asphalt."
                      value={dispatchDescription}
                      onChange={e => setDispatchDescription(e.target.value)}
                      style={{ width: '100%', minHeight: 60, padding: 12, resize: 'vertical' }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleDispatch} style={{ width: '100%', background: 'var(--status-warning)' }}>
                    Force Override & Dispatch
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {proofPreview && (
                    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <img src={proofPreview} alt="Proof preview" style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}

                  {!visionResult && (
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        id="proof-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="proof-upload" className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, cursor: 'pointer', borderStyle: 'dashed' }}>
                        <Camera size={18} /> {proofImage ? 'Change Proof Photo' : 'Upload Proof of Fix'}
                      </label>
                    </div>
                  )}

                  {verificationProgress > 0 && !visionResult && (
                    <div style={{ background: 'var(--surface-hover)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Loader2 size={14} className="spin text-primary" /> Vision AI Analyzing
                        </span>
                        <span className="text-primary">{verificationProgress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${verificationProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {visionResult && (
                    <div style={{ background: visionResult.verified ? 'rgba(5, 150, 105, 0.1)' : 'rgba(225, 29, 72, 0.1)', padding: 16, borderRadius: 'var(--radius-md)', border: `1px solid ${visionResult.verified ? 'var(--status-success)' : 'var(--status-critical)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: visionResult.verified ? 'var(--status-success)' : 'var(--status-critical)', fontWeight: 600, marginBottom: 4 }}>
                        {visionResult.verified ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {visionResult.verified ? 'Fix Verified via Vision AI' : 'Verification Failed'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-main)' }}>
                        {visionResult.error || `Structural delta confirmed.`}
                      </div>
                    </div>
                  )}

                  {!visionResult && (
                    <>
                      <textarea 
                        className="input" 
                        placeholder="Describe the resolution (e.g. 'Pothole filled with cold patch asphalt')"
                        value={resolutionDescription}
                        onChange={e => setResolutionDescription(e.target.value)}
                        style={{ width: '100%', minHeight: 80, padding: 12, resize: 'vertical' }}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }} 
                        disabled={!proofImage || verificationProgress > 0} 
                        onClick={runVisionVerification}
                      >
                        {verificationProgress > 0 ? 'Analyzing...' : 'Run Vision AI Verification'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} className="text-primary" /> Event Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {issue.timeline.map((event, idx) => {
                const user = users.find(u => u.id === event.by);
                const isDispute = event.action === 'disputed';
                return (
                  <div key={idx} style={{ paddingLeft: 16, borderLeft: `2px solid ${isDispute ? 'var(--status-critical)' : 'var(--border-medium)'}`, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: isDispute ? 'var(--status-critical)' : 'var(--border-medium)' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isDispute ? 'var(--status-critical)' : 'var(--text-main)', textTransform: 'capitalize' }}>
                      {event.action.replace('_', ' ')} by {user?.name || 'System'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 4 }}>{new Date(event.at).toLocaleString()}</div>
                    {event.note && <div className="text-secondary" style={{ fontSize: '0.875rem', background: 'var(--surface-hover)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>{event.note}</div>}
                    {event.resolutionProof && (
                      <div style={{ marginTop: 8, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-medium)', maxWidth: 400 }}>
                        <img src={event.resolutionProof} alt="Resolution Proof" style={{ width: '100%', display: 'block' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <h3 className="title-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={18} className="text-primary" /> Community Discussion</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {(!issue.comments || issue.comments.length === 0) ? (
                <div className="text-muted" style={{ fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No comments yet. Start the discussion!</div>
              ) : (
                issue.comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} className="text-secondary" />
                    </div>
                    <div style={{ flex: 1, background: 'var(--surface-hover)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.userName}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..." 
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--surface-card)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>Post</button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Please log in to participate in the discussion.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Swarm UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignSelf: 'flex-start', position: 'sticky', top: 24 }}>
          <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 className="title-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} className="text-primary" /> Swarm Validation</h3>
              <span className={`badge badge-${valStatus.color === 'var(--accent-green)' ? 'success' : valStatus.color === 'var(--accent-cyan)' ? 'info' : 'warning'}`}>
                {valStatus.label}
              </span>
            </div>

            {/* Confidence Meter */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8, fontWeight: 600 }}>
                <span className="text-secondary">Swarm Confidence</span>
                <span style={{ color: 'var(--status-success)' }}>{Math.round(issue.swarmConfidence * 100)}%</span>
              </div>
              <div style={{ height: 12, borderRadius: 6, background: 'var(--border-light)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%',
                    width: `${issue.swarmConfidence * 100}%`, 
                    background: 'var(--status-success)',
                    transition: 'width 0.5s ease-out'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                <span>Unverified</span>
                <span>Confirmed (85%+)</span>
              </div>
            </div>

            {/* WOW Swarm Visualizer */}
            <div className="swarm-container" style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)', minHeight: 320, background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-core {
                  0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.6); }
                  70% { box-shadow: 0 0 0 30px rgba(13, 148, 136, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
                }
                @keyframes dash-anim { to { stroke-dashoffset: -20; } }
                .radar-sweep {
                  position: absolute; top: 50%; left: 50%; width: 150%; height: 150%;
                  background: conic-gradient(from 0deg, rgba(13,148,136,0) 0deg, rgba(13,148,136,0.05) 70deg, rgba(13,148,136,0.4) 90deg, rgba(13,148,136,0) 90deg);
                  transform-origin: 0 0;
                  animation: radar-spin 4s linear infinite;
                  z-index: 1;
                }
              `}} />

              {/* Grid Background */}
              <div style={{ position: 'absolute', inset: 0, backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)' }} />

              {/* Radar Rings */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <div style={{ width: '85%', height: '85%', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '55%', height: '55%', border: '1px solid rgba(13,148,136,0.6)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '25%', height: '25%', border: '1px dashed rgba(13,148,136,0.5)', borderRadius: '50%' }} />
              </div>
              
              <div className="radar-sweep" />

              {/* Center Core (The Issue) */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#0f172a', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-core 2s infinite' }}>
                  <CatIcon size={28} color="var(--primary)" />
                </div>
              </div>

              {/* Connecting Lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
                {swarmNodes.map(node => (
                  <line 
                    key={`line-${node.id}`} 
                    x1="50%" y1="50%" 
                    x2={`${node.x}%`} y2={`${node.y}%`} 
                    stroke={node.id === issue.reportedBy ? 'rgba(59,130,246,0.8)' : 'rgba(16,185,129,0.7)'} 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    style={{ animation: 'dash-anim 1s linear infinite' }}
                  />
                ))}
              </svg>

              {/* Node Placements */}
              {swarmNodes.map(node => {
                const nodeUser = users.find(u => u.id === node.id);
                const isReporter = node.id === issue.reportedBy;
                return (
                  <div 
                    key={node.id} 
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.5s ease-out',
                      zIndex: 3
                    }}
                  >
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '50%',
                      border: `2px solid ${isReporter ? '#3b82f6' : '#10b981'}`,
                      background: '#0f172a',
                      boxShadow: `0 0 20px ${isReporter ? 'rgba(59,130,246,0.6)' : 'rgba(16,185,129,0.6)'}`,
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <XboxAvatar user={nodeUser || { id: node.id, name: node.name, avatarSeed: 0 }} size={36} style={{ borderRadius: '50%' }} />
                    </div>
                    <div style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(0,0,0,0.8)', 
                      color: 'white', 
                      padding: '4px 10px', 
                      borderRadius: 12, 
                      marginTop: 8, 
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      fontWeight: 600,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}>
                      {node.name} {isReporter && <span style={{ color: '#60a5fa' }}>(Reporter)</span>}
                    </div>
                  </div>
                );
              })}

              {swarmNodes.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600, zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Loader2 size={16} className="spin text-primary" /> Awaiting Swarm Nodes...
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> {issue.validators?.length || 0}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><X size={14} className="text-muted" /> {issue.disputes?.length || 0}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} className="text-primary" /> {issue.stakeTotal || 0} SP</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
