const express = require('express');
const router = express.Router();
const { findHSNCode } = require('../services/rag');
const { generateExportDeclaration } = require('../services/pdfGenerator');
const supabase = require('../db/supabase');

router.post('/hsn', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    const result = await findHSNCode(description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/export-pdf/:productId', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, artisans(*)')
      .eq('id', req.params.productId)
      .single();

    if (error) return res.status(404).json({ error: 'Product not found' });

    let hsnSuggestion = null;
    if (product.hsn_code) {
      hsnSuggestion = { code: product.hsn_code, description: '', confidence: product.hsn_confidence };
    } else if (product.story_en) {
      hsnSuggestion = await findHSNCode(product.story_en);
      await supabase.from('products').update({ hsn_code: hsnSuggestion.code, hsn_confidence: hsnSuggestion.confidence }).eq('id', product.id);
    }

    const pdfBuffer = await generateExportDeclaration(product, hsnSuggestion);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="export-draft-${product.id.slice(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
