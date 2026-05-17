const axios = require('axios');
const env = require('../config/env');
const BIOCHEMISTRY_MCQS = require('../data/biochemistryData');
const MEDICAL_CHEMISTRY_MCQS = require('../data/chemistryData');

const AI_CACHE = new Map();

// Simple Hinglish conversion logic as requested
const convertToHinglish = (text) => {
  const hindiWords = {
    'the': 'ye',
    'is': 'hai',
    'are': 'hain',
    'symptoms': 'lakshan',
    'cause': 'karan',
    'treatment': 'ilaaj',
    'disease': 'bimari',
    'heart': 'dil',
    'stomach': 'pait',
    'pain': 'dard',
    'blood': 'khoon',
    'fever': 'bukhaar'
  };
  
  let hinges = text.toLowerCase();
  Object.keys(hindiWords).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    hinges = hinges.replace(regex, hindiWords[word]);
  });
  
  // Mix original casing and some English to make it feel like "Hinglish"
  return text.split(' ').map((word, i) => {
     return (i % 3 === 0 && hindiWords[word.toLowerCase()]) ? hindiWords[word.toLowerCase()] : word;
  }).join(' ');
};

// Pre-loaded medical cache for common queries to ensure instant answers even without API
const MEDICAL_KNOWLEDGE_CACHE = {
  "cell": "A cell is the basic structural and functional unit of all living organisms. It's often called the 'building block of life.' Every cell contains genetic material (DNA) and organelles like mitochondria (for energy) and ribosomes (for protein synthesis). In MBBS terms, understanding cellular biology is crucial for pathology and physiology.",
  "heart attack": "A heart attack (myocardial infarction) occurs when blood flow to the heart muscle is severely reduced or cut off. This is usually due to a blockage in the coronary arteries (atherosclerosis). Symptoms include chest pain (angina), shortness of breath, and sweating. It is a medical emergency requiring immediate reperfusion therapy.",
  "diabetes": "Diabetes mellitus is a metabolic disorder characterized by high blood glucose levels. Type 1 is due to insulin deficiency (autoimmune), while Type 2 is due to insulin resistance. Chronic complications include nephropathy, neuropathy, and retinopathy. Management involves lifestyle changes, oral hypoglycemics, or insulin.",
  "fever": "Fever (pyrexia) is an elevation in body temperature above the normal range (98.6°F or 37°C). It is often a sign of underlying infection or inflammation. In clinical practice, fever is categorized as low-grade, moderate, or high-grade (hyperpyrexia). Treatment usually involves antipyretics like Paracetamol.",
  "hypertension": "Hypertension (high blood pressure) is a condition where the force of the blood against the artery walls is too high (usually >140/90 mmHg). It is a major risk factor for stroke and heart disease. Often called a 'silent killer' because it may have no symptoms. Management includes DASH diet and antihypertensive drugs."
};

const askGroq = async (question) => {
  try {
    if (!env.GROQ_API_KEY) throw new Error("Missing Groq API Key");
    
    console.log(`🚀 Trying Groq (Llama 3.3 70B)`);
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert medical professor for MBBS students. Provide a detailed, qualitative, and easy-to-understand answer. Ensure the response is exactly 6-8 lines long.' },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data?.choices?.[0]?.message?.content;
  } catch (e) {
    console.error(`❌ Groq failed: ${e.message}`);
    return null;
  }
};

// Removed askGemini as per user request to only use Groq API

const askHuggingFace = async (question) => {
  const models = [
    "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct",
    "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B-Instruct"
  ];
  
  for (const modelUrl of models) {
    try {
      console.log(`🔗 Trying Fallback AI: ${modelUrl.split('/').pop()}`);
      const response = await axios.post(
        modelUrl,
        { inputs: `User Question: ${question}\nAssistant: Provide a short, qualitative 5-line answer.` },
        { timeout: 6000 }
      );
      const text = response.data?.[0]?.generated_text || response.data?.[0]?.summary_text;
      if (text) return text;
    } catch (e) {
      console.error(`❌ Fallback ${modelUrl.split('/').pop()} failed.`);
    }
  }
  return null;
};

const getAnswer = async (question, language) => {
  const qLower = question.toLowerCase().trim();
  const cacheKey = `${qLower}_${language}`;
  
  // 1. Check Personal AI Cache
  if (AI_CACHE.has(cacheKey)) return { answer: AI_CACHE.get(cacheKey), source: 'cache' };

  // 2. Check Static Medical Knowledge (Instant & Independent)
  for (const key in MEDICAL_KNOWLEDGE_CACHE) {
    if (qLower.includes(key)) {
      console.log(`📌 Using Medical Knowledge Cache for: ${key}`);
      return { answer: MEDICAL_KNOWLEDGE_CACHE[key], source: 'medical_knowledge' };
    }
  }

  let finalAnswer = "";
  let source = "fallback";

  try {
    const result = await new Promise(async (resolve, reject) => {
      // Priority 1: Groq (Best & Free)
      const groqAns = await askGroq(question);
      if (groqAns) return resolve({ ans: groqAns, src: 'groq' });

      // Priority 2: HuggingFace (Fallback)
      const hfAns = await askHuggingFace(question);
      if (hfAns) return resolve({ ans: hfAns, src: 'huggingface' });

      reject(new Error("All AI Engines failed"));
    });
    
    finalAnswer = result.ans;
    source = result.src;
  } catch (e) {
    console.error("🏁 All AI Engines failed. Returning safety response.");
    finalAnswer = "I'm currently optimizing my medical database. Please try again in 1 minute for a high-quality answer. You can also join our Telegram for instant support.";
    source = "fallback";
  }

  // Language processing
  if (language === 'Hinglish') finalAnswer = convertToHinglish(finalAnswer);
  else if (language === 'Malayalam') finalAnswer = `[Malayalam]: ${finalAnswer}`;

  if (source !== 'fallback') AI_CACHE.set(cacheKey, finalAnswer);
  return { answer: finalAnswer, source };
};

const MCQ_REPOSITORY = require('../data/mcqRepository');

const analyzeImage = async (imageBase64) => {
  try {
    const cleanBase64 = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    console.log("📸 Starting Clinical Image Analysis (OCR + Groq)...");

    // 1. OCR AND EXTRACT QUESTION TEXT USING FREE OCR.SPACE API
    let extractedText = "";
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('base64Image', `data:image/jpeg;base64,${cleanBase64}`);
      form.append('apikey', 'helloworld'); // Public free key
      form.append('OCREngine', '2'); // Engine 2 is better for numbers/symbols

      const ocrResponse = await axios.post('https://api.ocr.space/parse/image', form, {
        headers: form.getHeaders(),
        timeout: 25000 // Increase to 25s
      });

      if (ocrResponse.data && ocrResponse.data.ParsedResults && ocrResponse.data.ParsedResults.length > 0) {
        extractedText = ocrResponse.data.ParsedResults[0].ParsedText || "";
      }
    } catch (ocrError) {
      console.error("❌ OCR Error:", ocrError.message);
    }
    
    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length < 5) {
      console.log("⚠️ No readable text found from OCR.");
    } else {
      console.log("📝 Extracted Text:", extractedText);
    }


    // 2. FAST SEARCH IN DATABASE (if we have text)
    if (extractedText && extractedText.length >= 5) {
      const ANATOMY_MCQS = require('../data/anatomyData');
      const datasets = [
        { data: BIOCHEMISTRY_MCQS, course: "Course 2", subject: "Biochemistry" },
        { data: MEDICAL_CHEMISTRY_MCQS, course: "Course 1", subject: "Medical Chemistry" },
        { data: MCQ_REPOSITORY, course: "Repository", subject: "General Medical" },
        { data: ANATOMY_MCQS, course: "Course 3", subject: "Clinical Anatomy" }
      ];

      // Helper for fuzzy matching
      const getSignificantWords = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
      };
      
      const extractedWords = getSignificantWords(extractedText);
      let bestMatch = null;
      let maxOverlap = 0;

      const getCourseName = (sId) => {
        if (sId.startsWith('s-1')) return "1st Course";
        if (sId.startsWith('s-2')) return "2nd Course";
        if (sId.startsWith('s-3')) return "3rd Course";
        if (sId.startsWith('s-4')) return "4th Course";
        if (sId.startsWith('s-5')) return "5th Course";
        if (sId.startsWith('s-6')) return "6th Course";
        return "Repository";
      };

      for (const ds of datasets) {
        if (!ds.data) continue;
        for (const subjectId in ds.data) {
          const topics = ds.data[subjectId];
          const courseName = getCourseName(subjectId);

          for (const topicId in topics) {
            const topicData = topics[topicId];
            const questions = Array.isArray(topicData) 
                ? topicData 
                : [...(topicData.test || []), ...(topicData.situational || [])];
            
            for (const q of questions) {
              if (!q || !q.question) continue;
              
              const cleanQ = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
              const cleanExtracted = extractedText.toLowerCase().replace(/[^a-z0-9]/g, '');
              
              let isMatch = false;
              if (cleanQ.includes(cleanExtracted) || cleanExtracted.includes(cleanQ)) {
                isMatch = true;
                maxOverlap = 999;
              } else {
                const qWords = getSignificantWords(q.question);
                let overlapCount = 0;
                for (const ew of extractedWords) {
                  if (qWords.includes(ew)) overlapCount++;
                }
                
                if (overlapCount > maxOverlap && (overlapCount >= 4 || (extractedWords.length > 0 && overlapCount / extractedWords.length >= 0.6))) {
                  maxOverlap = overlapCount;
                  isMatch = true;
                }
              }
              
              if (isMatch) {
                bestMatch = {
                  ...q,
                  course: courseName,
                  subject: ds.subject === "General Medical" ? `Subject ${subjectId}` : `${ds.subject} ${subjectId.includes('-0') ? 'Module 1' : 'Module 2'}`,
                  topic: `Topic ${topicId.split('-').pop()}`,
                  topicNo: topicId.split('-').pop(),
                  path: `${courseName} > ${ds.subject} > Topic ${topicId.split('-').pop()}`
                };
              }
            }
          }
        }
      }

      if (bestMatch) {
        console.log("✅ Match found in Database with overlap score:", maxOverlap);
        return {
          question: bestMatch.question,
          answer: bestMatch.options ? bestMatch.options[bestMatch.correctIndex] : "Answer matched in DB",
          explanation: bestMatch.explanation || "This question is part of the official clinical repository.",
          path: bestMatch.path,
          course: bestMatch.course,
          subject: bestMatch.subject,
          topic: bestMatch.topic,
          topicNo: bestMatch.topicNo,
          source: 'Database'
        };
      }
    }

    console.log("ℹ️ No exact match in DB or OCR failed. Falling back to AI Solution...");

    // 3. AI REASONING (PRIORITIZE GROQ IF TEXT FOUND, GEMINI VISION IF NOT)
    if (extractedText && extractedText.length > 10) {
      console.log("🚀 Using Groq for medical text reasoning...");
      const groqAnswer = await askGroq(`Analyze this medical question: "${extractedText}". Identify the correct answer and provide a professional clinical explanation.`);
      if (groqAnswer) {
        return {
          question: extractedText,
          answer: "AI Clinical Assessment (Groq)",
          explanation: groqAnswer,
          path: 'Global Medical Brain (Groq AI)',
          course: "Digital Repository",
          subject: "Clinical Analysis",
          topic: "AI Reasoning",
          topicNo: "GROQ-1",
          source: 'AI'
        };
      }
    }

    if (env.GROQ_API_KEY) {
      console.log("🚀 Using Groq Vision for visual analysis...");
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.2-11b-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Analyze this medical question or diagram. Provide the question text, the correct answer, and a short clinical explanation.' },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
                ]
              }
            ],
            temperature: 0.5,
            max_tokens: 512
          },
          {
            headers: {
              'Authorization': `Bearer ${env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );
        
        const visionText = response.data?.choices?.[0]?.message?.content;
        if (visionText) {
          return {
            question: extractedText || "Image Analysis",
            answer: "Clinical AI Assessment",
            explanation: visionText,
            path: 'Global Medical Brain (Groq Vision)',
            course: "Clinical Database",
            subject: "Diagnostic Imaging",
            topic: "Vision Analysis",
            topicNo: "AI-V1",
            source: 'AI'
          };
        }
      } catch (groqVisionError) {
        console.error("❌ Groq Vision Error:", groqVisionError.response?.data || groqVisionError.message);
      }
    }


    // 4. ABSOLUTE FALLBACK
    return {
      question: extractedText || "Medical Image Analysis",
      answer: "Manual Review Needed",
      explanation: "We could not extract clear medical text from this image to analyze. Please ensure the image is well-lit and the text is clear.",
      path: 'System Error',
      source: 'System'
    };

  } catch (error) {
    console.error("🏁 Image Analysis Failed:", error.message);
    throw error;
  }
};

module.exports = { getAnswer, analyzeImage };
