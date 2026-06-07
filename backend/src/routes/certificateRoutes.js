const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

// Helper to generate a unique certificate ID (SAMU-2026-XXXXXX)
function generateCertificateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SAMU-2026-${randomPart}`;
}

// Generate Certificate
router.post('/generate', async (req, res) => {
  const { name, group, subjectId } = req.body;

  if (!name || !group || !subjectId) {
    return res.status(400).json({ error: 'name, group, and subjectId are required' });
  }

  try {
    // 1. Map subjectId to file name and title
    let fileName = '';
    let subjectTitle = '';

    if (subjectId === 'biochemistry') {
      fileName = 'biochemistry_results.json';
      subjectTitle = 'Biochemistry';
    } else if (subjectId === 'microbiology') {
      fileName = 'microbiology_results.json';
      subjectTitle = 'Microbiology';
    } else if (subjectId === 'anatomy') {
      fileName = 'clinical_anatomy_results.json';
      subjectTitle = 'Clinical Anatomy';
    } else if (subjectId === 'chemistry') {
      fileName = 'medical_chemistry_results.json';
      subjectTitle = 'Medical Chemistry';
    } else {
      return res.status(400).json({ error: 'Invalid subjectId' });
    }

    // 2. Load JSON data
    const filePath = path.join(__dirname, '../data', fileName);
    if (!fs.existsSync(filePath)) {
      // If the file is missing (e.g. chemistry isn't uploaded yet), return graceful error
      return res.status(404).json({ 
        error: `Results file for ${subjectTitle} not found on server yet.` 
      });
    }

    const resultsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 3. Find matching student record (case-insensitive, trimmed)
    const normalizedSearchName = name.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedSearchGroup = group.toLowerCase().trim();

    const record = resultsData.find(item => {
      const itemValName = item.name.toLowerCase().replace(/\bxxx\b/g, ' ').replace(/\s+/g, ' ').trim();
      const itemValGroup = item.group.toLowerCase().trim();
      return itemValName === normalizedSearchName && itemValGroup === normalizedSearchGroup;
    });

    if (!record) {
      return res.status(404).json({ error: 'Student exam result record not found.' });
    }

    // 4. Verify score threshold (>= 98%)
    const score = parseFloat(record.score);
    if (isNaN(score) || score < 98.0) {
      return res.status(400).json({ 
        error: `Score of ${score}% does not qualify for a certificate. Minimum required is 98%.` 
      });
    }

    // 5. Determine achievement level and date
    let achievementLevel = 'Academic Distinction';
    if (score >= 100.0) {
      achievementLevel = 'Platinum Scholar';
    } else if (score >= 99.0) {
      achievementLevel = 'Gold Excellence';
    }

    // Extract completion date from record
    let completionDate = '2026';
    if (record.endTime) {
      completionDate = record.endTime.split(' ')[0]; // Extract just the date part (e.g. "19.05.2026")
    }

    // 6. Check if certificate already exists in database
    // We handle missing table/db errors gracefully so dev/demo modes still function
    let existingCert = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('student_name', record.name.replace(/\bXXX\b/g, ' ').replace(/\s+/g, ' ').trim())
        .eq('subject_name', subjectTitle)
        .maybeSingle();

      if (!error && data) {
        existingCert = data;
      }
    } catch (dbError) {
      console.warn('⚠️ Supabase fetch certificates failed. Fallback to dynamic generation.', dbError.message);
    }

    if (existingCert) {
      return res.json(existingCert);
    }

    // 7. Create certificate record
    const certificateId = generateCertificateId();
    const verificationUrl = `https://mrx4u-ops.github.io/samu_mcq/#/verify/${certificateId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

    const newCert = {
      certificate_id: certificateId,
      student_name: record.name.replace(/\bXXX\b/g, ' ').replace(/\s+/g, ' ').trim(),
      score: score,
      subject_name: subjectTitle,
      completion_date: completionDate,
      achievement_level: achievementLevel,
      qr_code_url: qrCodeUrl,
      revoked: false
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .insert(newCert)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    } catch (insertError) {
      console.warn('⚠️ Supabase insert certificate failed. Returning virtual demo certificate.', insertError.message);
      // Fallback virtual certificate for local/demo runs
      return res.json({
        id: 'virtual-' + Date.now(),
        ...newCert,
        created_at: new Date().toISOString(),
        isDemo: true
      });
    }

  } catch (err) {
    console.error('Error generating certificate:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Verify Certificate (Public)
router.get('/verify/:certId', async (req, res) => {
  const { certId } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('certificate_id', certId)
      .maybeSingle();

    if (error) {
      // Fallback logic for demo verification
      if (certId.startsWith('SAMU-2026-DEMO')) {
        return res.json({
          certificate_id: certId,
          student_name: 'Demo Student',
          score: 100.0,
          subject_name: 'Biochemistry',
          completion_date: '07.06.2026',
          achievement_level: 'Platinum Scholar',
          revoked: false,
          created_at: new Date().toISOString()
        });
      }
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

module.exports = router;
