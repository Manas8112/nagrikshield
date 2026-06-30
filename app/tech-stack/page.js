'use client';

import { ShieldCheck, Cpu, Network, Database, Brain, Zap, Layers, Server, Code, Eye, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TechStackPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .guide-hero {
          padding: 80px 20px;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-main) 0%, #1e293b 100%);
          border-bottom: 1px solid var(--border-light);
          position: relative;
          overflow: hidden;
        }
        .guide-hero h1, .guide-hero p {
          color: white;
        }
        .guide-hero::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 60%);
          animation: rotateBg 30s linear infinite;
          z-index: 0;
        }
        @keyframes rotateBg {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .guide-hero > * {
          position: relative;
          z-index: 1;
        }

        .guide-section {
          padding: 60px 0;
        }

        .tech-card {
          background: var(--surface-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
        }
        .tech-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }
        .tech-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 4px;
          background: var(--primary);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .tech-card:hover::before {
          transform: scaleX(1);
        }

        /* Staggered entry animations */
        .stagger-1 { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .stagger-2 { animation: slideUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .stagger-3 { animation: slideUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .stagger-4 { animation: slideUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pulse-icon {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); color: var(--primary-hover); }
          100% { transform: scale(1); }
        }
        
        .badge-tech {
          background: rgba(13, 148, 136, 0.1);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          display: inline-block;
        }
      `}} />

      <section className="guide-hero">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }} className="stagger-1">
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
            <Server size={48} className="text-primary pulse-icon" />
          </div>
        </div>
        <h1 className="display-lg stagger-2" style={{ marginBottom: 20 }}>
          System <span className="text-primary">Architecture</span>
        </h1>
        <p className="title-md stagger-3" style={{ maxWidth: 800, margin: '0 auto', opacity: 0.9 }}>
          A deep dive into the underlying machine learning models, infrastructure, and technical design of the NagrikShield platform.
        </p>
      </section>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <section className="guide-section stagger-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
            <Cpu size={32} className="text-secondary" />
            <h2 className="display-sm text-center">Core Technologies</h2>
          </div>
          
          <div className="grid-3" style={{ gap: 24 }}>
            <div className="tech-card">
              <div>
                <span className="badge-tech">Frontend Framework</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Code size={20} className="text-primary"/> Next.js 15 & React</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Built on the bleeding edge of the Next.js App Router. Leverages a hybrid rendering approach with React Server Components for heavy data fetching, while isolating interactivity to Client Components. Features dynamic routing and built-in API routes for backend orchestration.
                </p>
              </div>
            </div>
            
            <div className="tech-card">
              <div>
                <span className="badge-tech">Machine Learning</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={20} className="text-primary"/> LLM & RAG Engine</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Powered by <strong>Google's Gemma-3 (4B)</strong> model via local Ollama inference. The persistent Flask server utilizes <code>SentenceTransformers (all-MiniLM-L6-v2)</code> to encode user queries and performs high-speed vector retrieval using NumPy/FAISS over a custom civic knowledge base.
                </p>
              </div>
            </div>
            
            <div className="tech-card">
              <div>
                <span className="badge-tech">Computer Vision</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={20} className="text-primary"/> Python CLIP Pipeline</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  A zero-shot image classification and similarity pipeline powered by OpenAI's <code>CLIP (ViT-B/32)</code>. Used during the admin resolution phase to mathematically verify if the uploaded "fixed" image semantically matches the original damage context, preventing corruption and false resolutions.
                </p>
              </div>
            </div>

            <div className="tech-card">
              <div>
                <span className="badge-tech">Geospatial Data</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Network size={20} className="text-primary"/> Interactive Mapping</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Integrated with <code>react-leaflet</code> and OpenStreetMap. Features auto-zooming GPS heuristics, full-screen hardware-accelerated rendering, and coordinate tracking. Powers the geographical "Swarm Validation" radius and dynamic map visualizations.
                </p>
              </div>
            </div>

            <div className="tech-card">
              <div>
                <span className="badge-tech">Data Architecture</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={20} className="text-primary"/> Async Storage Engine</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  To ensure the demo runs entirely client-side without requiring complex database provisioning, we built a bespoke Async Storage wrapper over <code>localStorage</code>. It simulates high-latency network requests, supports complex relational querying, and maintains a persistent application state globally.
                </p>
              </div>
            </div>

            <div className="tech-card">
              <div>
                <span className="badge-tech">Algorithms</span>
                <h3 className="title-md mb-3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={20} className="text-primary"/> Deduplication DNA</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Issues generate a unique "DNA" hash based on geocoordinates, structural severity, and semantic category. When a new issue is submitted, the system runs a Cosine Similarity check against the unresolved database. &gt;80% similarity triggers the Deduplication block.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section" style={{ borderTop: '1px solid var(--border-light)', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Zap size={32} className="text-secondary" />
            <h2 className="display-sm">The 4-Layer Fusion API</h2>
          </div>
          <div className="card-elevated" style={{ background: 'var(--surface-card)' }}>
            <p className="text-secondary mb-6" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
              The core intelligence behind NagrikShield is the <strong>Hyperlocal Fusion Pipeline</strong>. When a citizen submits a photo, it passes through 4 distinct micro-services to calculate the exact civic impact and financial "Cost of Inaction".
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>1</div>
                <div>
                  <h4 className="title-sm mb-1">Semantic Classification Node</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Analyzes pixel-level data to categorize the issue (Pothole, Water Leak, Garbage) and outputs a raw confidence threshold.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>2</div>
                <div>
                  <h4 className="title-sm mb-1">Structural Assessment Node</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Uses edge-density detection heuristics and color-signature mapping (detecting rust or water signatures) to assign a base severity from 0-10.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>3</div>
                <div>
                  <h4 className="title-sm mb-1">Geo-Temporal Risk Node</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Applies dynamic multipliers based on the time of day (nighttime reports are riskier) and zone priority (residential vs commercial arteries).</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>4</div>
                <div>
                  <h4 className="title-sm mb-1">Generative Cascade Engine</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Takes the fused data block and queries the local LLM to project the future secondary damages (e.g. A water leak causing a sinkhole in 3 weeks) and calculates the exact ROI for fixing the issue immediately.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="guide-section" style={{ textAlign: 'center', paddingBottom: 100 }}>
          <div className="card-elevated" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-medium)', padding: '60px 40px' }}>
            <h2 className="display-sm mb-4">View the Implementation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
              The full source code demonstrates advanced frontend architectures, offline-first data synchronization, and cutting-edge local AI model integration.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/guide" className="btn btn-secondary" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                Read Game Manual
              </Link>
              <Link href="/" className="btn btn-primary" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
