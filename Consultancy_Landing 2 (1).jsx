import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Lock, TrendingUp, Users, Mail, Calendar } from 'lucide-react';

export default function ConsultancyLanding() {
  const [email, setEmail] = useState('');
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const handleEmailSignup = (e) => {
    e.preventDefault();
    // In production, integrate with email service (Substack, ConvertKit, etc.)
    alert(`Thanks for your interest. Check your email at ${email} for next steps.`);
    setEmail('');
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        
        h1, h2, h3 { font-family: 'Fraunces', serif; }
        body, input, button { font-family: 'IBM Plex Mono', monospace; }
        
        .gradient-accent {
          background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
        }
        
        .border-accent {
          border: 2px solid #1e3a8a;
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(30, 58, 138, 0.15);
        }
        
        .nav-underline {
          position: relative;
          text-decoration: none;
        }
        
        .nav-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #1e3a8a;
          transition: width 0.3s ease;
        }
        
        .nav-underline:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-accent rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">MSY</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Deterministic Systems</span>
          </div>
          <div className="hidden md:flex gap-8">
            {['Methodology', 'Services', 'Case Studies', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-underline text-sm font-medium text-gray-700">
                {item}
              </a>
            ))}
          </div>
          <button
            onClick={() => setConsultationOpen(true)}
            className="px-4 py-2 bg-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800 transition"
          >
            Schedule Call
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a8a" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded">
              <span className="text-xs font-semibold text-blue-900 tracking-wider">ENTERPRISE SYSTEMS ARCHITECTURE</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
              Systems That Don't Drift
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
              For enterprises where configuration inconsistency costs millions, where state corruption is unthinkable, where every layer must enforce its invariants. MSY Protocol brings deterministic architecture to your infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => setConsultationOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-accent text-white rounded font-semibold hover:shadow-lg transition"
              >
                Schedule 30-Min Diagnostic <ArrowRight size={20} />
              </button>
              <button
                onClick={() => window.location.href = '#services'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-900 rounded font-semibold hover:border-blue-900 transition"
              >
                See Our Approach <ArrowRight size={20} />
              </button>
            </div>

            {/* Social proof */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$500M+</div>
                <p className="text-sm text-gray-600">In annual throughput managed</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">99.999%</div>
                <p className="text-sm text-gray-600">Uptime across systems</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">15min</div>
                <p className="text-sm text-gray-600">MTTR for infrastructure changes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">The Enterprise Systems Problem</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            Most enterprises build systems where consistency is hoped for, not guaranteed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'Configuration Drift',
                description: 'Manual changes to production cause undocumented state divergence. Six months later, nobody remembers why this service behaves differently.'
              },
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'State Corruption',
                description: 'Replication failures, network splits, or race conditions leave your data inconsistent across services. Recovery takes weeks.'
              },
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'Uncontrolled Change',
                description: 'No governance means anyone with access can modify production. Compliance audits reveal a trail of unapproved changes.'
              },
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'Drift Detection Lag',
                description: 'You notice inconsistency weeks after it occurs. By then, the damage is done and root cause is impossible to determine.'
              },
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'Hidden Operational Burden',
                description: 'Your platform team spends 40% of time reconciling systems instead of building. Velocity stalls. On-call burden explodes.'
              },
              {
                icon: <AlertCircle size={24} className="text-red-600" />,
                title: 'Compliance Risk',
                description: 'Regulations (SOC2, HIPAA, PCI-DSS) require audit trails and change control. Manual systems can\'t prove compliance.'
              }
            ].map((problem, idx) => (
              <div key={idx} className="p-6 bg-white rounded border border-gray-200 card-hover">
                <div className="mb-4">{problem.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-red-50 border-l-4 border-red-600 rounded">
            <p className="text-gray-900 font-semibold">
              💰 <strong>Hidden Cost</strong>: The average enterprise loses $5-20M annually to undetected drift, failed deployments, and incident recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">MSY Protocol: Five Layers</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            A deterministic architecture where every layer enforces invariants. Your systems stop drifting.
          </p>

          <div className="space-y-6">
            {[
              {
                layer: 'Kernel',
                invariant: 'Never corrupt state',
                description: 'Immutable state registry with cryptographic sealing. All writes are logged, all reads validated against source of truth. Fail-closed defaults.',
                example: 'Event log + state snapshots with quorum-based consistency'
              },
              {
                layer: 'Envelope',
                invariant: 'Contain failure modes',
                description: 'Explicit boundary contracts between services. Failures isolate instead of cascade. Circuit breakers, timeout enforcement, explicit dependency management.',
                example: 'Service mesh with mutual TLS, request tracing, automatic retries with backoff'
              },
              {
                layer: 'Lattice',
                invariant: 'Monitor divergence',
                description: 'Continuous validation of configuration against single source of truth. Real-time alerts on drift. Audit trail of all changes.',
                example: 'Git-based SSOT + continuous reconciliation + alerting'
              },
              {
                layer: 'Operator',
                invariant: 'Single source of truth',
                description: 'Deterministic codegen produces all infrastructure. No manual changes. Every deployment is reproducible.',
                example: 'Infrastructure as code + code generation + templating'
              },
              {
                layer: 'Governance',
                invariant: 'Enforce consistency',
                description: 'Change control, approval workflows, digital signatures. Every change is auditable and reversible.',
                example: 'Pull request workflow + automated testing + approval gates'
              }
            ].map((layer, idx) => (
              <div key={idx} className="p-8 border-2 border-gray-200 rounded hover:border-blue-900 transition card-hover">
                <div className="flex items-start gap-6">
                  <div className="text-5xl font-bold text-blue-900 opacity-20 flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{layer}</h3>
                    <p className="text-sm text-blue-900 font-semibold mb-3 tracking-wide">Invariant: {layer.invariant}</p>
                    <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                      <code className="bg-gray-100 px-3 py-1 rounded">{example}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Engagement Models</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            Fixed-scope projects tailored to enterprise complexity and risk tolerance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Systems Diagnostic',
                duration: '2 weeks',
                price: '$25K - $50K',
                description: 'Audit your current architecture. Identify drift, state consistency risks, and governance gaps. Deliver roadmap.',
                deliverables: [
                  'Architecture audit report',
                  'Risk assessment matrix',
                  'MSY Protocol alignment gaps',
                  '12-month implementation roadmap'
                ]
              },
              {
                title: 'Core Layer Implementation',
                duration: '8-12 weeks',
                price: '$50K - $100K',
                description: 'Implement one critical MSY layer. Could be state registry, boundary contracts, or drift detection.',
                deliverables: [
                  'Design review & approval',
                  'Reference implementation',
                  'Team knowledge transfer',
                  'Operational runbook',
                  '4-week support period'
                ]
              },
              {
                title: 'Full System Redesign',
                duration: '16-24 weeks',
                price: '$100K - $250K+',
                description: 'End-to-end MSY Protocol implementation. All five layers, fully integrated, production-ready.',
                deliverables: [
                  'Complete architecture redesign',
                  'Phased migration plan',
                  'All five layers implemented',
                  'Compliance documentation',
                  'Team training program',
                  '8-week support period'
                ]
              }
            ].map((service, idx) => (
              <div key={idx} className={`p-8 rounded border-2 card-hover ${idx === 1 ? 'border-blue-900 bg-white shadow-lg' : 'border-gray-200 bg-white'}`}>
                {idx === 1 && <div className="text-xs font-bold text-blue-900 mb-4 tracking-widest">MOST POPULAR</div>}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-blue-900">{service.price}</div>
                      <div className="text-xs text-gray-600 mt-1">{service.duration}</div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3">
                  {service.deliverables.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-blue-900 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setConsultationOpen(true)}
                  className="w-full mt-8 py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Preview */}
      <section id="case-studies" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Real-World Impact</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            How enterprises reduced drift, locked state consistency, and reclaimed operational capacity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                industry: 'Fintech',
                challenge: 'Payment system state divergence caused $2M in failed reconciliations',
                solution: 'Kernel Layer: Immutable event log + state registry',
                result: '100% reconciliation accuracy, zero divergence incidents in 18 months'
              },
              {
                industry: 'Healthcare',
                challenge: 'HIPAA audit revealed undocumented production changes across 50+ services',
                solution: 'Governance + Lattice: Git-based SSOT + approval workflow + drift monitoring',
                result: 'Full audit trail compliance, 100% documented changes, HIPAA certification'
              },
              {
                industry: 'E-Commerce',
                challenge: 'Cascading failures: checkout outage took down recommendations and analytics',
                solution: 'Envelope Layer: Service boundaries + circuit breakers + explicit contracts',
                result: '8x blast radius reduction, MTTR from 45min to 12min'
              },
              {
                industry: 'Infrastructure',
                challenge: 'Kubernetes drift meant manual fixes to half of new deployments',
                solution: 'Operator Layer: Infrastructure codegen + declarative SSOT + validation',
                result: '98% reduction in deployment errors, 60% faster release cycles'
              }
            ].map((study, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded border border-gray-200 card-hover">
                <div className="text-sm font-bold text-blue-900 tracking-widest mb-3">{study.industry}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{study.challenge}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">SOLUTION</p>
                    <p className="text-sm text-gray-700">{study.solution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">RESULT</p>
                    <p className="text-sm text-green-700 font-semibold">{study.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Interested in a detailed case study? We'll send a comprehensive report.</p>
            <button
              onClick={() => setConsultationOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-900 text-blue-900 rounded font-semibold hover:bg-blue-50 transition"
            >
              Request Case Study <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 gradient-accent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12">Why Choose MSY Protocol</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                'Deterministic, not probabilistic. Every invariant is verifiable.',
                'Proven at scale: $500M+ in annual throughput across multiple enterprises.',
                'Not another observability tool. We architect systems that don\'t need excessive monitoring.',
                'Clear methodology. Five layers, one principle per layer. No guesswork.',
                'Fixed-scope engagements. No open-ended time-and-materials. You know the cost upfront.'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 text-white">
                  <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 p-8 rounded border border-white/20 backdrop-blur">
              <h3 className="text-2xl font-bold text-white mb-6">The Architect Loop</h3>
              <div className="space-y-4 text-white text-sm">
                {[
                  '1. Observe — Collect current state across your systems',
                  '2. Evaluate — Check invariants, identify violations',
                  '3. Project — Model the intervention and trade-offs',
                  '4. Act — Execute the change safely',
                  '5. Seal — Lock configuration, audit the change',
                  '6. Return — Observe again. Did it work?'
                ].map((step, idx) => (
                  <p key={idx}>{step}</p>
                ))}
              </div>
              <p className="text-white/70 text-xs mt-6 italic">This loop is how we architect. Methodical. Verifiable. Repeatable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">Common Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Is MSY Protocol compatible with our existing stack?',
                a: 'Yes. MSY is architecture-agnostic. We work with Kubernetes, VMs, serverless, databases, message queues—whatever your current stack. We help you apply invariant-driven thinking to what you have.'
              },
              {
                q: 'How long does implementation take?',
                a: 'Depends on scope. A diagnostic takes 2 weeks. A single layer (e.g., Lattice drift detection) takes 8-12 weeks. Full system redesign is 16-24 weeks. We deliver in phases so you see value incrementally.'
              },
              {
                q: 'What if we\'re not ready for a big engagement?',
                a: 'Start with the diagnostic. For $25-50K and 2 weeks, you get clarity on where you stand and a roadmap. No commitment beyond that. Many clients start with diagnostic → implement one layer → then decide on phase 2.'
              },
              {
                q: 'Do you provide ongoing support?',
                a: 'Yes. Every engagement includes 4-8 weeks of post-implementation support. We\'re available for questions, refinements, and knowledge transfer. After that, you can engage us for support retainers or additional projects.'
              },
              {
                q: 'Can you work with our existing vendor/consultant?',
                a: 'Absolutely. We often work alongside your current teams. We come in, architect the approach, implement or guide implementation, then hand off to your team.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-700 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Build Deterministic Systems?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with a 30-minute diagnostic. No cost. No obligation. Just clarity on where you stand.
          </p>

          <button
            onClick={() => setConsultationOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-accent text-white rounded font-semibold hover:shadow-lg transition mb-6"
          >
            Schedule Your 30-Min Diagnostic <Calendar size={20} />
          </button>

          <p className="text-gray-600">Or email us at <span className="font-mono font-semibold">hello@deterministic.systems</span></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">MSY</span>
              </div>
              <span className="text-white font-bold">Deterministic Systems</span>
            </div>
            <p className="text-sm">Architecture that doesn't drift.</p>
          </div>
          <div className="text-right text-sm">
            <p>© 2024 MSY Protocol</p>
            <p className="mt-2">Status: <span className="text-green-400">Sealed ✓</span></p>
          </div>
        </div>
      </footer>

      {/* Consultation Modal */}
      {consultationOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Diagnostic</h3>
            <p className="text-gray-600 mb-6">30 minutes. No cost. No sales pitch. Just technical clarity.</p>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-900"
              />
              <input
                type="email"
                placeholder="your.email@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-900"
              />
              <input
                type="text"
                placeholder="Your company"
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-900"
              />
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-900"
              >
                <option>Select preferred date/time</option>
                <option>Monday 10am ET</option>
                <option>Tuesday 2pm ET</option>
                <option>Wednesday 11am ET</option>
                <option>Thursday 3pm ET</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setConsultationOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 gradient-accent text-white rounded font-semibold hover:shadow-lg transition"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
