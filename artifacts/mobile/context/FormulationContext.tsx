import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/deviceId";

export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";
export type SweatLevel = "light" | "moderate" | "heavy";
export type SkinIssue = "redness" | "itching" | "dryness" | "irritation" | "darkening" | "acne";
export type Allergy = "fragrances" | "alcohol" | "parabens" | "sulfates" | "lanolin" | "propylene_glycol";
export type Lifestyle = "active" | "office" | "outdoor" | "mixed";
export type FragranceStyle = "unscented" | "fresh" | "floral" | "woody" | "citrus" | "herbal";
export type TexturePreference = "gel" | "cream" | "spray" | "stick" | "foam";
export type ProductType = "deodorant" | "shower_gel";

export interface QuestionnaireData {
  productType: ProductType | null;
  skinType: SkinType | null;
  sweatLevel: SweatLevel | null;
  skinIssues: SkinIssue[];
  allergies: Allergy[];
  lifestyle: Lifestyle | null;
  fragranceStyle: FragranceStyle | null;
  texturePreference: TexturePreference | null;
}

export interface FormulaIngredient {
  name: string; purpose: string; percentage?: string;
}
export interface FormulaSection {
  title: string; ingredients: FormulaIngredient[]; description?: string;
}
export interface Formulation {
  id: string; createdAt: string; productType: ProductType;
  questionnaireData: QuestionnaireData; productName: string; tagline: string;
  baseFormula: FormulaSection; odorControl: FormulaSection;
  skinCareActives: FormulaSection; fragranceProfile: FormulaSection;
  applicationInstructions: string; irishWaterNote?: string;
}

interface FormulationContextType {
  questionnaire: QuestionnaireData;
  updateQuestionnaire: (updates: Partial<QuestionnaireData>) => void;
  resetQuestionnaire: () => void;
  formulations: Formulation[];
  addFormulation: (f: Formulation) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationError: string | null;
  setGenerationError: (e: string | null) => void;
  isSyncing: boolean;
}

const defaultQuestionnaire: QuestionnaireData = {
  productType: null, skinType: null, sweatLevel: null,
  skinIssues: [], allergies: [], lifestyle: null,
  fragranceStyle: null, texturePreference: null,
};

const FormulationContext = createContext<FormulationContextType | null>(null);
const LOCAL_KEY = "limenova_formulations";

export function FormulationProvider({ children }: { children: React.ReactNode }) {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(defaultQuestionnaire);
  const [formulations, setFormulations] = useState<Formulation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from local storage first (fast), then sync from Supabase
  useEffect(() => {
    // Load local cache immediately
    AsyncStorage.getItem(LOCAL_KEY).then((data) => {
      if (data) {
        try { setFormulations(JSON.parse(data)); } catch {}
      }
    });

    // Then hydrate from Supabase
    (async () => {
      try {
        setIsSyncing(true);
        const deviceId = await getDeviceId();
        const { data, error } = await supabase
          .from("formulas")
          .select("*")
          .eq("device_id", deviceId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const cloud: Formulation[] = data.map((row: any) => ({
            ...row.data,
            id: row.id,
            createdAt: row.created_at,
            productName: row.product_name,
            tagline: row.tagline,
            productType: row.product_type,
          }));
          setFormulations(cloud);
          AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(cloud));
        }
      } catch (e) {
        console.warn("Supabase sync failed, using local data:", e);
      } finally {
        setIsSyncing(false);
      }
    })();
  }, []);

  const updateQuestionnaire = useCallback((updates: Partial<QuestionnaireData>) => {
    setQuestionnaire((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetQuestionnaire = useCallback(() => {
    setQuestionnaire(defaultQuestionnaire);
  }, []);

  const addFormulation = useCallback((f: Formulation) => {
    // Update local state immediately
    setFormulations((prev) => {
      const next = [f, ...prev];
      AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });

    // Persist to Supabase in background
    (async () => {
      try {
        const deviceId = await getDeviceId();
        const { error } = await supabase.from("formulas").upsert({
          id: f.id,
          device_id: deviceId,
          product_type: f.productType,
          product_name: f.productName,
          tagline: f.tagline,
          data: f,
          created_at: f.createdAt,
        });
        if (error) console.warn("Failed to sync formula to Supabase:", error.message);
      } catch (e) {
        console.warn("Supabase formula save error:", e);
      }
    })();
  }, []);

  return (
    <FormulationContext.Provider
      value={{
        questionnaire, updateQuestionnaire, resetQuestionnaire,
        formulations, addFormulation,
        isGenerating, setIsGenerating,
        generationError, setGenerationError,
        isSyncing,
      }}
    >
      {children}
    </FormulationContext.Provider>
  );
}

export function useFormulation() {
  const ctx = useContext(FormulationContext);
  if (!ctx) throw new Error("useFormulation must be used inside FormulationProvider");
  return ctx;
}
