import { QuestionnaireData, Formulation } from "@/context/FormulationContext";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

function getApiBase() {
  if (DOMAIN) return `https://${DOMAIN}/api`;
  return "/api";
}

export async function generateFormulation(data: QuestionnaireData): Promise<Formulation> {
  const body = {
    productType: data.productType,
    skinType: data.skinType,
    sweatLevel: data.sweatLevel,
    skinIssues: data.skinIssues,
    allergies: data.allergies,
    lifestyle: data.lifestyle,
    fragranceStyle: data.fragranceStyle,
    texturePreference: data.texturePreference,
  };

  const response = await fetch(`${getApiBase()}/formulation/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `Request failed: ${response.status}`);
  }

  const formulation = await response.json();
  return {
    ...formulation,
    questionnaireData: data,
  } as Formulation;
}

export async function analyseSkinFromImage(
  base64Image: string,
  productType: string
): Promise<Partial<QuestionnaireData>> {
  const response = await fetch(`${getApiBase()}/analysis/skin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, productType }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Analysis failed" }));
    throw new Error(err.error ?? `Analysis failed: ${response.status}`);
  }

  return response.json();
}
