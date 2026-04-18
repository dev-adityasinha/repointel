import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportAnalysisToPDF(
  elementId: string,
  repoName: string,
  analysis: any
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Element not found for export");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const availableWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * availableWidth) / canvas.width;

    let yPosition = margin;

    // Title
    pdf.setFontSize(24);
    pdf.text(`Repository Analysis Report`, margin, yPosition);
    yPosition += 10;

    // Repository Name
    pdf.setFontSize(16);
    pdf.text(`${repoName}`, margin, yPosition);
    yPosition += 8;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 12;
    pdf.setTextColor(0, 0, 0);

    // Add screenshot
    if (yPosition + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.addImage(imgData, "PNG", margin, yPosition, availableWidth, imgHeight);
    yPosition += imgHeight + 10;

    // Add summary text
    if (yPosition > pageHeight - margin - 20) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.text("Summary", margin, yPosition);
    yPosition += 6;

    pdf.setFontSize(10);
    const summaryLines = pdf.splitTextToSize(analysis.summary, availableWidth);
    pdf.text(summaryLines, margin, yPosition);

    pdf.save(`${repoName}-analysis-report.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
}
