import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "فایلی دریافت نشد." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "کلید API یافت نشد." }, { status: 500 });
    }

    // ۱. ارسال مستقیم فایل به Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append("file", file);
    whisperFormData.append("model", "whisper-large-v3");
    whisperFormData.append("language", "fa");

    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
      },
      body: whisperFormData,
    });

    if (!whisperRes.ok) {
      const errData = await whisperRes.text();
      console.error("Whisper Error:", errData);
      return NextResponse.json({ error: "خطا در تبدیل صدا به متن. لطفاً ابزار تغییر آی‌پی را چک کنید." }, { status: whisperRes.status });
    }

    const whisperData = await whisperRes.json();
    const userText = whisperData.text;

    // ۲. ارسال متن به Llama 3 برای خلاصه‌سازی
    const chatRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "تو یک دستیار هوشمند هستی. متن ورودی کاربر را بررسی کن و خروجی را با ساختار زیر و به زبان فارسی برگردان:\n\nخلاصه کلیدی:\n[یک یا دو جمله خلاصه]\n\nنکات مهم و تصمیمات:\n• [نکته ۱]\n• [نکته ۲]\n\nلیست اقدامات (To-Do):\n[ ] [کار ۱]\n[ ] [کار ۲]",
          },
          {
            role: "user",
            content: userText,
          },
        ],
      }),
    });

    if (!chatRes.ok) {
      return NextResponse.json({ error: "خطا در خلاصه‌سازی متن." }, { status: chatRes.status });
    }

    const chatData = await chatRes.json();
    const aiOutput = chatData.choices[0]?.message?.content || "پردازش ناموفق بود.";

    return NextResponse.json({ text: userText, summary: aiOutput });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "خطایی رخ داد" }, { status: 500 });
  }
}
