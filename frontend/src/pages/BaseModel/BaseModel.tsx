import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { config } from "@/config/env";
import { APP_CONSTANTS } from "@/constants/app";

// Types for better type safety
interface PredictionItem {
  label: string;
  probability: number;
}

interface PredictionResult {
  top_k_predictions: PredictionItem[];
  error?: string;
}

interface GroupedData {
  total: number;
  items: PredictionItem[];
}

type ModelKey = typeof APP_CONSTANTS.VALID_MODEL_KEYS[number];

// Validation functions
const validateFile = (file: File | null): string | null => {
  if (!file) return APP_CONSTANTS.ERROR_MESSAGES.NO_FILE_SELECTED;
  
  if (file.size > config.maxFileSize) {
    return APP_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  
  if (!APP_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return APP_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE;
  }
  
  return null;
};

const validateModelKey = (modelKey: string): modelKey is ModelKey => {
  return APP_CONSTANTS.VALID_MODEL_KEYS.includes(modelKey as ModelKey);
};

const sanitizeText = (text: string): string => {
  return text.replace(/[<>\"'&]/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

async function fetchBaseModelPrediction(file: File, modelKey: ModelKey): Promise<PredictionResult> {
  const fileError = validateFile(file);
  if (fileError) {
    throw new Error(fileError);
  }

  if (!validateModelKey(modelKey)) {
    throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_MODEL_KEY);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_key", modelKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  try {
    const res = await fetch(`${config.apiUrl}base/`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) {
        throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_REQUEST);
      } else if (res.status >= 500) {
        throw new Error(APP_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(APP_CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR);
    }

    const data = await res.json();
    
    // Validate response structure
    if (!data || !Array.isArray(data.top_k_predictions)) {
      throw new Error(APP_CONSTANTS.ERROR_MESSAGES.INVALID_RESPONSE);
    }

    // Sanitize response data
    data.top_k_predictions = data.top_k_predictions.map((item: any) => ({
      label: sanitizeText(String(item.label || '')),
      probability: Math.max(0, Math.min(1, Number(item.probability) || 0))
    }));

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(APP_CONSTANTS.ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    }
    throw new Error(APP_CONSTANTS.ERROR_MESSAGES.UNEXPECTED_ERROR);
  }
}

export default function BaseModel() {
  const [file, setFile] = useState<File | null>(null);
  const [modelKey, setModelKey] = useState<string>("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [groupedCenturyData, setGroupedCenturyData] = useState<Record<string, GroupedData> | null>(null);
  const [viewMode, setViewMode] = useState<typeof APP_CONSTANTS.DEFAULT_VIEW_MODE | "grouped">(APP_CONSTANTS.DEFAULT_VIEW_MODE);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError("");
    
    // Validate file immediately
    if (selectedFile) {
      const fileError = validateFile(selectedFile);
      if (fileError) {
        setError(fileError);
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setGroupedCenturyData(null);
    setProgress(0);
    setLoading(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 1.2;
      });
    }, 200);

    try {
      const data = await fetchBaseModelPrediction(file!, modelKey as ModelKey);
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setResult(data);
          setLoading(false);

          if (modelKey === 'decade' && data.top_k_predictions) {
            const grouped = data.top_k_predictions.reduce((acc: Record<string, GroupedData>, item: PredictionItem) => {
              const centuryPrefix = parseInt(item.label.slice(0, 2)) + 1;
              const century = centuryPrefix === 21 ? "21st Century" : `${centuryPrefix}th Century`;

              if (!acc[century]) {
                acc[century] = { total: 0, items: [] };
              }
              acc[century].total += item.probability;
              acc[century].items.push(item);
              return acc;
            }, {});
            setGroupedCenturyData(grouped);
          }
        }, 600);
      }, 600);
    } catch (err) {
      setProgress(100);
      setTimeout(() => {
        const errorMessage = err instanceof Error ? err.message : APP_CONSTANTS.ERROR_MESSAGES.UNEXPECTED_ERROR;
        setError(errorMessage);
        setLoading(false);
        if (config.isDevelopment) {
          console.error('Prediction error:', err);
        }
      }, 600);
    }
  };

  const handleModelChange = (val: string) => {
    setModelKey(val);
    setFile(null);
    // Reset file input element
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setResult(null);
    setGroupedCenturyData(null);
    setViewMode(APP_CONSTANTS.DEFAULT_VIEW_MODE);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Base Model Prediction
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Text File (Max {Math.round(config.maxFileSize / 1024 / 1024)}MB)</Label>
            <Input
              id="file"
              type="file"
              accept={APP_CONSTANTS.ALLOWED_FILE_TYPES.join(',')}
              onChange={handleFileChange}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_key">Model Type</Label>
            <Select onValueChange={handleModelChange} disabled={loading}>
              <SelectTrigger className="py-2 px-3 font-medium text-white">
                <SelectValue placeholder="Select a model type" />
              </SelectTrigger>
              <SelectContent>
                {APP_CONSTANTS.VALID_MODEL_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !file || !modelKey}>
            {loading ? "Predicting..." : "Submit"}
          </Button>
        </form>

        {modelKey === "decade" && result?.top_k_predictions && (
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => val && setViewMode(val as "flat" | "grouped")}
            className="flex justify-center mt-4 gap-2"
          >
            <ToggleGroupItem
              value="flat"
              className={`text-sm px-4 py-2 border transition-all duration-200 ease-in-out hover:scale-105 ${
                viewMode === "flat" 
                  ? "!bg-black !text-white !border-white shadow-lg" 
                  : "!bg-white !text-black !border-black hover:!bg-gray-100 hover:shadow-md"
              }`}
            >
              Top 10 List
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grouped"
              className={`text-sm px-4 py-2 border transition-all duration-200 ease-in-out hover:scale-105 ${
                viewMode === "grouped" 
                  ? "!bg-black !text-white !border-white shadow-lg" 
                  : "!bg-white !text-black !border-black hover:!bg-gray-100 hover:shadow-md"
              }`}
            >
              Grouped
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {loading && (
          <div className="mt-4">
            <p className="text-sm text-center text-gray-600 mb-2">Analyzing text, please wait...</p>
            <Progress value={progress} />
          </div>
        )}

        {viewMode === "flat" && result?.top_k_predictions && (
          <div className="mt-6 space-y-2">
            {result.top_k_predictions.map((item: PredictionItem, idx: number) => (
              <div
                key={`${item.label}-${idx}`}
                className="flex justify-between px-3 py-2 bg-white dark:bg-zinc-700 rounded-md shadow-sm text-sm"
              >
                <span className="font-medium text-slate-800 dark:text-white">
                  {modelKey === "decade" && item.label.length > 2
                    ? item.label + "s"
                    : item.label === "21"
                    ? "21st"
                    : item.label + "th"}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {(item.probability * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {viewMode === "grouped" && groupedCenturyData && (
          <div className="flex flex-wrap gap-6 mt-6">
            {Object.entries(groupedCenturyData).map(([century, data]) => (
              <div
                key={century}
                className="flex-1 min-w-[250px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-sm"
              >
                <h2 className="font-semibold text-black dark:text-white mb-2">
                  {century} — {(data.total * 100).toFixed(2)}%
                </h2>
                <ul className="space-y-2">
                  {data.items.map((item: PredictionItem, idx: number) => (
                    <li
                      key={`${century}-${item.label}-${idx}`}
                      className="flex justify-between px-3 py-1.5 bg-white dark:bg-zinc-700 rounded-md shadow-sm"
                    >
                      <span className="font-medium text-black dark:text-white">
                        {item.label + "s"}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {(item.probability * 100).toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}