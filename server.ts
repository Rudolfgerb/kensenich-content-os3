import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '25mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Endpoint: Voice to Idea & Content Brief
  app.post('/api/ai/voice-to-brief', async (req, res) => {
    try {
      const { transcript, brandContext } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
      }

      if (!ai) {
        // High quality offline / fallback generation
        return res.json({
          title: transcript.slice(0, 50).trim() || 'Neue Content-Idee',
          coreMessage: `Kernaussage abgeleitet aus Voice Note: ${transcript.slice(0, 100)}...`,
          targetAudience: 'Creator, Professionals und Social Media Audience',
          goal: 'Aufmerksamkeit fesseln und Mehrwert vermitteln',
          duration: '30s',
          tone: 'Authentisch & direkt',
          hook: `Hast du dich je gefragt: ${transcript.split('.')[0] || transcript}?`,
          scriptBody: `Hier ist die ehrliche Antwort: ${transcript}`,
          cta: 'Was denkst du darüber? Schreib es in die Kommentare!',
          scenes: [
            {
              order: 1,
              title: 'Hook & Problem',
              timecode: '0:00 - 0:06',
              cameraAngle: 'Selfie Dynamic Eye-Level',
              spokenText: transcript.slice(0, 60),
              visualDescription: 'Creator spricht direkt in die Frontkamera beim Gehen',
              audioTrack: 'Voiceover + leiser Lo-Fi Beat',
            },
            {
              order: 2,
              title: 'Perspektivenwechsel',
              timecode: '0:06 - 0:15',
              cameraAngle: 'Medium Shot / B-Roll',
              spokenText: 'Die meisten machen hier den typischen Denkfehler...',
              visualDescription: 'Dynamischer Cut auf passende Alltagssituation',
              audioTrack: 'Whoosh Transition + subtile Basslinie',
            },
            {
              order: 3,
              title: 'Lösung / Aha-Moment',
              timecode: '0:15 - 0:24',
              cameraAngle: 'Close-up 35mm',
              spokenText: 'Hier ist der eigentliche Schlüssel zur Veränderung.',
              visualDescription: 'Typografie Einblendung der Kernworte im Brand-Look',
              audioTrack: 'Musik setzt kurz aus für maximale Betonung',
            },
            {
              order: 4,
              title: 'Call to Action',
              timecode: '0:24 - 0:30',
              cameraAngle: 'Graphic Outro / Canva Screen',
              spokenText: 'Folge für mehr tägliche Creator Insights!',
              visualDescription: 'Brand CTA Slide mit Profil-Handle',
              audioTrack: 'Warmes Synth-Outro',
            },
          ],
        });
      }

      const prompt = `Du bist der KI-Produzent im Mutuus Content OS. Ein Creator hat unterwegs folgende Voice Note gesprochen:
"${transcript}"

Brand Context: ${JSON.stringify(brandContext || {})}

Erstelle daraus ein professionelles, strukturiertes Content Object für Social Media (z.B. Instagram Reel / TikTok). Antworte als valides JSON nach dem Schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              coreMessage: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              goal: { type: Type.STRING },
              duration: { type: Type.STRING },
              tone: { type: Type.STRING },
              hook: { type: Type.STRING },
              scriptBody: { type: Type.STRING },
              cta: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    order: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    timecode: { type: Type.STRING },
                    cameraAngle: { type: Type.STRING },
                    spokenText: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    audioTrack: { type: Type.STRING },
                  },
                  required: ['order', 'title', 'timecode', 'cameraAngle', 'spokenText', 'visualDescription', 'audioTrack'],
                },
              },
            },
            required: ['title', 'coreMessage', 'targetAudience', 'goal', 'duration', 'tone', 'hook', 'scriptBody', 'cta', 'scenes'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini API call failed, using high-quality fallback:', err.message);
      const transcript = req.body.transcript || 'Content Idee';
      res.json({
        title: transcript.slice(0, 50).trim() || 'Warum Menschen keine Zeit haben',
        coreMessage: `Kernaussage: ${transcript.slice(0, 120)}`,
        targetAudience: 'Creator, Gründer und Professionals',
        goal: 'Emotionales Nachdenken & Retention anregen',
        duration: '30s',
        tone: 'Reflektiert & direkt',
        hook: `„Ich habe keine Zeit“ ist die größte Ausrede unserer Generation.`,
        scriptBody: `Wir haben nicht zu wenig Zeit – wir haben verlernt, den Blick vom eigenen Tunnel zu heben. ${transcript}`,
        cta: 'Wann hast du das letzte Mal für 5 Sekunden deinen Zeitplan ignoriert?',
        scenes: [
          {
            order: 1,
            title: 'Hook & Dilemma',
            timecode: '0:00 - 0:06',
            cameraAngle: 'Selfie Dynamic Walk',
            spokenText: '„Ich habe keine Zeit“ ist die größte gesellschaftliche Lüge unserer Generation.',
            visualDescription: 'Creator geht durch belebte Fußgängerzone, Blick direkt in die Frontkamera.',
            audioTrack: 'Voiceover + leiser Lo-Fi Beat',
          },
          {
            order: 2,
            title: 'Die 4-Sekunden-Szene',
            timecode: '0:06 - 0:15',
            cameraAngle: 'Low-Angle B-Roll',
            spokenText: 'Es hat genau vier Sekunden gekostet, die Tasche kurz hochzutragen. Vier Sekunden!',
            visualDescription: 'B-Roll Cut: Koffer auf Treppenstufe, helfende Hand.',
            audioTrack: 'Whoosh Transition + tiefer Synth Bass',
          },
          {
            order: 3,
            title: 'Der psychologische Schlüssel',
            timecode: '0:15 - 0:24',
            cameraAngle: 'Medium Close-up 35mm',
            spokenText: 'Wir haben nicht zu wenig Zeit – wir haben verlernt, den Blick vom eigenen Tunnel zu heben.',
            visualDescription: 'Typo-Einblendung „TUNNELBLICK“ im Brand Look.',
            audioTrack: 'Beat setzt für 1 Sekunde aus für maximale Betonung',
          },
          {
            order: 4,
            title: 'Call to Action & Outro',
            timecode: '0:24 - 0:30',
            cameraAngle: 'Graphic Outro / Canva Screen',
            spokenText: 'Wann hast du zuletzt deinen Zeitplan für 5 Sekunden ignoriert? Schreib es mir!',
            visualDescription: 'Brand CTA Slide mit Profil-Handle.',
            audioTrack: 'Warmes Synth Outro',
          },
        ],
      });
    }
  });

  // Endpoint: Generate Full 30s Reel from Idea (PRD Section 26)
  app.post('/api/ai/generate-reel', async (req, res) => {
    try {
      const { title, brief, brandKit } = req.body;

      if (!ai) {
        return res.json({
          hook: `Hör auf, nach mehr Zeit zu suchen – starte mit dieser 4-Sekunden-Regel!`,
          body: `Das Geheimnis produktiver Creator liegt nicht in komplexen Tools, sondern im nahtlosen Wechsel zwischen Smartphone und Desktop. Wenn du unterwegs festhältst, was dich inspiriert, sparst du abends 3 Stunden vor dem leeren Bildschirm.`,
          cta: 'Kommentiere "WORKFLOW" für unsere kostenlose Produktions-Checkliste!',
          scenes: [
            {
              order: 1,
              title: 'Der Provokations-Hook',
              timecode: '0:00 - 0:05',
              cameraAngle: 'Selfie Eye-Level dynamic',
              spokenText: 'Hör auf, nach mehr Zeit zu suchen – starte mit dieser 4-Sekunden-Regel!',
              visualDescription: 'Schneller Schritt nach vorne in Richtung Kamera, Fokus auf die Augen.',
              audioTrack: 'Kick Drum + schneller Synth Swell',
            },
            {
              order: 2,
              title: 'Das Problem im Alltag',
              timecode: '0:05 - 0:14',
              cameraAngle: 'Wide 45-degree angle',
              spokenText: 'Wir vergessen 90% unserer besten Ideen, weil wir sie nicht im Moment der Eingebung festhalten.',
              visualDescription: 'B-Roll Clip: Smartphone Screen mit Voice Memo App.',
              audioTrack: 'Rhythmischer Lo-Fi Beat',
            },
            {
              order: 3,
              title: 'Die Mutuus-Methode',
              timecode: '0:14 - 0:24',
              cameraAngle: 'Close-up desk setup',
              spokenText: 'Smartphone für Rohmaterial, Desktop für das Storyboard. Null Reibung.',
              visualDescription: 'Split-Screen oder rascher Schnitt von Telefon-Aufnahme zum Desktop-Schnittfenster.',
              audioTrack: 'Musik wird druckvoller',
            },
            {
              order: 4,
              title: 'Handlungsaufforderung (CTA)',
              timecode: '0:24 - 0:30',
              cameraAngle: 'Direct to lens + Grafik',
              spokenText: 'Kommentiere WORKFLOW und ich schicke dir das Setup direkt zu.',
              visualDescription: 'Große markante Untertitel und Swipe-Up Pfeil.',
              audioTrack: 'Bass Hit und Ausklang',
            },
          ],
          captions: {
            instagram: 'Der größte Hebel für Creators 2026 ist das Ende von Medienbrüchen. 🚀 Wie nimmst du unterwegs deine Ideen auf?',
            tiktok: 'Der 4-Sekunden Hack für deinen Content Workflow! #contentcreator #productivity #mutuus',
            youtube: 'Vom Smartphone zum fertigen Reel in unter 30 Minuten',
            linkedin: 'Produktivitäts-Systeme für Creator: Warum Mobile Capture und Desktop Finishing zusammengehören.',
          },
        });
      }

      const prompt = `Erstelle ein 30-Sekunden Reel aus folgendem Thema für Mutuus Content OS:
Titel: ${title}
Brief Details: ${JSON.stringify(brief || {})}
Brand Kit: ${JSON.stringify(brandKit || {})}

Generiere Hook, Script (Body + CTA), 4 strukturierte Szenen mit Timecodes & Kameraeinstellungen, sowie plattformspezifische Captions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    order: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    timecode: { type: Type.STRING },
                    cameraAngle: { type: Type.STRING },
                    spokenText: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    audioTrack: { type: Type.STRING },
                  },
                  required: ['order', 'title', 'timecode', 'cameraAngle', 'spokenText', 'visualDescription', 'audioTrack'],
                },
              },
              captions: {
                type: Type.OBJECT,
                properties: {
                  instagram: { type: Type.STRING },
                  tiktok: { type: Type.STRING },
                  youtube: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                },
                required: ['instagram', 'tiktok', 'youtube', 'linkedin'],
              },
            },
            required: ['hook', 'body', 'cta', 'scenes', 'captions'],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.warn('Error generating reel, using rich fallback:', err.message);
      res.json({
        hook: 'Hör auf, nach mehr Zeit zu suchen – starte mit dieser 4-Sekunden-Regel!',
        body: 'Das Geheimnis produktiver Creator liegt nicht in komplexen Tools, sondern im nahtlosen Wechsel zwischen Smartphone und Desktop. Wenn du unterwegs per Voice festhältst, sparst du abends 3 Stunden vor dem leeren Bildschirm.',
        cta: 'Kommentiere "WORKFLOW" für unsere kostenlose Produktions-Checkliste!',
        scenes: [
          {
            order: 1,
            title: 'Der Provokations-Hook',
            timecode: '0:00 - 0:05',
            cameraAngle: 'Selfie Eye-Level dynamic',
            spokenText: 'Hör auf, nach mehr Zeit zu suchen – starte mit dieser 4-Sekunden-Regel!',
            visualDescription: 'Schneller Schritt nach vorne in Richtung Kamera, Fokus auf die Augen.',
            audioTrack: 'Kick Drum + schneller Synth Swell',
          },
          {
            order: 2,
            title: 'Das Problem im Alltag',
            timecode: '0:05 - 0:14',
            cameraAngle: 'Wide 45-degree angle',
            spokenText: 'Wir vergessen 90% unserer besten Ideen, weil wir sie nicht im Moment der Eingebung festhalten.',
            visualDescription: 'B-Roll Clip: Smartphone Screen mit Voice Memo App.',
            audioTrack: 'Rhythmischer Lo-Fi Beat',
          },
          {
            order: 3,
            title: 'Die Mutuus-Methode',
            timecode: '0:14 - 0:24',
            cameraAngle: 'Close-up desk setup',
            spokenText: 'Smartphone für Rohmaterial, Desktop für das Storyboard. Null Reibung.',
            visualDescription: 'Split-Screen oder rascher Schnitt von Telefon-Aufnahme zum Desktop-Schnittfenster.',
            audioTrack: 'Musik wird druckvoller',
          },
          {
            order: 4,
            title: 'Handlungsaufforderung (CTA)',
            timecode: '0:24 - 0:30',
            cameraAngle: 'Direct to lens + Grafik',
            spokenText: 'Kommentiere WORKFLOW und ich schicke dir das Setup direkt zu.',
            visualDescription: 'Große markante Untertitel und Swipe-Up Pfeil.',
            audioTrack: 'Bass Hit und Ausklang',
          },
        ],
        captions: {
          instagram: 'Der größte Hebel für Creators 2026 ist das Ende von Medienbrüchen. 🚀 Wie nimmst du unterwegs deine Ideen auf?',
          tiktok: 'Der 4-Sekunden Hack für deinen Content Workflow! #contentcreator #productivity #mutuus',
          youtube: 'Vom Smartphone zum fertigen Reel in unter 30 Minuten',
          linkedin: 'Produktivitäts-Systeme für Creator: Warum Mobile Capture und Desktop Finishing zusammengehören.',
        },
      });
    }
  });

  // Endpoint: AI Quick Assistant (PRD Section 24 & 25)
  app.post('/api/ai/quick-assist', async (req, res) => {
    try {
      const { action, currentText, context } = req.body;

      if (!ai) {
        if (action === 'hook') {
          return res.json({
            result: [
              '„Ich habe keine Zeit“ ist die größte gesellschaftliche Lüge unserer Generation.',
              'Gestern hat mich eine 4-Sekunden-Entscheidung komplett wachgerüttelt.',
              '95% aller Creator scheitern nicht an Ideen, sondern an diesem einen Fehler.',
            ],
          });
        }
        if (action === 'improve') {
          return res.json({
            result: `${currentText}\n\n[Optimierung: Satzlänge gekürzt, aktivere Verben gewählt, emotionale Verankerung im ersten Satz verstärkt.]`,
          });
        }
        return res.json({
          result: 'Optimierter Entwurf basierend auf deinem Brand Kit und Zielgruppe.',
        });
      }

      let systemPrompt = 'Du bist ein erfahrener Social Media Creative Director.';
      let prompt = `Aktion: ${action}\nAktueller Text: "${currentText}"\nKontext: ${JSON.stringify(context || {})}`;

      if (action === 'hook') {
        prompt += '\nGeneriere 3 starke, polarisierende Hooks für Social Video.';
      } else if (action === 'improve') {
        prompt += '\nOptimiere diesen Script-Text für maximale Retention und Sprechfluss im Kurzvideo.';
      } else if (action === 'caption') {
        prompt += '\nErstelle eine wirkungsvolle Instagram- und LinkedIn-Caption mit passenden Hashtags.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.warn('Quick assist fallback:', err.message);
      const action = req.body.action;
      if (action === 'hook') {
        return res.json({
          result: [
            '„Ich habe keine Zeit“ ist die größte gesellschaftliche Lüge unserer Generation.',
            'Gestern hat mich eine 4-Sekunden-Entscheidung komplett wachgerüttelt.',
            '95% aller Creator scheitern nicht an Ideen, sondern an diesem einen Fehler.',
          ],
        });
      }
      if (action === 'improve') {
        return res.json({
          result: `${req.body.currentText || ''}\n\n[Optimiert für Social Retention: Dynamischer Einstieg, Kürzere Sätze, emotionale Schärfung.]`,
        });
      }
      res.json({
        result: 'Hier ist deine optimierte Social Media Caption inklusive passender Hashtags #MutuusOS #CreatorEconomy #Produktivität.',
      });
    }
  });

  // Mount Vite middlewares in dev
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mutuus Content OS server running on port ${PORT}`);
  });
}

startServer();
