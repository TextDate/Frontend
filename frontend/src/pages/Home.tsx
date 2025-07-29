// src/pages/Home.tsx

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-evenly px-4 py-8">
        <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl px-6 py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-white">
          TextDate Predictor
        </h1>

        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base text-center leading-relaxed">
          This tool tries to predict the estimated age of a written text using machine learning models trained on historical documents from the 1600s to the 2020s.
          Choose one of the prediction types below:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex flex-col justify-between h-full">
            <div className="space-y-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Base Model
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Predicts the decade or century of a given text, showing the <strong>top 10</strong> most probable decades and their associated probabilities.
                <br />
                For century predictions, it shows the <strong>top 2</strong> with their respective probabilities.
              </p>
            </div>
            <Link to="/base">
              <Button className="w-full mt-auto" variant="default">
                Use Base Model
              </Button>
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex flex-col justify-between h-full">
            <div className="space-y-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Binary Model
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Takes a threshold value you define and classifies the text into two groups:
                <strong> Older</strong> or <strong> Equal or Younger</strong> than that threshold.
                <br />
                Also informs you about the most probable decade and its associated probability.
              </p>
            </div>
            <Button className="w-full mt-auto" variant="default">
              Use Binary Model
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}