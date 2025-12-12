import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Command, Volume2, VolumeX, Globe } from 'lucide-react';
import { interpretGitIntent } from './services/geminiService';
import { createRecognition, speakText } from './services/speechService';
import { Message, Sender, GitCommand, LanguageCode, LanguageConfig, TranslationDictionary } from './types';
import { TerminalMessage } from './components/TerminalMessage';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Configuration for supported languages
const LANGUAGES: LanguageConfig[] = [
  { code: 'es-CO', label: 'Español (CO)', flag: '🇨🇴' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
];

// UI Translations
const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  'es-CO': {
    welcome: "👋 Hola. Soy GitVoice Pro. Habla en español (o 'spanglish') y traduciré tus intenciones a comandos.",
    thinking: "Procesando...",
    listening: "Escuchando... (3s silencio para enviar)",
    tapToSpeak: "Toca para hablar",
    stop: "Detener",
    start: "Hablar",
    subtitle: "Asistente Políglota Experto",
    languageChanged: "Idioma cambiado a Español.",
    errorGen: "No pude entender eso. ¿Puedes repetirlo?",
    destructiveWarning: " ¡Cuidado! Acción destructiva.",
    cancelled: "Cancelado.",
    confirmed: "Confirmado.",
    copy: "Copiar comando",
    destructiveAction: "ACCIÓN DESTRUCTIVA",
    confirmAction: "Confirmar Ejecución",
    cancelAction: "Cancelar",
    commandConfirmed: "Comando confirmado"
  },
  'en-US': {
    welcome: "👋 Hi. I'm GitVoice Pro. Speak naturally, and I'll translate your intent into precise Git commands.",
    thinking: "Thinking...",
    listening: "Listening... (wait 3s to send)",
    tapToSpeak: "Tap to speak",
    stop: "Stop",
    start: "Start",
    subtitle: "Expert Polyglot Assistant",
    languageChanged: "Language switched to English.",
    errorGen: "I didn't catch that. Could you say it again?",
    destructiveWarning: " Warning! Destructive action.",
    cancelled: "Cancelled.",
    confirmed: "Confirmed.",
    copy: "Copy command",
    destructiveAction: "DESTRUCTIVE ACTION",
    confirmAction: "Confirm Execution",
    cancelAction: "Cancel",
    commandConfirmed: "Command confirmed"
  },
  'pt-BR': {
    welcome: "👋 Olá. Sou o GitVoice Pro. Fale naturalmente e traduzirei sua intenção para comandos Git.",
    thinking: "Pensando...",
    listening: "Ouvindo... (3s silêncio para enviar)",
    tapToSpeak: "Toque para falar",
    stop: "Parar",
    start: "Começar",
    subtitle: "Assistente Poliglota Especialista",
    languageChanged: "Idioma alterado para Português.",
    errorGen: "Não entendi. Pode repetir?",
    destructiveWarning: " Atenção! Ação destrutiva.",
    cancelled: "Cancelado.",
    confirmed: "Confirmado.",
    copy: "Copiar comando",
    destructiveAction: "AÇÃO DESTRUTIVA",
    confirmAction: "Confirmar Execução",
    cancelAction: "Cancelar",
    commandConfirmed: "Comando confirmado"
  },
  'fr-FR': {
    welcome: "👋 Bonjour. Je suis GitVoice Pro. Parlez naturellement, je traduirai vos intentions en commandes Git.",
    thinking: "Réflexion...",
    listening: "Écoute... (3s silence pour envoyer)",
    tapToSpeak: "Appuyez pour parler",
    stop: "Arrêter",
    start: "Parler",
    subtitle: "Assistant Polyglotte Expert",
    languageChanged: "Langue changée en Français.",
    errorGen: "Je n'ai pas compris. Pouvez-vous répéter ?",
    destructiveWarning: " Attention ! Action destructive.",
    cancelled: "Annulé.",
    confirmed: "Confirmé.",
    copy: "Copier la commande",
    destructiveAction: "ACTION DESTRUCTIVE",
    confirmAction: "Confirmer l'exécution",
    cancelAction: "Annuler",
    commandConfirmed: "Commande confirmée"
  },
  'de-DE': {
    welcome: "👋 Hallo. Ich bin GitVoice Pro. Sprich natürlich, ich übersetze deine Absichten in Git-Befehle.",
    thinking: "Nachdenken...",
    listening: "Zuhören... (3s Stille zum Senden)",
    tapToSpeak: "Tippen zum Sprechen",
    stop: "Stopp",
    start: "Start",
    subtitle: "Experte Polyglot Assistent",
    languageChanged: "Sprache auf Deutsch geändert.",
    errorGen: "Das habe ich nicht verstanden. Bitte wiederholen.",
    destructiveWarning: " Achtung! Destruktive Aktion.",
    cancelled: "Abgebrochen.",
    confirmed: "Bestätigt.",
    copy: "Befehl kopieren",
    destructiveAction: "ZERSTÖRERISCHE AKTION",
    confirmAction: "Ausführung bestätigen",
    cancelAction: "Abbrechen",
    commandConfirmed: "Befehl bestätigt"
  },
  'it-IT': {
    welcome: "👋 Ciao. Sono GitVoice Pro. Parla naturalmente e tradurrò le tue intenzioni in comandi Git.",
    thinking: "Elaborazione...",
    listening: "Ascolto... (3s silenzio per inviare)",
    tapToSpeak: "Tocca per parlare",
    stop: "Stop",
    start: "Parla",
    subtitle: "Assistente Poliglotta Esperto",
    languageChanged: "Lingua cambiata in Italiano.",
    errorGen: "Non ho capito. Puoi ripetere?",
    destructiveWarning: " Attenzione! Azione distruttiva.",
    cancelled: "Annullato.",
    confirmed: "Confermato.",
    copy: "Copia comando",
    destructiveAction: "AZIONE DISTRUTTIVA",
    confirmAction: "Conferma Esecuzione",
    cancelAction: "Annulla",
    commandConfirmed: "Comando confermato"
  },
  'zh-CN': {
    welcome: "👋 你好。我是 GitVoice Pro。请自然说话，我会将你的意图转化为 Git 命令。",
    thinking: "思考中...",
    listening: "正在聆听... (静音3秒发送)",
    tapToSpeak: "点击说话",
    stop: "停止",
    start: "开始",
    subtitle: "多语言专家助手",
    languageChanged: "语言已切换至中文。",
    errorGen: "我没听清。请再说一遍？",
    destructiveWarning: " 警告！破坏性操作。",
    cancelled: "已取消。",
    confirmed: "已确认。",
    copy: "复制命令",
    destructiveAction: "破坏性操作",
    confirmAction: "确认执行",
    cancelAction: "取消",
    commandConfirmed: "命令已确认"
  },
  'ja-JP': {
    welcome: "👋 こんにちは。GitVoice Proです。自然に話していただければ、Gitコマンドに翻訳します。",
    thinking: "考え中...",
    listening: "聞いています... (3秒沈黙で送信)",
    tapToSpeak: "タップして話す",
    stop: "停止",
    start: "開始",
    subtitle: "多言語エキスパートアシスタント",
    languageChanged: "言語を日本語に切り替えました。",
    errorGen: "聞き取れませんでした。もう一度お願いします。",
    destructiveWarning: " 警告！破壊的な操作です。",
    cancelled: "キャンセルしました。",
    confirmed: "確認しました。",
    copy: "コマンドをコピー",
    destructiveAction: "破壊的操作",
    confirmAction: "実行を確認",
    cancelAction: "キャンセル",
    commandConfirmed: "コマンド確認済み"
  },
  'ru-RU': {
    welcome: "👋 Привет. Я GitVoice Pro. Говорите естественно, и я переведу это в команды Git.",
    thinking: "Думаю...",
    listening: "Слушаю... (3с тишины для отправки)",
    tapToSpeak: "Нажмите, чтобы говорить",
    stop: "Стоп",
    start: "Начать",
    subtitle: "Эксперт-полиглот",
    languageChanged: "Язык переключен на Русский.",
    errorGen: "Я не понял. Повторите, пожалуйста?",
    destructiveWarning: " Внимание! Деструктивное действие.",
    cancelled: "Отменено.",
    confirmed: "Подтверждено.",
    copy: "Копировать",
    destructiveAction: "ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ",
    confirmAction: "Подтвердить выполнение",
    cancelAction: "Отмена",
    commandConfirmed: "Команда подтверждена"
  }
};

const SILENCE_TIMEOUT_MS = 3000;

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('es-CO');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      text: TRANSLATIONS['es-CO'].welcome, // Initial load always ES per requirements, or user pref
      sender: Sender.BOT,
      timestamp: Date.now()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef(""); 
  const soundEnabledRef = useRef(soundEnabled);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Update ref when state changes
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Helper to get current text safely
  const t = (key: keyof TranslationDictionary) => TRANSLATIONS[currentLang][key];

  // Handle Submission
  const handleUserSubmit = async (text: string) => {
    if (!text.trim()) return;

    addMessage(text, Sender.USER);
    setIsProcessing(true);

    // Pass the current language to Gemini so it generates the explanation in that language
    const gitResult = await interpretGitIntent(text, currentLang);
    setIsProcessing(false);

    if (gitResult) {
      let responseText = gitResult.explanation;
      if (gitResult.isDestructive) {
        responseText += t('destructiveWarning');
      }

      addMessage(responseText, Sender.BOT, gitResult);
      if (soundEnabledRef.current) speakText(responseText, currentLang);

    } else {
      const errorMsg = t('errorGen');
      addMessage(errorMsg, Sender.BOT);
      if (soundEnabledRef.current) speakText(errorMsg, currentLang);
    }
  };

  const submitRef = useRef(handleUserSubmit);
  useEffect(() => {
    submitRef.current = handleUserSubmit;
  }, [handleUserSubmit, currentLang]);

  // Cleanup old recognition if language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [currentLang]);

  const startListening = () => {
    // Pass currentLang to speech service so browser uses correct acoustic model
    const recognition = createRecognition(currentLang);
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = recognition;
    transcriptRef.current = "";
    setTranscriptBuffer("");

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        transcriptRef.current += (transcriptRef.current ? " " : "") + finalTranscript;
      }

      const display = transcriptRef.current + (interimTranscript ? " " + interimTranscript : "");
      setTranscriptBuffer(display);
      resetSilenceTimer();
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
      
      const text = transcriptRef.current;
      if (text && text.trim().length > 0) {
        submitRef.current(text);
      }
      
      setTranscriptBuffer("");
      transcriptRef.current = "";
    };
    
    recognition.onerror = (event) => {
      console.error("Speech error", event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
        clearSilenceTimer();
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, SILENCE_TIMEOUT_MS);
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcriptBuffer]);

  const addMessage = (text: string, sender: Sender, gitCommand?: GitCommand) => {
    const newMessage: Message = {
      id: generateId(),
      text,
      sender,
      timestamp: Date.now(),
      gitCommand
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleConfirmDestructive = (id: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        if (soundEnabled) speakText(t('confirmed'), currentLang);
        if (msg.gitCommand) {
          navigator.clipboard.writeText(msg.gitCommand.command);
        }
        return { ...msg, isConfirmed: true };
      }
      return msg;
    }));
  };

  const handleCancelDestructive = (id: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return { ...msg, text: t('cancelled'), isConfirmed: false, gitCommand: undefined }; 
      }
      return msg;
    }));
  };

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Command size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">GitVoice Pro</h1>
            <p className="text-xs text-slate-400 hidden md:block">{t('subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 min-w-[120px]"
            >
              <Globe size={18} className="text-slate-400" />
              <span className="text-sm font-medium">{currentLangConfig.flag} <span className="hidden sm:inline">{currentLangConfig.label}</span></span>
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-56 max-h-[80vh] overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setShowLangMenu(false);
                      setMessages(prev => [...prev, {
                        id: generateId(),
                        text: TRANSLATIONS[lang.code].languageChanged,
                        sender: Sender.SYSTEM,
                        timestamp: Date.now()
                      }]);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-700 flex items-center gap-2 ${currentLang === lang.code ? 'bg-slate-700 text-indigo-400' : 'text-slate-300'}`}
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      {/* Main Terminal Area */}
      <main className="flex-1 container mx-auto p-4 max-w-4xl flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto mb-32 pb-4 space-y-4 pr-2"
        >
          {messages.map(msg => (
            <TerminalMessage 
              key={msg.id} 
              message={msg} 
              onConfirm={handleConfirmDestructive}
              onCancel={handleCancelDestructive}
              // Pass the current language to the component for specific localized UI elements inside the bubble
              currentLang={currentLang} 
              translations={TRANSLATIONS[currentLang]}
            />
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-full text-sm animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                {t('thinking')}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent p-6 pb-8">
          <div className="container max-w-4xl mx-auto flex flex-col items-center gap-4">
            
            {/* Live Transcript Bubble */}
            <div className={`transition-all duration-300 transform ${isListening ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
               <div className="mb-4 text-center">
                 <span className="text-lg font-light text-slate-100 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-indigo-500/30 shadow-2xl">
                   {transcriptBuffer || "..."}
                 </span>
               </div>
            </div>

            {/* Mic Button */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-full blur opacity-40 transition duration-200 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 group-hover:opacity-60'}`}></div>
              <button
                onClick={toggleListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-2xl ${
                  isListening 
                    ? 'bg-red-600 text-white border-4 border-red-800' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                aria-label={isListening ? t('stop') : t('start')}
              >
                {isListening ? (
                  <MicOff size={32} />
                ) : (
                  <Mic size={32} />
                )}
              </button>
            </div>
            
            <p className="text-slate-500 text-sm font-medium">
              {isListening ? t('listening') : t('tapToSpeak')}
            </p>
          </div>
        </div>
      </main>

      {!process.env.API_KEY && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-red-500 p-6 rounded-xl max-w-md text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Missing API Key</h2>
            <p className="text-slate-300 mb-4">
              Please set the <code className="bg-slate-800 p-1 rounded">API_KEY</code> environment variable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;