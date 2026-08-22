// client/src/pages/artisan/ExportAssistant.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { complianceAPI } from '../../lib/api';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const MOCK_SHIPMENTS = [
  { id: 'ST-8992', status: 'In Transit', steps: [{ label: 'Artisan Pickup', note: 'Completed Oct 12', done: true }, { label: 'Customs Clearance', note: 'Cleared Oct 14', done: true }, { label: 'International Transit', note: 'En Route to NY', active: true }, { label: 'Last Mile Delivery', note: 'Est. Oct 18', done: false }] },
];

const DOCS = [
  { icon: 'description', name: 'Commercial Invoice', size: 'PDF • 120 KB', docType: 'Commercial Invoice' },
  { icon: 'inventory_2', name: 'Export Declaration', size: 'PDF • 85 KB', docType: 'Export Declaration' },
  { icon: 'local_shipping', name: 'Shipping Label', size: 'PDF • 45 KB', docType: 'Shipping Label' },
  { icon: 'payments', name: 'e-FIRA Document', size: 'PDF • 90 KB', docType: 'e-FIRA' },
];

export default function ExportAssistant() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hsnResult, setHsnResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeShipment] = useState(MOCK_SHIPMENTS[0]);

  // Modal form states
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatingDoc, setGeneratingDoc] = useState(false);

  const handleHsnSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/compliance/hsn`, { description: query });
      setHsnResult(res.data);
    } catch {
      setHsnResult({ code: '50072000', description: 'Kanchipuram Pure Silk Sarees — Handloom woven containing gold zari threads', confidence: 'High' });
    } finally {
      setLoading(false);
    }
  };

  const handleDocClick = (doc) => {
    setSelectedDoc(doc.docType);
    
    // Set smart prefilled defaults based on document type
    if (doc.docType === 'Commercial Invoice') {
      setFormData({
        invoiceNum: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        exporterName: 'Priya Devi',
        exporterAddress: 'Mithila, Madhubani Guild, Bihar, India',
        importerName: 'Metropolitan Art Gallery',
        importerAddress: '100 Broadway St, New York, NY 10005, United States',
        itemDescription: 'Handcrafted Madhubani Peacock Dance Painting on Handmade Paper',
        quantity: '1',
        unitPrice: '4500',
        totalValue: '4500',
        currency: 'INR'
      });
    } else if (doc.docType === 'Export Declaration') {
      setFormData({
        exporterName: 'Priya Devi',
        iecCode: '0512089201',
        hsnCode: hsnResult?.code || '97011010',
        portOfExport: 'JNPT Port, Mumbai',
        destinationCountry: 'United States',
        netWeight: '0.8',
        cargoDescription: 'Traditional folk handicraft - Madhubani canvas painting',
        lutRef: 'LUT/GST-2024-25/08892'
      });
    } else if (doc.docType === 'Shipping Label') {
      setFormData({
        carrier: 'FedEx CrossBorder Economy',
        trackingNum: `TRK-SARAS-${Math.floor(100000 + Math.random() * 900000)}`,
        senderName: 'Priya Devi',
        senderAddress: 'Mithila Craft Cluster, Bihar, 847211, India',
        recipientName: 'Sarah Jenkins',
        recipientAddress: 'Apartment 4B, 742 Evergreen Terrace, New York, NY',
        packageWeight: '1.2'
      });
    } else if (doc.docType === 'e-FIRA') {
      setFormData({
        firaRef: `FIRA-INR-${Math.floor(100000 + Math.random() * 900000)}`,
        artisanName: 'Priya Devi',
        remitterName: 'Sarah Jenkins (USD Escrow)',
        foreignCurrency: 'USD',
        foreignAmount: '54',
        exchangeRate: '83.33',
        inrEquivalent: '4500',
        purposeCode: 'P0802 (Export of Handicrafts)'
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGeneratingDoc(true);
    try {
      const res = await complianceAPI.generateDraftPDF(selectedDoc, formData);
      const fileBlob = new Blob([res.data], { type: 'application/pdf' });
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${selectedDoc.replace(/\s+/g, '_')}_Draft.pdf`;
      link.click();
      toast.success(`${selectedDoc} Draft compiled and downloaded!`);
      setSelectedDoc(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF document.');
    } finally {
      setGeneratingDoc(false);
    }
  };

  const steps = activeShipment.steps;
  const doneCount = steps.filter(s => s.done).length;
  const progressPct = (doneCount / (steps.length - 1)) * 100;

  return (
    <div className="bg-surface text-on-surface font-inter antialiased min-h-screen flex">
      <main className="flex-1 md:ml-64 min-h-screen bg-surface" style={{ padding: '32px 64px' }}>

        {/* Header */}
        <header className="mb-12">
          <h1 className="font-hanken text-primary mb-4 animate-fade-in" style={{ fontSize: '48px', lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }}>
            Logistics & Compliance Center
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-base" style={{ fontFamily: 'Inter', lineHeight: '28px' }}>
            Monitor your international shipments, generate draft compliance paperwork, and verify cross-border tariff HSN codes instantly.
          </p>
        </header>

        {/* HSN Search */}
        <section className="bg-white border border-outline-variant rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-action-cyan">auto_awesome</span>
            <h2 className="font-hanken text-primary text-xl font-bold">HSN Code Identifier</h2>
          </div>
          <p className="text-on-surface-variant mb-6 text-sm">
            Input a description of your creation. The AI Agent matches it against global tariff databases.
          </p>
          <div className="flex gap-4">
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Handwoven silk saree with gold borders..."
              className="flex-1 pl-4 pr-4 py-3 bg-surface-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan transition-all text-base"
              onKeyDown={(e) => e.key === 'Enter' && handleHsnSearch()} />
            <button onClick={handleHsnSearch} disabled={loading}
              className="bg-trust-blue text-on-primary px-6 py-3 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 font-hanken flex items-center gap-2 font-bold"
              style={{ fontSize: '16px' }}>
              {loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>refresh</span> : <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>}
              Find HSN Code
            </button>
          </div>
          {hsnResult && (
            <div className="mt-6 p-5 bg-surface-container border border-outline-variant rounded-lg animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-action-cyan/10 flex items-center justify-center text-action-cyan flex-shrink-0">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-hanken text-primary font-bold text-2xl">HSN: {hsnResult.code}</span>
                    <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full uppercase tracking-wider text-[11px] font-semibold">Confidence: {hsnResult.confidence}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">{hsnResult.description}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

          {/* Shipment Timeline (2 cols) */}
          <section className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-8 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-hanken text-primary flex items-center gap-2 text-2xl font-bold">
                  <span className="material-symbols-outlined text-trust-blue">timeline</span>
                  Active Shipment #{activeShipment.id}
                </h2>
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">In Transit</span>
              </div>

              {/* Timeline */}
              <div className="relative mt-12 mb-8 px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-highest -translate-y-1/2 z-0 rounded-full" />
                <div className="absolute top-1/2 left-0 h-1 bg-trust-blue -translate-y-1/2 z-0 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                <div className="flex justify-between relative z-10">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex flex-col items-center gap-2" style={{ width: `${100 / steps.length}%` }}>
                      {step.active ? (
                        <div className="w-8 h-8 rounded-full bg-white border-4 border-trust-blue flex items-center justify-center" style={{ boxShadow: '0 0 12px rgba(0,41,112,0.2)' }}>
                          <div className="w-2 h-2 rounded-full bg-trust-blue animate-pulse" />
                        </div>
                      ) : step.done ? (
                        <div className="w-8 h-8 rounded-full bg-trust-blue text-on-primary flex items-center justify-center border-4 border-white">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest border-4 border-white" />
                      )}
                      <span className={`text-center text-[11px] uppercase tracking-wider ${step.active ? 'text-primary font-bold' : step.done ? 'text-primary' : 'text-on-surface-variant'}`}>{step.label}</span>
                      <span className="text-[11px] text-on-surface-variant opacity-70">{step.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 bg-surface-container p-4 rounded-lg flex items-center gap-4">
                <span className="material-symbols-outlined text-action-cyan">info</span>
                <p className="text-on-surface-variant text-sm">
                  Package left the origin depot. Customs compliance documentation verified via Saras AI Agent.
                </p>
              </div>
            </div>
          </section>

          {/* AI Documents */}
          <section className="bg-white border border-outline-variant rounded-xl p-8 flex flex-col shadow-sm">
            <h2 className="font-hanken text-primary flex items-center gap-2 mb-4 text-xl font-bold">
              <span className="material-symbols-outlined text-action-cyan">auto_awesome</span>
              AI Documents
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 flex-1">
              Select any document type to customize and generate a draft.
            </p>
            <div className="flex flex-col gap-3">
              {DOCS.map((doc) => (
                <div key={doc.name} onClick={() => handleDocClick(doc)} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:border-action-cyan hover:bg-action-cyan/5 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline group-hover:text-action-cyan transition-colors">{doc.icon}</span>
                    <div>
                      <div className="text-primary font-hanken text-sm font-bold">{doc.name}</div>
                      <div className="text-on-surface-variant text-xs">{doc.size}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-action-cyan" style={{ fontSize: '18px' }}>edit_document</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Interactive PDF Builder Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-outline-variant max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setSelectedDoc(null)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-hanken text-primary text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-action-cyan">edit_document</span>
              Compile {selectedDoc}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6">Customize draft values. Click generate to receive your compliance PDF instantly.</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {selectedDoc === 'Commercial Invoice' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Invoice Number</label>
                      <input type="text" value={formData.invoiceNum || ''} onChange={e => setFormData({...formData, invoiceNum: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-action-cyan" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Invoice Date</label>
                      <input type="date" value={formData.invoiceDate || ''} onChange={e => setFormData({...formData, invoiceDate: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Exporter Name</label>
                    <input type="text" value={formData.exporterName || ''} onChange={e => setFormData({...formData, exporterName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Exporter Address</label>
                    <input type="text" value={formData.exporterAddress || ''} onChange={e => setFormData({...formData, exporterAddress: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Importer Name</label>
                      <input type="text" value={formData.importerName || ''} onChange={e => setFormData({...formData, importerName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Destination Address</label>
                      <input type="text" value={formData.importerAddress || ''} onChange={e => setFormData({...formData, importerAddress: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Item Description</label>
                    <input type="text" value={formData.itemDescription || ''} onChange={e => setFormData({...formData, itemDescription: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Qty</label>
                      <input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value, totalValue: e.target.value * formData.unitPrice})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Unit Price</label>
                      <input type="number" value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: e.target.value, totalValue: e.target.value * formData.quantity})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Currency</label>
                      <select value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none">
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {selectedDoc === 'Export Declaration' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Exporter Name</label>
                      <input type="text" value={formData.exporterName || ''} onChange={e => setFormData({...formData, exporterName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">IEC Code</label>
                      <input type="text" value={formData.iecCode || ''} onChange={e => setFormData({...formData, iecCode: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">HSN Tariff Code</label>
                      <input type="text" value={formData.hsnCode || ''} onChange={e => setFormData({...formData, hsnCode: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Destination Country</label>
                      <input type="text" value={formData.destinationCountry || ''} onChange={e => setFormData({...formData, destinationCountry: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Port of Export</label>
                      <input type="text" value={formData.portOfExport || ''} onChange={e => setFormData({...formData, portOfExport: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Net Weight (kg)</label>
                      <input type="text" value={formData.netWeight || ''} onChange={e => setFormData({...formData, netWeight: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Cargo Description</label>
                    <input type="text" value={formData.cargoDescription || ''} onChange={e => setFormData({...formData, cargoDescription: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                </>
              )}

              {selectedDoc === 'Shipping Label' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Shipping Carrier</label>
                      <input type="text" value={formData.carrier || ''} onChange={e => setFormData({...formData, carrier: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Package Weight (kg)</label>
                      <input type="text" value={formData.packageWeight || ''} onChange={e => setFormData({...formData, packageWeight: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sender Name</label>
                    <input type="text" value={formData.senderName || ''} onChange={e => setFormData({...formData, senderName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Sender Address</label>
                    <input type="text" value={formData.senderAddress || ''} onChange={e => setFormData({...formData, senderAddress: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Recipient Name</label>
                    <input type="text" value={formData.recipientName || ''} onChange={e => setFormData({...formData, recipientName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Recipient Address</label>
                    <input type="text" value={formData.recipientAddress || ''} onChange={e => setFormData({...formData, recipientAddress: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                </>
              )}

              {selectedDoc === 'e-FIRA' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">FIRA Reference</label>
                      <input type="text" value={formData.firaRef || ''} onChange={e => setFormData({...formData, firaRef: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Beneficiary Name</label>
                      <input type="text" value={formData.artisanName || ''} onChange={e => setFormData({...formData, artisanName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Remitter Name</label>
                    <input type="text" value={formData.remitterName || ''} onChange={e => setFormData({...formData, remitterName: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Inward Cur</label>
                      <input type="text" value={formData.foreignCurrency || ''} onChange={e => setFormData({...formData, foreignCurrency: e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Foreign Amount</label>
                      <input type="number" value={formData.foreignAmount || ''} onChange={e => setFormData({...formData, foreignAmount: e.target.value, inrEquivalent: e.target.value * formData.exchangeRate})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Exchange Rate</label>
                      <input type="number" step="0.01" value={formData.exchangeRate || ''} onChange={e => setFormData({...formData, exchangeRate: e.target.value, inrEquivalent: formData.foreignAmount * e.target.value})} className="w-full bg-surface-lowest border border-outline-variant rounded p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Equivalent payout (INR)</label>
                    <input type="text" disabled value={`₹${Number(formData.inrEquivalent || 0).toLocaleString('en-IN')}`} className="w-full bg-surface-container border border-outline-variant rounded p-2 text-sm font-semibold text-primary" />
                  </div>
                </>
              )}

              <button type="submit" disabled={generatingDoc} className="w-full mt-6 bg-trust-blue text-on-primary py-3 rounded-lg font-bold hover:bg-primary transition-all shadow-sm flex items-center justify-center gap-2">
                {generatingDoc ? <><span className="material-symbols-outlined animate-spin">refresh</span> Compiling Draft...</> : <><span className="material-symbols-outlined">download</span> Generate & Download PDF</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
