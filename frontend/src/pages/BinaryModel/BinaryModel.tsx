import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { config } from "@/config/env";
import { APP_CONSTANTS } from "@/constants/app";
import BinaryBarChart from "@/components/charts/BinaryBarChart";

interface BinaryPredictionResult {
  prediction: string;
  top_k: {
    older: {
      total_probability: number;
      items: { label: string; probability: number }[];
    };
    equal_or_younger: {
      total_probability: number;
      items: { label: string; probability: number }[];
    };
  };
}

export default function BinaryModel() {
  const [file, setFile] = useState<File | null>(null);
  const [modelKey, setModelKey] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");
  const [result, setResult] = useState<BinaryPredictionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError("");
  };

  const handleModelChange = (val: string) => {
    setModelKey(val);
    setThreshold("");
    setResult(null);
    setFile(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
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

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("model_key", modelKey);
    formData.append("threshold", threshold);

    try {
      const res = await fetch(`${config.apiUrl}binary/`, {
        method: "POST",
        body: formData,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok) {
        throw new Error("Prediction failed.");
      }

      const data = await res.json();

      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setResult(data as BinaryPredictionResult);
          setLoading(false);
        }, 600);
      }, 600);
    } catch (err) {
      setProgress(100);
      setTimeout(() => {
        setError("An error occurred during prediction.");
        setLoading(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Binary Model Prediction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Text File</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label>Model Type</Label>
            <Select onValueChange={handleModelChange}>
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

          {modelKey && (
            <div className="space-y-2">
              <Label>Threshold</Label>
              {modelKey === "decade" ? (
                <Select onValueChange={setThreshold}>
                  <SelectTrigger className="py-2 px-3 font-medium text-white">
                    <SelectValue placeholder="Select threshold decade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 41 }, (_, i) => 1610 + i * 10).map((decade) => (
                      <SelectItem key={decade} value={decade.toString()}>
                        {decade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select onValueChange={setThreshold}>
                  <SelectTrigger className="py-2 px-3 font-medium text-white">
                    <SelectValue placeholder="Select threshold century" />
                  </SelectTrigger>
                  <SelectContent>
                    {[18, 19, 20].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !file || !modelKey || !threshold}>
            {loading ? "Predicting..." : "Submit"}
          </Button>
        </form>

        {loading && (
          <div className="mt-4">
            <p className="text-sm text-center text-gray-600 mb-2">Analyzing text, please wait...</p>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <>
            <div className="mt-6 space-y-4 text-sm bg-slate-50 dark:bg-zinc-800 p-4 rounded-md shadow">
              <p><strong>Prediction:</strong> {result.prediction}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["older", "equal_or_younger"].map((group) => (
                  <div key={group}>
                    <h2 className="text-md font-semibold capitalize text-black dark:text-white">
                      {group.replace("_", " ")} ({(result.top_k[group as "older" | "equal_or_younger"].total_probability * 100).toFixed(2)}%)
                    </h2>
                    <ul className="space-y-1 mt-2">
                      {result.top_k[group as "older" | "equal_or_younger"].items.map((item, idx) => (
                        <li
                          key={`${group}-${item.label}-${idx}`}
                          className="flex justify-between bg-white dark:bg-zinc-700 rounded px-3 py-1.5 shadow-sm"
                        >
                          <span className="font-medium text-black dark:text-white">{item.label}</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {(item.probability * 100).toFixed(2)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <BinaryBarChart data={result.top_k} />
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}