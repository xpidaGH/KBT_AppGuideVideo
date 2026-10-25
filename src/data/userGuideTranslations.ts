import { SupportedLanguageCode } from '../types';

export interface UserGuideSection {
  id: string;
  title: string;
  content: string;
}

export interface UserGuideLanguageData {
  title: string;
  subtitle: string;
  badge: string;
  overview: string;
  sections: UserGuideSection[];
}

export const USER_GUIDE_TRANSLATIONS: Record<SupportedLanguageCode, UserGuideLanguageData> = {
  en: {
    title: 'KBT_AppGuideVideo: Master Engineering & Video Guide Manual',
    subtitle: 'Production-Grade Software Capture, Interactive Scribe Guides & 22-Language Capstone Architecture',
    badge: 'Capstone Guide v2.4 (All 22 Languages Supported)',
    overview:
      'Welcome to KBT_AppGuideVideo, an advanced engineering curriculum and production studio. Inspired by OBS Studio, Camtasia, ScreenFlow, Scribe, Guidde, and Loom, this project approaches screen recording, telemetry logging, and video rendering not merely as user-facing tools, but as low-level systems architectures, SIMD vectorization pipelines, and distributed render farms across 22 modern and foundational programming languages.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. The 5 Core Engineering Architecture Pillars',
        content: `• Desktop & Low-Level (C, C++, Rust, Go, Assembly, PowerShell): Direct GPU texture extraction via Windows IDXGIOutputDuplication, macOS ScreenCaptureKit, and Linux PipeWire. High-throughput BGRA-to-NV12 conversion using SIMD (AVX2/NEON), lock-free ring buffers, and hardware FFmpeg NVENC muxing.
• Multi-Platform Mobile (Kotlin, Java, Dart/Flutter, Swift): Persistent MediaProjection daemons, Android foreground services with resilient memory footprints, JNI binary buffers, and iOS ReplayKit bridges.
• Distributed Cloud & Web (TypeScript, JavaScript, Python, C#): DOM telemetry event capture, headless browser cluster rendering (Playwright/Puppeteer), and automated AI narration stitching with FastAPI and MoviePy.
• Enterprise Analytics Lake (SQL, R, Scala, Java): Akka/Pekko high-throughput telemetry ingestion, relational TimescaleDB interaction mapping, and R retention modeling detecting application confusion drop-offs.
• Legacy & Business Logic (PHP, Ruby, MATLAB, COBOL): Scalable S3 media catalog APIs, MATLAB digital signal processing (FFT audio hiss filtering & silence skipping), and COBOL-85 batch billing manifests.`,
      },
      {
        id: 'studio_recording',
        title: '2. Studio Screen Recording & Real-time Compositor',
        content: `• Screen & Camera Capture: Stream display output directly via getDisplayMedia or run the interactive built-in software IDE simulator. Add a draggable, circular Loom-style webcam overlay.
• Canvas Compositor: Real-time rendering of cursor highlight halos, animated click ripples, and automatic focal zoom for software demonstrations.
• Audio Visualizer: Native Web Audio API mixer with real-time Fast Fourier Transform (FFT) frequency spectrum and decibel VU meter.
• Production Container Export: Instant client-side muxing to WebM and MP4 formats with selectable 1080p 60FPS or 720p 30FPS output.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Visual Annotations: Softsubs vs Scribe Workflows',
        content: `• Mode 1 - Timed Text Metadata Tracks (Softsubs): Create, edit, and render precise timestamped subtitles. Export production WebVTT (.vtt) and SubRip (.srt) caption files directly into YouTube Studio or corporate LMS platforms.
• Mode 2 - Automated Scribe/Guidde Workflow Guides: Automatically capture every click coordinate, target element, and keyboard action as a step-by-step interactive manual with code snippets and action tags.
• 22-Language Instant Translation: Instantly translate any caption track or step guide across all 22 international languages with a single click.`,
      },
      {
        id: 'tts_playback',
        title: '4. Native Cross-Browser Text-to-Speech (TTS)',
        content: `• System Voice Auto-Matching: Queries window.speechSynthesis to bind the optimal localized voice matching the selected language's BCP-47 tag (e.g., fr-FR, ja-JP, ar-SA, hi-IN).
• Full Audio Lifecycle Controls: Play, pause, resume, and stop playback with custom speech rate and pitch calibration.
• Visual Speech Synchronizer: Highlights active workflow steps and displays dynamic soundwave pulses while speaking.`,
      },
      {
        id: 'native_deployment',
        title: '5. Multi-Platform Native Installation',
        content: `• Deploy as a native app across Android (APK/AAB with foreground capture services), iOS (PWA & WebKit home screen container), Windows (.exe/.msi via Tauri or Electron), macOS (.dmg with ScreenCaptureKit), and Linux (.AppImage/deb). Review INSTALLATION.md for end-to-end instructions.`,
      },
    ],
  },
  fr: {
    title: 'KBT_AppGuideVideo : Manuel d’Ingénierie & Guide Vidéo',
    subtitle: 'Capture Logicielle Haute Performance, Guides Interactifs Scribe & Architecture en 22 Langages',
    badge: 'Guide du Projet v2.4 (22 Langues Prises en Charge)',
    overview:
      'Bienvenue sur KBT_AppGuideVideo, cursus d’ingénierie avancée et studio de production vidéo. Inspiré d’OBS Studio, Camtasia, Scribe et Loom, ce projet aborde l’enregistrement d’écran et la génération de tutoriels sous l’angle des systèmes bas-niveau, de la vectorisation SIMD et des fermes de rendu distribuées.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. Les 5 Piliers Architecturaux',
        content: `• Desktop & Bas-Niveau (C, C++, Rust, Go, Assembleur, PowerShell) : Capture VRAM zero-copy (IDXGI / ScreenCaptureKit / PipeWire), conversion SIMD AVX2/NEON BGRA en NV12, ring-buffers lock-free et encodage matériel FFmpeg NVENC.
• Systèmes Mobiles Multiplateformes (Kotlin, Java, Dart/Flutter, Swift) : Démons Android MediaProjection, services de premier plan résilients et ponts JNI.
• Pipelines Cloud Distribués (TypeScript, JavaScript, Python, C#) : Capture de télémétrie DOM, fermes de rendu Playwright sans tête et voix off synthétique.
• Moteur Big Data & Analytique (SQL, R, Scala, Java) : Ingestion temps réel Akka/Pekko, tables relationnelles temporelles et modèles de rétention R.
• Systèmes Hérités & DSP (PHP, Ruby, MATLAB, COBOL) : Catalogues API S3, filtrage audio FFT sous MATLAB et manifestes de facturation COBOL-85.`,
      },
      {
        id: 'studio_recording',
        title: '2. Enregistreur Studio & Compositeur Graphique',
        content: `Capture d’écran directe via getDisplayMedia ou simulateur d’EDI intégré. Incrustation de bulle caméra style Loom, ondes de clics animées, visualiseur audio VU-mètre et export MP4/WebM en 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Annotations Visuelles & Sous-titres (Softsubs vs Scribe)',
        content: `• Pistes de métadonnées minutées (Softsubs) : Export de fichiers WebVTT et SRT pour YouTube et LMS.
• Guides interactifs Scribe : Étapes pas-à-pas automatiques avec coordonnées de clics et descriptions.
• Traduction instantanée dans les 22 langues internationales.`,
      },
      {
        id: 'tts_playback',
        title: '4. Synthèse Vocale Native (TTS)',
        content: `Intégration de l’API window.speechSynthesis avec sélection automatique de la voix système la plus proche pour chaque langue (fr-FR, etc.), contrôles lecture/pause/arrêt et mise en surbrillance dynamique des étapes.`,
      },
      {
        id: 'native_deployment',
        title: '5. Déploiement Multiplateforme Natif',
        content: `Génération pour Android (APK/AAB), iOS (PWA), Windows (.exe/.msi), macOS (.dmg) et Linux. Consultez INSTALLATION.md pour le guide complet.`,
      },
    ],
  },
  de: {
    title: 'KBT_AppGuideVideo: Ingenieurshandbuch & Video-Leitfaden',
    subtitle: 'Leistungsstarke Bildschirmaufnahme, Scribe-Leitfäden & 22-Sprachen-Architektur',
    badge: 'Capstone Leitfaden v2.4 (22 Sprachen)',
    overview:
      'Willkommen bei KBT_AppGuideVideo. Inspiriert von OBS Studio, Camtasia und Loom behandeln wir Bildschirmaufnahme und Videoerstellung als Low-Level-Systeme, SIMD-Vektorisierung und verteilte Render-Pipelines über 22 Programmiersprachen.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. Die 5 Kern-Architekturpfeiler',
        content: `• Desktop & Low-Level (C, C++, Rust, Go, Assembly, PowerShell): GPU-Direktaufnahme via IDXGI/PipeWire, SIMD AVX2-Farbkonvertierung und hardwarebeschleunigtes FFmpeg NVENC Muxing.
• Mobile Systeme (Kotlin, Java, Dart/Flutter, Swift): MediaProjection-Dienste und JNI-Audiopuffer.
• Verteilte Cloud-Pipelines (TypeScript, JS, Python, C#): DOM-Telemetrie und Headless-Rendering mit Playwright.
• Unternehmensanalytik (SQL, R, Scala, Java): Akka-Stream-Ingestion und R-Retentionsanalyse.
• Legacy-Systeme (PHP, Ruby, MATLAB, COBOL): S3-Medienkataloge, MATLAB FFT-Signalverarbeitung und COBOL-Abrechnungsmanifeste.`,
      },
      {
        id: 'studio_recording',
        title: '2. Studio-Aufnahme & Compositor',
        content: `Echtzeit-Aufnahme mit Bildschirmübertragung, Loom-Kamerabubble, Klickwellen-Animationen, Web-Audio-VU-Meter und MP4/WebM-Export mit 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Visuelle Anmerkungen (Softsubs & Scribe)',
        content: `WebVTT/SRT-Export für YouTube und LMS sowie schrittweise Scribe-Workflow-Leitfäden mit Übersetzung in 22 Weltsprachen.`,
      },
      {
        id: 'tts_playback',
        title: '4. Native Text-to-Speech (TTS) Sprachausgabe',
        content: `Automatische Systemstimmenerkennung über window.speechSynthesis mit voller Play/Pause-Steuerung und interaktiver Fortschrittsmarkierung.`,
      },
      {
        id: 'native_deployment',
        title: '5. Native Installation',
        content: `Bauanleitungen für Android (APK/AAB), iOS (PWA), Windows (.exe/.msi), macOS (.dmg) und Linux. Siehe INSTALLATION.md.`,
      },
    ],
  },
  es: {
    title: 'KBT_AppGuideVideo: Manual de Ingeniería y Guías de Video',
    subtitle: 'Captura de Software de Alto Rendimiento, Guías Scribe y Arquitectura en 22 Lenguajes',
    badge: 'Guía de Proyecto v2.4 (22 Idiomas Soportados)',
    overview:
      'Bienvenido a KBT_AppGuideVideo, plataforma inspirada en OBS Studio, Camtasia, Scribe y Loom. Tratamos la grabación de video como una disciplina de ingeniería de sistemas de bajo nivel, canalizaciones SIMD y clústeres de renderizado en la nube.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. Los 5 Pilares Arquitectónicos',
        content: `• Desktop y Bajo Nivel (C, C++, Rust, Go, Assembly, PowerShell): Captura directa de GPU (IDXGI / PipeWire), conversión SIMD AVX2 BGRA a NV12 y multiplexación con FFmpeg NVENC.
• Sistemas Móviles (Kotlin, Java, Dart/Flutter, Swift): Servicios MediaProjection en primer plano y serialización JNI de audio.
• Nube Distribuida (TypeScript, JS, Python, C#): Telemetría de eventos del DOM y renderizado headless con Playwright.
• Analítica Empresarial (SQL, R, Scala, Java): Ingesta masiva con Scala/Akka y modelos de retención de video con R.
• Sistemas Heredados y DSP (PHP, Ruby, MATLAB, COBOL): APIs multimedia, filtrado FFT de audio en MATLAB y manifiestos contables en COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Grabador de Estudio y Compositor Gráfico',
        content: `Captura de pantalla real o simulador interactivo de IDE. Superposición circular estilo Loom, ondas de clic animadas, medidor VU de audio y exportación en MP4/WebM a 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Anotaciones Visuales (Softsubs y Scribe)',
        content: `Generación de subtítulos temporizados WebVTT/SRT y guías interactivas paso a paso estilo Scribe con traducción instantánea a 22 idiomas.`,
      },
      {
        id: 'tts_playback',
        title: '4. Síntesis de Voz Nativa (TTS)',
        content: `Uso de window.speechSynthesis emparejando la voz óptima del sistema para cada idioma con controles de reproducción, pausa y parada.`,
      },
      {
        id: 'native_deployment',
        title: '5. Despliegue Multiplataforma Nativo',
        content: `Soporte de empaquetado para Android (APK/AAB), iOS (PWA), Windows (.exe/.msi), macOS (.dmg) y Linux. Revise INSTALLATION.md.`,
      },
    ],
  },
  it: {
    title: 'KBT_AppGuideVideo: Manuale di Ingegneria e Guida Video',
    subtitle: 'Cattura Software ad Alte Prestazioni, Guide Scribe e Architettura in 22 Linguaggi',
    badge: 'Guida Capstone v2.4 (22 Lingue Supportate)',
    overview:
      'Benvenuti in KBT_AppGuideVideo. Ispirato a OBS Studio, Camtasia e Loom, questo progetto affronta la registrazione dello schermo come architettura di sistemi a basso livello e pipeline di rendering distribuite.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. I 5 Pilastri Architetturali',
        content: `Cattura VRAM zero-copy (C/C++), buffer circolari lock-free in Rust, servizi MediaProjection in Kotlin per Android, pipeline cloud Playwright in Python/TypeScript, lago dati in Scala/SQL e filtri audio FFT in MATLAB con batch COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Registrazione Studio & Compositor',
        content: `Cattura schermo, sovrimpressione webcam stile Loom, animazioni di clic, VU-meter e download video in MP4/WebM a 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Annotazioni Visive (Softsub e Scribe)',
        content: `Sottotitoli sincronizzati WebVTT/SRT ed esportazione di guide interattive passo-passo con traduzione simultanea in 22 lingue.`,
      },
      {
        id: 'tts_playback',
        title: '4. Sintesi Vocale Nativa (TTS)',
        content: `Motore window.speechSynthesis con associazione automatica della voce di sistema più vicina e controlli multimediali completi.`,
      },
      {
        id: 'native_deployment',
        title: '5. Installazione Nativa',
        content: `Istruzioni dettagliate per Android, iOS, Windows, macOS e Linux disponibili in INSTALLATION.md.`,
      },
    ],
  },
  pt: {
    title: 'KBT_AppGuideVideo: Manual de Engenharia e Guia de Vídeo',
    subtitle: 'Captura de Alta Performance, Tutoriais Interativos Scribe e Arquitetura em 22 Linguagens',
    badge: 'Guia de Capstone v2.4 (22 Idiomas)',
    overview:
      'Bem-vindo ao KBT_AppGuideVideo. Inspirado no OBS Studio, Camtasia e Loom, abordamos a criação de tutoriais em vídeo como engenharia de sistemas de baixo nível, vetorização SIMD e processamento distribuído.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. Os 5 Pilares de Engenharia',
        content: `Captura direta de VRAM com DirectX/PipeWire, conversão SIMD AVX2, serviços MediaProjection em Kotlin, renderização headless com Playwright em Python/C#, telemetria em Scala/SQL, DSP FFT em MATLAB e faturamento COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Estúdio de Gravação e Compositor',
        content: `Gravação de tela real ou simulada, câmera flutuante estilo Loom, ondulações de clique, VU meter de áudio e exportação MP4/WebM.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Anotações Visuais (Softsubs e Scribe)',
        content: `Legendas WebVTT/SRT para YouTube/LMS e passos interativos automatizados com tradução em 22 idiomas.`,
      },
      {
        id: 'tts_playback',
        title: '4. Text-to-Speech (TTS) Nativo',
        content: `Suporte à API nativa do navegador com controle de voz, velocidade e sincronização de etapas.`,
      },
      {
        id: 'native_deployment',
        title: '5. Instalação Multiplataforma',
        content: `Consulte INSTALLATION.md para compilar para Android, iOS, Windows, macOS e Linux.`,
      },
    ],
  },
  id: {
    title: 'KBT_AppGuideVideo: Panduan Rekayasa & Pembuatan Video Tutorial',
    subtitle: 'Perekaman Perangkat Lunak Berperforma Tinggi, Panduan Interaktif Scribe & Arsitektur 22 Bahasa',
    badge: 'Panduan Proyek v2.4 (Mendukung 22 Bahasa)',
    overview:
      'Selamat datang di KBT_AppGuideVideo. Terinspirasi dari OBS Studio, Camtasia, Scribe, dan Loom, proyek ini memandang perekaman layar dan pembuatan tutorial sebagai sistem tingkat rendah, akselerasi SIMD, dan pipeline komputasi terdistribusi.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 Pilar Rekayasa Utama',
        content: `• Desktop & Low-Level (C, C++, Rust, Go, Assembly, PowerShell): Tangkapan VRAM GPU nol-salin, konversi SIMD AVX2 BGRA ke NV12, dan muxing FFmpeg NVENC.
• Mobile Multi-Platform (Kotlin, Java, Dart/Flutter, Swift): Layanan latar depan MediaProjection Android dan interop JNI.
• Cloud & Web Terdistribusi (TypeScript, JS, Python, C#): Telemetri DOM dan kluster render headless Playwright.
• Data & Analitik Enterprise (SQL, R, Scala, Java): Ingesti data telemetri berkecepatan tinggi dan pemodelan retensi penonton.
• Warisan & Logika Bisnis (PHP, Ruby, MATLAB, COBOL): Manajemen katalog S3, filter audio FFT MATLAB, dan batch COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Perekam Studio & Kompositor Kanvas',
        content: `Perekaman layar nyata atau simulator IDE interaktif, overlay kamera bundar gaya Loom, animasi riak klik, visualizer spektrum audio, dan ekspor MP4/WebM 1080p.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Anotasi Visual (Softsub & Scribe)',
        content: `Trek teks WebVTT/SRT untuk YouTube/LMS dan dokumen langkah interaktif otomatis dengan terjemahan instan ke 22 bahasa.`,
      },
      {
        id: 'tts_playback',
        title: '4. Sintesis Suara Alami (TTS)',
        content: `Menggunakan window.speechSynthesis dengan pemilihan suara sistem terdekat untuk semua 22 bahasa dunia dan kontrol pemutaran penuh.`,
      },
      {
        id: 'native_deployment',
        title: '5. Pemasangan Aplikasi Native',
        content: `Panduan lengkap untuk Android (APK), iOS (PWA), Windows (.exe), macOS (.dmg), dan Linux di INSTALLATION.md.`,
      },
    ],
  },
  sw: {
    title: 'KBT_AppGuideVideo: Mwongozo wa Uhandisi na Kurekodi Video',
    subtitle: 'Nasa Skrini ya Kiwango cha Juu, Miongozo ya Scribe na Usanifu wa Lugha 22',
    badge: 'Mwongozo wa Mradi v2.4 (Lugha 22)',
    overview:
      'Karibu kwenye KBT_AppGuideVideo. Mradi huu unahamasishwa na OBS Studio, Camtasia na Loom, ukiangazia unukuzi wa video kupitia usanifu wa mifumo ya ngazi ya chini, ufanisi wa SIMD na mashamba ya usindikaji wa wingu.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. Nguzo Kuu 5 za Usanifu',
        content: `Mkusanyiko wa moja kwa moja wa VRAM ya GPU (C/C++), buffer za kumbukumbu zisizo na kufuli (Rust), huduma za MediaProjection za Android (Kotlin), utoaji wa Playwright bila kichwa (Python/TypeScript), ziwa la takwimu (Scala/SQL), na usindikaji wa sauti wa MATLAB FFT na COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Studio ya Kurekodi na Muundo wa Skrini',
        content: `Kurekodi skrini halisi au mazingira ya mfano ya IDE, kamera ya duara ya Loom, miondoko ya kubofya panya, na upakuaji wa video wa MP4/WebM.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Maelezo ya Visual (Manukuu & Mwongozo wa Scribe)',
        content: `Uzalishaji wa manukuu ya WebVTT/SRT ya YouTube/LMS na maelekezo ya hatua kwa hatua yaliyotafsiriwa katika lugha 22.`,
      },
      {
        id: 'tts_playback',
        title: '4. Usomaji wa Maandishi kwa Sauti (TTS)',
        content: `Teknolojia ya window.speechSynthesis inayochagua sauti bora ya kifaa chako katika lugha zote 22 pamoja na udhibiti wa kusitisha na kuendelea.`,
      },
      {
        id: 'native_deployment',
        title: '5. Usanikishaji wa Asili',
        content: `Miongozo ya vifaa vya Android, iOS, Windows, macOS, na Linux inapatikana katika INSTALLATION.md.`,
      },
    ],
  },
  tr: {
    title: 'KBT_AppGuideVideo: Mühendislik El Kitabı ve Video Kılavuzu',
    subtitle: 'Yüksek Performanslı Yazılım Kaydı, Scribe Kılavuzları ve 22 Programlama Dili Mimarisi',
    badge: 'Capstone Rehberi v2.4 (22 Dil Desteği)',
    overview:
      'KBT_AppGuideVideo platformuna hoş geldiniz. OBS Studio, Camtasia, Scribe ve Loom vizyonuyla geliştirilen bu proje, video kaydetmeyi ve eğitim oluşturmayı düşük seviyeli sistem mimarisi ve SIMD optimizasyonu olarak ele alır.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 Temel Mimari Sütun',
        content: `• Masaüstü & Düşük Seviye (C, C++, Rust, Go, Assembly, PowerShell): GPU VRAM doğrudan yakalama (IDXGI/PipeWire), SIMD AVX2 BGRA-NV12 dönüşümü ve FFmpeg NVENC donanım muxing.
• Mobil Sistemler (Kotlin, Java, Dart/Flutter, Swift): Android MediaProjection ön plan servisleri ve JNI bellek köprüleri.
• Dağıtık Bulut (TypeScript, JS, Python, C#): DOM telemetrisi ve Playwright headless render kümesi.
• Kurumsal Analitik (SQL, R, Scala, Java): Akka veri akışı ve R kullanıcı tutundurma modelleri.
• Eski Sistemler & DSP (PHP, Ruby, MATLAB, COBOL): S3 katalog API, MATLAB FFT ses filtreleme ve COBOL faturalandırma raporları.`,
      },
      {
        id: 'studio_recording',
        title: '2. Stüdyo Kaydedici ve Kompozitör',
        content: `Ekran yakalama, Loom tarzı yuvarlak kamera baloncuğu, tıklama dalga animasyonları, VU-metre ve 1080p 60fps MP4/WebM dışa aktarma.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Görsel Açıklamalar (Softsub ve Scribe)',
        content: `YouTube ve LMS için WebVTT/SRT altyazı dosyaları ve 22 dilde adım adım Scribe dokümantasyonu.`,
      },
      {
        id: 'tts_playback',
        title: '4. Doğal Metin Okuma (TTS)',
        content: `Tüm 22 dilde en yakın sistem sesini otomatik eşleyen window.speechSynthesis motoru ile tam denetim.`,
      },
      {
        id: 'native_deployment',
        title: '5. Yerel Kurulum',
        content: `Android, iOS, Windows, macOS ve Linux için ayrıntılı derleme adımları INSTALLATION.md dosyasında.`,
      },
    ],
  },
  ru: {
    title: 'KBT_AppGuideVideo: Инженерное руководство и видеостудия',
    subtitle: 'Высокопроизводительный захват экрана, интерактивные руководства Scribe и архитектура на 22 языках',
    badge: 'Руководство проекта v2.4 (22 языка)',
    overview:
      'Добро пожаловать в KBT_AppGuideVideo. Вдохновленный OBS Studio, Camtasia, Scribe и Loom, этот проект рассматривает запись экрана как низкоуровневую системную архитектуру с SIMD-векторизацией и распределенным рендерингом на 22 языках программирования.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 ключевых архитектурных столпов',
        content: `• Desktop и низкий уровень (C, C++, Rust, Go, Ассемблер, PowerShell): Прямой захват VRAM через IDXGI/PipeWire, SIMD AVX2/NEON преобразование BGRA в NV12, lock-free кольцевые буферы и аппаратный FFmpeg NVENC.
• Мобильные платформы (Kotlin, Java, Dart/Flutter, Swift): Фоновые службы Android MediaProjection, отказоустойчивость памяти и JNI аудио-мосты.
• Распределенные облачные системы (TypeScript, JS, Python, C#): Телеметрия событий DOM, кластер Playwright и FastAPI/MoviePy композитор.
• Корпоративная аналитика (SQL, R, Scala, Java): Akka/Pekko потоковая обработка, TimescaleDB схемы и аналитика удержания на R.
• Legacy и цифровая обработка сигналов (PHP, Ruby, MATLAB, COBOL): Каталог S3, БПФ-фильтрация шума в MATLAB и биллинг COBOL-85.`,
      },
      {
        id: 'studio_recording',
        title: '2. Студия записи и визуальный композитор',
        content: `Захват экрана через getDisplayMedia или симулятор IDE, круглая веб-камера в стиле Loom, анимация кликов мыши, аудио VU-метр и экспорт в MP4/WebM 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Визуальные аннотации (Softsubs и Scribe)',
        content: `Генерация субтитров WebVTT и SRT для YouTube/LMS и пошаговые интерактивные руководства Scribe с мгновенным переводом на 22 языка.`,
      },
      {
        id: 'tts_playback',
        title: '4. Встроенный синтез речи (TTS)',
        content: `Интеграция с window.speechSynthesis с автоматическим подбором лучшего системного голоса для каждого из 22 языков, управлением паузой и подсветкой шагов.`,
      },
      {
        id: 'native_deployment',
        title: '5. Нативная установка',
        content: `Полная инструкция по сборке для Android (APK), iOS (PWA), Windows (.exe/.msi), macOS (.dmg) и Linux представлена в файле INSTALLATION.md.`,
      },
    ],
  },
  zh: {
    title: 'KBT_AppGuideVideo：软件工程与视频指南核心手册',
    subtitle: '高性能系统级录制引擎、Scribe交互式工作流与22种编程语言大型毕业项目架构',
    badge: '毕业设计架构指南 v2.4（全22种语言支持）',
    overview:
      '欢迎使用 KBT_AppGuideVideo。受 OBS Studio、Camtasia、ScreenFlow、Scribe、Guidde 和 Loom 的启发，本项目将屏幕录制与软件指南生成视为低级系统架构、SIMD 硬件加速以及跨 22 种主流和基础编程语言的高吞吐量流处理引擎。',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 五大核心工程架构支柱',
        content: `• 桌面端与底层系统架构 (C, C++, Rust, Go, Assembly, PowerShell)：通过 Windows IDXGIOutputDuplication、macOS ScreenCaptureKit 和 Linux PipeWire 实现 GPU 零拷贝捕获；使用 SIMD AVX2/NEON 实现极速 BGRA 到 NV12 转换；无锁环形缓冲区与 FFmpeg NVENC 硬件级封装。
• 跨平台移动端引擎 (Kotlin, Java, Dart/Flutter, Swift)：Android MediaProjection 前台服务守候、JNI 二进制音频增益流以及 iOS ReplayKit 原生交互桥梁。
• 分布式云端渲染流水线 (TypeScript, JavaScript, Python, C#)：DOM 交互事件捕获引擎、Playwright 无头浏览器集群确定性回放与 FastAPI 语音合成合成管道。
• 企业级交互数据与分析湖 (SQL, R, Scala, Java)：Akka/Pekko 高吞吐交互遥测摄取、TimescaleDB 时序映射与 R 语言视频流失及困惑点诊断模型。
• 传统业务与数字信号处理矩阵 (PHP, Ruby, MATLAB, COBOL)：S3 分块视频资产编目 API、MATLAB 快速傅里叶变换（FFT）音频降噪与静音剔除，以及 COBOL-85 日终带宽计费结算清单。`,
      },
      {
        id: 'studio_recording',
        title: '2. 演播室级屏幕录制与实时渲染合成器',
        content: `支持真实屏幕捕获或内置交互式 IDE 模拟器。提供 Loom 风格可拖拽圆形摄像头、鼠标点击水波纹动画、智能焦点变焦、实时 Web Audio 音频频谱与 VU 计量表，支持一键导出生产级 1080p 60FPS MP4 与 WebM 视频。`,
      },
      {
        id: 'visual_annotations',
        title: '3. 视觉标注切换系统：Softsubs 软字幕 vs Scribe 交互指南',
        content: `• 时间轴元数据轨道 (Softsubs)：精准编辑字幕，生成并导出 YouTube 及 LMS 平台标准的 WebVTT (.vtt) 与 SubRip (.srt) 字幕文件。
• Scribe/Guidde 智能工作流指南：自动将用户交互坐标、按键与代码片段记录为交互式步骤手册。
• 22 种国际化语言即时翻译：只需在下拉菜单中选择即可将整个字幕轨和指南翻译为 22 种语言。`,
      },
      {
        id: 'tts_playback',
        title: '4. 原生跨平台文本转语音（TTS）播报系统',
        content: `调用 window.speechSynthesis 引擎，自动检索并匹配当前所选语言的 BCP-47 本地最优系统发音人（如 zh-CN、ja-JP 等），支持播放、暂停、继续、停止与语速控制，在朗读时高亮对应步骤。`,
      },
      {
        id: 'native_deployment',
        title: '5. 全平台原生打包与部署指引',
        content: `提供 Android (APK/AAB 前台录屏服务)、iOS (PWA 模式)、Windows (.exe/.msi 安装包)、macOS (.dmg 镜像) 和 Linux 完整打包部署方案，详见 INSTALLATION.md。`,
      },
    ],
  },
  ja: {
    title: 'KBT_AppGuideVideo：エンジニアリング＆ビデオガイド総合マニュアル',
    subtitle: '高性能キャプチャエンジン、Scribe風インタラクティブガイド＆22言語対応システム設計',
    badge: 'キャップストーン設計ガイド v2.4（22言語対応）',
    overview:
      'KBT_AppGuideVideo へようこそ。OBS Studio、Camtasia、ScreenFlow、Scribe、Guidde、Loom から着想を得て、単なる画面録画アプリにとどまらず、22のプログラミング言語にまたがる低レイヤGPUテクスチャ取得、SIMDベクトル化、分散レンダリングクラスタとして構築されています。',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5つの基幹アーキテクチャ支柱',
        content: `• デスクトップ＆低レイヤ (C, C++, Rust, Go, アセンブリ, PowerShell): IDXGI/PipeWireによるGPUゼロコピー取得、SIMD AVX2によるBGRA→NV12高速色空間変換、ロックフリーリングバッファ、FFmpeg NVENCハードウェア多重化。
• マルチプラットフォームモバイル (Kotlin, Java, Dart/Flutter, Swift): Android MediaProjectionフォアグラウンドサービス、JNIオーディオストリーム制御、iOS ReplayKit連携。
• 分散クラウド＆Web (TypeScript, JS, Python, C#): DOMテレメトリ収集、Playwrightヘッドレスレンダリング、FastAPI/MoviePy自動ナレーション合成。
• エンタープライズデータ分析 (SQL, R, Scala, Java): Akkaストリーム取り込み、TimescaleDB時系列スキーマ、R言語による離脱・混乱ヒートマップ分析。
• レガシー連携＆DSP信号処理 (PHP, Ruby, MATLAB, COBOL): S3メディアAPI、MATLAB FFT周波数スペクトル雑音除去、COBOL-85日次帯域課金バッチ。`,
      },
      {
        id: 'studio_recording',
        title: '2. スタジオ画面録画＆リアルタイムコンポジター',
        content: `画面共有または組み込みIDEシミュレータからの映像取得。Loomスタイルの円形カメラバブル、クリック波紋エフェクト、VUメーター、1080p 60fps MP4/WebMエクスポート。`,
      },
      {
        id: 'visual_annotations',
        title: '3. 視覚アノテーション（Softsubs字幕 ＆ Scribeガイド）',
        content: `YouTube/LMS向けWebVTT・SRT字幕の作成・書き出し、操作手順を自動抽出するScribe形式ステップガイド、全22言語へのリアルタイム翻訳。`,
      },
      {
        id: 'tts_playback',
        title: '4. ネイティブ音声合成（TTS）システム',
        content: `window.speechSynthesis を活用し、各言語（ja-JPなど）に最適なシステム音声でガイドや字幕を自動読み上げ。再生・一時停止・停止制御とステップハイライト。`,
      },
      {
        id: 'native_deployment',
        title: '5. 各種ネイティブ環境へのインストール',
        content: `Android (APK/AAB)、iOS (PWA)、Windows (.exe/.msi)、macOS (.dmg)、Linuxへの完全な展開手順は INSTALLATION.md をご参照ください。`,
      },
    ],
  },
  ar: {
    title: 'KBT_AppGuideVideo: الدليل الهندسي الشامل واستوديو الفيديو',
    subtitle: 'تسجيل البرمجيات عالي الأداء، أدلة Scribe التفاعلية وبنية برمجية تغطي 22 لغة برمجة',
    badge: 'دليل المشروع v2.4 (يدعم 22 لغة عالمية)',
    overview:
      'مرحبًا بك في KBT_AppGuideVideo. مستوحى من OBS Studio و Camtasia و Loom، يتعامل هذا المشروع مع تسجيل الشاشة وتوليد البرامج التعليمية كبنية أنظمة منخفضة المستوى وتسريع SIMD ومعالجة موزعة عبر 22 لغة برمجة.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. الركائز الهندسية الخمس الأساسية',
        content: `• الأنظمة المنخفضة وسطح المكتب (C, C++, Rust, Go, Assembly, PowerShell): التقاط مباشر لذاكرة GPU VRAM عبر IDXGI و PipeWire، وتحويل ألوان SIMD AVX2 فائق السرعة، ودمج عتادي بـ FFmpeg NVENC.
• أنظمة الهاتف المحمول (Kotlin, Java, Dart/Flutter, Swift): خدمات MediaProjection للأندرويد في الواجهة الأمامية وربط JNI.
• الحوسبة السحابية الموزعة (TypeScript, JS, Python, C#): تتبع أحداث DOM ومزارع تصيير Playwright بدون واجهة وتوليد تعليق صوتي بـ FastAPI.
• بحيرة البيانات والتحليلات (SQL, R, Scala, Java): استيعاب التدفقات بـ Scala/Akka ونماذج تحليل الاحتفاظ بـ R.
• الأنظمة القديمة ومعالجة الإشارات (PHP, Ruby, MATLAB, COBOL): كتالوجات S3 بـ PHP، وتصفية ضوضاء FFT بـ MATLAB، وبيانات الفوترة الدفترية بـ COBOL-85.`,
      },
      {
        id: 'studio_recording',
        title: '2. استوديو التسجيل والتركيب المباشر',
        content: `التقاط الشاشة الحقيقية أو محاكي بيئة التطوير IDE. فقاعة كاميرا دائرية بأسلوب Loom، وتأثيرات تموج النقر، ومقياس صوت VU، وتصدير MP4/WebM بجودة 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. التعليقات التوضيحية (Softsubs وأدلة Scribe)',
        content: `تصدير ملفات ترجمة WebVTT و SRT لمنصات YouTube والتعليم، وأدلة تفاعلية خطوة بخطوة مع ترجمة فورية إلى 22 لغة عالمية.`,
      },
      {
        id: 'tts_playback',
        title: '4. توليد الصوت الآلي المدمج (TTS)',
        content: `استخدام محرك window.speechSynthesis مع اختيار تلقائي لأفضل صوت نظام محلي للغة المختارة وتحكم كامل بالتشغيل والتوقف.`,
      },
      {
        id: 'native_deployment',
        title: '5. التثبيت على مختلف المنصات',
        content: `إرشادات التثبيت المباشر على Android و iOS و Windows و macOS و Linux مفصلة بالكامل في ملف INSTALLATION.md.`,
      },
    ],
  },
  ur: {
    title: 'KBT_AppGuideVideo: انجینئرنگ و ویڈیو گائیڈ دستی کتابچہ',
    subtitle: 'اعلیٰ کارکردگی اسکرین ریکارڈنگ، سکرائب رہنمائی اور 22 زبانوں پر مشتمل پراجیکٹ کا ڈھانچہ',
    badge: 'پراجیکٹ گائیڈ ورژن 2.4 (22 زبانوں کی مکمل معاونت)',
    overview:
      'KBT_AppGuideVideo میں خوش آمدید۔ OBS Studio، Camtasia اور Loom سے متاثر ہو کر بنایا گیا یہ منصوبہ اسکرین ریکارڈنگ کو نچلی سطح کے سسٹمز، SIMD تیز رفتار رفتار کاری اور کلاؤڈ رینڈر فارمز کے طور پر پیش کرتا ہے۔',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. بنیادی 5 انجینئرنگ ستون',
        content: `براہ راست GPU VRAM کیپچر (C/C++)، رسٹ میں لاک فری رنگ بفر، اینڈرائیڈ کے لیے کوٹلن میڈیا پروجیکشن سروسز، پلے رائٹ کے ذریعے کلاؤڈ رینڈرنگ، اسکیل اور ایس کیو ایل ڈیٹا لیکس، اور میٹ لیب سگنل فلٹرنگ مع کوبول بلنگ رپورٹ۔`,
      },
      {
        id: 'studio_recording',
        title: '2. اسٹوڈیو ریکارڈنگ اور کمپوزیٹر',
        content: `اسکرین ریکارڈنگ، لوم اسٹائل گول کیمرہ، کلک اینیمیشن، آڈیو وی یو میٹر اور 1080p 60fps پر MP4/WebM برآمد۔`,
      },
      {
        id: 'visual_annotations',
        title: '3. بصری تشریحات (سب ٹائٹلز اور سکرائب گائیڈ)',
        content: `یوٹیوب اور LMS کے لیے WebVTT اور SRT فائلیں تیار کرنا اور 22 عالمی زبانوں میں فوری ترجمہ۔`,
      },
      {
        id: 'tts_playback',
        title: '4. ٹیکسٹ ٹو اسپیچ (TTS) نظام',
        content: `براؤزر کی مقامی window.speechSynthesis کے ذریعے 22 زبانوں میں خودکار نظام کی آواز کا ملاپ اور پلے/پاز کنٹرول۔`,
      },
      {
        id: 'native_deployment',
        title: '5. مقامی تنصیب (انسٹالیشن)',
        content: `اینڈرائیڈ، آئی او ایس، ونڈوز، میک اور لینکس کے لیے مکمل تنصیبی طریقہ کار INSTALLATION.md میں دیکھیں۔`,
      },
    ],
  },
  hi: {
    title: 'KBT_AppGuideVideo: इंजीनियरिंग और वीडियो गाइड मैनुअल',
    subtitle: 'उच्च-प्रदर्शन सॉफ्टवेयर कैप्चर, इंटरैक्टिव स्क्राइब गाइड और 22 प्रोग्रामिंग भाषाओं का आर्किटेक्चर',
    badge: 'कैपस्टोन गाइड v2.4 (22 भाषाओं का पूर्ण समर्थन)',
    overview:
      'KBT_AppGuideVideo में आपका स्वागत है। OBS Studio, Camtasia, Scribe और Loom से प्रेरित, यह प्रोजेक्ट स्क्रीन रिकॉर्डिंग और ट्यूटोरियल निर्माण को निम्न-स्तरीय सिस्टम आर्किटेक्चर, SIMD एक्सेलेरेशन और वितरित रेंडर पाइपलाइन के रूप में प्रस्तुत करता है।',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 प्रमुख इंजीनियरिंग स्तंभ',
        content: `• डेस्कटॉप और लो-लेवल (C, C++, Rust, Go, Assembly, PowerShell): IDXGI और PipeWire द्वारा सीधा GPU VRAM कैप्चर, SIMD AVX2 द्वारा BGRA से NV12 रूपांतरण और FFmpeg NVENC एन्कोडिंग।
• मल्टी-प्लेटफ़ॉर्म मोबाइल (Kotlin, Java, Dart/Flutter, Swift): Android MediaProjection फ़ोरग्राउंड सेवा और JNI ऑडियो बफ़र्स।
• डिस्ट्रीब्यूटेड क्लाउड (TypeScript, JS, Python, C#): DOM टेलीमेट्री और Playwright हेडलेस रेंडरिंग क्लस्टर।
• एंटरप्राइज एनालिटिक्स (SQL, R, Scala, Java): Akka टेलीमेट्री डेटा स्ट्रीम और R रिटेंशन विश्लेषण मॉडल।
• लीगेसी और डीएसपी (PHP, Ruby, MATLAB, COBOL): S3 मीडिया कैटलॉग, MATLAB FFT फ़िल्टरिंग और COBOL-85 बिलिंग रिपोर्ट।`,
      },
      {
        id: 'studio_recording',
        title: '2. स्टूडियो रिकॉर्डर और रियल-टाइम कम्पोज़िटर',
        content: `वास्तविक स्क्रीन या इनबिल्ट IDE सिमुलेटर कैप्चर। लूम-स्टाइल वेबकैम बबल, क्लिक तरंग एनिमेशन, ऑडियो वीयू-मीटर और 1080p 60fps MP4/WebM एक्सपोर्ट।`,
      },
      {
        id: 'visual_annotations',
        title: '3. विज़ुअल एनोटेशन (सॉफ्टसब्स और स्क्राइब गाइड)',
        content: `YouTube और LMS के लिए WebVTT/SRT सबटाइटल फाइलें और 22 भाषाओं में अनुवादित चरण-दर-चरण स्क्राइब गाइड।`,
      },
      {
        id: 'tts_playback',
        title: '4. नेटिव टेक्स्ट-टू-स्पीच (TTS)',
        content: `window.speechSynthesis के माध्यम से 22 भाषाओं में सिस्टम की सर्वोत्तम आवाज़ से स्वचालित वाचन और नियंत्रण।`,
      },
      {
        id: 'native_deployment',
        title: '5. नेटिव प्लेटफ़ॉर्म पर इंस्टॉलेशन',
        content: `Android, iOS, Windows, macOS और Linux के लिए संपूर्ण चरण-दर-चरण निर्देश INSTALLATION.md में उपलब्ध हैं।`,
      },
    ],
  },
  vi: {
    title: 'KBT_AppGuideVideo: Cẩm nang Kỹ thuật & Studio Video Hướng dẫn',
    subtitle: 'Ghi hình Phần mềm Hiệu năng cao, Hướng dẫn Scribe Tương tác & Kiến trúc 22 Ngôn ngữ',
    badge: 'Cẩm nang Đồ án v2.4 (Hỗ trợ 22 Ngôn ngữ)',
    overview:
      'Chào mừng bạn đến với KBT_AppGuideVideo. Lấy cảm hứng từ OBS Studio, Camtasia, Scribe và Loom, dự án này xây dựng quy trình quay video như một hệ thống cấp thấp, tối ưu hóa SIMD và mạng lưới kết xuất phân tán trên 22 ngôn ngữ lập trình.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 Trụ cột Kiến trúc Cốt lõi',
        content: `Ghi hình trực tiếp VRAM từ GPU (C/C++), vòng đệm không khóa (Rust), dịch vụ MediaProjection trên Android (Kotlin), cụm render Playwright (Python/TypeScript), kho dữ liệu tương tác (Scala/SQL), xử lý tín hiệu âm thanh FFT trong MATLAB và báo cáo cước COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '2. Studio Ghi hình & Bộ tổng hợp',
        content: `Quay màn hình thực tế hoặc bộ mô phỏng IDE, bong bóng camera kiểu Loom, sóng nhấp chuột, đồng hồ VU âm thanh và xuất video MP4/WebM 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '3. Chú thích Hình ảnh (Phụ đề Softsubs & Scribe)',
        content: `Tạo phụ đề WebVTT/SRT cho YouTube và LMS cùng hướng dẫn từng bước tương tác Scribe với khả năng dịch tức thì sang 22 ngôn ngữ.`,
      },
      {
        id: 'tts_playback',
        title: '4. Giọng đọc Tự nhiên (TTS)',
        content: `Sử dụng window.speechSynthesis để tự động chọn giọng đọc hệ thống phù hợp nhất cho 22 ngôn ngữ cùng khả năng tạm dừng và đồng bộ hóa.`,
      },
      {
        id: 'native_deployment',
        title: '5. Cài đặt Ứng dụng Gốc',
        content: `Hướng dẫn chi tiết triển khai cho Android, iOS, Windows, macOS và Linux có trong INSTALLATION.md.`,
      },
    ],
  },
  ko: {
    title: 'KBT_AppGuideVideo: 엔지니어링 및 비디오 가이드 종합 매뉴얼',
    subtitle: '고성능 시스템 레벨 소프트웨어 캡처, Scribe 워크플로 및 22개 프로그래밍 언어 아키텍처',
    badge: '캡스톤 프로젝트 가이드 v2.4 (22개 언어 지원)',
    overview:
      'KBT_AppGuideVideo에 오신 것을 환영합니다. OBS Studio, Camtasia, Scribe, Loom에서 영감을 받아 화면 녹화와 튜토리얼 생성을 단순한 앱이 아닌 저수준 시스템 아키텍처, SIMD 벡터화, 분산 렌더링 팜으로 구현했습니다.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5대 핵심 엔지니어링 아키텍처 기둥',
        content: `• 데스크톱 및 저수준 (C, C++, Rust, Go, Assembly, PowerShell): GPU VRAM 제로 카피 캡처, SIMD AVX2 BGRA-NV12 변환, 무잠금 링 버퍼 및 FFmpeg NVENC 하드웨어 멀티플렉싱.
• 멀티플랫폼 모바일 (Kotlin, Java, Dart/Flutter, Swift): Android MediaProjection 포그라운드 서비스 및 JNI 오디오 버퍼.
• 분산 클라우드 (TypeScript, JS, Python, C#): DOM 원격 분석 및 Playwright 헤드리스 렌더링 클러스터.
• 엔터프라이즈 분석 레이크 (SQL, R, Scala, Java): Akka 스트림 수집 및 R 리텐션 모델링.
• 레거시 및 DSP (PHP, Ruby, MATLAB, COBOL): S3 미디어 카탈로그, MATLAB FFT 오디오 잡음 제거 및 COBOL-85 일일 대역폭 청구서.`,
      },
      {
        id: 'studio_recording',
        title: '2. 스튜디오 레코더 및 실시간 컴포지터',
        content: `실제 화면 또는 내장 IDE 시뮬레이터 캡처. Loom 스타일 원형 웹캠, 마우스 클릭 물결 애니메이션, VU 미터, 1080p 60fps MP4/WebM 내보내기 지원.`,
      },
      {
        id: 'visual_annotations',
        title: '3. 시각적 주석 (Softsubs 자막 & Scribe 가이드)',
        content: `YouTube/LMS용 WebVTT 및 SRT 자막 생성, 단계별 Scribe 가이드 작성 및 22개 언어 실시간 번역.`,
      },
      {
        id: 'tts_playback',
        title: '4. 브라우저 내장 음성 합성 (TTS)',
        content: `window.speechSynthesis를 활용하여 22개 언어별 최적의 시스템 음성을 자동 매칭하고 재생/일시정지 및 스텝 하이라이트 제어.`,
      },
      {
        id: 'native_deployment',
        title: '5. 네이티브 배포 및 설치',
        content: `Android (APK/AAB), iOS (PWA), Windows (.exe/.msi), macOS (.dmg), Linux 설치 가이드는 INSTALLATION.md를 참조하세요.`,
      },
    ],
  },
  fa: {
    title: 'KBT_AppGuideVideo: راهنمای مهندسی و استودیوی تولید ویدیو',
    subtitle: 'ضبط نرم‌افزار با عملکرد بالا، راهنماهای تعاملی Scribe و معماری پروژه در ۲۲ زبان برنامه‌نویسی',
    badge: 'راهنمای پروژه نسخه ۲.۴ (پشتیبانی از ۲۲ زبان)',
    overview:
      'به KBT_AppGuideVideo خوش آمدید. با الهام از OBS Studio، Camtasia و Loom، این پروژه به ضبط ویدیو و تولید راهنماهای نرم‌افزاری به عنوان معماری سیستم‌های سطح پایین و پردازش برداری SIMD نگاه می‌کند.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '۱. پنج ستون اصلی معماری مهندسی',
        content: `ضبط مستقیم از حافظه گرافیکی GPU با C/C++، بافرهای حلقوی بدون قفل در Rust، سرویس پیش‌زمینه MediaProjection در Kotlin، رندر ابری بدون سر با Playwright در Python، دریاچه داده در Scala/SQL، فیلتر سیگنال صوتی FFT در MATLAB و گزارش صورتحساب COBOL.`,
      },
      {
        id: 'studio_recording',
        title: '۲. استودیوی ضبط و ترکیب زنده',
        content: `ضبط صفحه نمایش واقعی یا شبیه‌ساز IDE، حباب وبکم دایره‌ای سبک Loom، انیمیشن موج کلیک، نمایشگر صوت VU و خروجی MP4/WebM با کیفیت 1080p 60fps.`,
      },
      {
        id: 'visual_annotations',
        title: '۳. حاشیه‌نویسی بصری (زیرنویس و راهنمای Scribe)',
        content: `تولید فایل‌های زیرنویس WebVTT و SRT برای یوتیوب و سامانه‌های آموزشی و راهنماهای گام‌به‌گام تعاملی با ترجمه به ۲۲ زبان.`,
      },
      {
        id: 'tts_playback',
        title: '۴. تبدیل متن به گفتار بومی (TTS)',
        content: `استفاده از موتور صوتی مرورگر window.speechSynthesis با انتخاب خودکار بهترین صدای سیستم برای ۲۲ زبان دنیا.`,
      },
      {
        id: 'native_deployment',
        title: '۵. نصب محلی و چندپلتفرمه',
        content: `راهنمای کامل ساخت برای اندروید، آی‌او‌اس، ویندوز، مک و لینوکس در INSTALLATION.md ارائه شده است.`,
      },
    ],
  },
  mr: {
    title: 'KBT_AppGuideVideo: अभियांत्रिकी व व्हिडिओ मार्गदर्शक मॅन्युअल',
    subtitle: 'उच्च-कार्यक्षमता स्क्रीन रेकॉर्डिंग, इंटरॅक्टिव्ह Scribe मार्गदर्शक व २२ भाषांचे आर्किटेक्चर',
    badge: 'कॅपस्टोन मार्गदर्शक v2.4 (२२ भाषा उपलब्ध)',
    overview:
      'KBT_AppGuideVideo मध्ये आपले स्वागत आहे. OBS Studio, Camtasia व Loom च्या प्रेरणेने बनवलेला हा प्रकल्प स्क्रीन रेकॉर्डिंगला निम्न-स्तरीय सिस्टीम्स आणि २२ प्रोग्रामिंग भाषांमधील वितरित रेंडरिंग म्हणून सादर करतो.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '१. मुख्य ५ अभियांत्रिकी स्तंभ',
        content: `थेट GPU VRAM कॅप्चर (C/C++), लॉक-फ्री रिंग बफर (Rust), अँड्रॉइड मीडिया प्रोजेक्शन (Kotlin), क्लाउड रेंडरिंग (Python/TypeScript), स्काला/एसक्यूएल डेटा लेक, मॅटलॅब ऑडिओ एफएफटी फिल्टर व कोबोल बिलिंग रिपोर्ट.`,
      },
      {
        id: 'studio_recording',
        title: '२. स्टुडिओ रेकॉर्डर व कॉम्पोझिटर',
        content: `स्क्रीन किंवा आयडीई सिम्युलेटर रेकॉर्ड करा. लूम-शैलीतील कॅमेरा, क्लिक वेव्ह अ‍ॅनिमेशन, ऑडिओ व्हिझ्युअलायझर आणि १०८०p ६०fps वर MP4/WebM एक्सपोर्ट करा.`,
      },
      {
        id: 'visual_annotations',
        title: '३. व्हिज्युअल अ‍ॅनोटेशन्स (सबटायटल्स व स्क्राइब मार्गदर्शक)',
        content: `युट्यूब व एलएमएससाठी WebVTT/SRT सबटायटल्स आणि २२ भाषांमध्ये त्वरित अनुवादित पायरी-दर-पायरी मार्गदर्शक.`,
      },
      {
        id: 'tts_playback',
        title: '४. टेक्स्ट-टू-स्पीच (TTS) ऑडिओ',
        content: `window.speechSynthesis द्वारे २२ भाषांसाठी सिस्टीम आवाजाची निवड आणि प्ले/पॉज नियंत्रण.`,
      },
      {
        id: 'native_deployment',
        title: '५. नेटिव्ह इन्स्टॉलेशन',
        content: `अँड्रॉइड, आयओएस, विंडोज, मॅक आणि लिनक्ससाठी संपूर्ण मार्गदर्शक INSTALLATION.md मध्ये पहा.`,
      },
    ],
  },
  bn: {
    title: 'KBT_AppGuideVideo: ইঞ্জিনিয়ারিং ও ভিডিও গাইড নির্দেশিকা',
    subtitle: 'উচ্চ-ক্ষমতাসম্পন্ন স্ক্রিন রেকর্ডিং, স্ক্রাইব গাইড ও ২২টি প্রোগ্রামিং ভাষার আর্কিটেকচার',
    badge: 'ক্যাপস্টোন প্রজেক্ট গাইড v2.4 (২২টি ভাষা সমর্থিত)',
    overview:
      'KBT_AppGuideVideo-তে আপনাকে স্বাগতম। OBS Studio, Camtasia এবং Loom দ্বারা অনুপ্রাণিত হয়ে এই প্রজেক্টে স্ক্রিন রেকর্ডিং ও টিউটোরিয়াল তৈরিকে লো-লেভেল সিস্টেম এবং ২২টি ভাষার ক্লাউড রেন্ডারিং হিসেবে রূপায়িত করা হয়েছে।',
    sections: [
      {
        id: 'architecture_pillars',
        title: '১. প্রধান ৫টি ইঞ্জিনিয়ারিং স্তম্ভ',
        content: `সরাসরি জিপিইউ ভি-র‍্যাম ক্যাপচার (C/C++), রাস্টে লক-ফ্রি রিং বাফার, অ্যান্ড্রয়েডে কোটলিন মিডিয়া প্রজেকশন, প্লে-রাইট হেডলেস ক্লাস্টার (Python/TS), স্কালা/এসকিউএল ডেটা লেক এবং ম্যাটল্যাব এফএফটি অডিও ফিল্টার সহ কোবোল বিলিং রিপোর্ট।`,
      },
      {
        id: 'studio_recording',
        title: '২. স্টুডিও রেকর্ডিং ও ভিজ্যুয়াল কম্পোজিটর',
        content: `স্ক্রিন বা আইডিই সিমুলেটর ক্যাপচার, লুম স্টাইল সার্কুলার ক্যামেরা, ক্লিক তরঙ্গ অ্যানিমেশন, অডিও ভিইউ মিটার এবং 1080p 60fps-এ MP4/WebM এক্সপোর্ট।`,
      },
      {
        id: 'visual_annotations',
        title: '৩. ভিজ্যুয়াল অ্যানোটেশন (সাবটাইটেল ও স্ক্রাইব গাইড)',
        content: `ইউটিউব ও এলএমএস-এর জন্য WebVTT/SRT সাবটাইটেল এবং ২২টি ভাষায় তাৎক্ষণিক অনুবাদযোগ্য ধাপভিত্তিক স্ক্রাইব গাইড।`,
      },
      {
        id: 'tts_playback',
        title: '৪. টেক্সট-টু-স্পিচ (TTS) অডিও',
        content: `window.speechSynthesis ব্যবহার করে ২২টি ভাষার জন্য স্বয়ংক্রিয় সিস্টেম ভয়েস ম্যাচিং ও পূর্ণ নিয়ন্ত্রণ।`,
      },
      {
        id: 'native_deployment',
        title: '৫. স্থানীয় প্ল্যাটফর্মে ইনস্টলেশন',
        content: `Android, iOS, Windows, macOS ও Linux-এর জন্য বিস্তারিত ইনস্টলেশন গাইড INSTALLATION.md ফাইলে দেখুন।`,
      },
    ],
  },
  ta: {
    title: 'KBT_AppGuideVideo: பொறியியல் மற்றும் வீடியோ வழிகாட்டி கையேடு',
    subtitle: 'உயர் செயல்திறன் திரை பிடிப்பு, ஸ்க்ரைப் ஊடாடும் வழிகாட்டிகள் & 22 மொழிகள் கட்டமைப்பு',
    badge: 'திட்ட வழிகாட்டி v2.4 (22 மொழிகள் ஆதரவு)',
    overview:
      'KBT_AppGuideVideo-விற்கு நல்வரவு. OBS Studio, Camtasia மற்றும் Loom ஆகியவற்றின் தூண்டுதலில் திரை பதிவை குறைந்த-நிலை கணினி கட்டமைப்பு மற்றும் 22 நிரலாக்க மொழிகளில் விநியோகிக்கப்பட்ட ரெண்டரிங் ஆக உருவாக்கியுள்ளோம்.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 முதன்மை பொறியியல் தூண்கள்',
        content: `நேரடி GPU VRAM பிடிப்பு (C/C++), பூட்டற்ற ரிங் பஃபர் (Rust), ஆண்ட்ராய்டு மீடியா ப்ரொஜெக்ஷன் (Kotlin), Playwright கிளவுட் ரெண்டரிங், Scala/SQL தரவு ஏரி மற்றும் மேட்லேப் FFT ஒலி வடிகட்டுதல் மற்றும் COBOL பில்லிங் அறிக்கை.`,
      },
      {
        id: 'studio_recording',
        title: '2. ஸ்டுடியோ ரெக்கார்டர் & கம்போசிட்டர்',
        content: `திரை அல்லது ஐடிஇ சிமுலேட்டர் பதிவு, லூம் பாணி வட்ட வெப்கேம், கிளிக் அலை அனிமேஷன், ஆடியோ வி.யு மீட்டர் மற்றும் 1080p 60fps MP4/WebM ஏற்றுமதி.`,
      },
      {
        id: 'visual_annotations',
        title: '3. காட்சி விளக்கங்கள் (Softsubs மற்றும் Scribe)',
        content: `YouTube மற்றும் LMS-க்கான WebVTT/SRT வசனங்கள் மற்றும் 22 உலக மொழிகளில் உடனடி மொழிபெயர்ப்புடன் கூடிய படிநிலை வழிகாட்டிகள்.`,
      },
      {
        id: 'tts_playback',
        title: '4. குரல்வழி உரை வாசிப்பு (TTS)',
        content: `window.speechSynthesis மூலம் 22 மொழிகளுக்கான உகந்த கணினி குரல் தேர்வு மற்றும் கட்டுப்பாடு.`,
      },
      {
        id: 'native_deployment',
        title: '5. நேட்டிவ் சாதனங்களில் நிறுவுதல்',
        content: `Android, iOS, Windows, macOS மற்றும் Linux நிறுவல் வழிமுறைகளை INSTALLATION.md கோப்பில் காண்க.`,
      },
    ],
  },
  te: {
    title: 'KBT_AppGuideVideo: ఇంజనీరింగ్ మరియు వీడియో గైడ్ మాన్యువల్',
    subtitle: 'అధిక పనితీరు గల స్క్రీన్ రికార్డింగ్, స్క్రైబ్ గైడ్లు మరియు 22 భాషల నిర్మాణ నమూనా',
    badge: 'ప్రాజెక్ట్ గైడ్ v2.4 (22 భాషల మద్దతు)',
    overview:
      'KBT_AppGuideVideo కి స్వాగతం. OBS Studio, Camtasia మరియు Loom ప్రేరణతో రూపొందించబడిన ఈ ప్రాజెక్ట్ స్క్రీన్ రికార్డింగ్‌ను లో-లెవల్ సిస్టమ్స్ మరియు 22 ప్రోగ్రామింగ్ భాషల్లో పంపిణీ చేయబడిన రెండరింగ్‌గా సమర్పిస్తుంది.',
    sections: [
      {
        id: 'architecture_pillars',
        title: '1. 5 ముఖ్యమైన ఇంజనీరింగ్ స్తంభాలు',
        content: `GPU VRAM నుండి నేరుగా క్యాప్చర్ (C/C++), రస్ట్ లాక్-ఫ్రీ రింగ్ బఫర్, ఆండ్రాయిడ్ మీడియా ప్రొజెక్షన్ (Kotlin), క్లౌడ్ రెండరింగ్ (Python/TypeScript), స్కాలా/SQL డేటా లేక్ మరియు మ్యాట్‌ల్యాబ్ FFT ఆడియో ఫిల్టరింగ్ తో పాటు COBOL బిల్లింగ్ రిపోర్ట్.`,
      },
      {
        id: 'studio_recording',
        title: '2. స్టూడియో రికార్డర్ & కాంపోజిటర్',
        content: `స్క్రీన్ లేదా IDE సిమ్యులేటర్ రికార్డ్ చేయండి. లూమ్ శైలి గుండ్రని కెమెరా, క్లిక్ తరంగ యానిమేషన్లు, ఆడియో VU మీటర్ మరియు 1080p 60fps MP4/WebM ఎగుమతి.`,
      },
      {
        id: 'visual_annotations',
        title: '3. విజువల్ ఉల్లేఖనాలు (Softsubs & Scribe గైడ్)',
        content: `YouTube మరియు LMS కోసం WebVTT/SRT ఉపశీర్షికలు మరియు 22 భాషల్లో తక్షణ అనువాదంతో కూడిన దశల వారీ స్క్రైబ్ గైడ్లు.`,
      },
      {
        id: 'tts_playback',
        title: '4. టెక్స్ట్-టు-స్పీచ్ (TTS) వాయిస్‌ఓవర్',
        content: `window.speechSynthesis ద్వారా 22 భాషలకు సరిపోయే సిస్టమ్ వాయిస్ ఎంపిక మరియు ప్లే/పాజ్ నియంత్రణ.`,
      },
      {
        id: 'native_deployment',
        title: '5. పరికరాల్లో నేరుగా ఇన్‌స్టాలేషన్',
        content: `Android, iOS, Windows, macOS మరియు Linux కోసం పూర్తి సూచనలు INSTALLATION.md లో అందుబాటులో ఉన్నాయి.`,
      },
    ],
  },
};
