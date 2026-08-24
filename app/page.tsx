"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const handleProcess = async () => {
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
      } else {
        alert(data.error || "خطایی رخ داد");
      }
    } catch (err) {
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  // تعریف کلاس دکمه به صورت متغیر جداگانه تا هرگز خطای کامپایل ندهد
  const buttonClass = isRecording 
    ? "px-6 py-3 rounded-xl font-bold bg-red-600 text-white w-full" 
    : "px-6 py-3 rounded-xl font-bold bg-amber-500 text-slate-950 w-full";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-amber-400">دستیار صوتی هوشمند</h1>
        </header>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={buttonClass}
          >
            {isRecording ? "توقف ضبط" : "شروع ضبط صدا"}
          </button>

          {audioUrl && (
            <div className="mt-4">
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!audioBlob || loading}
            className="w-full py-3 rounded-xl bg-slate-800 text-amber-300 font-bold disabled:opacity-50"
          >
            {loading ? "در حال پردازش..." : "ارسال و تحلیل هوش مصنوعی"}
          </button>
        </div>

        {(transcription || summary) && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-amber-400 font-bold mb-2">متن پیاده‌سازی شده:</h3>
              <p className="text-slate-300">{transcription}</p>
            </div>
            <div>
              <h3 className="text-amber-400 font-bold mb-2">خلاصه جلسه:</h3>
              <p className="text-slate-300">{summary}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
