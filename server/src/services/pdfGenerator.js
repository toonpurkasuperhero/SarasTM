// server/src/services/pdfGenerator.js
const PDFDocument = require('pdfkit');

function generateExportDeclaration(product, hsnSuggestion) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Dark Blue Header Banner
    doc.rect(0, 0, 595, 110).fill('#001645');

    // Header Content
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold');
    doc.text('DRAFT EXPORT DECLARATION', 40, 35);
    doc.fillColor('#00BAF2').fontSize(9).font('Helvetica-Bold');
    doc.text('SARAS AI CUSTOMS COMPLIANCE SUITE • PROVENANCE ADVISORY', 40, 65);

    // Vetted Stamp Box on Banner Right
    doc.rect(470, 30, 85, 50).lineWidth(1.5).stroke('#00BAF2');
    doc.fillColor('#00BAF2').fontSize(8).font('Helvetica-Bold');
    doc.text('AI CLASSIFIED', 470, 42, { width: 85, align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(9).text(hsnSuggestion?.code || '9701.10.10', 470, 56, { width: 85, align: 'center' });

    // Body Setup
    let y = 140;
    
    // Draw Box for Exporter Details
    doc.rect(40, y, 515, 80).fill('#F8FAFC');
    doc.rect(40, y, 515, 80).strokeColor('#E2E8F0').lineWidth(1).stroke();
    
    doc.fillColor('#001645').fontSize(10).font('Helvetica-Bold');
    doc.text('EXPORTER (SarasTM Registered Artisan)', 55, y + 12);
    doc.fillColor('#334155').font('Helvetica').fontSize(10);
    doc.text(`Name: ${product.artisans?.name || 'Priya Devi'}`, 55, y + 30);
    doc.text(`Region: ${product.artisans?.region || product.region_label || 'Madhubani, Bihar, India'}`, 55, y + 45);
    doc.text(`Verification ID: VRN-ARTISAN-${product.artisans?.id?.slice(0, 8).toUpperCase() || '34A1841B'}`, 55, y + 60);

    y += 100;

    // Draw Box for Cargo and HSN details
    doc.rect(40, y, 515, 160).fill('#F8FAFC');
    doc.rect(40, y, 515, 160).strokeColor('#E2E8F0').lineWidth(1).stroke();

    doc.fillColor('#001645').fontSize(10).font('Helvetica-Bold');
    doc.text('CARGO & TARIFF CLASSIFICATION', 55, y + 12);

    const row = (label, val, posY) => {
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9).text(label, 55, posY);
      doc.fillColor('#0F172A').font('Helvetica').fontSize(9).text(val || 'Pending', 220, posY);
    };

    row('Product Title:', product.title, y + 30);
    row('Craft Type:', product.craft_type || 'Handicrafts', y + 45);
    row('Customs HSN Tariff Code:', hsnSuggestion?.code || '9701.10.10', y + 60);
    row('HSN Description:', hsnSuggestion?.description || 'Paintings, drawings and pastels, executed entirely by hand', y + 75);
    row('RAG Classifier Confidence:', `${hsnSuggestion?.confidence || '94%'} (Matched against customs index)`, y + 90);
    row('Declared Invoice Price (INR):', `₹${Number(product.price_inr || 4500).toLocaleString('en-IN')}`, y + 105);
    row('Declared Value (USD):', `$${product.price_usd || 54}`, y + 120);
    row('Port of Loading:', 'Delhi Cargo Terminal (DEL)', y + 135);

    y += 180;

    // QR Code / Verification Section
    doc.rect(40, y, 515, 80).strokeColor('#E2E8F0').lineWidth(1).stroke();
    // Simulate a barcode
    doc.fillColor('#000000');
    for (let i = 0; i < 40; i++) {
      const w = i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2;
      doc.rect(60 + (i * 4), y + 15, w, 30).fill();
    }
    doc.fillColor('#475569').fontSize(7).font('Courier-Bold');
    doc.text(`*SARAS-PASS-${product.id?.slice(0, 8).toUpperCase()}*`, 60, y + 50);

    doc.fillColor('#001645').fontSize(10).font('Helvetica-Bold');
    doc.text('DIGITAL AUTHENTICITY CERTIFICATE', 260, y + 15);
    doc.fillColor('#334155').font('Helvetica').fontSize(8);
    doc.text('This cargo is protected with a Tamper-Proof provenance QR passport linking directly to the blockchain seed register proving authenticity, source cluster origin, and GI-tag validation for global customs trust clearance.', 260, y + 30, { width: 280, align: 'justify' });

    y += 100;

    // Disclaimer
    doc.rect(40, y, 515, 60).fill('#FEF2F2');
    doc.rect(40, y, 515, 60).strokeColor('#FCA5A5').lineWidth(1).stroke();
    doc.fillColor('#991B1B').fontSize(9).font('Helvetica-Bold');
    doc.text('IMPORTANT DISCLAIMER FOR CUSTOMS', 55, y + 10);
    doc.fillColor('#7F1D1D').font('Helvetica').fontSize(7.5);
    doc.text('This is an AI-generated draft created via SarasTM for preparation and layout check. It is NOT a legally binding shipping bill. HSN code classifications and declarations must be audited by a certified Customs Broker prior to filing.', 55, y + 25, { width: 485, align: 'justify' });

    doc.end();
  });
}

function generateEFIRA(order, payout) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Deep Indigo Header Banner
    doc.rect(0, 0, 595, 110).fill('#001645');

    // Header Content
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold');
    doc.text('FOREIGN INWARD REMITTANCE ADVICE', 40, 35);
    doc.fillColor('#00BAF2').fontSize(9).font('Helvetica-Bold');
    doc.text('e-FIRA PROVISSIONAL ADVICE • ISSUED FOR ONDC GLOBAL EXPORTS', 40, 65);

    // AD Code Stamp Box on Banner Right
    doc.rect(460, 30, 95, 50).lineWidth(1.5).stroke('#00BAF2');
    doc.fillColor('#00BAF2').fontSize(8).font('Helvetica-Bold');
    doc.text('AD-II CODE', 460, 42, { width: 95, align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(9).text('RAZOR-INR', 460, 56, { width: 95, align: 'center' });

    let y = 140;

    // Transaction Details table-style layout
    doc.rect(40, y, 515, 230).fill('#F8FAFC');
    doc.rect(40, y, 515, 230).strokeColor('#E2E8F0').lineWidth(1).stroke();

    doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
    doc.text('TRANSACTION REMITTANCE ADVICE', 55, y + 15);
    
    // Grid Lines
    doc.moveTo(40, y + 40).lineTo(555, y + 40).strokeColor('#E2E8F0').lineWidth(1).stroke();

    const row = (label, val, posY) => {
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10).text(label, 55, posY);
      doc.fillColor('#0F172A').font('Helvetica').fontSize(10).text(val || 'N/A', 230, posY);
    };

    row('Advice Ref Number:', `SARAS-FIRA-${payout.id?.slice(0, 8).toUpperCase() || 'MOCK8992'}`, y + 55);
    row('Beneficiary Name:', 'Priya Devi', y + 75);
    row('Remitter/Payer:', `Collector (${order.buyer_email || 'Sarah Jenkins'})`, y + 95);
    row('Inward Amount:', `${order.currency || 'USD'} ${Number(order.amount || 54).toFixed(2)}`, y + 115);
    row('Conversion Rate:', '1 USD = 83.33 INR', y + 135);
    row('Payout Value (INR):', `₹${Number(payout.amount_inr || 4500).toLocaleString('en-IN')}`, y + 155);
    row('Purpose Code:', 'P0802 (Export of Handicrafts/Arts)', y + 175);
    row('FEMA Compliance status:', 'AUTO-COMPLIANT (Cleared via ONDC AD System)', y + 195);

    y += 250;

    // Official FEMA Seal simulation
    doc.circle(100, y + 60, 45).lineWidth(1).stroke('#001645');
    doc.circle(100, y + 60, 40).lineWidth(0.5).stroke('#00BAF2');
    doc.fillColor('#001645').fontSize(6).font('Helvetica-Bold');
    doc.text('REMITTANCE APPROVED', 65, y + 45, { width: 70, align: 'center' });
    doc.text('RBI-FEMA-ONDC', 65, y + 60, { width: 70, align: 'center' });
    doc.text('SARAS AI CERT', 65, y + 70, { width: 70, align: 'center' });

    // Details side note
    doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
    doc.text('FEMA DISBURSEMENT ADVICE', 170, y + 25);
    doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
    doc.text('This document certifies receipt of foreign currency proceeds conversion into INR equivalent deposited into beneficiary Bank Account under FEMA guidelines for handicraft exports. This digital advice satisfies bank compliance verification requirements.', 170, y + 45, { width: 370, align: 'justify' });

    doc.end();
  });
}

function generateCustomPDF(docType, data) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Deep Indigo Header Banner
    doc.rect(0, 0, 595, 110).fill('#001645');

    // Header Content
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold');
    doc.text(docType.toUpperCase(), 40, 35);
    doc.fillColor('#00BAF2').fontSize(9).font('Helvetica-Bold');
    doc.text('SARAS AI LOGISTICS SUITE • AUTO-GENERATED EXPORT TEMPLATE', 40, 65);

    // Vetted Seal on Banner Right
    doc.rect(470, 30, 85, 50).lineWidth(1.5).stroke('#00BAF2');
    doc.fillColor('#00BAF2').fontSize(8).font('Helvetica-Bold');
    doc.text('STATUS', 470, 42, { width: 85, align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(9).text('DRAFT VETTED', 470, 56, { width: 85, align: 'center' });

    let y = 140;

    const row = (label, value, posY) => {
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9.5).text(label, 55, posY);
      doc.fillColor('#0F172A').font('Helvetica').fontSize(9.5).text(value || 'N/A', 220, posY);
    };

    if (docType === 'Commercial Invoice') {
      // Draw Exporter vs Importer boxes
      doc.rect(40, y, 245, 90).fill('#F8FAFC');
      doc.rect(40, y, 245, 90).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#001645').fontSize(9).font('Helvetica-Bold');
      doc.text('EXPORTER DETAILS', 50, y + 10);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text(data.exporterName || 'Priya Devi', 50, y + 25, { width: 225 });
      doc.text(data.exporterAddress || 'Madhubani Guild, Bihar, India', 50, y + 40, { width: 225 });

      doc.rect(310, y, 245, 90).fill('#F8FAFC');
      doc.rect(310, y, 245, 90).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#001645').fontSize(9).font('Helvetica-Bold');
      doc.text('IMPORTER / BUYER DETAILS', 320, y + 10);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text(data.importerName || 'Sarah Jenkins', 320, y + 25, { width: 225 });
      doc.text(data.importerAddress || 'New York, USA', 320, y + 40, { width: 225 });

      y += 105;

      // Invoice info block
      doc.rect(40, y, 515, 60).fill('#F8FAFC');
      doc.rect(40, y, 515, 60).strokeColor('#E2E8F0').lineWidth(1).stroke();
      
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8).text('INVOICE NUMBER', 50, y + 12);
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text(data.invoiceNum || 'INV-88902', 50, y + 25);

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8).text('INVOICE DATE', 210, y + 12);
      doc.fillColor('#0F172A').font('Helvetica').fontSize(10).text(data.invoiceDate || new Date().toLocaleDateString('en-IN'), 210, y + 25);

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8).text('PAYMENT TERMS', 380, y + 12);
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text('ONDC ESCROW CLEARANCE', 380, y + 25);

      y += 75;

      // Item breakdown table
      doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold').text('LINE ITEM BREAKDOWN', 40, y);
      y += 18;

      // Draw table header row background
      doc.rect(40, y, 515, 20).fill('#001645');
      doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
      doc.text('Item Description', 45, y + 6);
      doc.text('Qty', 330, y + 6, { width: 30, align: 'center' });
      doc.text('Unit Price', 380, y + 6, { width: 70, align: 'right' });
      doc.text('Total Value', 470, y + 6, { width: 80, align: 'right' });

      y += 20;

      // Draw item row
      doc.rect(40, y, 515, 40).fill('#F8FAFC');
      doc.rect(40, y, 515, 40).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica');
      doc.text(data.itemDescription || 'Madhubani Canvas Painting', 45, y + 15, { width: 270 });
      doc.text(data.quantity || '1', 330, y + 15, { width: 30, align: 'center' });
      
      const currencySymbol = data.currency === 'USD' ? '$' : data.currency === 'INR' ? '₹' : '';
      doc.text(`${currencySymbol}${Number(data.unitPrice || 4500).toLocaleString()}`, 380, y + 15, { width: 70, align: 'right' });
      doc.text(`${currencySymbol}${Number(data.totalValue || 4500).toLocaleString()}`, 470, y + 15, { width: 80, align: 'right' });

      y += 70;

      // Signature blocks
      doc.moveTo(40, y + 40).lineTo(200, y + 40).strokeColor('#94A3B8').lineWidth(1).stroke();
      doc.fillColor('#475569').fontSize(8).text('Exporter Authorized Signatory', 40, y + 45);

      doc.moveTo(355, y + 40).lineTo(515, y + 40).strokeColor('#94A3B8').lineWidth(1).stroke();
      doc.fillColor('#475569').fontSize(8).text('FEMA Compliance Verified', 355, y + 45);

    } else if (docType === 'Export Declaration') {
      doc.rect(40, y, 515, 230).fill('#F8FAFC');
      doc.rect(40, y, 515, 230).strokeColor('#E2E8F0').lineWidth(1).stroke();

      doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
      doc.text('CUSTOMS SHIPMENT COMPLIANCE METADATA', 55, y + 15);
      
      // Grid Divider
      doc.moveTo(40, y + 38).lineTo(555, y + 38).strokeColor('#E2E8F0').stroke();

      row('Exporter Name:', data.exporterName, y + 50);
      row('IEC (Importer Exporter Code):', data.iecCode, y + 70);
      row('HSN Classification Code:', data.hsnCode, y + 90);
      row('Port of Clearance:', data.portOfExport, y + 110);
      row('Destination Country:', data.destinationCountry, y + 130);
      row('Net Weight (kg):', `${data.netWeight || '1.2'} kg`, y + 150);
      row('Declared Description:', data.cargoDescription, y + 170);
      row('GST LUT Ref Code:', data.lutRef, y + 190);

      y += 245;

      // Mock customs circular seal
      doc.circle(100, y + 50, 40).lineWidth(1.2).stroke('#001645');
      doc.fillColor('#001645').fontSize(6).font('Helvetica-Bold');
      doc.text('CUSTOMS DRAFT APPROVED', 65, y + 40, { width: 70, align: 'center' });
      doc.text('PORT OF LOADING JNPT', 65, y + 55, { width: 70, align: 'center' });

      doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
      doc.text('PROVISSIONAL PORT RELEASE STATEMENT', 170, y + 15);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text('This declaration is pre-classified using SarasTM agentic RAG matching ONDC listings to the correct 8-digit HSN code. The item is marked as auto-LUT GST exempt handcrafted heritage goods and fits all primary cargo carrier standards.', 170, y + 35, { width: 370, align: 'justify' });

    } else if (docType === 'Shipping Label') {
      doc.rect(40, y, 515, 290).fill('#F8FAFC');
      doc.rect(40, y, 515, 290).strokeColor('#E2E8F0').lineWidth(1.5).stroke();

      // Top label tracking and carrier logo
      doc.fillColor('#001645').fontSize(16).font('Helvetica-Bold').text(data.carrier || 'FEDEX CROSSBORDER', 55, y + 15);
      doc.fillColor('#00BAF2').fontSize(10).font('Helvetica-Bold').text('DAK GHAR NIRKAY KENDRA INTEGRATION', 55, y + 35);

      // Tracking Barcode Simulation
      doc.fillColor('#000000');
      for (let i = 0; i < 50; i++) {
        const w = i % 4 === 0 ? 3.5 : i % 2 === 0 ? 1 : 2;
        doc.rect(340 + (i * 4), y + 12, w, 35).fill();
      }
      doc.fillColor('#475569').fontSize(7.5).font('Courier-Bold');
      doc.text(data.trackingNum || 'TRK-SARAS-998821', 340, y + 50);

      // Divider Line
      doc.moveTo(40, y + 65).lineTo(555, y + 65).strokeColor('#E2E8F0').lineWidth(1.5).stroke();

      // Sender Box vs Recipient Box
      doc.fillColor('#001645').fontSize(9).font('Helvetica-Bold').text('SENDER (SHIP FROM):', 55, y + 80);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text(data.senderName || 'Priya Devi', 55, y + 95);
      doc.text(data.senderAddress || 'Bihar, India', 55, y + 110, { width: 220 });

      doc.fillColor('#001645').fontSize(9).font('Helvetica-Bold').text('RECIPIENT (SHIP TO):', 310, y + 80);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text(data.recipientName || 'Sarah Jenkins', 310, y + 95);
      doc.text(data.recipientAddress || 'New York, USA', 310, y + 110, { width: 220 });

      y += 185;

      // Weight & Package Box
      doc.rect(55, y, 485, 30).fill('#E2E8F0');
      doc.fillColor('#001645').fontSize(9).font('Helvetica-Bold');
      doc.text(`PACKAGE WEIGHT: ${data.packageWeight || '1.5'} kg`, 70, y + 10);
      doc.text('SERVICE OPTION: EXPRESS PARCEL ON-DEMAND', 280, y + 10);

    } else if (docType === 'e-FIRA') {
      doc.rect(40, y, 515, 230).fill('#F8FAFC');
      doc.rect(40, y, 515, 230).strokeColor('#E2E8F0').lineWidth(1).stroke();

      doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
      doc.text('FOREIGN INWARD REMITTANCE CLASSIFICATION ADVICE', 55, y + 15);
      
      // Grid Divider
      doc.moveTo(40, y + 38).lineTo(555, y + 38).strokeColor('#E2E8F0').stroke();

      row('FIRA Reference Number:', data.firaRef, y + 50);
      row('Beneficiary Artisan:', data.artisanName, y + 70);
      row('Remitter / Inward Payer:', data.remitterName, y + 90);
      row('Foreign Currency Amount:', `${data.foreignCurrency} ${data.foreignAmount}`, y + 110);
      row('Conversion Exchange Rate:', `1 ${data.foreignCurrency} = ${data.exchangeRate} INR`, y + 130);
      row('Equivalent Payout (INR):', `₹${Number(data.inrEquivalent).toLocaleString('en-IN')}`, y + 150);
      row('FEMA Purpose Code:', data.purposeCode, y + 170);

      y += 245;

      // Mock circular seal
      doc.circle(100, y + 50, 40).lineWidth(1.2).stroke('#001645');
      doc.fillColor('#001645').fontSize(6).font('Helvetica-Bold');
      doc.text('RBI AD-II CLEARED', 65, y + 40, { width: 70, align: 'center' });
      doc.text('EXPORTS REVENUE OUT', 65, y + 55, { width: 70, align: 'center' });

      doc.fillColor('#001645').fontSize(11).font('Helvetica-Bold');
      doc.text('OFFICIAL FEMA SETTLEMENT CERTIFICATE', 170, y + 15);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text('This digital advice is compiled under foreign exchange receipt compliance mandates. It confirms that the conversion of inward overseas buyer remittances has cleared direct-escrow deposits to your linked bank account.', 170, y + 35, { width: 370, align: 'justify' });
    }

    // Common Footer Disclaimer
    y = 520;
    doc.rect(40, y, 515, 45).fill('#FEF2F2');
    doc.rect(40, y, 515, 45).strokeColor('#FCA5A5').lineWidth(1).stroke();
    doc.fillColor('#991B1B').fontSize(8).font('Helvetica-Bold');
    doc.text('AI-ASSISTED DOCUMENT COMPLIANCE VERIFICATION', 55, y + 8);
    doc.fillColor('#7F1D1D').font('Helvetica').fontSize(7);
    doc.text(
      'This document represents a digital drafting template generated via SarasTM. Before shipping items abroad or declaring customs clearances, confirm classifications and values with a certified export advisor or custom house broker.',
      55, y + 20, { width: 485, align: 'justify' }
    );

    doc.end();
  });
}

module.exports = {
  generateExportDeclaration,
  generateEFIRA,
  generateCustomPDF,
};
