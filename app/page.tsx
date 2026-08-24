"use client";

import { useState, useRef, useEffect } from "react";

interface SavedNote {
  id: string;
  date: string;
  transcription: string;
  summary: string;
  tags: string[];
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<SavedNote[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("govoice_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("دسترسی به میکروفون داده نشد.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!audioBlob) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setTranscription(data.text);
        setSummary(data.summary);

        const newNote: SavedNote = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString("fa-IR"),
          transcription: data.text,
          summary: data.summary,
          tags: ["یادداشت صوتی", "هوش مصنوعی"],
        };
        const updatedHistory = [newNote, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("govoice_history", JSON.stringify(updatedHistory));
      } else {
        alert(data.error || "خطایی رخ داد");
      }
    } catch (err) {
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const content = گزارش دستیار صوتی هوشمند\n\nمتن پیاده‌سازی شده:\n${transcription}\n\nخلاصه و اقدامات:\n${summary};
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = voice-note-${Date.now()}.txt;
    a.click();
  };

  const filteredHistory = history.filter((item) =>
    item.transcription.includes(searchQuery) || item.summary.includes(searchQuery)
  );
return (
    <main className="min-h-screen bg-slate-950 text-slate-100 dir-rtl font-sans selection:bg-amber-500 selection:text-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 mb-4">
            دستیار صوتی فوق‌هوشمند
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            پردازش گفتار، خلاصه‌سازی ساختاریافته و مدیریت حرفه‌ای یادداشت‌ها
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* پنل ضبط */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-200">ضبط صدا</h2>
                {isRecording && (
                  <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-3 py-1 rounded-full font-mono animate-pulse">
                    {recordingTime} ثانیه
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center my-8">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isRecording
                      ? "bg-rose-500 shadow-2xl shadow-rose-500/50 scale-105"
                      : "bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-2xl shadow-amber-500/20 hover:scale-105"
                  }}
                >
                  <span className={text-4xl ${isRecording ? "text-white animate-pulse" : "text-slate-950"}}>
                    {isRecording ? "⏹" : "🎙"}
                  </span>
                </button>
                <p className="mt-6 text-sm text-slate-400 font-medium">
                  {isRecording ? "در حال ضبط... جهت توقف کلیک کنید" : "برای شروع ضبط کلیک کنید"}
                </p>
              </div>

              {audioUrl && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>

            <button
              onClick={handleUploadAndProcess}
              disabled={!audioBlob || loading}
              className={w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                !audioBlob || loading
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-[0.98]"
              }}
            >
              {loading ? "در حال پردازش هوش مصنوعی..." : "تحلیل و خلاصه‌سازی هوشمند"}
            </button>
          </div>

          {/* پنل خروجی و ادیتور */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-slate-200">نتیجه پردازش</h2>
                {(transcription || summary) && (
                  <button
                    onClick={downloadReport}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
                  >
                    :inbox_tray: دانلود فایل TXT
                  </button>
                )}
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[420px] pr-2">
                {transcription && (
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">متن پیاده‌سازی شده (قابل ویرایش):</h4>
                    <textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      className="w-full bg-transparent text-slate-300 text-sm leading-relaxed focus:outline-none resize-none"
                      rows={4}
                    />
                  </div>
                )}

                {summary && (
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/30">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">خلاصه و اقدامات (To-Do):</h4>
                    <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">{summary}</div>
                  </div>
                )}

                {!transcription && !summary && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-600">
                    <span className="text-5xl mb-4">:sparkles:</span>
                    <p>نتیجه پردازش صدا اینجا قرار می‌گیرد.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* بخش تاریخچه پیشرفته با قابلیت جستجو */}
        {history.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-200">تاریخچه آرشیو شده</h2>
              <input
                type="text"
                placeholder=":mag: جستجو در یادداشت‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full md:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-amber-500">{item.date}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">آرشیو</span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2 mb-3">{item.transcription}</p>
                  <button
                    onClick={() => {
                      setTranscription(item.transcription);
                      setSummary(item.summary);
                    }}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    نمایش کامل
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

