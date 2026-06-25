import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Opens a clean, isolated print window containing only the invoice.
 * - invoiceNumber becomes the default "Save As" filename in the browser PDF dialog
 * - Popup is isolated from dark-mode/app-chrome so no bleed-in
 * - Captures exact DOM state AFTER flushSync so pending amount is included
 */
export function printInvoice(invoiceNumber?: string) {
  const el = document.getElementById('invoice-root');
  if (!el) {
    window.print();
    return;
  }

  // Capture the current rendered HTML (including pending amount, template styles)
  const invoiceHtml = el.outerHTML;

  const printWin = window.open('', '_blank', 'width=900,height=1100,scrollbars=no');
  if (!printWin) {
    // Popup blocked — fall back to page print
    window.print();
    return;
  }

  const title = invoiceNumber || 'Invoice';

  printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      background: #ffffff;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Desktop: centre the 820px invoice with padding */
    body {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    #invoice-root {
      width: 820px;
      flex-shrink: 0;
    }

    /* Mobile: scale the 820px invoice down to fit the screen */
    @media screen and (max-width: 860px) {
      body {
        padding: 0;
        overflow-x: hidden;
      }
      #invoice-root {
        width: 820px;
        transform-origin: top left;
        transform: scale(var(--inv-scale, 1));
      }
      /* JS sets --inv-scale below */
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm;
      }
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        display: block !important;
      }
      #invoice-root {
        width: 100% !important;
        transform: none !important;
      }
    }
  </style>
</head>
<body>
  ${invoiceHtml}
  <script>
    // Scale invoice to fit mobile viewport width
    function applyScale() {
      var vw = window.innerWidth;
      if (vw < 860) {
        var scale = Math.min(1, (vw) / 820);
        document.documentElement.style.setProperty('--inv-scale', scale);
        // Shrink body height to match scaled content
        var root = document.getElementById('invoice-root');
        if (root) {
          root.parentElement.style.height = (root.scrollHeight * scale) + 'px';
        }
      }
    }
    applyScale();
    window.addEventListener('resize', applyScale);
  </script>
</body>
</html>`);

  printWin.document.close();

  // Print after fonts/content load
  printWin.addEventListener('load', () => {
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 350);
  });

  // Safety fallback if load never fires
  setTimeout(() => {
    if (printWin && !printWin.closed) {
      printWin.focus();
      printWin.print();
    }
  }, 1200);
}

export async function downloadInvoicePDF(invoiceNumber: string) {
  const el = document.getElementById('invoice-root');
  if (!el) throw new Error('Invoice element not found');

  // Remove dark mode temporarily for clean PDF capture
  const wasDark = document.documentElement.classList.contains('dark');
  if (wasDark) document.documentElement.classList.remove('dark');

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 860,
  });

  if (wasDark) document.documentElement.classList.add('dark');

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= pageH - margin * 2) {
    pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
  } else {
    // Multi-page support
    const pageImgH = pageH - margin * 2;
    let srcY = 0;
    const totalH = canvas.height;
    const ratio = imgW / canvas.width;
    while (srcY < totalH) {
      const sliceH = Math.min(pageImgH / ratio, totalH - srcY);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.ceil(sliceH);
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceData = sliceCanvas.toDataURL('image/png');
      if (srcY > 0) pdf.addPage();
      pdf.addImage(sliceData, 'PNG', margin, margin, imgW, sliceH * ratio);
      srcY += sliceH;
    }
  }

  pdf.save(`Invoice-${invoiceNumber}.pdf`);
}
