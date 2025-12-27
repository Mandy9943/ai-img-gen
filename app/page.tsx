"use client";

import JSZip from "jszip";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  History,
  Image as ImageIcon,
  Key,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface GenerationResult {
  status: "success" | "error" | "pending" | "processing";
  prompt: string;
  urls?: string[];
  error?: string;
  sessionId?: string;
}

const DEFAULT_JSON = JSON.stringify(
  [
    {
      prompt: "A futuristic city in the style of Blade Runner",
      variant: "banner",
    },
    { prompt: "A cute robot drinking coffee", variant: "logo" },
    { prompt: "A majestic mountain landscape at sunset", variant: "banner" },
  ],
  null,
  2
);

interface SessionHistory {
  id: string;
  createdAt: string;
  images: string[];
}

export default function Home() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API Key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      fetchHistory(savedKey);
    }
  }, []);

  const fetchHistory = async (key: string) => {
    if (!key) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/sessions", {
        headers: { "x-api-key": key },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.sessions);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Save API Key to localStorage when it changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("gemini_api_key", newKey);
    if (newKey) fetchHistory(newKey);
    else setHistory([]);
  };

  const validateJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
      setError(null);
      return parsed;
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please provide a Gemini API Key first.");
      return;
    }

    const parsed = validateJson();
    if (!parsed) return;

    setIsLoading(true);
    setError(null);

    // Initialize results as pending
    setResults(
      parsed.map((item: any) => ({
        status: "pending",
        prompt: item.prompt,
      }))
    );

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: jsonInput,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate images");
      }

      setResults(
        data.results.map((r: any) => ({ ...r, sessionId: data.sessionId }))
      );
      fetchHistory(apiKey); // Refresh history after generation
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImagesAsZip = async (urls: string[], sessionId: string) => {
    setIsDownloading(true);
    const zip = new JSZip();

    try {
      const downloadPromises = urls.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const fileName = url.split("/").pop() || "image.png";
        zip.file(fileName, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `ai-images-${sessionId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setError(`Download failed: ${e.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = results.filter(
      (r) => r.status === "success" && r.urls && r.urls.length > 0
    );
    if (successImages.length === 0) return;

    const allUrls = successImages.flatMap((r) => r.urls!);
    const sessionId = results[0].sessionId || Date.now().toString();
    await downloadImagesAsZip(allUrls, sessionId);
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Bulk AI Image Generator</h1>
        <p className="text-muted-foreground">
          Paste your JSON configuration below to generate images in bulk.
        </p>
      </header>

      {/* API Key Configuration */}
      <section className="mb-8 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Key className="w-4 h-4" />
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your GOOGLE_GENERATIVE_AI_API_KEY"
              className="w-full p-2 pr-10 border rounded bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500">
            * Your API key is stored locally in your browser (localStorage) and
            is only sent to the generation API.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">JSON Configuration</h2>
            <button
              onClick={() => setJsonInput(DEFAULT_JSON)}
              className="text-sm text-blue-500 hover:underline"
            >
              Reset to Example
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="flex-1 min-h-[400px] p-4 font-mono text-sm border rounded-lg bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="[ { 'prompt': '...', 'variant': 'logo' } ]"
          />
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isLoading ? "Generating..." : "Generate Bulk Images"}
          </button>
        </section>

        {/* Results Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Progress & Results</h2>
            <div className="flex items-center gap-2">
              {results.some((r) => r.status === "success") && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  {isDownloading ? "Zipping..." : "Download All"}
                </button>
              )}
              {results.length > 0 && results[0].sessionId && (
                <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded font-mono">
                  Session: {results[0].sessionId}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900 overflow-y-auto max-h-[600px]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                <ImageIcon className="w-12 h-12" />
                <p>No images generated yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-zinc-800 rounded shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium truncate flex-1">
                        {result.prompt}
                      </span>
                      {result.status === "pending" && (
                        <div className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />
                      )}
                      {result.status === "processing" && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      {result.status === "success" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {result.urls && result.urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {result.urls.map((url, urlIdx) => (
                          <a
                            key={urlIdx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square overflow-hidden rounded border border-zinc-200 dark:border-zinc-700 group"
                          >
                            <img
                              src={url}
                              alt={result.prompt}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                View Full
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                    {result.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* History Section */}
      {apiKey && (
        <section className="mt-12 p-6 border rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold">Previous Generations</h2>
            </div>
            {isLoadingHistory && (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            )}
          </div>

          {history.length === 0 && !isLoadingHistory ? (
            <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No previous sessions found for this API Key.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                >
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-700/50 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[150px]">
                      {session.id}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 grid grid-cols-4 gap-1">
                    {session.images.slice(0, 8).map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square relative overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900 group cursor-pointer"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <img
                          src={url}
                          alt=""
                          className="object-cover w-full h-full transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                    {session.images.length > 8 && (
                      <div className="aspect-square flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded text-[10px] font-bold">
                        +{session.images.length - 8}
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <button
                      onClick={() =>
                        downloadImagesAsZip(session.images, session.id)
                      }
                      disabled={isDownloading}
                      className="text-[10px] flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      Download Session (.zip)
                    </button>
                    <button
                      onClick={() => {
                        // Load this session's results into the main progress panel for viewing
                        setResults(
                          session.images.map((url) => ({
                            status: "success",
                            prompt: url.split("/").pop() || "Generated Image",
                            urls: [url],
                            sessionId: session.id,
                          }))
                        );
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-[10px] flex items-center gap-1 text-zinc-500 hover:text-blue-500 transition-colors"
                    >
                      Restore View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* FAQ Section */}
      <footer className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-center">Reference & FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Variant Options</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                The{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-xs">
                  variant
                </code>{" "}
                field determines the shape:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-500 min-w-[60px]">
                    logo
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Generates <strong>Square</strong> images (1:1). Best for
                    avatars and icons.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-500 min-w-[60px]">
                    banner
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Generates <strong>Widescreen</strong> images (16:9). Best
                    for headers.
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Custom Aspect Ratios
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                You can override the variant by adding an{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-xs">
                  aspectRatio
                </code>{" "}
                field:
                <br />
                <code className="block mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">
                  &#123; "prompt": "...", "aspectRatio": "4:3" &#125;
                </code>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Custom Filenames</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Control the output filename by adding a{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-xs">
                  filename
                </code>{" "}
                field:
                <br />
                <code className="block mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">
                  &#123; "prompt": "...", "filename": "my-custom-image" &#125;
                </code>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Bulk Processing</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                You can submit as many prompts as you want. To ensure stability,
                the system processes{" "}
                <strong>up to 10 images simultaneously</strong>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Storage</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Images are saved in{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-xs">
                  public/output/
                </code>
                . They appear in the results panel as soon as they are ready.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
