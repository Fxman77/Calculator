document.addEventListener('DOMContentLoaded', () => {
    // State
    let displayValue = "0";
    let fullExpression = "";
    let isNewInput = true;
    let history = [];
    let memoryValue = 0;
    let isUserPro = localStorage.getItem('isUserPro') === 'true';

    // ADMOB DUAL BUILD CONFIGURATION (AUTOMATIC ENVIRONMENT DETECTION + TOGGLE)
    // Closed testing uses official Google Test Ad ID to prevent account suspension.
    // Pass ?prod=true in URL or set IS_TEST_BUILD = false for live production release.
    const IS_TEST_BUILD = true;
    const forceProduction = window.location.search.includes('prod=true');
    const useTestAds = IS_TEST_BUILD && !forceProduction;

    const AD_CONFIG = useTestAds ? {
        client: "ca-app-pub-3940256099942544",
        slot: "6300978111"
    } : {
        client: "ca-app-pub-2910631304019617",
        slot: "1729963728"
    };

    // HAPTIC FEEDBACK
    function triggerHaptic() {
        if ("vibrate" in navigator) {
            try {
                navigator.vibrate(10);
            } catch (e) {}
        }
    }

    // 12 TOP WORLD LANGUAGES TRANSLATIONS DICTIONARY
    const TRANSLATIONS = {
        uz: {
            calcTab: "🧮 Kalkulyator",
            converterTab: "📏 Birliklar",
            historyTitle: "Hisob-kitoblar Tarixi",
            historyClear: "Tozalash",
            emptyHistory: "Hali hisoblashlar mavjud emas",
            scientificMode: "Ilmiy Rejim",
            standardMode: "Oddiy Rejim",
            categoryLabel: "Kategoriya:",
            themeLight: "☀️ Ochiq",
            themeDark: "🌙 To'q",
            themeGold: "👑 Oltin",
            themeCyber: "🔮 Kiber",
            proTitle: "Calculator PRO",
            proSubtitle: "Barcha imkoniyatlarni cheklovlarsiz oching!",
            proAdFree: "100% Reklamasiz",
            proThemes: "Eksklyuziv Pro Mavzular",
            proBackup: "Zahiraviy Nusxalash",
            proPriority: "Cheksiz Convertor",
            proBuyBtn: "⭐ PRO versiyani faollashtirish ($0.99)",
            proRestore: "Xaridni tiklash",
            categories: {
                length: "📏 Uzunlik",
                weight: "⚖️ Massa / Og'irlik",
                temp: "🌡️ Harorat",
                area: "📐 Maydon",
                volume: "🧪 Hajm",
                speed: "🚀 Tezlik",
                data: "💾 Ma'lumot",
                currency: "💱 Valyuta (Pul)"
            },
            errZeroDiv: "Nolga bo'lish mumkin emas",
            errNegSqrt: "Manfiy son ildizi mavjud emas",
            errNegLn: "Manfiy son logarifmi mavjud emas",
            errUndefined: "Aniqlanmagan",
            errMath: "Matematik xato"
        },
        en: {
            calcTab: "🧮 Calculator",
            converterTab: "📏 Converter",
            historyTitle: "Calculation History",
            historyClear: "Clear All",
            emptyHistory: "No calculations yet",
            scientificMode: "Scientific",
            standardMode: "Standard",
            categoryLabel: "Category:",
            themeLight: "☀️ Light",
            themeDark: "🌙 Dark",
            themeGold: "👑 Gold",
            themeCyber: "🔮 Cyber",
            proTitle: "Calculator PRO",
            proSubtitle: "Unlock all features without limits!",
            proAdFree: "100% Ad-Free Experience",
            proThemes: "Exclusive Pro Themes",
            proBackup: "Data Backup & Restore",
            proPriority: "Unlimited Conversion",
            proBuyBtn: "⭐ Activate PRO Version ($0.99)",
            proRestore: "Restore Purchase",
            categories: {
                length: "📏 Length",
                weight: "⚖️ Mass / Weight",
                temp: "🌡️ Temperature",
                area: "📐 Area",
                volume: "🧪 Volume",
                speed: "🚀 Speed",
                data: "💾 Data Storage",
                currency: "💱 Currency (Money)"
            },
            errZeroDiv: "Cannot divide by zero",
            errNegSqrt: "Negative square root undefined",
            errNegLn: "Negative logarithm undefined",
            errUndefined: "Undefined",
            errMath: "Math Error"
        },
        es: {
            calcTab: "🧮 Calculadora",
            converterTab: "📏 Conversor",
            historyTitle: "Historial de cálculos",
            historyClear: "Limpiar todo",
            emptyHistory: "Sin cálculos aún",
            scientificMode: "Científica",
            standardMode: "Estándar",
            categoryLabel: "Categoría:",
            themeLight: "☀️ Claro",
            themeDark: "🌙 Oscuro",
            themeGold: "👑 Oro",
            themeCyber: "🔮 Ciber",
            proTitle: "Calculadora PRO",
            proSubtitle: "¡Desbloquea todo sin límites!",
            proAdFree: "100% Sin Anuncios",
            proThemes: "Temas Exclusivos Pro",
            proBackup: "Copia de Seguridad",
            proPriority: "Conversor Ilimitado",
            proBuyBtn: "⭐ Activar Versión PRO ($0.99)",
            proRestore: "Restaurar compra",
            categories: {
                length: "📏 Longitud",
                weight: "⚖️ Masa / Peso",
                temp: "🌡️ Temperatura",
                area: "📐 Área",
                volume: "🧪 Volumen",
                speed: "🚀 Velocidad",
                data: "💾 Almacenamiento",
                currency: "💱 Moneda / Divisa"
            },
            errZeroDiv: "No se puede dividir por cero",
            errNegSqrt: "Raíz cuadrada negativa no definida",
            errNegLn: "Logaritmo negativo no definido",
            errUndefined: "Indefinido",
            errMath: "Error matemático"
        },
        pt: {
            calcTab: "🧮 Calculadora",
            converterTab: "📏 Conversor",
            historyTitle: "Histórico de cálculos",
            historyClear: "Limpar tudo",
            emptyHistory: "Nenhum cálculo ainda",
            scientificMode: "Científica",
            standardMode: "Padrão",
            categoryLabel: "Categoria:",
            themeLight: "☀️ Claro",
            themeDark: "🌙 Escuro",
            themeGold: "👑 Ouro",
            themeCyber: "🔮 Cyber",
            proTitle: "Calculadora PRO",
            proSubtitle: "Desbloqueie tudo sem limites!",
            proAdFree: "100% Sem Anúncios",
            proThemes: "Temas Pro Exclusivos",
            proBackup: "Backup de Dados",
            proPriority: "Conversão Ilimitada",
            proBuyBtn: "⭐ Ativar Versão PRO ($0.99)",
            proRestore: "Restaurar compra",
            categories: {
                length: "📏 Comprimento",
                weight: "⚖️ Massa / Peso",
                temp: "🌡️ Temperatura",
                area: "📐 Área",
                volume: "🧪 Volume",
                speed: "🚀 Velocidade",
                data: "💾 Armazenamento",
                currency: "💱 Moeda / Câmbio"
            },
            errZeroDiv: "Não é possível dividir por zero",
            errNegSqrt: "Raiz quadrada negativa não definida",
            errNegLn: "Logaritmo negativo não definido",
            errUndefined: "Indefinido",
            errMath: "Erro matemático"
        },
        ru: {
            calcTab: "🧮 Калькулятор",
            converterTab: "📏 Конвертер",
            historyTitle: "История вычислений",
            historyClear: "Очистить",
            emptyHistory: "История пуста",
            scientificMode: "Инженерный",
            standardMode: "Обычный",
            categoryLabel: "Категория:",
            themeLight: "☀️ Светлая",
            themeDark: "🌙 Тёмная",
            themeGold: "👑 Золотая",
            themeCyber: "🔮 Кибер",
            proTitle: "Калькулятор PRO",
            proSubtitle: "Разблокируйте все функции без ограничений!",
            proAdFree: "100% Без Рекламы",
            proThemes: "Эксклюзивные Pro Темы",
            proBackup: "Резервное Копирование",
            proPriority: "Безлимитный Конвертер",
            proBuyBtn: "⭐ Активировать PRO ($0.99)",
            proRestore: "Восстановить покупку",
            categories: {
                length: "📏 Длина",
                weight: "⚖️ Масса / Вес",
                temp: "🌡️ Температура",
                area: "📐 Площадь",
                volume: "🧪 Объем",
                speed: "🚀 Скорость",
                data: "💾 Данные",
                currency: "💱 Валюта"
            },
            errZeroDiv: "Деление на ноль невозможно",
            errNegSqrt: "Корень из отриц. числа не существует",
            errNegLn: "Логарифм отриц. числа не существует",
            errUndefined: "Не определено",
            errMath: "Ошибка вычислений"
        },
        hi: {
            calcTab: "🧮 कैलकुलेटर",
            converterTab: "📏 कनवर्टर",
            historyTitle: "गणना इतिहास",
            historyClear: "सब साफ़ करें",
            emptyHistory: "अभी कोई गणना नहीं",
            scientificMode: "वैज्ञानिक",
            standardMode: "मानक",
            categoryLabel: "श्रेणी:",
            themeLight: "☀️ हल्का",
            themeDark: "🌙 गहरा",
            themeGold: "👑 गोल्ड",
            themeCyber: "🔮 साइबर",
            proTitle: "कैलक्यूलेटर PRO",
            proSubtitle: "बिना किसी सीमा के सभी सुविधाओं को अनलॉक करें!",
            proAdFree: "100% विज्ञापन-मुक्त अनुभव",
            proThemes: "विशेष प्रो थीम",
            proBackup: "डेटा बैकअप और पुनर्वापसी",
            proPriority: "असीमित रूपांतरण",
            proBuyBtn: "⭐ PRO संस्करण सक्षम करें ($0.99)",
            proRestore: "खरीद पुनर्स्थापित करें",
            categories: {
                length: "📏 लंबाई",
                weight: "⚖️ द्रव्यमान / वजन",
                temp: "🌡️ तापमान",
                area: "📐 क्षेत्रफल",
                volume: "🧪 आयतन",
                speed: "🚀 गति",
                data: "💾 डेटा संग्रहण",
                currency: "💱 मुद्रा (करंसी)"
            },
            errZeroDiv: "शून्य से विभाजन संभव नहीं",
            errNegSqrt: "ऋणात्मक वर्गमूल अपरिभाषित",
            errNegLn: "ऋणात्मक लघुगणक अपरिभाषित",
            errUndefined: "अपरिभाषित",
            errMath: "गणितीय त्रुटि"
        },
        de: {
            calcTab: "🧮 Rechner",
            converterTab: "📏 Konverter",
            historyTitle: "Berechnungsverlauf",
            historyClear: "Alles löschen",
            emptyHistory: "Noch keine Berechnungen",
            scientificMode: "Wissenschaftlich",
            standardMode: "Standard",
            categoryLabel: "Kategorie:",
            themeLight: "☀️ Hell",
            themeDark: "🌙 Dunkel",
            themeGold: "👑 Gold",
            themeCyber: "🔮 Cyber",
            proTitle: "Rechner PRO",
            proSubtitle: "Schalten Sie alle Funktionen ohne Einschränkungen frei!",
            proAdFree: "100% Werbefrei",
            proThemes: "Exklusive Pro-Themes",
            proBackup: "Datensicherung & Wiederherstellung",
            proPriority: "Unbegrenzter Konverter",
            proBuyBtn: "⭐ PRO-Version aktivieren ($0.99)",
            proRestore: "Kauf wiederherstellen",
            categories: {
                length: "📏 Länge",
                weight: "⚖️ Masse / Gewicht",
                temp: "🌡️ Temperatur",
                area: "📐 Fläche",
                volume: "🧪 Volumen",
                speed: "🚀 Geschwindigkeit",
                data: "💾 Datenspeicher",
                currency: "💱 Währung (Geld)"
            },
            errZeroDiv: "Teilen durch Null nicht möglich",
            errNegSqrt: "Negative Quadratwurzel undefiniert",
            errNegLn: "Negativer Logarithmus undefiniert",
            errUndefined: "Undefiniert",
            errMath: "Mathematischer Fehler"
        },
        fr: {
            calcTab: "🧮 Calculatrice",
            converterTab: "📏 Convertisseur",
            historyTitle: "Historique des calculs",
            historyClear: "Effacer tout",
            emptyHistory: "Aucun calcul pour le moment",
            scientificMode: "Scientifique",
            standardMode: "Standard",
            categoryLabel: "Catégorie:",
            themeLight: "☀️ Clair",
            themeDark: "🌙 Sombre",
            themeGold: "👑 Or",
            themeCyber: "🔮 Cyber",
            proTitle: "Calculatrice PRO",
            proSubtitle: "Débloquez toutes les fonctionnalités sans limites!",
            proAdFree: "100% Sans Publicité",
            proThemes: "Thèmes Pro Exclusifs",
            proBackup: "Sauvegarde des Données",
            proPriority: "Convertisseur Illimité",
            proBuyBtn: "⭐ Activer la version PRO ($0.99)",
            proRestore: "Restaurer l'achat",
            categories: {
                length: "📏 Longueur",
                weight: "⚖️ Masse / Poids",
                temp: "🌡️ Température",
                area: "📐 Surface",
                volume: "🧪 Volume",
                speed: "🚀 Vitesse",
                data: "💾 Données",
                currency: "💱 Devise / Monnaie"
            },
            errZeroDiv: "Division par zéro impossible",
            errNegSqrt: "Racine carrée négative non définie",
            errNegLn: "Logarithme négatif non défini",
            errUndefined: "Indéfini",
            errMath: "Erreur mathématique"
        },
        id: {
            calcTab: "🧮 Kalkulator",
            converterTab: "📏 Konverter",
            historyTitle: "Riwayat Perhitungan",
            historyClear: "Hapus Semua",
            emptyHistory: "Belum ada perhitungan",
            scientificMode: "Sains",
            standardMode: "Standar",
            categoryLabel: "Kategori:",
            themeLight: "☀️ Terang",
            themeDark: "🌙 Gelap",
            themeGold: "👑 Emas",
            themeCyber: "🔮 Siber",
            proTitle: "Kalkulator PRO",
            proSubtitle: "Buka semua fitur tanpa batas!",
            proAdFree: "100% Bebas Iklan",
            proThemes: "Tema Pro Eksklusif",
            proBackup: "Cadangkan Data",
            proPriority: "Konverter Tanpa Batas",
            proBuyBtn: "⭐ Aktifkan Versi PRO ($0.99)",
            proRestore: "Pulihkan Pembelian",
            categories: {
                length: "📏 Panjang",
                weight: "⚖️ Massa / Berat",
                temp: "🌡️ Suhu",
                area: "📐 Luas",
                volume: "🧪 Volume",
                speed: "🚀 Kecepatan",
                data: "💾 Penyimpanan Data",
                currency: "💱 Mata Uang"
            },
            errZeroDiv: "Tidak dapat dibagi dengan nol",
            errNegSqrt: "Akar kuadrat negatif tidak terdefinisi",
            errNegLn: "Logaritma negatif tidak terdefinisi",
            errUndefined: "Tidak terdefinisi",
            errMath: "Kesalahan Matematika"
        },
        ar: {
            calcTab: "🧮 حاسبة",
            converterTab: "📏 محول",
            historyTitle: "سجل الحسابات",
            historyClear: "مسح الكل",
            emptyHistory: "لا يوجد حسابات بعد",
            scientificMode: "علمي",
            standardMode: "قياسي",
            categoryLabel: "الفئة:",
            themeLight: "☀️ فاتح",
            themeDark: "🌙 داكن",
            themeGold: "👑 ذهبي",
            themeCyber: "🔮 سايبر",
            proTitle: "الحاسبة PRO",
            proSubtitle: "افتح جميع الميزات بدون حدود!",
            proAdFree: "100% خالي من الإعلانات",
            proThemes: "ثيمات احترافية حصرية",
            proBackup: "نسخ احتياطي للبيانات",
            proPriority: "محول غير محدود",
            proBuyBtn: "⭐ تفعيل الإصدار الاحترافي ($0.99)",
            proRestore: "استعادة الشراء",
            categories: {
                length: "📏 الطول",
                weight: "⚖️ الكتلة / الوزن",
                temp: "🌡️ درجة الحرارة",
                area: "📐 المساحة",
                volume: "🧪 الحجم",
                speed: "🚀 السرعة",
                data: "💾 تخزين البيانات",
                currency: "💱 العملات (المال)"
            },
            errZeroDiv: "لا يمكن القسمة على صفر",
            errNegSqrt: "الجذر التربيعي للسالب غير معرف",
            errNegLn: "اللوغاريتم السالب غير معرف",
            errUndefined: "غير معرف",
            errMath: "خطأ رياضي"
        },
        ja: {
            calcTab: "🧮 電卓",
            converterTab: "📏 単位変換",
            historyTitle: "計算履歴",
            historyClear: "すべて消去",
            emptyHistory: "履歴はまだありません",
            scientificMode: "科学電卓",
            standardMode: "標準",
            categoryLabel: "カテゴリ:",
            themeLight: "☀️ ライト",
            themeDark: "🌙 ダーク",
            themeGold: "👑 ゴールド",
            themeCyber: "🔮 サイバー",
            proTitle: "電卓 PRO",
            proSubtitle: "無制限ですべての機能を解放！",
            proAdFree: "100% 広告なし",
            proThemes: "限定Proテーマ",
            proBackup: "データバックアップ＆復元",
            proPriority: "無制限コンバーター",
            proBuyBtn: "⭐ PRO版を有効化 ($0.99)",
            proRestore: "購入を復元",
            categories: {
                length: "📏 長さ",
                weight: "⚖️ 質量 / 重量",
                temp: "🌡️ 温度",
                area: "📐 面積",
                volume: "🧪 体積",
                speed: "🚀 速度",
                data: "💾 データ容量",
                currency: "💱 通貨・為替"
            },
            errZeroDiv: "0で割ることはできません",
            errNegSqrt: "負の平方根は未定義です",
            errNegLn: "負の対数は未定義です",
            errUndefined: "未定義",
            errMath: "計算エラー"
        },
        ko: {
            calcTab: "🧮 계산기",
            converterTab: "📏 단위 변환",
            historyTitle: "계산 기록",
            historyClear: "모두 지우기",
            emptyHistory: "기록이 없습니다",
            scientificMode: "공학용",
            standardMode: "일반",
            categoryLabel: "카테고리:",
            themeLight: "☀️ 라이트",
            themeDark: "🌙 다크",
            themeGold: "👑 골드",
            themeCyber: "🔮 사이버",
            proTitle: "계산기 PRO",
            proSubtitle: "제한 없이 모든 기능을 잠금 해제하세요!",
            proAdFree: "100% 광고 없음",
            proThemes: "전용 프로 테마",
            proBackup: "데이터 백업 및 복원",
            proPriority: "무제한 변환기",
            proBuyBtn: "⭐ PRO 버전 활성화 ($0.99)",
            proRestore: "구매 복원",
            categories: {
                length: "📏 길이",
                weight: "⚖️ 질량 / 무게",
                temp: "🌡️ 온도",
                area: "📐 넓이",
                volume: "🧪 부피",
                speed: "🚀 속도",
                data: "💾 데이터 용량",
                currency: "💱 통화 (환율)"
            },
            errZeroDiv: "0으로 나눌 수 없습니다",
            errNegSqrt: "음수 제곱근은 정의되지 않음",
            errNegLn: "음수 로그는 정의되지 않음",
            errUndefined: "정의되지 않음",
            errMath: "수학 오류"
        }
    };

    const langSelect = document.getElementById('langSelect');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const proBadgeBtn = document.getElementById('proBadgeBtn');
    const adMobBanner = document.getElementById('adMobBanner');
    const proModal = document.getElementById('proModal');
    const closeProModalBtn = document.getElementById('closeProModalBtn');
    const buyProBtn = document.getElementById('buyProBtn');
    const restorePurchaseBtn = document.getElementById('restorePurchaseBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');

    let currentLang = localStorage.getItem('calcLang') || 'uz';
    let currentTheme = localStorage.getItem('calcTheme') || 'dark';

    // PRO & MONETIZATION MANAGEMENT
    function updateProStatus(proState) {
        isUserPro = proState;
        localStorage.setItem('isUserPro', proState);

        if (isUserPro) {
            proBadgeBtn.textContent = '👑 PRO Active';
            proBadgeBtn.classList.add('active-pro');
            adMobBanner.classList.add('hidden-pro');
        } else {
            proBadgeBtn.textContent = '⭐ PRO';
            proBadgeBtn.classList.remove('active-pro');
            adMobBanner.classList.remove('hidden-pro');
        }
    }

    updateProStatus(isUserPro);

    proBadgeBtn.addEventListener('click', () => {
        triggerHaptic();
        proModal.classList.remove('hidden');
    });

    closeProModalBtn.addEventListener('click', () => {
        triggerHaptic();
        proModal.classList.add('hidden');
    });

    buyProBtn.addEventListener('click', () => {
        triggerHaptic();
        updateProStatus(true);
        proModal.classList.add('hidden');
        alert(currentLang === 'uz' ? "🎉 Calculator PRO versiyasi muvaffaqiyatli faollashtirildi!" : "🎉 Calculator PRO successfully activated!");
    });

    restorePurchaseBtn.addEventListener('click', () => {
        triggerHaptic();
        updateProStatus(true);
        proModal.classList.add('hidden');
        alert(currentLang === 'uz' ? "✅ Xaridingiz muvaffaqiyatli qayta tiklandi!" : "✅ Purchase restored successfully!");
    });

    // THEME SWITCHER
    function updateThemeButtonText() {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        if (document.body.classList.contains('dark-theme')) themeToggleBtn.textContent = t.themeLight;
        else if (document.body.classList.contains('light-theme')) themeToggleBtn.textContent = isUserPro ? t.themeGold : t.themeDark;
        else if (document.body.classList.contains('gold-theme')) themeToggleBtn.textContent = t.themeCyber;
        else themeToggleBtn.textContent = t.themeDark;
    }

    function setTheme(theme) {
        document.body.classList.remove('dark-theme', 'light-theme', 'gold-theme', 'cyberpunk-theme');
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('calcTheme', theme);
        updateThemeButtonText();
    }

    setTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        triggerHaptic();
        if (document.body.classList.contains('dark-theme')) {
            setTheme('light');
        } else if (document.body.classList.contains('light-theme')) {
            if (isUserPro) setTheme('gold');
            else setTheme('dark');
        } else if (document.body.classList.contains('gold-theme')) {
            setTheme('cyberpunk');
        } else {
            setTheme('dark');
        }
    });

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('calcLang', lang);
        langSelect.value = lang;
        const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (key === 'scientificMode') {
                const isSciHidden = scientificKeypad.classList.contains('hidden');
                el.textContent = isSciHidden ? t.scientificMode : t.standardMode;
            } else if (t[key]) {
                el.textContent = t[key];
            }
        });

        updateThemeButtonText();
        populateCategoryOptions();
        renderHistory();
    }

    langSelect.addEventListener('change', (e) => {
        triggerHaptic();
        setLanguage(e.target.value);
    });

    // DATA BACKUP (EXPORT & IMPORT JSON)
    exportDataBtn.addEventListener('click', () => {
        triggerHaptic();
        const backupData = {
            version: "2.1.0",
            timestamp: new Date().toISOString(),
            history: history,
            memoryValue: memoryValue,
            currentTheme: currentTheme,
            currentLang: currentLang,
            isUserPro: isUserPro
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `calculator_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    importDataBtn.addEventListener('click', () => {
        triggerHaptic();
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.history && Array.isArray(imported.history)) {
                    // FIX 2: Sanitize history strings on import to prevent stored XSS
                    history = imported.history.map(item => String(item).replace(/[<>]/g, ''));
                    if (imported.memoryValue) memoryValue = imported.memoryValue;
                    if (imported.currentLang) setLanguage(imported.currentLang);
                    if (imported.currentTheme) setTheme(imported.currentTheme);
                    if (typeof imported.isUserPro === 'boolean') updateProStatus(imported.isUserPro);

                    renderHistory();
                    alert(currentLang === 'uz' ? "✅ Ma'lumotlar muvaffaqiyatli tiklandi!" : "✅ Data restored successfully!");
                } else {
                    alert(currentLang === 'uz' ? "❌ Noto'g'ri fayl formati!" : "❌ Invalid backup file format!");
                }
            } catch (err) {
                alert(currentLang === 'uz' ? "❌ Faylni o'qishda xatolik!" : "❌ Error reading backup file!");
            }
        };
        reader.readAsText(file);
    });

    // Elements
    const mainDisplay = document.getElementById('mainDisplay');
    const equationDisplay = document.getElementById('equationDisplay');
    const historyPanel = document.getElementById('historyOverlay');
    const historyList = document.getElementById('historyList');
    const scientificKeypad = document.getElementById('scientificKeypad');
    const toggleModeBtn = document.getElementById('toggleModeBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Section & Tab Elements
    const calcTabBtn = document.getElementById('calcTabBtn');
    const converterTabBtn = document.getElementById('converterTabBtn');
    const calculatorSection = document.getElementById('calculatorSection');
    const converterSection = document.getElementById('converterSection');

    // Memory Buttons
    const memClearBtn = document.getElementById('memClear');
    const memRecallBtn = document.getElementById('memRecall');
    const memAddBtn = document.getElementById('memAdd');
    const memSubBtn = document.getElementById('memSub');

    // Converter Elements
    const categorySelect = document.getElementById('categorySelect');
    const fromUnitSelect = document.getElementById('fromUnitSelect');
    const toUnitSelect = document.getElementById('toUnitSelect');
    const convertInput = document.getElementById('convertInput');
    const convertOutput = document.getElementById('convertOutput');
    const swapUnitsBtn = document.getElementById('swapUnitsBtn');


    // LIVE CURRENCY EXCHANGE RATES (CBU / ER API + Offline Cache)
    let liveCurrencyRates = {
        'UZS': 1,
        'USD': 12850,
        'EUR': 13950,
        'RUB': 142,
        'GBP': 16300,
        'CNY': 1780,
        'KZT': 26.5,
        'TRY': 375,
        'AED': 3495,
        'SAR': 3420,
        'KRW': 9.6
    };
    let currencyLastUpdatedText = "";
    let isCurrencyOnline = false;

    // Load cached rates from localStorage if available
    try {
        const cachedRates = localStorage.getItem('calc_currency_rates');
        const cachedTime = localStorage.getItem('calc_currency_time');
        if (cachedRates) {
            liveCurrencyRates = Object.assign(liveCurrencyRates, JSON.parse(cachedRates));
            if (cachedTime) currencyLastUpdatedText = cachedTime;
        }
    } catch(e) {}

    async function fetchLiveCurrencyRates() {
        const currencyStatusDot = document.getElementById('currencyStatusDot');
        const currencyLastUpdated = document.getElementById('currencyLastUpdated');

        if (currencyLastUpdated) {
            currencyLastUpdated.textContent = currentLang === 'uz' ? "🔄 Kurslar yuklanmoqda..." : "🔄 Updating rates...";
        }

        try {
            // Primary: Central Bank of Uzbekistan (CBU) JSON API
            const resp = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', { cache: 'no-cache' });
            if (!resp.ok) throw new Error("CBU HTTP error " + resp.status);
            const data = await resp.json();

            if (Array.isArray(data)) {
                data.forEach(item => {
                    const code = item.Ccy;
                    const rate = parseFloat(item.Rate);
                    if (code && !isNaN(rate) && rate > 0) {
                        liveCurrencyRates[code] = rate;
                    }
                });

                liveCurrencyRates['UZS'] = 1;
                const today = new Date();
                const timeStr = today.toLocaleDateString() + ' ' + today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                currencyLastUpdatedText = timeStr;
                isCurrencyOnline = true;

                localStorage.setItem('calc_currency_rates', JSON.stringify(liveCurrencyRates));
                localStorage.setItem('calc_currency_time', timeStr);

                if (currencyStatusDot) currencyStatusDot.className = 'status-dot online';
                if (currencyLastUpdated) {
                    currencyLastUpdated.textContent = currentLang === 'uz' ? `🟢 Jonli kurs (MB) • ${timeStr}` : `🟢 Live Rate (CBU) • ${timeStr}`;
                }
                performConversion();
                return;
            }
        } catch(e) {
            console.log("CBU API fetch failed, trying secondary fallback...", e);
        }

        try {
            // Secondary Fallback API: open.er-api.com
            const resp = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-cache' });
            if (!resp.ok) throw new Error("ER-API HTTP error " + resp.status);
            const data = await resp.json();

            if (data && data.rates && data.rates['UZS']) {
                const uzsPerUsd = data.rates['UZS'];
                Object.keys(data.rates).forEach(code => {
                    const usdPerCode = data.rates[code];
                    if (usdPerCode > 0) {
                        liveCurrencyRates[code] = uzsPerUsd / usdPerCode;
                    }
                });

                liveCurrencyRates['UZS'] = 1;
                const today = new Date();
                const timeStr = today.toLocaleDateString() + ' ' + today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                currencyLastUpdatedText = timeStr;
                isCurrencyOnline = true;

                localStorage.setItem('calc_currency_rates', JSON.stringify(liveCurrencyRates));
                localStorage.setItem('calc_currency_time', timeStr);

                if (currencyStatusDot) currencyStatusDot.className = 'status-dot online';
                if (currencyLastUpdated) {
                    currencyLastUpdated.textContent = currentLang === 'uz' ? `🟢 Jonli kurs • ${timeStr}` : `🟢 Live Rate • ${timeStr}`;
                }
                performConversion();
                return;
            }
        } catch(err) {
            console.log("Secondary currency API failed, using cached/offline rates.", err);
        }

        // Offline / Failure fallback
        isCurrencyOnline = false;
        if (currencyStatusDot) currencyStatusDot.className = 'status-dot offline';
        if (currencyLastUpdated) {
            const label = currentLang === 'uz' ? "🌐 Saqlangan (Oflayn) kurs" : "🌐 Cached (Offline) rate";
            currencyLastUpdated.textContent = `${label} ${currencyLastUpdatedText ? '(' + currencyLastUpdatedText + ')' : ''}`;
        }
        performConversion();
    }

    // CONVERSION DATABASE (FIX 4: Corrected 'm3' name to 'Kub metr (m³)')
    const CONVERSION_DATA = {
        length: {
            units: {
                'm': { name: 'Metr (m)', factor: 1 },
                'km': { name: 'Kilometr (km)', factor: 1000 },
                'cm': { name: 'Santimetr (cm)', factor: 0.01 },
                'mm': { name: 'Millimetr (mm)', factor: 0.001 },
                'in': { name: 'Dyuym (inch)', factor: 0.0254 },
                'ft': { name: 'Fut (feet)', factor: 0.3048 },
                'mi': { name: 'Mil (mile)', factor: 1609.344 }
            }
        },
        weight: {
            units: {
                'kg': { name: 'Kilogramm (kg)', factor: 1 },
                'g': { name: 'Gramm (g)', factor: 0.001 },
                'mg': { name: 'Milligramm (mg)', factor: 0.000001 },
                't': { name: 'Tonna (t)', factor: 1000 },
                'lb': { name: 'Funt (lb)', factor: 0.45359237 },
                'oz': { name: 'Unsiya (oz)', factor: 0.02834952 }
            }
        },
        temp: {
            special: true,
            units: {
                'C': { name: 'Selsiy (°C)' },
                'F': { name: 'Farengeyt (°F)' },
                'K': { name: 'Kelvin (K)' }
            }
        },
        area: {
            units: {
                'm2': { name: 'Kvadrat metr (m²)', factor: 1 },
                'km2': { name: 'Kvadrat km (km²)', factor: 1000000 },
                'ha': { name: 'Gektar (ha)', factor: 10000 },
                'ft2': { name: 'Kvadrat fut (ft²)', factor: 0.09290304 },
                'acre': { name: 'Akr (acre)', factor: 4046.85642 }
            }
        },
        volume: {
            units: {
                'L': { name: 'Litr (L)', factor: 1 },
                'mL': { name: 'Millilitr (mL)', factor: 0.001 },
                'm3': { name: 'Kub metr (m³)', factor: 1000 }, // FIX 4: Corrected from 'Kvadrat metr'
                'gal': { name: 'Gallon (US)', factor: 3.78541178 },
                'cup': { name: 'Stakan / US Cup (236.59 mL)', factor: 0.236588 }
            }
        },
        speed: {
            units: {
                'kmh': { name: 'km/soat (km/h)', factor: 1 },
                'ms': { name: 'm/s (m/s)', factor: 3.6 },
                'mph': { name: 'mil/soat (mph)', factor: 1.609344 }
            }
        },
        data: {
            units: {
                'B': { name: 'Bayt (B)', factor: 1 },
                'KB': { name: 'Kilobayt (KB)', factor: 1024 },
                'MB': { name: 'Megabayt (MB)', factor: 1048576 },
                'GB': { name: 'Gigabayt (GB)', factor: 1073741824 },
                'TB': { name: 'Terabayt (TB)', factor: 1099511627776 }
            }
        },
        currency: {
            specialCurrency: true,
            units: {
                'UZS': { name: "O'zbek so'mi (UZS)", symbol: "so'm" },
                'USD': { name: "AQSh dollari (USD)", symbol: "$" },
                'EUR': { name: "Yevro (EUR)", symbol: "€" },
                'RUB': { name: "Rossiya rubli (RUB)", symbol: "₽" },
                'GBP': { name: "Angliya funti (GBP)", symbol: "£" },
                'CNY': { name: "Xitoy yuani (CNY)", symbol: "¥" },
                'KZT': { name: "Qozog'iston tengesi (KZT)", symbol: "₸" },
                'TRY': { name: "Turkiya lirasi (TRY)", symbol: "₺" },
                'AED': { name: "BAA dirhami (AED)", symbol: "AED" },
                'SAR': { name: "Saudiya riyoli (SAR)", symbol: "SAR" },
                'KRW': { name: "Janubiy Koreya voni (KRW)", symbol: "₩" }
            }
        }
    };

    function populateCategoryOptions() {
        const selectedVal = categorySelect.value || 'length';
        const tCats = (TRANSLATIONS[currentLang] || TRANSLATIONS.en).categories;

        categorySelect.innerHTML = `
            <option value="length">${tCats.length}</option>
            <option value="weight">${tCats.weight}</option>
            <option value="temp">${tCats.temp}</option>
            <option value="area">${tCats.area}</option>
            <option value="volume">${tCats.volume}</option>
            <option value="speed">${tCats.speed}</option>
            <option value="data">${tCats.data}</option>
            <option value="currency">${tCats.currency}</option>
        `;
        categorySelect.value = selectedVal;
        initConverterCategory();
    }

    calcTabBtn.addEventListener('click', () => {
        triggerHaptic();
        calcTabBtn.classList.add('active');
        converterTabBtn.classList.remove('active');
        calculatorSection.classList.remove('hidden');
        converterSection.classList.add('hidden');
    });

    converterTabBtn.addEventListener('click', () => {
        triggerHaptic();
        converterTabBtn.classList.add('active');
        calcTabBtn.classList.remove('active');
        converterSection.classList.remove('hidden');
        calculatorSection.classList.add('hidden');
        initConverterCategory();
    });

    function initConverterCategory() {
        const catKey = categorySelect.value;
        const catData = CONVERSION_DATA[catKey];
        const currencyRateInfo = document.getElementById('currencyRateInfo');

        if (catKey === 'currency') {
            if (currencyRateInfo) currencyRateInfo.classList.remove('hidden');
            fetchLiveCurrencyRates();
        } else {
            if (currencyRateInfo) currencyRateInfo.classList.add('hidden');
        }

        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        const unitKeys = Object.keys(catData.units);
        unitKeys.forEach((key) => {
            const unit = catData.units[key];
            fromUnitSelect.innerHTML += `<option value="${key}">${unit.name}</option>`;
            toUnitSelect.innerHTML += `<option value="${key}">${unit.name}</option>`;
        });

        if (unitKeys.length > 1) {
            toUnitSelect.selectedIndex = 1;
        }

        performConversion();
    }

    function performConversion() {
        const valStr = convertInput.value.replace(/\s+/g, '');
        const val = parseFloat(valStr);
        if (isNaN(val)) {
            convertOutput.value = "0";
            return;
        }

        const catKey = categorySelect.value;
        const catData = CONVERSION_DATA[catKey];
        const fromKey = fromUnitSelect.value;
        const toKey = toUnitSelect.value;

        if (fromKey === toKey) {
            convertOutput.value = formatNumber(val.toString());
            return;
        }

        let result = 0;

        if (catData.special && catKey === 'temp') {
            let celsius = val;
            if (fromKey === 'F') celsius = (val - 32) * 5 / 9;
            else if (fromKey === 'K') celsius = val - 273.15;

            if (toKey === 'C') result = celsius;
            else if (toKey === 'F') result = (celsius * 9 / 5) + 32;
            else if (toKey === 'K') result = celsius + 273.15;
        } else if (catData.specialCurrency && catKey === 'currency') {
            const fromRate = liveCurrencyRates[fromKey] || 1;
            const toRate = liveCurrencyRates[toKey] || 1;
            const baseValueInUZS = val * fromRate;
            result = baseValueInUZS / toRate;
        } else {
            const fromFactor = catData.units[fromKey].factor;
            const toFactor = catData.units[toKey].factor;
            const baseValue = val * fromFactor;
            result = baseValue / toFactor;
        }

        let resStr = formatResult(result);
        convertOutput.value = formatNumber(resStr);
    }

    categorySelect.addEventListener('change', () => {
        triggerHaptic();
        initConverterCategory();
    });

    fromUnitSelect.addEventListener('change', () => {
        triggerHaptic();
        performConversion();
    });

    toUnitSelect.addEventListener('change', () => {
        triggerHaptic();
        performConversion();
    });

    convertInput.addEventListener('input', performConversion);

    const refreshRatesBtn = document.getElementById('refreshRatesBtn');
    if (refreshRatesBtn) {
        refreshRatesBtn.addEventListener('click', () => {
            triggerHaptic();
            fetchLiveCurrencyRates();
        });
    }

    swapUnitsBtn.addEventListener('click', () => {
        triggerHaptic();
        const temp = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = temp;
        performConversion();
    });

    document.querySelectorAll('.conv-key').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            const key = btn.dataset.key;
            if (key === 'CLR') {
                convertInput.value = '0';
            } else if (key === 'DEL') {
                convertInput.value = convertInput.value.length > 1 ? convertInput.value.slice(0, -1) : '0';
            } else if (key === '.') {
                if (!convertInput.value.includes('.')) convertInput.value += '.';
            } else {
                if (convertInput.value === '0') convertInput.value = key;
                else convertInput.value += key;
            }
            performConversion();
        });
    });

    function formatNumber(numStr) {
        if (!numStr || typeof numStr !== 'string') return numStr;
        if (numStr === "Xato" || isErrorState(numStr)) {
            return numStr;
        }

        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        const isNegative = integerPart.startsWith('-');
        if (isNegative) integerPart = integerPart.slice(1);

        const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return (isNegative ? '-' : '') + formattedInt + decimalPart;
    }

    function parseFormattedNumber(formattedStr) {
        if (typeof formattedStr === 'number') return formattedStr;
        return parseFloat(formattedStr.replace(/\s+/g, ''));
    }

    function updateDisplay() {
        mainDisplay.textContent = formatNumber(displayValue);
        
        const cleanLen = displayValue.replace(/\s+/g, '').length;
        if (cleanLen > 11) {
            mainDisplay.style.fontSize = '2.2rem';
        } else if (cleanLen > 8) {
            mainDisplay.style.fontSize = '2.8rem';
        } else {
            mainDisplay.style.fontSize = '3.4rem';
        }

        if (fullExpression) {
            equationDisplay.textContent = fullExpression;
        } else {
            equationDisplay.textContent = '';
        }
    }

    // FIX 6: ACCURATE FLOATING POINT AND SMALL NUMBER FORMATTING
    function formatResult(value) {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        if (isNaN(value)) return t.errMath;
        if (!isFinite(value)) return t.errZeroDiv;
        if (value === 0) return "0";
        
        let absVal = Math.abs(value);
        if (absVal < 1e-12 && absVal > 0) return "0";

        // Clean float precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
        let num = Number(Math.round(value + 'e12') + 'e-12');
        let str = num.toString();
        
        if (str.includes('e')) {
            return str;
        }

        return str;
    }

    function evaluateExpression(exprStr) {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        try {
            let cleanExpr = exprStr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/\s+/g, '');
            
            if (!/^[0-9+\-*/.()]+$/.test(cleanExpr.replace(/\*\*/g, ''))) {
                return t.errMath;
            }

            let res = Function('"use strict"; return (' + cleanExpr + ')')();
            return res;
        } catch (e) {
            return t.errMath;
        }
    }

    function isErrorState(val) {
        if (!val || typeof val !== 'string') return false;
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        return val === t.errZeroDiv || val === t.errNegSqrt || val === t.errNegLn || val === t.errUndefined || val === t.errMath;
    }

    function onNumberClick(number) {
        triggerHaptic();
        if (isErrorState(displayValue)) {
            displayValue = "0";
            fullExpression = "";
            isNewInput = true;
        }

        if (isNewInput || displayValue === "0") {
            displayValue = number;
            isNewInput = false;
        } else {
            if (displayValue.replace(/\s+/g, '').length < 15) {
                displayValue += number;
            }
        }
        updateDisplay();
    }

    function onDecimalClick() {
        triggerHaptic();
        if (isNewInput) {
            displayValue = "0.";
            isNewInput = false;
        } else if (!displayValue.includes(".")) {
            displayValue += ".";
        }
        updateDisplay();
    }

    // FIX 7: OPERATOR PRECEDENCE UX (DO NOT JUMP MAIN DISPLAY ON OPERATOR PRESS)
    function onOperationClick(operation) {
        triggerHaptic();
        const currentValue = parseFormattedNumber(displayValue);
        if (isNaN(currentValue)) return;

        if (isNewInput && fullExpression.length > 0) {
            fullExpression = fullExpression.trim().replace(/[+\-×÷^]$/, operation) + " ";
        } else {
            fullExpression += `${formatNumber(displayValue)} ${operation} `;
        }

        isNewInput = true;
        updateDisplay();
    }

    // FIX 1 & FIX 5: PERCENTAGE CONTEXT & TAN(90°) ASYMPTOTE DETECTION
    function onInstantScientificClick(operation) {
        triggerHaptic();
        const currentValue = parseFormattedNumber(displayValue);
        if (isNaN(currentValue)) return;

        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        let result = currentValue;
        let isErrorStr = false;

        switch (operation) {
            case '√': 
                if (currentValue < 0) {
                    result = t.errNegSqrt;
                    isErrorStr = true;
                } else {
                    result = Math.sqrt(currentValue);
                }
                break;
            case 'x²': 
                result = Math.pow(currentValue, 2); 
                break;
            case 'sin': 
                let sinDeg = (currentValue % 360 + 360) % 360;
                if (sinDeg === 0 || sinDeg === 180) result = 0;
                else if (sinDeg === 90) result = 1;
                else if (sinDeg === 270) result = -1;
                else result = Math.sin(currentValue * Math.PI / 180); 
                break;
            case 'cos': 
                let cosDeg = (currentValue % 360 + 360) % 360;
                if (cosDeg === 90 || cosDeg === 270) result = 0;
                else if (cosDeg === 0) result = 1;
                else if (cosDeg === 180) result = -1;
                else result = Math.cos(currentValue * Math.PI / 180); 
                break;
            case 'tan': 
                // FIX 5: Detect tan(90°), tan(270°), tan(90 + k*180) asymptote
                let tanDeg = (currentValue % 360 + 360) % 360;
                if (Math.abs(tanDeg - 90) < 1e-6 || Math.abs(tanDeg - 270) < 1e-6) {
                    result = t.errUndefined;
                    isErrorStr = true;
                } else if (tanDeg === 0 || tanDeg === 180) {
                    result = 0;
                } else {
                    result = Math.tan(currentValue * Math.PI / 180);
                }
                break;
            case 'ln': 
                if (currentValue <= 0) {
                    result = t.errNegLn;
                    isErrorStr = true;
                } else {
                    result = Math.log(currentValue);
                }
                break;
            case '%': 
                // FIX 1: Percentage calculation logic (100 + 10% = 110)
                if (fullExpression.trim().length > 0) {
                    const match = fullExpression.trim().match(/^([\d\s.]+)\s*([+\-×÷^])$/);
                    if (match) {
                        const baseVal = parseFormattedNumber(match[1]);
                        const op = match[2];
                        if (!isNaN(baseVal) && (op === '+' || op === '-')) {
                            const percentVal = (baseVal * currentValue) / 100;
                            displayValue = formatResult(percentVal);
                            isNewInput = true;
                            updateDisplay();
                            return;
                        }
                    }
                }
                result = currentValue / 100; 
                break;
        }

        const formattedRes = isErrorStr ? result : formatResult(result);
        const entry = `${operation}(${formatNumber(displayValue)}) = ${isErrorStr ? result : formatNumber(formattedRes)}`;
        addHistory(entry);

        displayValue = formattedRes;
        isNewInput = true;
        updateDisplay();
    }

    function onEqualsClick() {
        triggerHaptic();
        if (!fullExpression && isNewInput) return;

        let completeExprStr = fullExpression + formatNumber(displayValue);
        let evalResult = evaluateExpression(completeExprStr);

        if (typeof evalResult === 'string') {
            displayValue = evalResult;
            fullExpression = "";
            isNewInput = true;
            updateDisplay();
            return;
        }

        let formattedRes = formatResult(evalResult);
        let historyEntry = `${completeExprStr} = ${formatNumber(formattedRes)}`;
        
        addHistory(historyEntry);
        equationDisplay.textContent = `${completeExprStr} =`;
        displayValue = formattedRes;
        fullExpression = "";
        isNewInput = true;
        updateDisplay();
    }

    function onClearClick() {
        triggerHaptic();
        displayValue = "0";
        fullExpression = "";
        isNewInput = true;
        equationDisplay.textContent = '';
        updateDisplay();
    }

    function onBackspaceClick() {
        triggerHaptic();
        if (!isNewInput && displayValue.length > 0) {
            displayValue = displayValue.length === 1 ? "0" : displayValue.slice(0, -1);
            if (displayValue === "-" || displayValue === "") displayValue = "0";
            updateDisplay();
        }
    }

    if (memClearBtn) {
        memClearBtn.addEventListener('click', () => {
            triggerHaptic();
            memoryValue = 0;
            memRecallBtn.style.opacity = '0.5';
        });
    }

    if (memRecallBtn) {
        memRecallBtn.addEventListener('click', () => {
            triggerHaptic();
            if (memoryValue !== 0) {
                displayValue = formatResult(memoryValue);
                isNewInput = true;
                updateDisplay();
            }
        });
    }

    if (memAddBtn) {
        memAddBtn.addEventListener('click', () => {
            triggerHaptic();
            const val = parseFormattedNumber(displayValue);
            if (!isNaN(val)) {
                memoryValue += val;
                memRecallBtn.style.opacity = '1';
            }
        });
    }

    if (memSubBtn) {
        memSubBtn.addEventListener('click', () => {
            triggerHaptic();
            const val = parseFormattedNumber(displayValue);
            if (!isNaN(val)) {
                memoryValue -= val;
                memRecallBtn.style.opacity = '1';
            }
        });
    }

    function addHistory(entry) {
        history.unshift(entry);
        renderHistory();
    }

    // FIX 2: SAFE DOM NODES CREATION PREVENTING XSS INJECTION
    function renderHistory() {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        historyList.innerHTML = '';

        if (history.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-msg';
            li.textContent = t.emptyHistory;
            historyList.appendChild(li);
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.textContent = item; // Safe text node escaping HTML
            li.addEventListener('click', () => {
                triggerHaptic();
                const parts = item.split('=');
                if (parts.length > 1) {
                    displayValue = parts[parts.length - 1].trim().replace(/\s+/g, '');
                    isNewInput = true;
                    updateDisplay();
                    historyPanel.classList.add('hidden');
                }
            });
            historyList.appendChild(li);
        });
    }

    document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
        btn.addEventListener('click', () => onNumberClick(btn.dataset.num));
    });

    document.querySelectorAll('.op-btn[data-op]').forEach(btn => {
        btn.addEventListener('click', () => onOperationClick(btn.dataset.op));
    });

    document.querySelectorAll('.sci-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', () => onInstantScientificClick(btn.dataset.action));
    });

    document.querySelectorAll('.sci-btn[data-op]').forEach(btn => {
        btn.addEventListener('click', () => onOperationClick(btn.dataset.op));
    });

    document.getElementById('decimalBtn').addEventListener('click', onDecimalClick);
    document.getElementById('clearBtn').addEventListener('click', onClearClick);
    document.getElementById('backspaceBtn').addEventListener('click', onBackspaceClick);
    document.getElementById('equalsBtn').addEventListener('click', onEqualsClick);

    toggleModeBtn.addEventListener('click', () => {
        triggerHaptic();
        scientificKeypad.classList.toggle('hidden');
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        toggleModeBtn.textContent = scientificKeypad.classList.contains('hidden') ? t.scientificMode : t.standardMode;
    });

    toggleHistoryBtn.addEventListener('click', () => {
        triggerHaptic();
        historyPanel.classList.toggle('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        triggerHaptic();
        history = [];
        renderHistory();
    });

    window.addEventListener('keydown', (e) => {
        if (!converterSection.classList.contains('hidden')) return;

        if (e.key >= '0' && e.key <= '9') onNumberClick(e.key);
        else if (e.key === '.') onDecimalClick();
        else if (e.key === '+') onOperationClick('+');
        else if (e.key === '-') onOperationClick('-');
        else if (e.key === '*') onOperationClick('×');
        else if (e.key === '/') onOperationClick('÷');
        else if (e.key === '^') onOperationClick('^');
        else if (e.key === '%') onInstantScientificClick('%');
        else if (e.key === 'Enter' || e.key === '=') onEqualsClick();
        else if (e.key === 'Backspace') onBackspaceClick();
        else if (e.key === 'Escape') onClearClick();
    });

    // Initialize Language & Theme
    setLanguage(currentLang);
});
