import { Router, type IRouter } from "express";

const router: IRouter = Router();

function extractJson(text: string): Record<string, any> | null {
  try { return JSON.parse(text.trim()); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  const stripped = text.replace(/^```(?:json)?\s*/im, "").replace(/```\s*$/im, "").trim();
  try { return JSON.parse(stripped); } catch {}
  return null;
}

const NOT_SKIN_ERROR =
  "This photo doesn't appear to show skin or a body part. Please take a clear photo of your face, arms, underarms, or the skin area you'd like analysed — not food, objects, animals, or screenshots.";

router.post("/analysis/skin", async (req, res) => {
  const { base64Image, productType } = req.body;

  if (!base64Image || typeof base64Image !== "string") {
    res.status(400).json({ error: "base64Image is required" });
    return;
  }

  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  if (!baseUrl || !apiKey) {
    res.status(500).json({ error: "AI integration not configured" });
    return;
  }

  const url = `${baseUrl}/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // ── Step 1: Strict image validation ────────────────────────────────────────
  // Fail CLOSED — if this check errors we return an error, not fall through.
  try {
    const validationResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            {
              text: `You are a strict image classifier for a dermatology app.

Your ONLY job: decide if this image shows a human body part with visible skin.

VALID examples: face, neck, arms, underarms, chest, back, hands, legs, feet, shoulders, stomach — any human skin area.

INVALID examples: food, animals, landscapes, plants, cars, clothing, screenshots, memes, documents, cartoon characters, objects, buildings, text, artwork, medical scans, x-rays, or ANYTHING that is not real human skin.

If you are not 100% certain it shows REAL HUMAN SKIN, answer INVALID.

Reply with exactly ONE WORD — either:
VALID
INVALID

No explanation. No punctuation. One word only.`
            },
          ],
        }],
        generationConfig: { maxOutputTokens: 20 },
      }),
    });

    if (!validationResponse.ok) {
      // Validation endpoint itself failed — decline rather than let random images through
      res.status(422).json({ error: NOT_SKIN_ERROR });
      return;
    }

    const validJson = await validationResponse.json() as any;
    const raw: string = validJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const upperRaw = raw.trim().toUpperCase();

    // Check INVALID first — "INVALID" contains "VALID" so order matters
    if (upperRaw.includes("INVALID") || !upperRaw.includes("VALID")) {
      res.status(422).json({ error: NOT_SKIN_ERROR });
      return;
    }
  } catch (validationErr) {
    // Network/parse error during validation — decline to be safe
    console.warn("Validation step failed with exception, declining:", validationErr);
    res.status(422).json({ error: NOT_SKIN_ERROR });
    return;
  }

  // ── Step 2: Full skin analysis (only reached if validation passed) ──────────
  const prompt = `You are an expert dermatologist AI. Analyse this human skin photo and return ONLY a raw JSON object — no markdown, no code fences, no extra text.

The JSON must have exactly these fields:
{
  "isSkinPhoto": true or false,
  "skinType": one of "dry","oily","combination","normal","sensitive",
  "sweatLevel": one of "light","moderate","heavy",
  "skinIssues": array, zero or more of "redness","itching","dryness","irritation","darkening","acne",
  "allergies": [],
  "lifestyle": one of "active","office","outdoor","mixed",
  "fragranceStyle": one of "unscented","fresh","floral","woody","citrus","herbal",
  "texturePreference": one of "gel","cream","spray","stick","foam"
}

If this is NOT a real human skin photo, set "isSkinPhoto": false and all other fields to null.
If it IS a real skin photo, set "isSkinPhoto": true and fill all fields based on what you see.
Base your analysis on visible skin characteristics. For fields you cannot determine from the image use sensible defaults.
Return ALL fields every time. Output raw JSON only.`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: prompt },
          ],
        }],
        generationConfig: { maxOutputTokens: 600 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Vision API error", response.status, errText);
      res.status(500).json({ error: `AI vision request failed (${response.status})` });
      return;
    }

    const json = await response.json() as any;
    const rawText: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      res.status(422).json({ error: "Could not read the photo. Please try a clearer, well-lit image of your skin." });
      return;
    }

    const parsed = extractJson(rawText);

    if (!parsed) {
      res.status(422).json({ error: "Could not analyse this photo. Please ensure it shows your skin clearly." });
      return;
    }

    // Double-check: model's own self-assessment
    if (parsed.isSkinPhoto === false) {
      res.status(422).json({ error: NOT_SKIN_ERROR });
      return;
    }

    const VALID_SKIN_TYPES = ["dry", "oily", "combination", "normal", "sensitive"];
    if (!VALID_SKIN_TYPES.includes(parsed.skinType)) {
      res.status(422).json({ error: NOT_SKIN_ERROR });
      return;
    }

    res.json({
      skinType: parsed.skinType,
      sweatLevel: parsed.sweatLevel ?? "moderate",
      skinIssues: Array.isArray(parsed.skinIssues) ? parsed.skinIssues : [],
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      lifestyle: parsed.lifestyle ?? "mixed",
      fragranceStyle: parsed.fragranceStyle ?? "fresh",
      texturePreference: parsed.texturePreference ?? "cream",
    });
  } catch (err: any) {
    console.error("Skin analysis error", err);
    res.status(500).json({ error: err?.message ?? "Skin analysis failed" });
  }
});

export default router;
