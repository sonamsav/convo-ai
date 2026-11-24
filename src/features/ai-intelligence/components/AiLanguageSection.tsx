import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Languages,
  RotateCw,
} from 'lucide-react';
import { Button, Badge, LoadingState } from '@/components/ui';
import { useAppDispatch } from '@/app/store/hooks';
import { addToast } from '@/app/store/slices/toastSlice';
import { aiService } from '../services/aiService';
import { AiTranslationResult, SupportedLanguage } from '../types/ai';

const LANGUAGE_SAMPLES = [
  {
    lang: 'Hindi (हिंदी)',
    text: 'नमस्ते, क्या आप बता सकते हैं कि हमारा सर्वर इंटीग्रेशन कब तक लाइव होगा? हमें जल्द पुष्टि चाहिए।',
    target: 'en' as SupportedLanguage,
  },
  {
    lang: 'English to Hindi',
    text: 'We have updated your server configuration and the latency fix is now active. Please verify.',
    target: 'hi' as SupportedLanguage,
  },
  {
    lang: 'Spanish (Español)',
    text: 'Hola, tenemos un problema con la facturación mensual. No podemos descargar las facturas en PDF.',
    target: 'en' as SupportedLanguage,
  },
];

export const AiLanguageSection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [inputText, setInputText] = useState(LANGUAGE_SAMPLES[0].text);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<AiTranslationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const result = await aiService.translate(inputText.trim(), targetLang);
      setTranslationResult(result);
      dispatch(
        addToast({
          type: 'success',
          title: 'Translation Completed',
          message: `Detected ${result.detectedLanguageName} → Translated to ${result.targetLanguage.toUpperCase()}.`,
          duration: 2500,
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Translation Failed',
          message: err?.message || 'Could not complete translation.',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult.translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    dispatch(
      addToast({
        type: 'info',
        title: 'Copied to Clipboard',
        message: 'Translated text copied to clipboard.',
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-600" />
          <span>Multilingual AI &amp; Language Intelligence Studio</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Native multilingual processing for international customer support with first-class Hindi (हिंदी), English, Spanish, and European language support.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4">
        {/* Sample presets */}
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
            Language Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_SAMPLES.map((s) => (
              <button
                key={s.lang}
                type="button"
                onClick={() => {
                  setInputText(s.text);
                  setTargetLang(s.target);
                }}
                className="px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500 transition-colors"
              >
                {s.lang}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Source Text to Detect &amp; Translate:
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Target language selector and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Languages className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Translate Target Language:
            </span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            >
              <option value="en">English (en)</option>
              <option value="hi">Hindi (हिन्दी - hi)</option>
              <option value="es">Spanish (Español - es)</option>
              <option value="fr">French (Français - fr)</option>
              <option value="de">German (Deutsch - de)</option>
              <option value="ja">Japanese (日本語 - ja)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleTranslate}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Translate Text
          </Button>
        </div>
      </div>

      {/* Results Display */}
      {isLoading ? (
        <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <LoadingState message="Detecting language and executing neural translation..." />
        </div>
      ) : translationResult ? (
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Detected Source:
              </span>
              <Badge variant="primary" size="sm">
                {translationResult.detectedLanguageName} ({translationResult.detectedLanguage})
              </Badge>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Target:</span>
              <Badge variant="success" size="sm">
                {translationResult.targetLanguage.toUpperCase()}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={handleCopy}
              leftIcon={isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            >
              {isCopied ? 'Copied' : 'Copy Translation'}
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Translated Output:
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {translationResult.translatedText}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-400 text-xs">
          Select a sample above or paste text and click &quot;Translate Text&quot; to test multilingual detection.
        </div>
      )}
    </div>
  );
};
