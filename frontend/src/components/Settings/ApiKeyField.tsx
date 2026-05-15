import React, {useState} from "react";
import {Eye, EyeOff, Plus, Trash2, X, ChevronDown, Key, Tag, Cpu, Check} from "lucide-react";
import {cn} from "@/lib/utils.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = "openai" | "anthropic" | "groq" | "other";

interface ApiKey {
  id: string;
  nickname: string;
  provider: Provider;
  maskedKey: string;   // stored masked, e.g. "••••••••••••ab3f"
  models: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  groq: "Groq",
  other: "Other",
};

const PROVIDER_SUGGESTIONS: Record<Provider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  other: [],
};

function detectProvider(key: string): Provider {
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("sk-proj-") || (key.startsWith("sk-") && !key.startsWith("sk-ant-"))) return "openai";
  if (key.startsWith("gsk_")) return "groq";
  return "other";
}

function maskKey(key: string): string {
  if (key.length <= 4) return "••••";
  return "••••••••••••" + key.slice(-4);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ProviderBadge({provider}: {provider: Provider}) {
  const colors: Record<Provider, string> = {
    openai:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    anthropic: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    groq:      "bg-purple-500/15 text-purple-400 border-purple-500/30",
    other:     "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", colors[provider])}>
      {PROVIDER_LABELS[provider]}
    </span>
  );
}

function ModelTag({label, onRemove}: {label: string; onRemove?: () => void}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-zinc-300">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-zinc-500 hover:text-zinc-200 transition-colors">
          <X size={10}/>
        </button>
      )}
    </span>
  );
}

// ─── Saved Key Row ─────────────────────────────────────────────────────────────

function ApiKeyRow({apiKey, onDelete}: {apiKey: ApiKey; onDelete: (id: string) => void}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-white/8 bg-white/3 overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/4 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <Key size={14} className="text-zinc-500 shrink-0"/>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-200 truncate">
              {apiKey.nickname || "Unnamed Key"}
            </span>
            <ProviderBadge provider={apiKey.provider}/>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{apiKey.maskedKey}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={e => {e.stopPropagation(); onDelete(apiKey.id);}}
            className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14}/>
          </button>
          <ChevronDown
            size={14}
            className={cn("text-zinc-500 transition-transform duration-200", expanded && "rotate-180")}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-white/5 pt-3">
          <p className="text-xs text-zinc-500 mb-2">Models</p>
          <div className="flex flex-wrap gap-1.5">
            {apiKey.models.length > 0
              ? apiKey.models.map(m => <ModelTag key={m} label={m}/>)
              : <span className="text-xs text-zinc-600 italic">No models configured</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Key Form ─────────────────────────────────────────────────────────────

interface AddKeyFormProps {
  onAdd: (key: ApiKey) => void;
  onCancel: () => void;
}

function AddKeyForm({onAdd, onCancel}: AddKeyFormProps) {
  const [nickname, setNickname] = useState("");
  const [rawKey, setRawKey]     = useState("");
  const [showKey, setShowKey]   = useState(false);
  const [provider, setProvider] = useState<Provider>("other");
  const [models, setModels]     = useState<string[]>([]);
  const [modelInput, setModelInput] = useState("");
  const [autoDetected, setAutoDetected] = useState(false);

  const handleKeyChange = (val: string) => {
    setRawKey(val);
    if (val.length > 8) {
      const detected = detectProvider(val);
      setProvider(detected);
      setAutoDetected(detected !== "other");
    } else {
      setAutoDetected(false);
    }
  };

  const addModel = (model: string) => {
    const trimmed = model.trim();
    if (trimmed && !models.includes(trimmed)) {
      setModels(prev => [...prev, trimmed]);
    }
    setModelInput("");
  };

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addModel(modelInput);
    }
  };

  const handleSubmit = () => {
    if (!rawKey.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      nickname: nickname.trim() || "Unnamed Key",
      provider,
      maskedKey: maskKey(rawKey),
      models,
    });
  };

  const suggestions = PROVIDER_SUGGESTIONS[provider].filter(s => !models.includes(s));

  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-4 space-y-4">

      {/* Nickname */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Tag size={11}/> Nickname
        </label>
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="e.g. Personal OpenAI"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Key size={11}/> API Key
        </label>
        <div className="relative">
          <input
            value={rawKey}
            onChange={e => handleKeyChange(e.target.value)}
            type={showKey ? "text" : "password"}
            placeholder="sk-••••••••••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/25 transition-colors font-mono"
          />
          <button
            onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        </div>
        {autoDetected && (
          <p className="flex items-center gap-1 text-xs text-emerald-400">
            <Check size={11}/> Detected provider: {PROVIDER_LABELS[provider]}
          </p>
        )}
      </div>

      {/* Provider */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Cpu size={11}/> Provider
        </label>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PROVIDER_LABELS) as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-colors",
                provider === p
                  ? "bg-white/15 border-white/25 text-zinc-100"
                  : "bg-white/3 border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15"
              )}
            >
              {PROVIDER_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Models */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-400">Models</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {models.map(m => (
            <ModelTag key={m} label={m} onRemove={() => setModels(prev => prev.filter(x => x !== m))}/>
          ))}
        </div>
        <input
          value={modelInput}
          onChange={e => setModelInput(e.target.value)}
          onKeyDown={handleModelKeyDown}
          placeholder="Type a model name and press Enter"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
        />
        {suggestions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-600">Suggestions</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => addModel(s)}
                  className="text-xs px-2 py-0.5 rounded-md bg-white/3 border border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!rawKey.trim()}
          className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/15 border border-white/15 rounded-md text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Key
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ApiKeyField() {
  const [keys, setKeys]       = useState<ApiKey[]>([]);
  const [adding, setAdding]   = useState(false);

  const handleAdd = (key: ApiKey) => {
    setKeys(prev => [...prev, key]);
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">API Keys</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Plus size={12}/> Add Key
          </button>
        )}
      </div>

      {keys.length === 0 && !adding && (
        <p className="text-xs text-zinc-600 text-center py-6 border border-dashed border-white/8 rounded-lg">
          No API keys saved yet
        </p>
      )}

      <div className="space-y-2">
        {keys.map(k => (
          <ApiKeyRow key={k.id} apiKey={k} onDelete={handleDelete}/>
        ))}
      </div>

      {adding && (
        <AddKeyForm onAdd={handleAdd} onCancel={() => setAdding(false)}/>
      )}
    </div>
  );
}