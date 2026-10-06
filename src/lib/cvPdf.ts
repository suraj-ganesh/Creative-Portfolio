import { jsPDF } from "jspdf";
import { cv } from "@/data/cv";

/**
 * Builds the CV as a real PDF in the browser and downloads it directly
 * (no preview, no dialog). Layout mirrors the CV document: header with
 * contact details, summary, skills/tools, experience, education and
 * projects — monochrome, A4, selectable text.
 */
export function downloadCvPdf(): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PAGE_W = 595.28;
  const MARGIN = 48;
  const MAX_W = PAGE_W - MARGIN * 2;
  const BOTTOM = 786;
  const INK = "#161616";
  const MUTED = "#5a5a5a";
  const FAINT = "#9a9a9a";

  let y = 56;

  const pageBreak = (needed: number): void => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      y = 56;
    }
  };

  const rule = (): void => {
    pageBreak(24);
    y += 6;
    doc.setDrawColor(INK);
    doc.setLineWidth(2.5);
    doc.line(MARGIN, y, MARGIN + MAX_W * 0.32, y);
    doc.setDrawColor(FAINT);
    doc.setLineWidth(0.75);
    doc.line(MARGIN + MAX_W * 0.32, y, MARGIN + MAX_W, y);
    y += 14;
  };

  const section = (title: string): void => {
    pageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(INK);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 16;
  };

  const paragraph = (text: string, size = 10): void => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(text, MAX_W) as string[];
    pageBreak(lines.length * (size * 1.35) + 6);
    doc.text(lines, MARGIN, y);
    y += lines.length * (size * 1.35) + 6;
  };

  const bullets = (items: string[], size = 10): void => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(INK);
    const lh = size * 1.35;
    for (const item of items) {
      const lines = doc.splitTextToSize(item, MAX_W - 14) as string[];
      pageBreak(lines.length * lh + 4);
      lines.forEach((line, i) => {
        doc.text(i === 0 ? `•  ${line}` : `    ${line}`, MARGIN, y);
        y += lh;
      });
      y += 2;
    }
    y += 4;
  };

  const jobHead = (title: string, org: string, period: string): void => {
    pageBreak(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 14;
    const meta = [org, period].filter(Boolean).join(" | ");
    if (meta) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(MUTED);
      doc.text(meta, MARGIN, y);
      y += 14;
    }
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(INK);
  doc.text(cv.name.toUpperCase(), MARGIN, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(MUTED);
  doc.text(cv.role.toUpperCase(), MARGIN, y);
  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(INK);
  doc.text(`${cv.phone}   •   ${cv.email}   •   ${cv.website}`, MARGIN, y);
  y += 8;

  rule();
  section("Professional Summary");
  paragraph(cv.summary);

  rule();
  section("Skills");
  paragraph(cv.skills.join("   •   "));

  section("Tools");
  paragraph(cv.tools.join("   •   "));

  rule();
  section("Work Experience");
  for (const job of cv.experience) {
    jobHead(job.title, job.org, job.period);
    bullets(job.bullets);
  }

  rule();
  section("Education");
  for (const e of cv.education) {
    pageBreak(44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK);
    doc.text(e.degree.toUpperCase(), MARGIN, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(e.school, MARGIN, y);
    y += 14;
    doc.text(e.period, MARGIN, y);
    y += 20;
  }

  rule();
  section("Projects");
  for (const p of cv.projects) {
    jobHead(p.title, "", "");
    paragraph(p.description);
  }

  doc.save("Suraj-Ganesh-CV.pdf");
}
