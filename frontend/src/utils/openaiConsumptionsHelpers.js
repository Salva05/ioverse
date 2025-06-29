export const modelCostsTable = {
  /* ——— Core GPT-4.x & GPT-4o family ——— */
  "gpt-4o-2024-08-06": { input: 2.5, output: 10.0 },
  "gpt-4o-audio-preview-2024-12-17": { input: 2.5, output: 10.0 },
  "gpt-4o-realtime-preview-2025-06-03": { input: 5.0, output: 20.0 },
  "gpt-4o-search-preview-2025-03-11": { input: 2.5, output: 10.0 },

  "gpt-4.1-2025-04-14": { input: 2.0, output: 8.0 },
  "gpt-4.1-mini-2025-04-14": { input: 0.4, output: 1.6 },
  "gpt-4.1-nano-2025-04-14": { input: 0.1, output: 0.4 },

  "gpt-4.5-preview-2025-02-27": { input: 75.0, output: 150.0 },

  /* ——— GPT-4o mini variants ——— */
  "gpt-4o-mini-2024-07-18": { input: 0.15, output: 0.6 },
  "gpt-4o-mini-audio-preview-2024-12-17": { input: 0.15, output: 0.6 },
  "gpt-4o-mini-realtime-preview-2024-12-17": { input: 0.6, output: 2.4 },
  "gpt-4o-mini-search-preview-2025-03-11": { input: 0.15, output: 0.6 },

  /* ——— O-series models ——— */
  "o1-2024-12-17": { input: 15.0, output: 60.0 },
  "o1-pro-2025-03-19": { input: 150.0, output: 600.0 },
  "o1-mini-2024-09-12": { input: 1.1, output: 4.4 },

  "o3-2025-04-16": { input: 2.0, output: 8.0 },
  "o3-pro-2025-06-10": { input: 20.0, output: 80.0 },
  "o3-mini-2025-01-31": { input: 1.1, output: 4.4 },
  "o3-deep-research-2025-06-26": { input: 10.0, output: 40.0 },

  "o4-mini-2025-04-16": { input: 1.1, output: 4.4 },
  "o4-mini-deep-research-2025-06-26": { input: 2.0, output: 8.0 },

  /* ——— Classic ChatGPT & GPT-3.5/4 Turbo ——— */
  "chatgpt-4o-latest": { input: 5.0, output: 15.0 },
  "gpt-4-turbo-2024-04-09": { input: 10.0, output: 30.0 },
  "gpt-4-0613": { input: 30.0, output: 60.0 },
  "gpt-4-32k": { input: 60.0, output: 120.0 },

  "gpt-3.5-turbo-0125": { input: 0.5, output: 1.5 },
  "gpt-3.5-turbo-instruct": { input: 1.5, output: 2.0 },
  "gpt-3.5-turbo-16k-0613": { input: 3.0, output: 4.0 },

  /* ——— Codex & legacy completions ——— */
  "codex-mini-latest": { input: 1.5, output: 6.0 },
  "davinci-002": { input: 2.0, output: 2.0 },

  /* ——— Computer-use API ——— */
  "computer-use-preview-2025-03-11": { input: 3.0, output: 12.0 },

  /* ——— Image generation (per-image output prices) ——— */
  /* GPT Image 1 */
  "gpt-image-1-low-1024x1024": { output: 0.011 },
  "gpt-image-1-low-1024x1536": { output: 0.016 },
  "gpt-image-1-low-1536x1024": { output: 0.016 },
  "gpt-image-1-medium-1024x1024": { output: 0.042 },
  "gpt-image-1-medium-1024x1536": { output: 0.063 },
  "gpt-image-1-medium-1536x1024": { output: 0.063 },
  "gpt-image-1-high-1024x1024": { output: 0.167 },
  "gpt-image-1-high-1024x1536": { output: 0.25 },
  "gpt-image-1-high-1536x1024": { output: 0.25 },

  /* DALL·E 3 */
  "dalle-3-standard-1024x1024": { output: 0.04 },
  "dalle-3-standard-1024x1792": { output: 0.08 },
  "dalle-3-standard-1792x1024": { output: 0.08 },
  "dalle-3-hd-1024x1024": { output: 0.08 },
  "dalle-3-hd-1024x1792": { output: 0.12 },
  "dalle-3-hd-1792x1024": { output: 0.12 },

  /* DALL·E 2 */
  "dalle-2-standard-256x256": { output: 0.016 },
  "dalle-2-standard-512x512": { output: 0.018 },
  "dalle-2-standard-1024x1024": { output: 0.02 },

  /* Note:
     - All prices are dollars per million **output** tokens unless noted otherwise
       (image SKUs are per generated image). */
};

/** Returns cost in USD for one usage row coming from the backend. */
export const computeCostUSD = (r) => {
  // text completions
  if ("input_tokens" in r || "output_tokens" in r) {
    const rate = modelCostsTable[r.model] || {};
    const input = (r.input_tokens || 0) * (rate.input || 0);
    const cached =
      (r.input_cached_tokens || 0) * (rate.cachedInput ?? rate.input ?? 0);
    const output = (r.output_tokens || 0) * (rate.output || 0);
    // prices are “per-million tokens”
    return (input + cached + output) / 1_000_000;
  }

  // image generations
  if ("images" in r) {
    // build the lookup key that lives inside modelCostsTable
    const key = (() => {
      // GPT Image 1 ➜ "gpt-image-1-<quality>-<size>"
      if (r.model === "gpt-image-1") {
        const quality = r.quality || "medium";
        return `gpt-image-1-${quality}-${r.size}`;
      }
      // DALL·E 3 ➜ "dalle-3-standard-<size>"  (quality always “standard” unless HD shown)
      if (r.model === "dall-e-3") {
        const q = r.quality === "hd" ? "hd" : "standard";
        return `dalle-3-${q}-${r.size}`;
      }
      // DALL·E 2 ➜ "dalle-2-standard-<size>"
      if (r.model === "dall-e-2") {
        return `dalle-2-standard-${r.size}`;
      }
      return null;
    })();

    const pricePerImage = modelCostsTable[key]?.output ?? 0;
    return (r.images || 0) * pricePerImage;
  }

  return 0;
};

/** Converts a backend row into the shape the UI expects. */
export const toUiRow = (r) => ({
  date: new Date(r.timestamp * 1000).toISOString().slice(0, 10), // "YYYY-MM-DD"
  model: r.model,
  tokens:
    "input_tokens" in r || "output_tokens" in r
      ? (r.input_tokens || 0) + (r.output_tokens || 0)
      : 0,
  cost: computeCostUSD(r),
});
