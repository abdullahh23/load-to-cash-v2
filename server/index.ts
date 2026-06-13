import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { extractWithGemini } from './gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8787;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG, or WEBP files are allowed'));
  },
});

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return next();
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(header.slice(7));
  if (error || !user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  next();
}

app.post('/api/extract', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, error: 'Gemini API key not configured on server' });
      return;
    }

    const mock = process.env.GEMINI_MOCK === 'true';
    if (mock) {
      res.json({
        success: true,
        data: {
          loadNumber: 'MOCK-001',
          brokerName: 'Mock Broker LLC',
          pickupDate: '2025-01-15',
          grossAmount: 2500,
          originCity: 'Chicago',
          originState: 'IL',
          destinationCity: 'Dallas',
          destinationState: 'TX',
        },
      });
      return;
    }

    const result = await extractWithGemini(req.file.buffer, req.file.mimetype, apiKey);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Extraction failed';
    res.status(500).json({ success: false, error: message });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
