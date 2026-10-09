"use client";

interface Phase {
  name: string;
  details?: string;
  duration?: string;
  amount: number;
}

interface ProposalData {
  id: string;
  title: string;
  content?: string;
  status: string;
  currency?: string;
  validUntil?: string;
  terms?: string;
  phases?: Phase[];
  client?: {
    name?: string;
    companyName?: string;
    email?: string;
    companyAddress?: string;
    gstin?: string;
  };
  owner?: {
    name?: string;
    email?: string;
  };
}

interface Props {
  proposal: ProposalData;
  companyProfile: any;
}

export default function ProposalPrintPage({ proposal, companyProfile }: Props) {
  const currency = proposal.currency || "₹";
  const totalAmount = (proposal.phases || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const logoUrl = companyProfile?.logoUrl || "/header_logo.png";
  const companyName =
    companyProfile?.companyName || "WebWrite Services";
  const companyAddress = [
    companyProfile?.companyDetails?.address,
    companyProfile?.companyDetails?.city,
    companyProfile?.companyDetails?.state,
  ]
    .filter(Boolean)
    .join(", ");
  const companyEmail = companyProfile?.personalDetails?.email || "";
  const companyPhone = companyProfile?.personalDetails?.phone || "";
  const gstNumber = companyProfile?.taxDetails?.gstNumber || "";

  const clientName =
    proposal.client?.companyName || proposal.client?.name || "Client";
  const clientEmail = proposal.client?.email || "";
  const clientAddress = proposal.client?.companyAddress || "";
  const clientGstin = proposal.client?.gstin || "";

  const validUntilStr = proposal.validUntil
    ? new Date(proposal.validUntil).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No Expiry";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f3f4f6; font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; }

        .print-toolbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: #1e293b;
          color: white;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .print-toolbar-title { font-size: 14px; font-weight: 600; opacity: 0.9; }
        .print-toolbar-actions { display: flex; gap: 8px; }
        .print-btn {
          background: #3b82f6; color: white; border: none;
          padding: 8px 18px; border-radius: 6px; font-size: 13px;
          font-weight: 600; cursor: pointer;
        }
        .print-btn:hover { background: #2563eb; }
        .close-btn {
          background: transparent; color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 14px; border-radius: 6px;
          font-size: 13px; cursor: pointer;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); }

        .page-wrapper {
          padding-top: 64px;
          padding-bottom: 40px;
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .proposal-sheet {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          margin: 20px auto;
        }

        /* Header */
        .proposal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 40px 48px 32px;
          border-bottom: 3px solid #3b82f6;
          background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
        }
        .company-logo { height: 52px; width: auto; margin-bottom: 12px; object-fit: contain; }
        .company-name { font-size: 22px; font-weight: 800; color: #1e293b; }
        .company-details { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.6; }
        .proposal-badge {
          text-align: right;
        }
        .proposal-label {
          font-size: 32px;
          font-weight: 300;
          letter-spacing: 4px;
          color: #1e293b;
          text-transform: uppercase;
        }
        .proposal-number {
          font-size: 13px;
          color: #3b82f6;
          font-weight: 600;
          margin-top: 4px;
        }
        .status-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #d1fae5;
          color: #065f46;
        }

        /* Client + Info Row */
        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-cell {
          padding: 20px 24px;
          border-right: 1px solid #e5e7eb;
        }
        .info-cell:last-child { border-right: none; }
        .info-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .info-value { font-size: 15px; font-weight: 700; color: #1e293b; }
        .info-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

        /* Body */
        .proposal-body { padding: 32px 48px; }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #3b82f6;
          border-bottom: 2px solid #e0e7ff;
          padding-bottom: 8px;
          margin-bottom: 16px;
          margin-top: 28px;
        }
        .section-title:first-child { margin-top: 0; }
        .content-html { font-size: 13px; color: #374151; line-height: 1.7; }
        .content-html h1, .content-html h2, .content-html h3 { margin: 12px 0 6px; font-weight: 700; }
        .content-html p { margin: 6px 0; }
        .content-html ul, .content-html ol { padding-left: 20px; }
        .content-html li { margin: 3px 0; }

        /* Phases table */
        .phases-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-top: 4px;
        }
        .phases-table th {
          background: #f1f5f9;
          padding: 10px 14px;
          text-align: left;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }
        .phases-table th:last-child { text-align: right; }
        .phases-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
          color: #374151;
        }
        .phases-table td:last-child { text-align: right; font-weight: 600; }
        .phases-table tr:last-child td { border-bottom: none; }
        .phases-total-row td {
          background: #f8faff;
          font-weight: 800;
          font-size: 15px;
          border-top: 2px solid #3b82f6;
          color: #1e293b;
        }
        .amount-text { color: #3b82f6; }

        /* Terms */
        .terms-text {
          font-size: 12px;
          color: #64748b;
          line-height: 1.7;
          white-space: pre-wrap;
          background: #f8faff;
          border: 1px solid #e0e7ff;
          border-radius: 8px;
          padding: 16px;
        }

        /* Footer */
        .proposal-footer {
          border-top: 2px solid #e5e7eb;
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 12px;
          color: #94a3b8;
          background: #f8faff;
        }
        .signature-line {
          width: 160px;
          border-bottom: 1px solid #94a3b8;
          margin-bottom: 6px;
          height: 40px;
        }
        .signature-label { font-size: 11px; color: #64748b; font-weight: 600; }

        @media print {
          .print-toolbar { display: none !important; }
          body { background: white; }
          .page-wrapper { padding: 0; }
          .proposal-sheet { width: 100%; box-shadow: none; margin: 0; }
          @page { size: A4; margin: 10mm 15mm; }
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="print-toolbar">
        <span className="print-toolbar-title">
          Proposal — {proposal.title}
        </span>
        <div className="print-toolbar-actions">
          <button className="close-btn" onClick={() => window.close()}>
            ✕ Close
          </button>
          <button className="print-btn" onClick={() => window.print()}>
            🖨 Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="page-wrapper">
        <div className="proposal-sheet">
          {/* Header */}
          <div className="proposal-header">
            <div>
              <img src={logoUrl} alt="" className="company-logo" onError={(e) => { (e.target as any).style.display = 'none'; }} />
              <div className="company-name">{companyName}</div>
              {companyAddress && <div className="company-details">{companyAddress}</div>}
              {companyEmail && <div className="company-details">{companyEmail}{companyPhone ? ` · ${companyPhone}` : ""}</div>}
              {gstNumber && <div className="company-details">GST: {gstNumber}</div>}
            </div>
            <div className="proposal-badge">
              <div className="proposal-label">Proposal</div>
              <div className="proposal-number">ID: {proposal.id?.slice(-8).toUpperCase()}</div>
              <div className="status-badge">{proposal.status}</div>
            </div>
          </div>

          {/* Info Row */}
          <div className="info-row">
            <div className="info-cell">
              <div className="info-label">Prepared For</div>
              <div className="info-value">{clientName}</div>
              {clientEmail && <div className="info-sub">{clientEmail}</div>}
              {clientAddress && <div className="info-sub">{clientAddress}</div>}
              {clientGstin && <div className="info-sub">GSTIN: {clientGstin}</div>}
            </div>
            <div className="info-cell">
              <div className="info-label">Prepared By</div>
              <div className="info-value">{proposal.owner?.name || companyName}</div>
              {proposal.owner?.email && <div className="info-sub">{proposal.owner.email}</div>}
            </div>
            <div className="info-cell">
              <div className="info-label">Valid Until</div>
              <div className="info-value">{validUntilStr}</div>
              <div className="info-label" style={{ marginTop: 16 }}>Total Value</div>
              <div className="info-value amount-text">{currency} {totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Body */}
          <div className="proposal-body">
            {/* Intro/Content */}
            {proposal.content && (
              <>
                <div className="section-title">Introduction & Scope</div>
                <div
                  className="content-html"
                  dangerouslySetInnerHTML={{ __html: proposal.content }}
                />
              </>
            )}

            {/* Phases */}
            {(proposal.phases || []).length > 0 && (
              <>
                <div className="section-title">Project Phases & Pricing</div>
                <table className="phases-table">
                  <thead>
                    <tr>
                      <th style={{ width: "5%" }}>#</th>
                      <th style={{ width: "25%" }}>Phase</th>
                      <th>Deliverables</th>
                      <th style={{ width: "15%" }}>Duration</th>
                      <th style={{ width: "15%" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(proposal.phases || []).map((phase, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{phase.name}</td>
                        <td style={{ color: "#4b5563", fontSize: "12px" }}>{phase.details || "—"}</td>
                        <td>{phase.duration || "—"}</td>
                        <td>{currency} {Number(phase.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="phases-total-row">
                      <td colSpan={4} style={{ textAlign: "right", paddingRight: 14 }}>Grand Total</td>
                      <td className="amount-text">{currency} {totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* Terms */}
            {proposal.terms && (
              <>
                <div className="section-title">Terms & Conditions</div>
                <div className="terms-text">{proposal.terms}</div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="proposal-footer">
            <div>
              <div className="signature-line"></div>
              <div className="signature-label">Authorized Signature — {companyName}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: "#374151" }}>{companyName}</div>
              {companyEmail && <div>{companyEmail}</div>}
              <div style={{ marginTop: 4, fontSize: 11 }}>
                Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
