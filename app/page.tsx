"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // ارسال فایل صوتی واقعی به بک‌اند
        await sendAudioToApi(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setSummary("");
      setTranscriptionText("");
    } catch (err) {
      alert("دسترسی به میکروفون داده نشد یا خطایی رخ داد.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioToApi = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "voice.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setTranscriptionText(data.text);
        setSummary(data.summary);
      } else {
        alert("خطا در پردازش هوش مصنوعی: " + data.error);
      }
    } catch (error) {
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center justify-between">
      {/* هدر */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 border-b border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            🎙️
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            VoiceAction AI
          </span>
        </div>
        <nav className="hidden sm:flex gap-6 text-sm text-slate-400">
          <a href="#" className="hover:text-white transition">داشبورد</a>
          <a href="#" className="hover:text-white transition">یادداشت‌های من</a>
          <a href="#" className="hover:text-white transition">تنظیمات</a>
        </nav>
      </header>

      {/* محتوای اصلی */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
        {/* باکس ضبط صدا */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition duration-500"></div>

          <div className="text-center z-10">
            <h2 className="text-2xl font-bold mb-2">دستیار صوتی هوشمند</h2>
            <p className="text-slate-400 text-sm">ویس خود را ضبط کنید تا AI آن را تبدیل به لیست کار کند.</p>
          </div>
{/* دکمه ضبط */}
          <div className="my-10 flex flex-col items-center z-10">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={
                isRecording
                  ? "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-105"
                  : "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-105 shadow-[0_0_35px_rgba(37,99,235,0.4)]"
              }
            >
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
              )}
              <svg className="w-10 h-10 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isRecording ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
              </svg>
            </button>
            <span className="mt-4 text-xs text-slate-400 font-medium">
              {isRecording ? "در حال ضبط... (جهت توقف کلیک کنید)" : "جهت شروع ضبط کلیک کنید"}
            </span>
          </div>

          {/* پلیر ویس */}
          {audioUrl && (
            <div className="w-full z-10 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
              <audio src={audioUrl} controls className="w-full h-8" />
            </div>
          )}
        </div>

        {/* باکس خروجی هوش مصنوعی */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <span>:sparkles:</span> خروجی هوش مصنوعی
            </h3>
            {isProcessing && <span className="text-xs text-amber-400 animate-pulse">در حال تبدیل ویس و خلاصه‌سازی...</span>}
          </div>

          <div className="flex-1 flex flex-col justify-center overflow-y-auto max-h-[350px]">
            {summary ? (
              <div className="space-y-4">
                {transcriptionText && (
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-400">
                    <span className="font-bold text-slate-300 block mb-1">متن کامل ویس:</span>
                    {transcriptionText}
                  </div>
                )}
                <pre dir="rtl" className="whitespace-pre-wrap text-sm text-slate-200 font-sans leading-relaxed text-right">
                  {summary}
                </pre>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p>هنوز ویسی ضبط نشده است.</p>
                <p className="text-xs mt-1">پس از ضبط، خلاصه‌ی نکات و To-Do لیست واقعی در اینجـا ظاهر می‌شود.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* فوتر */}
      <footer className="mt-8 text-slate-600 text-xs">
        طراحی‌شده برای مدیریت هوشمند کارهای روزمره
      </footer>
    </div>
  );
}
