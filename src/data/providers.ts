export type PricingModel = 'char' | 'min' | 'sec' | 'token';

export interface PricingTier {
    name: string;
    price: number;
    unit: number; // e.g., 1000000 chars or 1 min
    unitType: PricingModel;
    description: string;
}

export interface BenchmarkScores {
    quality: number; // 1-5 (MOS or equivalent)
    speed: number; // 1-5 rating
    priceScore: number; // 1-5 (5 is cheapest)
    features: number; // 1-5 based on feature set
}

export interface Provider {
    id: string;
    name: string;
    type: 'TTS' | 'STT' | 'BOTH';
    description: string;
    website: string;
    pricing: PricingTier[];
    benchmarks: BenchmarkScores;
    features: string[];
    languages: number;
    bestFor: string[]; // e.g., 'voice-agent', 'audiobook', 'transcription'
    status?: 'active' | 'discontinued' | 'new';
    openSource?: boolean;
    eloScore?: number; // Artificial Analysis ELO
    latencyMs?: number; // TTFA in ms
    wer?: number; // Word Error Rate % (STT)
    compliance?: string[]; // e.g., ['HIPAA', 'SOC2', 'EU AI Act compliant']
    isNew?: boolean; // Added in Q2/Q3 2026
}

export const providers: Provider[] = [
    // ─── TIER 1: INDUSTRY LEADERS ───────────────────────────────────────────────
    {
        id: 'inworld',
        name: 'Inworld AI',
        type: 'TTS',
        description: 'Realtime TTS-2 and TTS 1.5 Max remain top-5 on the Artificial Analysis Speech Arena. Sub-250ms P90 latency, zero-shot voice cloning, domain-specific pronunciation for healthcare/finance/legal.',
        website: 'https://inworld.ai',
        pricing: [
            { name: 'TTS-1.5 Max', price: 50, unit: 1000000, unitType: 'char', description: '$50/1M chars standard ($10/1M on legacy Founder tier)' },
            { name: 'TTS-1.5 Mini', price: 25, unit: 1000000, unitType: 'char', description: '$25/1M chars standard ($5/1M on legacy Founder tier)' },
        ],
        benchmarks: { quality: 5, speed: 5, priceScore: 2, features: 5 },
        features: ['Top-5 TTS Arena ELO', 'Zero-shot Voice Cloning (5–15s)', 'Sub-250ms P90 Latency', 'Realtime TTS-2 (130ms)', 'Domain-specific Pronunciation', 'Healthcare/Finance/Legal'],
        languages: 30,
        bestFor: ['voice-agent', 'content-creation', 'enterprise'],
        eloScore: 1198,
        latencyMs: 130,
        compliance: ['SOC2', 'HIPAA'],
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        type: 'BOTH',
        description: '$500M Series D (Feb 4, 2026) led by Sequoia at an $11B valuation — more than tripled in a year. 74 languages, on-premise/on-device deployment. Eleven v3 is GA; Scribe v1 STT retires Jul 9, 2026 in favor of Scribe v2.',
        website: 'https://elevenlabs.io',
        pricing: [
            { name: 'Starter', price: 6, unit: 30000, unitType: 'char', description: '$6/mo for 30k chars' },
            { name: 'Creator', price: 22, unit: 121000, unitType: 'char', description: '$22/mo for 121k chars' },
            { name: 'Scale API', price: 165, unit: 1000000, unitType: 'char', description: '~$165/1M chars (Scale)' },
        ],
        benchmarks: { quality: 5, speed: 4, priceScore: 2, features: 5 },
        features: ['Eleven v3 (GA Feb 2)', 'Scribe v2 Realtime STT (sub-150ms, 90+ languages)', 'On-Premise / On-Device', 'Voice Cloning (10,000+ voices)', 'Dubbing & Translation', '74 Languages', 'ElevenAgents', 'IBM watsonx Integration', 'Series D: $500M @ $11B (Feb 2026)'],
        languages: 74,
        bestFor: ['content-creation', 'narration', 'voice-agent', 'enterprise'],
        eloScore: 1197,
        latencyMs: 75,
        compliance: ['SOC2', 'HIPAA', 'GDPR'],
    },

    // ─── COMMERCIAL STT LEADERS ─────────────────────────────────────────────────
    {
        id: 'deepgram',
        name: 'Deepgram',
        type: 'BOTH',
        description: 'Unicorn — $130M Series C (Jan 13, 2026) at a $1.3B valuation, funding the OfOne acquisition for restaurant/drive-thru voice AI. Flux Multilingual (Apr 29) is the first conversational STT with integrated end-of-turn detection.',
        website: 'https://deepgram.com',
        pricing: [
            { name: 'Nova-3 STT', price: 0.0043, unit: 1, unitType: 'min', description: '$0.0043–$0.0077/min (per-second billing)' },
            { name: 'Voice Agent API', price: 0.075, unit: 1, unitType: 'min', description: '~$0.075/min (STT+LLM+TTS)' },
        ],
        benchmarks: { quality: 4.5, speed: 5, priceScore: 4, features: 4 },
        features: ['Nova-3 (5.3% WER)', 'Flux Multilingual (sub-300ms EOT detection)', 'Sub-300ms Streaming', 'Diarization', 'Smart Formatting', 'TTS Speed Controls (0.7–1.5×)', 'Self-hosted Deployment', 'OfOne Acquisition (Restaurant Voice AI)', '45+ Languages', 'Per-second Billing'],
        languages: 45,
        bestFor: ['voice-agent', 'transcription', 'analytics', 'real-time'],
        wer: 5.3,
        compliance: ['HIPAA', 'SOC2'],
    },
    {
        id: 'assemblyai',
        name: 'AssemblyAI',
        type: 'STT',
        description: '#1 for developer experience. Universal-3.5 Pro adds Context Carryover and configurable latency modes. New Sync API (Jul 14, 2026) returns a finished transcript from one HTTP POST in ~134ms median — no polling or WebSocket required.',
        website: 'https://www.assemblyai.com',
        pricing: [
            { name: 'Universal-2', price: 0.0025, unit: 1, unitType: 'min', description: '$0.0025/min ($0.15/hr) — 99 languages' },
            { name: 'Universal-3.5 Pro', price: 0.0035, unit: 1, unitType: 'min', description: '$0.0035/min ($0.21/hr async) — prompt-based customization' },
            { name: 'Sync / Realtime API', price: 0.0075, unit: 1, unitType: 'min', description: '$0.0075/min ($0.45/hr) — ~134ms median (Jul 14, 2026)' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 5, features: 5 },
        features: ['Universal-3.5 Pro Streaming', 'Sync API (~134ms median, launched Jul 2026)', 'Context Carryover', 'Prompt-based Domain Customization', 'Three Latency Modes', 'Medical Mode (en/es/de/fr)', 'PII Redaction', 'Voice Agent API ($4.50/hr flat)', 'Audio Intelligence'],
        languages: 99,
        bestFor: ['analytics', 'transcription', 'understanding', 'enterprise'],
        wer: 14.5,
        compliance: ['HIPAA', 'SOC2 Type 2', 'ISO 27001:2022', 'PCI DSS v4.0', 'GDPR'],
    },

    // ─── LATENCY LEADERS ────────────────────────────────────────────────────────
    {
        id: 'cartesia',
        name: 'Cartesia',
        type: 'TTS',
        description: 'Sonic 3.5 pushes latency further: ~40ms TTFB on Turbo, sub-100ms on the standard model. 30+ Featured Voices, Hindi/Korean prosody improvements, and dated immutable model snapshots for production stability.',
        website: 'https://cartesia.ai',
        pricing: [
            { name: 'Pay-as-you-go', price: 5, unit: 100000, unitType: 'char', description: '$5/100k credits (1 credit/char)' },
        ],
        benchmarks: { quality: 4.5, speed: 5, priceScore: 3, features: 4 },
        features: ['Sonic 3.5 (40ms Turbo TTFB)', '3-second Voice Cloning', 'Emotion Control', '30+ Featured Voices', 'Dated Immutable Model Snapshots', 'PVC Accent/Gender PATCH API'],
        languages: 20,
        bestFor: ['voice-agent', 'real-time'],
        eloScore: 1208,
        latencyMs: 40,
    },

    // ─── NEWEST ENTRANTS (Q2 2026) ────────────────────────────────────────────────
    {
        id: 'alibaba-qwen-audio',
        name: 'Alibaba Qwen-Audio-3.0-TTS-Plus',
        type: 'TTS',
        description: 'NEW — Currently #1 on the Artificial Analysis Speech Arena leaderboard by Elo, ahead of Speechify Simba and Google Gemini 3.1 Flash TTS. Available via Alibaba Cloud.',
        website: 'https://www.alibabacloud.com',
        pricing: [
            { name: 'API', price: 27.6, unit: 1000000, unitType: 'char', description: '$27.60/1M chars' },
        ],
        benchmarks: { quality: 5, speed: 4, priceScore: 2, features: 4 },
        features: ['#1 Artificial Analysis Speech Arena', 'Alibaba Cloud Native', 'Highest Human-preference Elo'],
        languages: 20,
        bestFor: ['content-creation', 'enterprise'],
        status: 'new',
        isNew: true,
        eloScore: 1234,
    },
    {
        id: 'speechify-simba',
        name: 'Speechify Simba 3.2',
        type: 'TTS',
        description: 'NEW — #2 on the Artificial Analysis Speech Arena at a fraction of top-tier pricing, undercutting every other top-5 model on cost per character.',
        website: 'https://speechify.com',
        pricing: [
            { name: 'API', price: 10, unit: 1000000, unitType: 'char', description: '$10/1M chars' },
        ],
        benchmarks: { quality: 5, speed: 4, priceScore: 4, features: 3 },
        features: ['#2 Artificial Analysis Speech Arena', 'Best Elo-to-Price Ratio in Top 5'],
        languages: 20,
        bestFor: ['content-creation', 'budget'],
        status: 'new',
        isNew: true,
        eloScore: 1230,
    },
    {
        id: 'gemini-tts',
        name: 'Google Gemini 3.1 Flash TTS',
        type: 'TTS',
        description: 'Google\'s flagship TTS model (Apr 15, 2026). Natural-language style control via 200+ audio tags instead of SSML — steer pace, pitch, and emphasis with prompt text. Every output is SynthID-watermarked.',
        website: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-tts-preview',
        pricing: [
            { name: 'Flash TTS', price: 18.3, unit: 1000000, unitType: 'char', description: '~$18.30/1M chars' },
        ],
        benchmarks: { quality: 5, speed: 4, priceScore: 3, features: 5 },
        features: ['200+ Audio Tags (Natural-language Style Control)', 'SynthID Watermarking', '70+ Languages', 'AI Studio / Vertex AI / Google Vids'],
        languages: 70,
        bestFor: ['content-creation', 'narration', 'enterprise'],
        eloScore: 1215,
        compliance: ['GDPR', 'SynthID Provenance'],
    },

    // ─── ESTABLISHED Q1 2026 ENTRANTS ─────────────────────────────────────────────
    {
        id: 'mistral-voxtral',
        name: 'Mistral Voxtral',
        type: 'TTS',
        description: '4B-parameter open-weight model (CC BY-NC 4.0). 90ms TTFA, runs on smartphones with 3GB RAM. Preferred over ElevenLabs Flash v2.5 in 68.4% of blind zero-shot cloning comparisons. Voxtral Transcribe 2 (Feb 2026) added batch and real-time ASR.',
        website: 'https://mistral.ai',
        pricing: [
            { name: 'API', price: 16, unit: 1000000, unitType: 'char', description: '$16/1M chars' },
        ],
        benchmarks: { quality: 4.5, speed: 5, priceScore: 3, features: 3 },
        features: ['4B Parameters', '90ms TTFA', 'Smartphone Deployment (3GB RAM)', '3-second Voice Adaptation', 'Voxtral Transcribe 2 (ASR)', 'EU Data Sovereignty', 'CC BY-NC 4.0 (open weights)'],
        languages: 9,
        bestFor: ['voice-agent', 'budget', 'offline'],
        latencyMs: 90,
    },
    {
        id: 'microsoft-mai',
        name: 'Microsoft MAI',
        type: 'BOTH',
        description: 'Unveiled at Build 2026 (Jun 2): MAI-Voice-2 brings expressive speech with emotional styles and roles across 15 languages, preferred over MAI-Voice-1 in 72% of tests. MAI-Transcribe-1.5 delivers best-in-class WER across 43 languages and now powers Copilot, Teams, GitHub, and Dynamics 365.',
        website: 'https://azure.microsoft.com/ai',
        pricing: [
            { name: 'MAI-Transcribe-1.5', price: 0.017, unit: 1, unitType: 'min', description: '~$0.017/min (Azure Foundry pricing)' },
            { name: 'MAI-Voice-2', price: 16, unit: 1000000, unitType: 'char', description: '$16/1M chars' },
        ],
        benchmarks: { quality: 5, speed: 4, priceScore: 3, features: 4 },
        features: ['MAI-Voice-2 (72% preferred over v1)', 'MAI-Transcribe-1.5 (43-language WER leader)', 'Emotional Styles & Roles', 'Zero-shot Cloning (5–60s)', 'Copilot/Teams/GitHub Integration', 'Half GPU Usage vs Competitors'],
        languages: 43,
        bestFor: ['enterprise', 'transcription', 'accessibility'],
        status: 'new',
        isNew: true,
        compliance: ['Azure Compliance', 'GDPR', 'HIPAA'],
    },
    {
        id: 'xai-grok',
        name: 'xAI Grok TTS',
        type: 'BOTH',
        description: 'Standalone Grok TTS and STT APIs launched Apr 17, 2026, with Custom Voices arriving Apr 30. Confirmed pricing of $4.20/1M chars undercuts ElevenLabs (~$50/1M) and OpenAI (~$30/1M) by roughly 90%.',
        website: 'https://x.ai',
        pricing: [
            { name: 'TTS API', price: 4.20, unit: 1000000, unitType: 'char', description: '$4.20/1M chars' },
        ],
        benchmarks: { quality: 4.0, speed: 4, priceScore: 5, features: 4 },
        features: ['5 Voices (Eve, Ara, Leo, Rex, Sal)', 'Speech Tags ([laugh], [sigh], <whisper>)', 'STT — 25 Languages, Batch & Streaming', 'Vercel AI Gateway Integration', 'OpenAI Realtime API Compatible'],
        languages: 25,
        bestFor: ['voice-agent', 'budget', 'prototyping'],
    },

    // ─── ESTABLISHED COMMERCIAL ──────────────────────────────────────────────────
    {
        id: 'openai',
        name: 'OpenAI',
        type: 'BOTH',
        description: 'GPT-Realtime-2 (May 2026) adds configurable reasoning for speech-to-speech agents, alongside new GPT-Realtime-Translate and GPT-Realtime-Whisper streaming models. The Realtime API Beta was deprecated May 12, 2026. GPT-4o Transcribe/Mini Transcribe remain for budget STT.',
        website: 'https://openai.com',
        pricing: [
            { name: 'TTS Standard', price: 15, unit: 1000000, unitType: 'char', description: '$15/1M chars (tts-1)' },
            { name: 'TTS HD', price: 30, unit: 1000000, unitType: 'char', description: '$30/1M chars (tts-1-hd)' },
            { name: 'GPT-4o Transcribe', price: 0.006, unit: 1, unitType: 'min', description: '$0.006/min — free diarization' },
            { name: 'Mini Transcribe', price: 0.003, unit: 1, unitType: 'min', description: '$0.003/min — budget option' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 3, features: 4 },
        features: ['GPT-Realtime-2 (Configurable Reasoning)', 'GPT-Realtime-Translate', 'GPT-Realtime-Whisper (Streaming STT)', 'GPT-4o Transcribe (5% WER)', 'Free Diarization', 'tts-1 / tts-1-hd', '99+ Languages (STT)'],
        languages: 99,
        bestFor: ['simple-app', 'prototyping', 'transcription', 'voice-agent'],
        wer: 5,
        compliance: ['SOC2', 'GDPR'],
    },
    {
        id: 'azure',
        name: 'Azure AI Speech',
        type: 'BOTH',
        description: 'Broadest language coverage: 140+ languages, 500+ voices. Neural HD 2.5 (Mar 2026) improves prosody and expressiveness while cutting price from $30 to $22/1M chars, with regional expansion to France, Sweden, and Canada Central.',
        website: 'https://azure.microsoft.com/products/ai-services/ai-speech',
        pricing: [
            { name: 'Neural TTS (Prebuilt)', price: 16, unit: 1000000, unitType: 'char', description: '$16/1M chars' },
            { name: 'Neural HD 2.5', price: 22, unit: 1000000, unitType: 'char', description: '$22/1M chars (down from $30, Mar 2026)' },
            { name: 'STT Standard', price: 0.017, unit: 1, unitType: 'min', description: '$0.017/min (140+ languages)' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 4, features: 5 },
        features: ['140+ Languages (TTS)', '500+ Neural Voices', 'Neural HD 2.5 (Improved Prosody)', 'Custom Neural Voice', 'Speech Translation', 'Real-time Captions', 'Avatar Video Synthesis'],
        languages: 140,
        bestFor: ['enterprise', 'accessibility', 'global'],
        compliance: ['SOC2', 'HIPAA', 'ISO 27001', 'GDPR', 'FedRAMP'],
    },
    {
        id: 'google',
        name: 'Google Cloud Speech',
        type: 'BOTH',
        description: 'Chirp 3 HD at $30/1M chars for TTS, 75+ languages, Gemini ecosystem integration. Speech-to-Text V2 now prices real-time at $0.016/min with Dynamic Batch at $0.004/min (75% cheaper). See Gemini 3.1 Flash TTS for Google\'s newer flagship voice model.',
        website: 'https://cloud.google.com/text-to-speech',
        pricing: [
            { name: 'WaveNet', price: 4, unit: 1000000, unitType: 'char', description: '$4/1M chars (standard)' },
            { name: 'Chirp 3 HD', price: 30, unit: 1000000, unitType: 'char', description: '$30/1M chars (HD)' },
            { name: 'STT V2 Real-time', price: 0.016, unit: 1, unitType: 'min', description: '$0.016/min ($0.004/min Dynamic Batch)' },
        ],
        benchmarks: { quality: 4.0, speed: 3, priceScore: 3, features: 4 },
        features: ['Chirp 3 HD', 'WaveNet & Studio Voices', 'Dynamic Batch STT (75% cheaper)', 'Gemini Integration', '380+ Voices', '75+ Languages', 'Google Translate Integration'],
        languages: 75,
        bestFor: ['enterprise', 'analytics', 'accessibility'],
        compliance: ['SOC2', 'HIPAA', 'ISO 27001', 'GDPR'],
    },
    {
        id: 'hume',
        name: 'Hume AI',
        type: 'TTS',
        description: 'Octave 2 delivers audio in under 200ms with virtually zero content hallucinations. Hume open-sourced TADA (Mar 10, 2026) — a text-acoustic alignment architecture that generates speech 5× faster and supports long-form audio up to 700 seconds.',
        website: 'https://hume.ai',
        pricing: [
            { name: 'Octave 2', price: 7.60, unit: 1000000, unitType: 'char', description: '$7.60/1M chars' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 4, features: 4 },
        features: ['Octave 2 (sub-200ms)', 'TADA — Open-sourced Mar 2026', '5× Faster Inference', '700s Long-form Generation', 'Zero Content Hallucinations', 'Emotional Intelligence', '11 Languages'],
        languages: 11,
        bestFor: ['voice-agent', 'content-creation'],
    },
    {
        id: 'leanvox',
        name: 'LeanVox',
        type: 'TTS',
        description: 'Budget-friendly at $5/1M chars with 23+ language support. Competitive entry-level option for smaller production workloads.',
        website: 'https://leanvox.ai',
        pricing: [
            { name: 'Standard', price: 5, unit: 1000000, unitType: 'char', description: '$5/1M chars' },
        ],
        benchmarks: { quality: 3.5, speed: 3, priceScore: 5, features: 2 },
        features: ['23+ Languages', 'Standard Neural Voices', 'REST API'],
        languages: 23,
        bestFor: ['budget', 'simple-app'],
    },

    // ─── OPEN SOURCE / SELF-HOSTED ───────────────────────────────────────────────
    {
        id: 'kokoro',
        name: 'Kokoro v1.0',
        type: 'TTS',
        description: 'Most efficient open-source TTS. 82M parameters, 54 baked-in voices, MOS 4.2, runs on Raspberry Pi. Elo 1,057 on Artificial Analysis — highest open-weights rank among sub-100M-parameter models. ~$0.65/1M chars hosted.',
        website: 'https://huggingface.co/hexgrad/Kokoro-82M',
        pricing: [
            { name: 'Self-hosted', price: 0, unit: 1000000, unitType: 'char', description: 'Free (compute only)' },
            { name: 'Hosted (DeepInfra)', price: 0.65, unit: 1000000, unitType: 'char', description: '~$0.65/1M chars hosted' },
        ],
        benchmarks: { quality: 4.2, speed: 4, priceScore: 5, features: 3 },
        features: ['82M Parameters', '54 Baked-in Voices', 'MOS 4.2 (highest open-source)', 'CPU / Raspberry Pi Capable', '36× Real-time on Free Colab T4', 'Apache 2.0 License', '9 Languages'],
        languages: 9,
        bestFor: ['budget', 'accessibility', 'offline'],
        openSource: true,
        eloScore: 1057,
    },
    {
        id: 'chatterbox',
        name: 'Chatterbox',
        type: 'TTS',
        description: 'MIT-licensed, beats ElevenLabs in blind tests — Chatterbox-Turbo won 65.3% preference vs ElevenLabs\' 24.5%. Family of 3: original (500M), Multilingual (23+ languages), Turbo (350M, sub-200ms streaming).',
        website: 'https://github.com/resemble-ai/chatterbox',
        pricing: [
            { name: 'Self-hosted', price: 0, unit: 1000000, unitType: 'char', description: 'Free (MIT license)' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 5, features: 4 },
        features: ['MIT License', 'Turbo: 65.3% Preferred over ElevenLabs (24.5%)', 'Chatterbox Turbo (sub-200ms)', 'Chatterbox Multilingual (23+ languages)', 'PerTh Neural Watermarking', 'Paralinguistic Tags [laugh] [cough]', 'Emotion Control'],
        languages: 23,
        bestFor: ['budget', 'content-creation', 'voice-agent', 'offline'],
        openSource: true,
    },
    {
        id: 'qwen3-tts',
        name: 'Qwen3-TTS',
        type: 'TTS',
        description: 'Apache 2.0 — State-of-the-art WER: 0.77% Chinese, 1.24% English. 0.6B & 1.7B variants across Base/CustomVoice/VoiceDesign flavors; now the default TTS in Hugging Face\'s speech-to-speech pipeline.',
        website: 'https://huggingface.co/Qwen',
        pricing: [
            { name: 'Self-hosted', price: 0, unit: 1000000, unitType: 'char', description: 'Free (Apache 2.0)' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 5, features: 4 },
        features: ['Apache 2.0 License', '0.77% Chinese WER', '1.24% English WER', '0.6B & 1.7B Variants', 'Base / CustomVoice / VoiceDesign', 'Default HF Speech-to-Speech TTS', '49+ Voice Presets', '10 Languages'],
        languages: 10,
        bestFor: ['budget', 'content-creation', 'accessibility'],
        openSource: true,
        wer: 1.24,
    },
    {
        id: 'fish-audio',
        name: 'Fish Audio S2 Pro',
        type: 'TTS',
        description: 'Top open-weights model by Elo (1,120) on Artificial Analysis. Built on the Qwen3-4B backbone with inline emotion cues and 80+ language support. Ships under the Fish Audio Research License — free for research/non-commercial use; commercial deployment requires a separate license.',
        website: 'https://fish.audio',
        pricing: [
            { name: 'API', price: 10, unit: 1000000, unitType: 'char', description: '~$10/1M chars (commercial API)' },
            { name: 'Research weights', price: 0, unit: 1000000, unitType: 'char', description: 'Free — non-commercial only (Fish Audio Research License)' },
        ],
        benchmarks: { quality: 4.5, speed: 4, priceScore: 4, features: 4 },
        features: ['Elo 1,120 (Top Open-weights)', 'Built on Qwen3-4B Backbone', 'Inline Emotion Cues ([whisper], [laugh])', '80+ Languages', 'Research License (Non-commercial Free)'],
        languages: 80,
        bestFor: ['content-creation', 'voice-agent'],
        openSource: true,
        eloScore: 1120,
    },
    {
        id: 'moonshine',
        name: 'Moonshine (Useful Sensors)',
        type: 'STT',
        description: 'Edge/offline STT champion. 245M parameters (MIT license) matches Whisper Large-v3 accuracy at 1/6 the size. Leading choice for mobile and embedded devices.',
        website: 'https://github.com/usefulsensors/moonshine',
        pricing: [
            { name: 'Self-hosted', price: 0, unit: 1, unitType: 'min', description: 'Free (MIT license)' },
        ],
        benchmarks: { quality: 4.0, speed: 5, priceScore: 5, features: 2 },
        features: ['245M Parameters (MIT)', 'Matches Whisper Large-v3', '1/6 the Size of Whisper', 'Mobile & Embedded Ready', 'CPU Capable'],
        languages: 1,
        bestFor: ['accessibility', 'offline', 'budget'],
        openSource: true,
    },

    // ─── DISCONTINUED ────────────────────────────────────────────────────────────
    {
        id: 'playht',
        name: 'PlayHT',
        type: 'TTS',
        description: '⚠️ DISCONTINUED — Acquired by Meta (Jul 2025); the ~35-person team joined Meta Superintelligence Labs. The API actually went dark Jul 26, 2025, weeks ahead of schedule, and the service was permanently terminated Dec 31, 2025. All accounts, audio, and voice clones were deleted with no migration path; the play.ht domain no longer resolves. Migrate to ElevenLabs, Chatterbox, or Kokoro.',
        website: 'https://play.ht',
        pricing: [
            { name: 'N/A', price: 0, unit: 1, unitType: 'char', description: 'Service discontinued' },
        ],
        benchmarks: { quality: 4.0, speed: 3, priceScore: 2, features: 4 },
        features: ['Service Discontinued (Dec 31, 2025)', 'Team Absorbed into Meta Superintelligence Labs', 'No Data Migration Path', 'Migrate to: ElevenLabs, Chatterbox, Kokoro'],
        languages: 0,
        bestFor: [],
        status: 'discontinued',
    },
];
