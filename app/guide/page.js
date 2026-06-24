'use client';

import { ShieldCheck, Cpu, Network, Award, Zap, Camera, Activity, AlertTriangle, Layers, BookOpen, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .guide-hero {
          padding: 80px 20px;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-main) 0%, #e0f2fe 100%);
          border-bottom: 1px solid var(--border-light);
          position: relative;
          overflow: hidden;
        }
        .guide-hero::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(13, 148, 136, 0.05) 0%, transparent 60%);
          animation: rotateBg 20s linear infinite;
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

        .term-row {
          display: flex;
          gap: 24px;
          padding: 24px;
          background: var(--surface-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          margin-bottom: 16px;
          align-items: center;
          transition: all 0.3s ease;
        }
        .term-row:hover {
          background: var(--surface-hover);
          transform: scale(1.01);
          border-color: var(--border-medium);
        }
        .term-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          background: rgba(13, 148, 136, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
      `}} />

      <section className="guide-hero">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }} className="stagger-1">
          <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '50%', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
            <Cpu size={48} className="text-primary pulse-icon" />
          </div>
        </div>
        <h1 className="display-lg stagger-2" style={{ marginBottom: 20 }}>
          The Engine <span className="text-primary">Room</span>
        </h1>
        <p className="title-md stagger-3" style={{ color: 'var(--text-muted)', maxWidth: 700, margin: '0 auto' }}>
          Discover the technology stack and rules behind CivicTech Command. A complete guide for judges and citizens.
        </p>
      </section>

      <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Section 1: The Tech Stack */}
        <section className="guide-section stagger-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Layers size={32} className="text-secondary" />
            <h2 className="display-sm">Architecture & Tech Stack</h2>
          </div>
          
          <div className="grid-3" style={{ gap: 24 }}>
            <div className="tech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Activity size={24} className="text-primary" />
                <h3 className="title-sm">Next.js App Router</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Built natively on React and Next.js 15 using Server Components where possible, and seamless Client Components for high interactivity. Fully static, edge-ready performance.
              </p>
            </div>
            
            <div className="tech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <MapPin size={24} className="text-primary" />
                <h3 className="title-sm">Leaflet GPS Mapping</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                Features a sophisticated dynamic Leaflet map integration allowing citizens to precisely drop pins on the map for accurate issue localization and deduplication geometry.
              </p>
            </div>
            
            <div className="tech-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Cpu size={24} className="text-primary" />
                <h3 className="title-sm">Python Vision Backend</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                A custom Python Flask backend running CLIP (ViT-B-32) to perform deep semantic image similarity validation when government workers resolve issues.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Gamified Dictionary */}
        <section className="guide-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <BookOpen size={32} className="text-secondary" />
            <h2 className="display-sm">The Game Manual (Terminology)</h2>
          </div>
          <p className="text-muted mb-6" style={{ fontSize: '1.1rem' }}>
            We've gamified civic responsibility. Here is how the mechanics work:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            <div className="term-row">
              <div className="term-icon"><ShieldCheck size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Shield Points (SP) <span className="badge badge-success" style={{ fontSize: 10 }}>Economy</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  The core currency of the platform. Think of this as "Stake". When you report an issue, the system automatically stakes SP. If the AI or the swarm determines your report is fake, you lose the stake. When the government fixes the issue, your SP is returned with a massive bonus!
                </p>
              </div>
            </div>

            <div className="term-row">
              <div className="term-icon"><Award size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Experience (XP) & Levels <span className="badge badge-info" style={{ fontSize: 10 }}>Progression</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  You earn XP for validating other people's reports, completing Quests, and upvoting critical infrastructure failures. Earning XP levels up your profile from "Citizen" to "Guardian" to "Administrator", unlocking unique profile badges.
                </p>
              </div>
            </div>

            <div className="term-row">
              <div className="term-icon"><Network size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Swarm Validation <span className="badge badge-warning" style={{ fontSize: 10 }}>Consensus</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  A single report isn't enough to dispatch a government truck. Our "Swarm" algorithm requires nearby citizens to physically validate the issue. The app calculates a Confidence Score (0-100%). At 85%, the issue is officially marked "Community Validated".
                </p>
              </div>
            </div>

            <div className="term-row">
              <div className="term-icon"><Layers size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  AI Deduplication <span className="badge badge-info" style={{ fontSize: 10 }}>Optimization</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  What happens if 10 people report the exact same pothole? The AI Engine calculates Issue DNA to detect duplicate reports within a 50-meter radius. Instead of creating 10 different tickets, it blocks you and advises you to pool your Shield Points by validating the existing report.
                </p>
              </div>
            </div>

            <div className="term-row">
              <div className="term-icon"><AlertTriangle size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Civic Vitals <span className="badge badge-critical" style={{ fontSize: 10 }}>Analytics</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  Neighborhoods have "Health Vitals" ranging from 0% to 100%. If a neighborhood is flooded with unresolved potholes, the Infrastructure and Safety vitals drop dynamically. As soon as the government resolves the issue, the vital instantly recovers!
                </p>
              </div>
            </div>

            <div className="term-row">
              <div className="term-icon"><Camera size={32} /></div>
              <div>
                <h3 className="title-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Python Vision Verification <span className="badge badge-success" style={{ fontSize: 10 }}>Anti-Corruption</span>
                </h3>
                <p className="text-secondary mt-2" style={{ lineHeight: 1.5 }}>
                  To prevent corrupt officials from falsely marking an issue as "Resolved", the Admin must upload a proof photo of the repair. Our Python CLI backend analyzes the structural integrity of the fix against the original image using deep semantic image embedding. Only a valid fix releases the citizens' staked SP!
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: Call to Action */}
        <section className="guide-section" style={{ textAlign: 'center', paddingBottom: 100 }}>
          <div className="card-elevated" style={{ background: 'var(--secondary)', color: 'white', padding: '60px 40px' }}>
            <h2 className="display-sm mb-4" style={{ color: 'white' }}>Ready to explore the Command Center?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
              Jump into the Admin dashboard using the credentials <strong>admin@nagrik.in</strong> / <strong>admin123</strong>, or test the citizen features on the Live Map.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/admin" className="btn btn-primary" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                Enter Admin Portal
              </Link>
              <Link href="/map" className="btn btn-ghost" style={{ height: 48, padding: '0 32px', fontSize: 16, border: '1px solid var(--text-muted)', color: 'white' }}>
                View Live Map <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
