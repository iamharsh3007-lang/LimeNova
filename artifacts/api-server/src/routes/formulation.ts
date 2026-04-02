import { Router, type IRouter } from "express";
import { GenerateFormulationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/formulation/generate", async (req, res) => {
  const parseResult = GenerateFormulationBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const data = parseResult.data;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  if (!baseUrl || !apiKey) {
    res.status(500).json({ error: "AI integration not configured" });
    return;
  }

  const productLabel =
    data.productType === "deodorant" ? "natural deodorant" : "shower gel";

  const prompt = `You are a premium cosmetic formulation scientist specialising in Irish personal care products. 
  
Create a highly personalised ${productLabel} formula for a customer in Ireland based on their profile:

SKIN PROFILE:
- Skin type: ${data.skinType}
- Sweat level: ${data.sweatLevel ?? "moderate"}
- Skin issues: ${data.skinIssues && data.skinIssues.length > 0 ? data.skinIssues.join(", ") : "none"}

SENSITIVITIES & ALLERGIES:
- Allergies/intolerances: ${data.allergies && data.allergies.length > 0 ? data.allergies.join(", ") : "none"}

LIFESTYLE & CONTEXT:
- Lifestyle: ${data.lifestyle}
- Location: Ireland (hard water, damp climate — formulate accordingly)

PREFERENCES:
- Fragrance style: ${data.fragranceStyle}
- Texture preference: ${data.texturePreference}

Respond ONLY with a valid JSON object (no markdown code blocks, no extra text). Use this exact schema:
{
  "productName": "creative premium name for this formula",
  "tagline": "short clinical-elegant tagline, max 10 words",
  "baseFormula": {
    "title": "Base Formula",
    "description": "2 sentences explaining the base selection for this skin type",
    "ingredients": [
      { "name": "ingredient name", "purpose": "what it does", "percentage": "x%" }
    ]
  },
  "odorControl": {
    "title": "Odor Control System",
    "description": "2 sentences on the odor control approach",
    "ingredients": [
      { "name": "ingredient name", "purpose": "what it does", "percentage": "x%" }
    ]
  },
  "skinCareActives": {
    "title": "Skin-Care Actives",
    "description": "mention specific actives chosen for their skin issues e.g. Niacinamide for redness",
    "ingredients": [
      { "name": "ingredient name", "purpose": "what it does", "percentage": "x%" }
    ]
  },
  "fragranceProfile": {
    "title": "Fragrance Profile",
    "description": "describe the scent journey: top, mid, base notes",
    "ingredients": [
      { "name": "ingredient name", "purpose": "what it does", "percentage": "x%" }
    ]
  },
  "applicationInstructions": "2-3 sentences on how to use this formula",
  "irishWaterNote": "specific note on how formula is optimised for Ireland's hard water and damp climate"
}`;

  try {
    // Replit AI Integrations proxy — apiVersion is "" so no /v1beta/ prefix
    const url = `${baseUrl}/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "Gemini API error");
      res.status(500).json({ error: `AI request failed (${response.status})` });
      return;
    }

    const json = await response.json() as any;
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      req.log.error({ json }, "Empty AI response");
      res.status(500).json({ error: "Empty response from AI" });
      return;
    }

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned);

    const formulation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      productType: data.productType,
      ...parsed,
    };

    res.json(formulation);
  } catch (err: any) {
    req.log.error({ err }, "Formulation generation error");
    res.status(500).json({ error: err?.message ?? "Internal server error" });
  }
});

export default router;
