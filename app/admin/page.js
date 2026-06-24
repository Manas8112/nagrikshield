'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authProvider';
import { getIssues, updateIssueStatus, addNotification, getApplications, updateApplication, updateUser, getUsers, updateNeighborhoodVitals, getFeedbacks, updateFeedback, broadcastNotification } from '../lib/storage';
import { getSeverityLevel, getDynamicSeverity } from '../lib/resolutionKB';
import { ShieldCheck, Target, CheckCircle, Activity, Camera, Loader2, Play, ArrowUp, Briefcase, UserCheck, X, AlertTriangle, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('dispatches');
  const [verifyingIssue, setVerifyingIssue] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [dispatchModalIssue, setDispatchModalIssue] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [visionResult, setVisionResult] = useState(null);
  const [resolutionDescription, setResolutionDescription] = useState('');

  useEffect(() => {
    async function load() {
      if (!loading && user?.role !== 'admin') {
        router.push('/');
      } else if (user?.role === 'admin') {
        const data = await getIssues();
        setIssues(data || []);
        
        const apps = await getApplications();
        setApplications(apps.filter(a => a.status === 'pending'));

        const usersData = await getUsers();
        setAllUsers(usersData || []);
        
        const fbData = await getFeedbacks();
        setFeedbacks(fbData || []);
      }
    }
    load();
    
    // Auto-refresh interval to keep columns in sync
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [user, loading, router]);

  const refresh = async () => {
    const data = await getIssues();
    setIssues(data || []);
    const apps = await getApplications();
    setApplications(apps.filter(a => a.status === 'pending'));
    const usersData = await getUsers();
    setAllUsers(usersData || []);
    const fbData = await getFeedbacks();
    setFeedbacks(fbData || []);
  };

  const handleStatusChange = async (issueId, newStatus, issueTitle, reporters) => {
    await updateIssueStatus(issueId, newStatus);
    
    if (newStatus === 'in_progress' || newStatus === 'resolved') {
      const msg = newStatus === 'in_progress' 
        ? `Govt dispatch deployed for: ${issueTitle}`
        : `Issue resolved: ${issueTitle}. Staked SP returned with 2x multiplier!`;
        
      reporters.forEach(async rId => {
        await addNotification(rId, { type: 'status_update', issueId, message: msg });
      });
      
      if (newStatus === 'resolved') {
        const issue = issues.find(i => i.id === issueId);
        if (issue) await updateNeighborhoodVitals(issue.neighborhood, true);
      }
    }
    
    await refresh();
  };

  const handleVerifyResolution = (issue) => {
    setVerifyingIssue(issue);
    setVerificationProgress(0);
    setProofImage(null);
    setProofPreview(null);
    setVisionResult(null);
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

  const runVisionVerification = async () => {
    setVerificationProgress(10); // Start
    
    // Fake progress while waiting for PyTorch
    const progressInterval = setInterval(() => {
      setVerificationProgress(p => p < 90 ? p + 10 : p);
    }, 500);

    try {
      const res = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: verifyingIssue.image,
          proofImage: proofImage
        })
      });

      const data = await res.json();
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setVisionResult(data);

      if (data.verified) {
        setTimeout(async () => {
          await updateIssueStatus(verifyingIssue.id, 'resolved', { proofImage, resolutionDescription });
          const involved = [...new Set([verifyingIssue.reportedBy, ...(verifyingIssue.validators || [])])];
          involved.forEach(async userId => {
            await addNotification(userId, {
              message: `AI-VERIFIED FIX: "${verifyingIssue.title}" has been permanently resolved. Your staked SP has been returned with a bonus!`,
            });
          });
          await updateNeighborhoodVitals(verifyingIssue.neighborhood, true);
          setVerifyingIssue(null);
          await refresh();
        }, 3000);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setVisionResult({ verified: false, error: "Network or AI Error" });
    }
  };

  const handleApproveApp = async (app) => {
    await updateApplication(app.id, { status: 'approved' });
    await updateUser(app.userId, { role: 'department_head', department: app.department });
    await addNotification(app.userId, { message: `Congratulations! Your request to become the Head of ${app.department} has been APPROVED by the Admin.` });
    await refresh();
  };

  const handleRejectApp = async (app) => {
    await updateApplication(app.id, { status: 'rejected' });
    await addNotification(app.userId, { message: `Your request to lead ${app.department} was rejected.` });
    await refresh();
  };

  const handleMarkImplemented = async (fb) => {
    await updateFeedback(fb.id, { status: 'implemented' });
    if (fb.userId && fb.userId !== 'anonymous') {
      await addNotification(fb.userId, { message: `Feature Implemented: Your request for "${fb.message}" is now live!` });
    }
    await broadcastNotification({ message: `A new feature just dropped! Check it out.` });
    await refresh();
  };

  const handleDispatch = async (deptHeadId) => {
    if (!dispatchModalIssue) return;
    
    await updateIssueStatus(dispatchModalIssue.id, 'in_progress');
    
    if (deptHeadId !== 'force_dispatch') {
      await addNotification(deptHeadId, { message: `DISPATCH ALERT: You have been assigned to coordinate response for "${dispatchModalIssue.title}".` });
    }
    
    const reporters = [dispatchModalIssue.reportedBy, ...(dispatchModalIssue.validators||[])];
    reporters.forEach(async rId => {
      await addNotification(rId, { message: `Govt dispatch deployed for: ${dispatchModalIssue.title}` });
    });

    setDispatchModalIssue(null);
    await refresh();
  };

  if (loading || !user || user.role !== 'admin') {
    return <div style={{ padding: 40, textAlign: 'center' }}>Authorizing Command Center...</div>;
  }

  const columns = [
    { id: 'reported', title: 'New Reports' },
    { id: 'validated', title: 'Community Validated' },
    { id: 'in_progress', title: 'Active Dispatches' },
    { id: 'resolved', title: 'Resolved' },
  ];

  return (
    <>
      <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="display-sm mb-2" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={40} className="text-primary" /> CivicTech <span className="text-primary">Command</span>
            </h1>
            <p className="text-muted">Administrator Dispatch & AI Verification Terminal</p>
          </div>
          <div className="badge badge-info" style={{ padding: '8px 16px', fontSize: 14 }}>
            System Administrator
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button className={`btn ${activeTab === 'dispatches' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('dispatches')}>Dispatch Center</button>
        <button className={`btn ${activeTab === 'features' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('features')}>Feature Requests</button>
      </div>

      {activeTab === 'dispatches' && (
        <>
          <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 24, minHeight: '60vh' }}>
        {columns.map(col => {
          const colIssues = issues.filter(i => i.status === col.id);
          return (
            <div key={col.id} style={{ flex: '0 0 320px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="title-sm">{col.title}</h3>
                <span className="badge badge-muted">{colIssues.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {colIssues.map(issue => {
                  const dynSeverity = getDynamicSeverity(issue);
                  const sev = getSeverityLevel(dynSeverity);
                  return (
                    <div key={issue.id} className="card" style={{ padding: 16, cursor: 'default' }}>
                      <Link href={`/issue/${issue.id}`} className="title-sm mb-2" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'block' }}>
                        {issue.title}
                      </Link>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <span className={`badge badge-${sev.level}`}>{dynSeverity.toFixed(1)}</span>
                        <span className="text-muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ArrowUp size={12} /> {issue.upvotes || 0}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {col.id === 'reported' && (
                          <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }} onClick={() => handleStatusChange(issue.id, 'validated', issue.title, [issue.reportedBy])}>
                            Force Validate
                          </button>
                        )}
                        {col.id === 'validated' && (
                          <button className="btn btn-primary" style={{ width: '100%', fontSize: 12 }} onClick={() => setDispatchModalIssue(issue)}>
                            Dispatch Team
                          </button>
                        )}
                        {col.id === 'in_progress' && (
                          <button className="btn btn-success" style={{ width: '100%', fontSize: 12, background: 'var(--status-success)', color: 'white' }} onClick={() => handleVerifyResolution(issue)}>
                            <Camera size={14} /> Submit Proof of Fix
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Applications Panel */}
      {applications.length > 0 && (
        <div className="card" style={{ marginTop: 24, borderColor: 'var(--primary)', background: 'rgba(13, 148, 136, 0.05)' }}>
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase className="text-primary" /> Pending Department Applications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applications.map(app => (
              <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{app.userName}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>Requested to lead: <span className="text-primary" style={{ fontWeight: 600 }}>{app.department}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" style={{ background: 'var(--status-critical)', color: 'white', padding: '6px 12px' }} onClick={() => handleRejectApp(app)}>Reject</button>
                  <button className="btn btn-success" style={{ background: 'var(--status-success)', color: 'white', padding: '6px 12px' }} onClick={() => handleApproveApp(app)}>Approve</button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
        </>
      )}

      {activeTab === 'features' && (
        <div className="card">
          <h2 className="title-md mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb className="text-primary" /> User Feature Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {feedbacks.length === 0 ? (
              <p className="text-muted">No feature requests found.</p>
            ) : feedbacks.map(fb => (
              <div key={fb.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Requested by: {fb.userName}</div>
                  <div className="text-muted" style={{ fontSize: 14 }}>{fb.message}</div>
                </div>
                <div>
                  {fb.status === 'implemented' ? (
                    <span className="badge badge-success" style={{ padding: '8px 16px' }}><CheckCircle size={14} /> Implemented</span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleMarkImplemented(fb)}>Mark Implemented</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Modal Overlay */}
      {dispatchModalIssue && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target className="text-primary" /> Dispatch Assignment</h2>
              <button className="btn btn-ghost" onClick={() => setDispatchModalIssue(null)}><X size={20} /></button>
            </div>
            
            <p className="text-muted mb-4">Select an available Department Head to coordinate the resolution for: <strong className="text-main">{dispatchModalIssue.title}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {allUsers.filter(u => u.role === 'department_head').length === 0 ? (
                <div className="text-muted" style={{ padding: 16, textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  No Department Heads currently approved. You can force dispatch to a generic crew.
                </div>
              ) : (
                allUsers.filter(u => u.role === 'department_head').map(head => (
                  <button 
                    key={head.id} 
                    className="btn btn-ghost" 
                    style={{ justifyContent: 'space-between', padding: 16, border: '1px solid var(--border-medium)', textAlign: 'left' }}
                    onClick={() => handleDispatch(head.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{head.name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>Head of {head.department}</div>
                    </div>
                    <UserCheck size={20} className="text-primary" />
                  </button>
                ))
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleDispatch('force_dispatch')}>
              Force Dispatch (Generic Crew)
            </button>
          </div>
        </div>
      )}

      {/* AI Verification Modal Overlay */}
      {verifyingIssue && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 700, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity className="text-primary" /> True AI Vision Verification
              </h2>
              <button className="btn btn-ghost" onClick={() => setVerifyingIssue(null)}><X size={20} /></button>
            </div>
            
            <p className="text-muted mb-4">Upload a photo of the repaired location. Our PyTorch Vision Engine will compare it with the original report to ensure the structural background matches.</p>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-hover)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>Original Pothole/Issue</div>
                {verifyingIssue.image ? (
                  <img src={verifyingIssue.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="text-muted text-center" style={{ padding: 20 }}>No original image provided for this issue.</span>
                )}
              </div>
              <div style={{ flex: 1, border: '2px dashed var(--primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-hover)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 12, zIndex: 10 }}>Uploaded Proof</div>
                {proofPreview ? (
                  <img src={proofPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <label style={{ cursor: 'pointer', textAlign: 'center', padding: 20, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={32} className="text-primary mb-2" />
                    <span className="text-primary" style={{ fontWeight: 600 }}>Click to Upload Proof Photo</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {verificationProgress > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                  <span className="text-primary">PyTorch Feature Extraction</span>
                  <span>{verificationProgress}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${verificationProgress}%`, background: 'var(--primary)', transition: 'width 0.4s linear' }} />
                </div>
              </div>
            )}

            {visionResult && (
              <div style={{ padding: 16, background: visionResult.verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${visionResult.verified ? 'var(--status-success)' : 'var(--status-critical)'}`, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                {visionResult.verified ? (
                  <>
                    <CheckCircle size={32} className="text-success mb-2 mx-auto" style={{ color: 'var(--status-success)' }} />
                    <h3 style={{ color: 'var(--status-success)', margin: 0 }}>Verified! Issue Re-Resolved</h3>
                    <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{visionResult.error || `Confidence Match: ${visionResult.confidence?.toFixed(1)}%`}</p>
                    <p style={{ fontSize: 12, marginTop: 8 }}>Issue is resolving automatically...</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={32} className="text-critical mb-2 mx-auto" style={{ color: 'var(--status-critical)' }} />
                    <h3 style={{ color: 'var(--status-critical)', margin: 0 }}>Verification Failed</h3>
                    <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                      {visionResult.error || "The uploaded image does not appear to match the original location structurally."}
                    </p>
                    <button className="btn btn-secondary mt-4" onClick={() => setVerificationProgress(0)}>Try Again</button>
                  </>
                )}
              </div>
            )}

            {!visionResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
