"use client";

import { useEffect } from "react";
import { InvoiceRenderer, InvoiceData } from "@/components/invoice-templates";

interface Props {
  invoice: InvoiceData;
  companyProfile: any;
}

export default function InvoicePrintPage({ invoice, companyProfile }: Props) {
  useEffect(() => {
    // Small delay to ensure rendering is complete, then trigger print dialog
    const timer = setTimeout(() => {
      // Don't auto-print, let user click the button
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #f3f4f6; font-family: sans-serif; }
        .print-toolbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #1e293b;
          color: white;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          print-color-adjust: exact;
        }
        .print-toolbar-title {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
        }
        .print-toolbar-actions { display: flex; gap: 8px; }
        .print-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .print-btn:hover { background: #2563eb; }
        .close-btn {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); }
        .page-wrapper {
          padding-top: 64px;
          padding-bottom: 40px;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .invoice-sheet {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          margin: 20px auto;
        }
        @media print {
          .print-toolbar { display: none !important; }
          body { background: white; }
          .page-wrapper { padding: 0; }
          .invoice-sheet {
            width: 100%;
            box-shadow: none;
            margin: 0;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      <div className="print-toolbar">
        <span className="print-toolbar-title">
          Invoice — {invoice.invoiceNumber}
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
        <div className="invoice-sheet">
          <InvoiceRenderer invoice={invoice} profile={companyProfile} />
        </div>
      </div>
    </>
  );
}
