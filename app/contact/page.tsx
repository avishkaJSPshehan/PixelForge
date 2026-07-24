'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const mailtoLink = `mailto:[YOUR EMAIL]?subject=${encodeURIComponent(form.subject || 'PixelForge Contact')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailtoLink;
    setSent(true);
    setError('');
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 28, paddingBottom: 80 }}>

            <Link href="/" className="back-btn">← Back to Home</Link>

            <div className="tool-header animate-in" style={{ textAlign: 'left', marginBottom: 32 }}>
              <div
                className="tool-header-icon"
                style={{
                  background: 'linear-gradient(135deg,rgba(67,233,123,.18),rgba(56,178,248,.1))',
                  border: '1px solid rgba(67,233,123,.25)',
                }}
              >
                ✉️
              </div>
              <h1>Contact Us</h1>
              <p>
                PixelForge is built and maintained by <strong>ByteBuilders</strong>. We read every
                message we receive — your feedback genuinely shapes what we build next.
              </p>
            </div>

            <div className="animate-in delay-1">

              {/* Contact info cards */}
              <div className="contact-info-grid">
                <div className="contact-info-card">
                  <span className="contact-info-icon">📧</span>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <a href="mailto:[YOUR EMAIL]" className="contact-info-value">
                      [YOUR EMAIL]
                    </a>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="contact-info-icon">💬</span>
                  <div>
                    <div className="contact-info-label">WhatsApp</div>
                    <a
                      href="https://wa.me/[YOUR WHATSAPP NUMBER]"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info-value"
                    >
                      [YOUR WHATSAPP NUMBER]
                    </a>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="contact-info-icon">🏢</span>
                  <div>
                    <div className="contact-info-label">Company</div>
                    <div className="contact-info-value">ByteBuilders</div>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="contact-info-icon">⚡</span>
                  <div>
                    <div className="contact-info-label">Response Time</div>
                    <div className="contact-info-value">1–2 business days</div>
                  </div>
                </div>
              </div>

              {/* Common reasons to reach out */}
              <div className="contact-reasons">
                <div className="contact-reasons-title">Common reasons people reach out</div>
                <div className="contact-reason-item">
                  <span className="contact-reason-icon">🐛</span>
                  <span><strong>Bug reports</strong> — Something isn&apos;t working as expected? Tell us exactly what happened and we&apos;ll investigate.</span>
                </div>
                <div className="contact-reason-item">
                  <span className="contact-reason-icon">💡</span>
                  <span><strong>Tool requests</strong> — Got an idea for a new file tool you wish existed? We&apos;re always looking for what to build next.</span>
                </div>
                <div className="contact-reason-item">
                  <span className="contact-reason-icon">💼</span>
                  <span><strong>Business inquiries</strong> — Partnership, licensing, or commercial enquiries? Reach out and we&apos;ll get back to you.</span>
                </div>
                <div className="contact-reason-item">
                  <span className="contact-reason-icon">💬</span>
                  <span><strong>General feedback</strong> — Enjoying PixelForge? Have a suggestion? We genuinely love hearing from users.</span>
                </div>
              </div>

              {/* Contact form */}
              {!sent ? (
                <form className="contact-form glass-card" onSubmit={handleSubmit} noValidate style={{ marginTop: 28 }}>
                  <div className="contact-form-title">Send a Message</div>

                  <div className="contact-form-row">
                    <div className="contact-field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="contact-name" className="contact-field-label">Name <span className="contact-required">*</span></label>
                      <input
                        id="contact-name"
                        type="text"
                        className="contact-field-input"
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="contact-field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="contact-email" className="contact-field-label">Email <span className="contact-required">*</span></label>
                      <input
                        id="contact-email"
                        type="email"
                        className="contact-field-input"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-field-group" style={{ marginTop: 16 }}>
                    <label htmlFor="contact-subject" className="contact-field-label">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      className="contact-field-input"
                      placeholder="e.g. Bug report, Feature request, Business inquiry…"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>

                  <div className="contact-field-group">
                    <label htmlFor="contact-message" className="contact-field-label">Message <span className="contact-required">*</span></label>
                    <textarea
                      id="contact-message"
                      className="contact-field-input contact-field-textarea"
                      placeholder="Describe your question, bug, or idea in as much detail as you can…"
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>

                  {error && <p className="contact-error">⚠️ {error}</p>}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 4 }}>
                    ✉️ Send Message
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                    This opens your default email client. Alternatively, email us directly at{' '}
                    <a href="mailto:[YOUR EMAIL]" style={{ color: 'var(--primary)' }}>[YOUR EMAIL]</a>.
                  </p>
                </form>
              ) : (
                <div className="glass-card animate-fade" style={{ padding: '40px 32px', textAlign: 'center', marginTop: 28 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ marginBottom: 8 }}>Message Ready to Send</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Your default mail app has been opened with the message pre-filled. Please click
                    Send in your email client. We typically respond within 1–2 business days.
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSent(false)}
                    style={{ marginTop: 20 }}
                  >
                    Send Another Message
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
