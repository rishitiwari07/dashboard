"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FormState = {
  name: string;
  email: string;
  phone: string;
  title: string;
  type: string;
};

export default function TeamOnboardingPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;

  const [linkValid, setLinkValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    title: "",
    type: "Employee",
  });

  useEffect(() => {
    if (!token) return;
    fetch(`/api/team-member-onboarding/form/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setLinkValid(true);
        } else {
          setLinkValid(false);
          setErrorMsg(data.message || "This link is invalid or has expired.");
        }
      })
      .catch(() => {
        setLinkValid(false);
        setErrorMsg("Unable to verify link. Please try again.");
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/team-member-onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || "Submission failed. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>WWS</div>
          <h1 style={styles.title}>Team Member Onboarding</h1>
          <p style={styles.subtitle}>Webwrite Services — Join our team</p>
        </div>

        {/* Loading */}
        {linkValid === null && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Verifying your invite link…</p>
          </div>
        )}

        {/* Invalid / expired */}
        {linkValid === false && (
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.errorTitle}>Link Unavailable</h2>
            <p style={styles.errorText}>{errorMsg || "This onboarding link is invalid or has already been used."}</p>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Details Submitted!</h2>
            <p style={styles.successText}>
              Thank you! Your information has been submitted. Our team will review it and get back to you shortly.
            </p>
          </div>
        )}

        {/* Form */}
        {linkValid === true && !submitted && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.formIntro}>
              Please fill in your details below to complete the onboarding process.
            </p>

            {errorMsg && <div style={styles.formError}>{errorMsg}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rishi Tiwari"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address *</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job Title / Role</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Employment Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Employee">Full-Time Employee</option>
                <option value="Intern">Intern</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contractor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={submitting ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
            >
              {submitting ? "Submitting…" : "Submit Details →"}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p>© {new Date().getFullYear()} Webwrite Services. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "40px 40px 32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "18px",
    letterSpacing: "2px",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    marginBottom: "16px",
    boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: 700,
    margin: "0 0 6px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    margin: 0,
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 0",
    gap: "16px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    margin: 0,
  },
  errorBox: {
    textAlign: "center",
    padding: "24px 16px",
  },
  errorIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "16px",
  },
  errorTitle: {
    color: "#f87171",
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  errorText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  successBox: {
    textAlign: "center",
    padding: "24px 16px",
  },
  successIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(34,197,94,0.15)",
    color: "#4ade80",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "16px",
  },
  successTitle: {
    color: "#4ade80",
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  successText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formIntro: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: "0 0 4px",
  },
  formError: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "13px",
    fontWeight: 500,
  },
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  select: {
    background: "rgba(30,27,60,0.9)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "13px 20px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "4px",
    boxShadow: "0 8px 24px rgba(102,126,234,0.35)",
    transition: "opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footer: {
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.25)",
    fontSize: "12px",
  },
};
