import { SoftsubCue, ScribeWorkflowStep, SupportedLanguageCode } from '../types';

export const INITIAL_SOFTSUB_CUES: SoftsubCue[] = [
  {
    id: 'cue_1',
    startTime: 0.5,
    endTime: 4.0,
    speaker: 'Instructor',
    text: 'Welcome to KBT_AppGuideVideo. In this module, we explore low-level zero-copy GPU capture and hardware encoding.',
    translations: {
      en: 'Welcome to KBT_AppGuideVideo. In this module, we explore low-level zero-copy GPU capture and hardware encoding.',
      fr: 'Bienvenue sur KBT_AppGuideVideo. Dans ce module, nous explorons la capture GPU sans copie et l’encodage matériel.',
      de: 'Willkommen bei KBT_AppGuideVideo. In diesem Modul erkunden wir Zero-Copy-GPU-Aufnahme und Hardware-Codierung.',
      es: 'Bienvenidos a KBT_AppGuideVideo. En este módulo exploramos la captura GPU de copia cero y la codificación por hardware.',
      it: 'Benvenuti in KBT_AppGuideVideo. In questo modulo esploriamo l’acquisizione GPU zero-copy e la codifica hardware.',
      pt: 'Bem-vindo ao KBT_AppGuideVideo. Neste módulo, exploramos a captura de GPU sem cópia e a codificação por hardware.',
      id: 'Selamat datang di KBT_AppGuideVideo. Dalam modul ini, kita mempelajari tangkapan GPU zero-copy dan pengkodean perangkat keras.',
      sw: 'Karibu kwenye KBT_AppGuideVideo. Katika moduli hii, tunachunguza unukuzi wa GPU wa nakala sifuri na uwekaji usimbaji wa maunzi.',
      tr: 'KBT_AppGuideVideo platformuna hoş geldiniz. Bu modülde, sıfır kopyalı GPU yakalama ve donanım kodlamasını inceliyoruz.',
      ru: 'Добро пожаловать в KBT_AppGuideVideo. В этом модуле мы изучаем прямой захват GPU VRAM без копирования и аппаратное кодирование.',
      zh: '欢迎来到 KBT_AppGuideVideo。在本模块中，我们将深入探索底层零拷贝 GPU 捕获与硬件编码架构。',
      ja: 'KBT_AppGuideVideo へようこそ。このモジュールでは、低レイヤのGPUゼロコピー取得とハードウェアエンコードを探求します。',
      ar: 'مرحبًا بك في KBT_AppGuideVideo. في هذه الوحدة، نستكشف الالتقاط المباشر لذاكرة GPU والتشفير العتادي.',
      ur: 'KBT_AppGuideVideo میں خوش آمدید۔ اس ماڈیول میں ہم بغیر کاپی کے براہ راست GPU کیپچر اور ہارڈویئر انکوڈنگ کا مطالعہ کرتے ہیں۔',
      hi: 'KBT_AppGuideVideo में आपका स्वागत है। इस मॉड्यूल में हम लो-लेवल जीरो-कॉपी जीपीयू कैप्चर और हार्डवेयर एन्कोडिंग का अध्ययन करेंगे।',
      vi: 'Chào mừng bạn đến với KBT_AppGuideVideo. Trong bài học này, chúng ta sẽ tìm hiểu về kỹ thuật chụp GPU không sao chép và mã hóa phần cứng.',
      ko: 'KBT_AppGuideVideo에 오신 것을 환영합니다. 본 모듈에서는 저수준 제로 카피 GPU 캡처와 하드웨어 인코딩을 다룹니다.',
      fa: 'به KBT_AppGuideVideo خوش آمدید. در این بخش، ضبط مستقیم از حافظه گرافیکی GPU بدون کپی و رمزگذاری سخت‌افزاری را بررسی می‌کنیم.',
      mr: 'KBT_AppGuideVideo मध्ये आपले स्वागत आहे. या मॉड्युलमध्ये आपण झिरो-कॉपी GPU कॅप्चर आणि हार्डवेअर एन्कोडिंगचा अभ्यास करू.',
      bn: 'KBT_AppGuideVideo-তে স্বাগতম। এই মডিউলে আমরা লো-লেভেল জিরো-কপি GPU ক্যাপচার এবং হার্ডওয়্যার এনকোডিং নিয়ে আলোচনা করব।',
      ta: 'KBT_AppGuideVideo-விற்கு நல்வரவு. இந்த பாடப்பகுதியில் பூஜ்ஜிய நகல் GPU பிடிப்பு மற்றும் வன்பொருள் குறியாக்கத்தை கற்கிறோம்.',
      te: 'KBT_AppGuideVideo కి స్వాగతం. ఈ మాడ్యూల్‌లో మనం లో-లెవల్ జీరో-కాపీ GPU క్యాప్చర్ మరియు హార్డ్‌వేర్ ఎన్‌కోడింగ్‌ని పరిశీలిస్తాము.',
    },
  },
  {
    id: 'cue_2',
    startTime: 4.5,
    endTime: 8.5,
    speaker: 'Instructor',
    text: 'Notice how the SIMD AVX2 vector transformation converts BGRA pixels into NV12 planar color space at over 200 frames per second.',
    translations: {
      en: 'Notice how the SIMD AVX2 vector transformation converts BGRA pixels into NV12 planar color space at over 200 frames per second.',
      fr: 'Remarquez comment la transformation vectorielle SIMD AVX2 convertit les pixels BGRA en espace NV12 à plus de 200 images par seconde.',
      de: 'Beachten Sie, wie die SIMD AVX2-Vektortransformation BGRA-Pixel mit über 200 Bildern pro Sekunde in den NV12-Farbraum umwandelt.',
      es: 'Observe cómo la transformación vectorial SIMD AVX2 convierte los píxeles BGRA en el espacio de color planar NV12 a más de 200 fotogramas por segundo.',
      it: 'Notate come la trasformazione vettoriale SIMD AVX2 converte i pixel BGRA nello spazio colore NV12 a oltre 200 fotogrammi al secondo.',
      pt: 'Observe como a transformação vetorial SIMD AVX2 converte pixels BGRA no espaço planar NV12 a mais de 200 quadros por segundo.',
      id: 'Perhatikan bagaimana transformasi vektor SIMD AVX2 mengubah piksel BGRA menjadi ruang warna planar NV12 dengan kecepatan lebih dari 200 bingkai per detik.',
      sw: 'Tazama jinsi mabadiliko ya vekta ya SIMD AVX2 yanavyobadilisha pikseli za BGRA kuwa nafasi ya rangi ya NV12 kwa zaidi ya fremu 200 kwa sekunde.',
      tr: 'SIMD AVX2 vektör dönüşümünün BGRA piksellerini saniyede 200 kareden fazla hızla NV12 renk uzayına nasıl dönüştürdüğüne dikkat edin.',
      ru: 'Обратите внимание, как векторное SIMD AVX2 преобразование переводит пиксели BGRA в цветовое пространство NV12 со скоростью свыше 200 кадров/с.',
      zh: '请注意 SIMD AVX2 向量变换如何以每秒超过 200 帧的极限吞吐量将 BGRA 像素转换为 NV12 平面色彩空间。',
      ja: 'SIMD AVX2 ベクトル変換が毎秒200フレームを超える速度でBGRAピクセルをNV12平面色空間へ変換する様子をご覧ください。',
      ar: 'لاحظ كيف يحول التحويل الشعاعي SIMD AVX2 بكسلات BGRA إلى فضاء ألوان NV12 بمعدل يتجاوز 200 إطار في الثانية.',
      ur: 'دیکھیں کہ کس طرح SIMD AVX2 ویکٹر ٹرانسفارمیشن 200 فریم فی سیکنڈ سے زیادہ کی رفتار سے BGRA پکسلز کو NV12 میں تبدیل کرتا ہے۔',
      hi: 'ध्यान दें कि कैसे SIMD AVX2 वेक्टर परिवर्तन 200 फ्रेम प्रति सेकंड से अधिक गति से BGRA पिक्सल को NV12 रंग स्थान में बदलता है।',
      vi: 'Hãy quan sát cách phép biến đổi vector SIMD AVX2 chuyển đổi pixel BGRA thành không gian màu phẳng NV12 với tốc độ hơn 200 khung hình/giây.',
      ko: 'SIMD AVX2 벡터 변환이 초당 200프레임 이상의 속도로 BGRA 픽셀을 NV12 평면 색 공간으로 변환하는 과정을 확인하세요.',
      fa: 'توجه کنید که چگونه تبدیل برداری SIMD AVX2 پیکسل‌های BGRA را با سرعتی بیش از ۲۰۰ فریم در ثانیه به فضای رنگی NV12 تبدیل می‌کند.',
      mr: 'पहा कसे SIMD AVX2 व्हेक्टर ट्रान्सफॉर्मेशन २०० पेक्षा जास्त फ्रेम्स प्रति सेकंद वेगाने BGRA पिक्सेलना NV12 मध्ये रूपांतरित करते.',
      bn: 'লক্ষ্য করুন কিভাবে SIMD AVX2 ভেক্টর রূপান্তর প্রতি সেকেন্ডে ২০০-এর বেশি ফ্রেমে BGRA পিক্সেলকে NV12 রঙে রূপান্তর করে।',
      ta: 'SIMD AVX2 திசையன் மாற்றம் வினாடிக்கு 200 பிரேம்களுக்கு மேல் BGRA பிக்சல்களை NV12 வண்ண இடமாக மாற்றுவதைக் கவனியுங்கள்.',
      te: 'SIMD AVX2 వెక్టర్ ట్రాన్స్‌ఫర్మేషన్ సెకనుకు 200 కంటే ఎక్కువ ఫ్రేమ్‌ల వేగంతో BGRA పిక్సెల్‌లను NV12 రంగు ప్రదేశంలోకి ఎలా మారుస్తుందో గమనించండి.',
    },
  },
  {
    id: 'cue_3',
    startTime: 9.0,
    endTime: 13.5,
    speaker: 'Instructor',
    text: 'Finally, the lock-free ring buffer streams chunks to the asynchronous disk sink, preventing any frame stutter during student interaction.',
    translations: {
      en: 'Finally, the lock-free ring buffer streams chunks to the asynchronous disk sink, preventing any frame stutter during student interaction.',
      fr: 'Enfin, le tampon circulaire sans verrou envoie les blocs vers l’enregistreur disque asynchrone, évitant tout saccadement.',
      de: 'Schließlich streamt der sperrenfreie Ringpuffer Blöcke an die asynchrone Festplattensenke, wodurch jedes Ruckeln verhindert wird.',
      es: 'Finalmente, el búfer circular sin bloqueos transmite fragmentos al receptor asíncrono en disco, evitando cualquier tartamudeo de cuadros.',
      it: 'Infine, il ring buffer lock-free trasmette i blocchi al sink asincrono su disco, prevenendo qualsiasi scatto nei fotogrammi.',
      pt: 'Finalmente, o buffer circular sem bloqueios transmite dados para a gravação assíncrona em disco, evitando travamentos.',
      id: 'Akhirnya, ring buffer lock-free mengalirkan potongan data ke penyimpan disk asinkron, mencegah lag selama interaksi.',
      sw: 'Mwishowe, bafa ya pete isiyo na kufuli inatiririsha data kwenye diski bila kukatika wakati wa mwingiliano.',
      tr: 'Son olarak, kilitsiz halka arabelleği parçaları eşzamansız disk alıcısına aktararak kare takılmalarını engeller.',
      ru: 'Наконец, неблокирующий кольцевой буфер передает данные в асинхронный дисковый приемник, исключая любые задержки кадров.',
      zh: '最后，无锁环形缓冲区将视频块异步推入磁盘写入器，彻底杜绝学员交互过程中的任何掉帧和卡顿。',
      ja: '最後に、ロックフリーリングバッファが非同期ディスク書き込みへチャンクを送信し、操作中のフレーム落ちを防ぎます。',
      ar: 'أخيرًا، يقوم المخزن الدائري غير المقفل بتدفق البيانات إلى القرص غير المتزامن لمنع أي تقطيع أثناء التفاعل.',
      ur: 'آخر میں، لاک فری رنگ بفر ڈیٹا کو غیر متضاد ڈسک میں بھیجتا ہے، جس سے فریم کے اٹکنے کا کوئی امکان نہیں رہتا۔',
      hi: 'अंत में, लॉक-फ्री रिंग बफर अतुल्यकालिक डिस्क सिंक में डेटा स्ट्रीम करता है, जिससे फ्रेम अटकने की कोई संभावना नहीं रहती।',
      vi: 'Cuối cùng, bộ đệm vòng không khóa truyền dữ liệu vào ổ đĩa bất đồng bộ, loại bỏ hoàn toàn hiện tượng giật khung hình.',
      ko: '마지막으로 무잠금 링 버퍼가 청크를 비동기 디스크 싱크로 스트리밍하여 학생 조작 중 프레임 끊김을 완벽히 방지합니다.',
      fa: 'در نهایت، بافر حلقوی بدون قفل داده‌ها را به حافظه دیسک ناهمگام منتقل می‌کند تا از افت فریم جلوگیری شود.',
      mr: 'शेवटी, लॉक-फ्री रिंग बफर असिंक्रोनस डिस्क सिंकमध्ये डेटा पाठवतो, ज्यामुळे कोणताही फ्रेम ड्रॉप होत नाही.',
      bn: 'সবশেষে, লক-মুক্ত রিং বাফার অ্যাসিঙ্ক্রোনাস ডিস্ক সিঙ্কে ডেটা পাঠায়, ফলে কোনো ফ্রেম আটকে যাওয়ার ঘটনা ঘটে না।',
      ta: 'இறுதியாக, பூட்டற்ற ரிங் பஃபர் தரவை ஒத்திசைவற்ற வட்டுக்கு அனுப்புகிறது, இதனால் பிரேம் நடுக்கம் முற்றிலும் தடுக்கப்படுகிறது.',
      te: 'చివరగా, లాక్-ఫ్రీ రింగ్ బఫర్ డేటాను అసమకాలిక డిస్క్ సింక్‌కి ప్రసారం చేస్తుంది, ఫ్రేమ్ డ్రాప్‌లను అడ్డుకుంటుంది.',
    },
  },
];

export const INITIAL_SCRIBE_STEPS: ScribeWorkflowStep[] = [
  {
    id: 'step_1',
    stepNumber: 1,
    timestamp: 1.2,
    actionType: 'click',
    targetElement: '#btn-init-vram',
    coordinates: { x: 180, y: 140 },
    title: 'Initialize DXGI Desktop Duplication',
    description: 'Click on the VRAM Capture Engine button to bind directly to DirectX 11 device outputs.',
    codeSnippet: 'dxgi_init_capture(&engine, 0);',
    translations: {
      en: {
        title: 'Initialize DXGI Desktop Duplication',
        description: 'Click on the VRAM Capture Engine button to bind directly to DirectX 11 device outputs.',
      },
      fr: {
        title: 'Initialiser la duplication de bureau DXGI',
        description: 'Cliquez sur le bouton VRAM Capture Engine pour vous lier directement aux sorties DirectX 11.',
      },
      de: {
        title: 'DXGI Desktop-Duplikation initialisieren',
        description: 'Klicken Sie auf VRAM Capture Engine, um sich direkt an DirectX 11-Geräteausgänge zu binden.',
      },
      es: {
        title: 'Inicializar duplicación de escritorio DXGI',
        description: 'Haga clic en VRAM Capture Engine para conectarse directamente a las salidas del dispositivo DirectX 11.',
      },
      it: {
        title: 'Inizializza duplicazione desktop DXGI',
        description: 'Fare clic su VRAM Capture Engine per connettersi direttamente alle uscite del dispositivo DirectX 11.',
      },
      pt: {
        title: 'Inicializar duplicação de desktop DXGI',
        description: 'Clique no botão VRAM Capture Engine para vincular diretamente às saídas DirectX 11.',
      },
      id: {
        title: 'Inisialisasi Duplikasi Desktop DXGI',
        description: 'Klik tombol VRAM Capture Engine untuk terhubung langsung ke output perangkat DirectX 11.',
      },
      sw: {
        title: 'Anzisha Unukuzi wa Skrini wa DXGI',
        description: 'Bofya kitufe cha VRAM Capture Engine ili kuunganisha moja kwa moja na matokeo ya DirectX 11.',
      },
      tr: {
        title: 'DXGI Masaüstü Çoğaltmasını Başlat',
        description: 'Doğrudan DirectX 11 cihaz çıkışlarına bağlanmak için VRAM Capture Engine düğmesine tıklayın.',
      },
      ru: {
        title: 'Инициализировать дублирование экрана DXGI',
        description: 'Нажмите кнопку VRAM Capture Engine для прямого подключения к выходам устройства DirectX 11.',
      },
      zh: {
        title: '初始化 DXGI 桌面复制引擎',
        description: '点击 VRAM Capture Engine 按钮直接绑定到 DirectX 11 硬件输出表面。',
      },
      ja: {
        title: 'DXGI デスクトップ複製を初期化',
        description: 'DirectX 11 デバイス出力に直接バインドするため、VRAM Capture Engine ボタンをクリックします。',
      },
      ar: {
        title: 'تهيئة تكرار سطح المكتب DXGI',
        description: 'انقر فوق زر VRAM Capture Engine للربط مباشرة بمخرجات جهاز DirectX 11.',
      },
      ur: {
        title: 'DXGI ڈیسک ٹاپ ڈپلیکیشن شروع کریں',
        description: 'DirectX 11 ڈیوائس کے آؤٹ پٹ سے براہ راست منسلک ہونے کے لیے VRAM Capture Engine پر کلک کریں۔',
      },
      hi: {
        title: 'DXGI डेस्कटॉप डुप्लीकेशन प्रारंभ करें',
        description: 'DirectX 11 डिवाइस आउटपुट से सीधे जुड़ने के लिए VRAM Capture Engine बटन पर क्लिक करें।',
      },
      vi: {
        title: 'Khởi tạo Nhân bản Màn hình DXGI',
        description: 'Nhấp vào nút VRAM Capture Engine để liên kết trực tiếp với đầu ra thiết bị DirectX 11.',
      },
      ko: {
        title: 'DXGI 데스크톱 복제 초기화',
        description: 'DirectX 11 디바이스 출력에 직접 바인딩하려면 VRAM Capture Engine 버튼을 클릭합니다.',
      },
      fa: {
        title: 'راه‌اندازی تکثیر دسکتاپ DXGI',
        description: 'برای اتصال مستقیم به خروجی‌های DirectX 11، روی دکمه VRAM Capture Engine کلیک کنید.',
      },
      mr: {
        title: 'DXGI डेस्कटॉप डुप्लिकेशन सुरू करा',
        description: 'DirectX 11 डिव्हाइस आउटपुटशी थेट जोडण्यासाठी VRAM Capture Engine बटणावर क्लिक करा.',
      },
      bn: {
        title: 'DXGI ডেস্কটপ ডুপ্লিকেশন আরম্ভ করুন',
        description: 'DirectX 11 আউটপুটের সাথে সরাসরি যুক্ত হতে VRAM Capture Engine বাটনে ক্লিক করুন।',
      },
      ta: {
        title: 'DXGI டெஸ்க்டாப் நகலெடுப்பை துவக்குங்கள்',
        description: 'DirectX 11 வெளியீடுகளுடன் நேரடியாக இணைக்க VRAM Capture Engine பொத்தானைக் கிளிக் செய்யவும்.',
      },
      te: {
        title: 'DXGI డెస్క్‌టాప్ డూప్లికేషన్‌ను ప్రారంభించండి',
        description: 'DirectX 11 పరికర అవుట్‌పుట్‌లకు నేరుగా బైండ్ చేయడానికి VRAM Capture Engine బటన్‌పై క్లిక్ చేయండి.',
      },
    },
  },
  {
    id: 'step_2',
    stepNumber: 2,
    timestamp: 3.8,
    actionType: 'click',
    targetElement: '#select-simd-mode',
    coordinates: { x: 340, y: 220 },
    title: 'Enable AVX2 256-Bit Color Space Transform',
    description: 'Switch color format from BGRA to NV12 to prepare frames for hardware NVENC encoder ingestion.',
    codeSnippet: 'avx2_bgra_to_nv12_fast(src, yPlane, uvPlane, pixelCount);',
    translations: {
      en: {
        title: 'Enable AVX2 256-Bit Color Space Transform',
        description: 'Switch color format from BGRA to NV12 to prepare frames for hardware NVENC encoder ingestion.',
      },
      fr: {
        title: 'Activer la transformation d’espace colorimétrique AVX2',
        description: 'Basculez le format de BGRA vers NV12 pour préparer l’encodage matériel NVENC.',
      },
      de: {
        title: 'AVX2 256-Bit-Farbraumtransformation aktivieren',
        description: 'Farbformat von BGRA auf NV12 umstellen, um Frames für den Hardware-Encoder vorzubereiten.',
      },
      es: {
        title: 'Habilitar transformación de color AVX2 de 256 bits',
        description: 'Cambie el formato de color de BGRA a NV12 para alimentar el codificador de hardware NVENC.',
      },
      it: {
        title: 'Abilita trasformazione colore AVX2 a 256 bit',
        description: 'Passa da BGRA a NV12 per preparare i fotogrammi per l’encoder hardware NVENC.',
      },
      pt: {
        title: 'Ativar transformação de cor AVX2 de 256 bits',
        description: 'Alterne o formato de BGRA para NV12 para preparar os quadros para o codificador NVENC.',
      },
      id: {
        title: 'Aktifkan Transformasi Warna AVX2 256-Bit',
        description: 'Ubah format warna dari BGRA ke NV12 untuk persiapan encoder perangkat keras NVENC.',
      },
      sw: {
        title: 'Wezesha Mabadiliko ya Rangi ya AVX2 256-Bit',
        description: 'Badilisha muundo wa rangi kutoka BGRA hadi NV12 ili kutayarisha usimbaji wa maunzi.',
      },
      tr: {
        title: 'AVX2 256-Bit Renk Uzayı Dönüşümünü Etkinleştir',
        description: 'Donanım NVENC kodlayıcısına beslemek için renk formatını BGRA dan NV12 ye geçirin.',
      },
      ru: {
        title: 'Включить 256-битное преобразование цветов AVX2',
        description: 'Переключите формат с BGRA на NV12 для подготовки кадров к аппаратному NVENC кодированию.',
      },
      zh: {
        title: '启用 AVX2 256位色彩空间转换',
        description: '将颜色格式由 BGRA 切换至 NV12 平面，为硬件 NVENC 编码器提供最优格式。',
      },
      ja: {
        title: 'AVX2 256ビット色空間変換を有効化',
        description: 'NVENCハードウェアエンコーダ入力用に、カラーフォーマットをBGRAからNV12へ切り替えます。',
      },
      ar: {
        title: 'تفعيل تحويل مساحة الألوان AVX2 بدقة 256 بت',
        description: 'قم بتغيير تنسيق الألوان من BGRA إلى NV12 لإعداد الإطارات للتشفير العتادي NVENC.',
      },
      ur: {
        title: 'AVX2 256-بٹ کلر اسپیس فعال کریں',
        description: 'فریموں کو ہارڈویئر NVENC میں بھیجنے کے لیے BGRA کو NV12 میں تبدیل کریں۔',
      },
      hi: {
        title: 'AVX2 256-बिट कलर स्पेस ट्रांसफॉर्म सक्षम करें',
        description: 'हार्डवेयर NVENC एनकोडर के लिए फ्रेम तैयार करने हेतु प्रारूप को BGRA से NV12 में बदलें।',
      },
      vi: {
        title: 'Bật chuyển đổi không gian màu AVX2 256-Bit',
        description: 'Chuyển định dạng từ BGRA sang NV12 để chuẩn bị dữ liệu cho bộ mã hóa phần cứng NVENC.',
      },
      ko: {
        title: 'AVX2 256비트 색 공간 변환 활성화',
        description: '하드웨어 NVENC 인코더 입력을 위해 색상 포맷을 BGRA에서 NV12로 전환합니다.',
      },
      fa: {
        title: 'فعال‌سازی تبدیل فضای رنگی ۲۵۶ بیتی AVX2',
        description: 'تغییر فرمت رنگ از BGRA به NV12 برای آماده‌سازی فریم‌ها جهت رمزگذاری سخت‌افزاری NVENC.',
      },
      mr: {
        title: 'AVX2 २५६-बिट कलर स्पेस ट्रान्सफॉर्म सक्षम करा',
        description: 'हार्डवेअर NVENC साठी फ्रेम्स तयार करण्यासाठी फॉरमॅट BGRA वरून NV12 मध्ये बदला.',
      },
      bn: {
        title: 'AVX2 ২৫৬-বিট কালার স্পেস ট্রান্সফর্ম সক্ষম করুন',
        description: 'হার্ডওয়্যার NVENC এনকোডারের জন্য ফ্রেম প্রস্তুত করতে ফরম্যাট BGRA থেকে NV12-এ পরিবর্তন করুন।',
      },
      ta: {
        title: 'AVX2 256-பிட் வண்ண மாற்றத்தை இயக்குங்கள்',
        description: 'வன்பொருள் NVENC குறியாக்கிக்காக வண்ண வடிவமைப்பை BGRA விலிருந்து NV12 ஆக மாற்றவும்.',
      },
      te: {
        title: 'AVX2 256-బిట్ కలర్ స్పేస్ ట్రాన్స్‌ఫార్మ్‌ను ప్రారంభించండి',
        description: 'హార్డ్‌వేర్ NVENC ఎన్‌కోడర్ కోసం ఫ్రేమ్‌లను సిద్ధం చేయడానికి రంగు ఆకృతిని BGRA నుండి NV12కి మార్చండి.',
      },
    },
  },
  {
    id: 'step_3',
    stepNumber: 3,
    timestamp: 6.5,
    actionType: 'click',
    targetElement: '#btn-export-mp4',
    coordinates: { x: 520, y: 310 },
    title: 'Mux Production MP4 with AAC Sound',
    description: 'Finalize container muxing with h.264 profile, AAC stereo audio track, and embedded softsubs.',
    codeSnippet: 'muxer.EncodeFrame(yPlane, uvPlane);',
    translations: {
      en: {
        title: 'Mux Production MP4 with AAC Sound',
        description: 'Finalize container muxing with h.264 profile, AAC stereo audio track, and embedded softsubs.',
      },
      fr: {
        title: 'Multiplexer le fichier MP4 avec son AAC',
        description: 'Finalisez le conteneur MP4 avec profil h.264, piste audio AAC et sous-titres intégrés.',
      },
      de: {
        title: 'MP4 mit AAC-Ton muxen',
        description: 'Container mit H.264-Profil, AAC-Stereo-Audiotrack und eingebetteten Softsubs finalisieren.',
      },
      es: {
        title: 'Multiplexar MP4 con sonido AAC',
        description: 'Finalice el contenedor MP4 con perfil h.264, pista de audio AAC y subtítulos incrustados.',
      },
      it: {
        title: 'Multiplexa MP4 di produzione con audio AAC',
        description: 'Finalizza il contenitore con profilo h.264, traccia stereo AAC e softsub incorporati.',
      },
      pt: {
        title: 'Multiplexar MP4 com som AAC',
        description: 'Finalize o arquivo MP4 com perfil h.264, áudio estéreo AAC e legendas integradas.',
      },
      id: {
        title: 'Muxing MP4 Produksi dengan Suara AAC',
        description: 'Selesaikan penggabungan wadah MP4 dengan profil h.264, trek audio stereo AAC, dan subtitle.',
      },
      sw: {
        title: 'Changanya MP4 na Sauti ya AAC',
        description: 'Kamilisha muundo wa MP4 na wasifu wa h.264, sauti ya AAC, na manukuu yaliyoingizwa.',
      },
      tr: {
        title: 'AAC Sesli Üretim MP4 Dosyasını Çoğulla',
        description: 'H.264 profili, AAC stereo ses parçası ve gömülü altyazılarla MP4 kapsayıcısını sonlandırın.',
      },
      ru: {
        title: 'Мультиплексировать MP4 со звуком AAC',
        description: 'Завершите создание контейнера с профилем h.264, аудиодорожкой AAC и встроенными субтитрами.',
      },
      zh: {
        title: '封装生产级 MP4 容器并混音 AAC 立体声',
        description: '完成 h.264 视频流、AAC 立体声音轨与时间轴软字幕的最终合成封装。',
      },
      ja: {
        title: 'AAC音声付きプロダクションMP4を多重化',
        description: 'h.264プロファイル、AACステレオ音声トラック、字幕トラックをMP4コンテナに最終出力します。',
      },
      ar: {
        title: 'دمج فيديو MP4 النهائي مع صوت AAC',
        description: 'إنهاء دمج الحاوية مع ملف h.264 ومسار صوت AAC ستريو وترجمة مدمجة.',
      },
      ur: {
        title: 'AAC ساؤنڈ کے ساتھ پروڈکشن MP4 تیار کریں',
        description: 'H.264 پروفائل، AAC آڈیو ٹریک اور سب ٹائٹلز کے ساتھ فائل مکمل کریں۔',
      },
      hi: {
        title: 'AAC ध्वनि के साथ प्रोडक्शन MP4 मक्स करें',
        description: 'h.264 प्रोफाइल, AAC स्टीरियो ऑडियो और सॉफ्टसब्स के साथ MP4 फ़ाइल को अंतिम रूप दें।',
      },
      vi: {
        title: 'Đóng gói MP4 với Âm thanh AAC',
        description: 'Hoàn tất đóng gói vùng chứa với cấu hình h.264, âm thanh stereo AAC và phụ đề nhúng.',
      },
      ko: {
        title: 'AAC 오디오와 함께 프로덕션 MP4 다중화',
        description: 'h.264 프로파일, AAC 스테레오 오디오 트랙 및 소프트 자막이 포함된 MP4 컨테이너 생성을 완료합니다.',
      },
      fa: {
        title: 'میکس نهایی فایل MP4 با صدای AAC',
        description: 'نهایی‌سازی بسته ویدیویی با پروفایل h.264، صدای استریو AAC و زیرنویس‌های هماهنگ.',
      },
      mr: {
        title: 'AAC ऑडिओसह प्रॉडक्शन MP4 मक्स करा',
        description: 'h.264 प्रोफाइल, AAC ऑडिओ आणि सॉफ्टसब्ससह कंटेनर अंतिम करा.',
      },
      bn: {
        title: 'AAC অডিও সহ প্রোডাকশন MP4 তৈরি করুন',
        description: 'h.264 প্রোফাইল, AAC স্টেরিও ট্র্যাক এবং সাবটাইটেল সহ কন্টেইনার সম্পূর্ণ করুন।',
      },
      ta: {
        title: 'AAC ஒலியுடன் தயாரிப்பு MP4 ஐ முடிக்கவும்',
        description: 'h.264 சுயவிவரம், AAC ஸ்டீரியோ ஒலி மற்றும் வசனங்களுடன் MP4 கோப்பை இறுதி செய்யவும்.',
      },
      te: {
        title: 'AAC సౌండ్‌తో ప్రొడక్షన్ MP4ని మక్స్ చేయండి',
        description: 'h.264 ప్రొఫైల్, AAC స్టీరియో ఆడియో మరియు ఉపశీర్షికలతో MP4 కంటైనర్‌ను పూర్తి చేయండి.',
      },
    },
  },
];
