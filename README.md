# Prompt Brew

> Peracik dan pemoles prompt AI multibahasa (Indonesia/English) — susun prompt terstruktur untuk teks, gambar, musik, kode, dan video, lalu poles hasilnya dengan Gemini.

---

## Fitur Utama

- **Kategori prompt** — teks, gambar, musik, kode, video, dan custom.
- **Refine dengan AI** — poles draf prompt-mu via Gemini (API key aman di sisi server, tidak terekspos ke browser).
- **Live preview** — lihat hasil prompt jadi secara real-time selagi menyusun.
- **Profil personalisasi** — simpan konteks/persona-mu untuk dipakai ulang di semua prompt.

## Cara Menjalankan

```bash
npm install
cp .env.example .env   # isi GEMINI_API_KEY
npm run dev
```

Buka `http://localhost:3000` (atau port yang tertera di terminal).

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express 5 (`server.ts`, juga membundel untuk production)
- **AI**: Google Gemini SDK (`@google/genai`) — API key di sisi server
- **Styling**: Tailwind CSS

---

## License

MIT License © 2026 Yudhan Sebastian
