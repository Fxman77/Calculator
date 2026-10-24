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
                data: "💾 Ma'lumot"
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
                data: "💾 Data Storage"
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
                data: "💾 Almacenamiento"
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
                data: "💾 Armazenamento"
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
                data: "💾 Данные"
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
                data: "💾 डेटा संग्रहण"
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
                data: "💾 Datenspeicher"
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
                data: "💾 Données"
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
                data: "💾 Penyimpanan Data"
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
                data: "💾 تخزين البيانات"
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
                data: "💾 データ容量"
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
                data: "💾 데이터 용량"
            },
            errZeroDiv: "0으로 나눌 수 없습니다",
            errNegSqrt: "음수 제곱근은 정의되지 않음",
            errNegLn: "음수 로그는 정의되지 않음",
            errUndefined: "정의되지 않음",
            errMath: "수학 오류"
        }
    };

    const EXTRA_TRANSLATIONS = {
        uz: {
            currencyTab: "💱 Valyuta", financeTab: "📊 Moliya", loanTab: "💳 Kredit hisoblagich", percentTab: "📈 Foiz & Chegirma",
            loanAmountLabel: "Kredit summasi (so'm / $):", loanRateLabel: "Yillik foiz (%):", loanTermLabel: "Muddati (oy):",
            calculateBtn: "⚡ Hisoblash", monthlyPayLabel: "Oylik to'lov:", totalInterestLabel: "Jami foiz:", totalPaymentLabel: "Jami to'lov:",
            pctMode1Title: "1. Sonning foizini topish", pctMode2Title: "2. Chegirma (Skidka) hisoblash", pctMode3Title: "3. Nisbat foizini topish",
            currencyRateTitle: "Joriy Valyuta Kurslari", refreshBtn: "Yangilash", discPayLabel: "To'lanadi:", discSavedLabel: "Tejov:"
        },
        en: {
            currencyTab: "💱 Currency", financeTab: "📊 Finance", loanTab: "💳 Loan Calculator", percentTab: "📈 Percent & Discount",
            loanAmountLabel: "Loan Amount ($ / so'm):", loanRateLabel: "Annual Rate (%):", loanTermLabel: "Term (months):",
            calculateBtn: "⚡ Calculate", monthlyPayLabel: "Monthly payment:", totalInterestLabel: "Total interest:", totalPaymentLabel: "Total payment:",
            pctMode1Title: "1. Calculate percentage of number", pctMode2Title: "2. Discount & Savings calculator", pctMode3Title: "3. Percentage ratio",
            currencyRateTitle: "Exchange Rates", refreshBtn: "Refresh", discPayLabel: "Final price:", discSavedLabel: "You save:"
        },
        es: {
            currencyTab: "💱 Divisas", financeTab: "📊 Finanzas", loanTab: "💳 Préstamos", percentTab: "📈 Porcentaje & Descuento",
            loanAmountLabel: "Monto del préstamo:", loanRateLabel: "Tasa anual (%):", loanTermLabel: "Plazo (meses):",
            calculateBtn: "⚡ Calcular", monthlyPayLabel: "Pago mensual:", totalInterestLabel: "Interés total:", totalPaymentLabel: "Pago total:",
            pctMode1Title: "1. Calcular porcentaje", pctMode2Title: "2. Calculadora de descuento", pctMode3Title: "3. Proporción porcentual",
            currencyRateTitle: "Tipos de Cambio", refreshBtn: "Actualizar", discPayLabel: "Precio final:", discSavedLabel: "Ahorro:"
        },
        pt: {
            currencyTab: "💱 Moedas", financeTab: "📊 Finanças", loanTab: "💳 Empréstimos", percentTab: "📈 Porcentagem & Desconto",
            loanAmountLabel: "Valor do empréstimo:", loanRateLabel: "Taxa anual (%):", loanTermLabel: "Prazo (meses):",
            calculateBtn: "⚡ Calcular", monthlyPayLabel: "Pagamento mensal:", totalInterestLabel: "Juros totais:", totalPaymentLabel: "Total a pagar:",
            pctMode1Title: "1. Calcular porcentagem", pctMode2Title: "2. Calculadora de desconto", pctMode3Title: "3. Razão percentual",
            currencyRateTitle: "Taxas de Câmbio", refreshBtn: "Atualizar", discPayLabel: "Preço final:", discSavedLabel: "Economia:"
        },
        ru: {
            currencyTab: "💱 Валюта", financeTab: "📊 Финансы", loanTab: "💳 Кредитный калькулятор", percentTab: "📈 Проценты и скидки",
            loanAmountLabel: "Сумма кредита:", loanRateLabel: "Годовая ставка (%):", loanTermLabel: "Срок (месяцев):",
            calculateBtn: "⚡ Рассчитать", monthlyPayLabel: "Ежемесячный платеж:", totalInterestLabel: "Переплата (проценты):", totalPaymentLabel: "Итоговая выплата:",
            pctMode1Title: "1. Найти процент от числа", pctMode2Title: "2. Расчет скидки", pctMode3Title: "3. Процентное соотношение",
            currencyRateTitle: "Курсы Валют", refreshBtn: "Обновить", discPayLabel: "К оплате:", discSavedLabel: "Экономия:"
        },
        hi: {
            currencyTab: "💱 मुद्रा", financeTab: "📊 वित्त", loanTab: "💳 ऋण कैलकुलेटर", percentTab: "📈 प्रतिशत और छूट",
            loanAmountLabel: "ऋण राशि:", loanRateLabel: "वार्षिक दर (%):", loanTermLabel: "अवधि (माह):",
            calculateBtn: "⚡ गणना करें", monthlyPayLabel: "मासिक किस्त:", totalInterestLabel: "कुल ब्याज:", totalPaymentLabel: "कुल भुगतान:",
            pctMode1Title: "1. संख्या का प्रतिशत निकालें", pctMode2Title: "2. छूट कैलकुलेटर", pctMode3Title: "3. प्रतिशत अनुपात",
            currencyRateTitle: "मुद्रा विनिमय दर", refreshBtn: "ताज़ा करें", discPayLabel: "अंतिम मूल्य:", discSavedLabel: "बचत:"
        },
        de: {
            currencyTab: "💱 Währung", financeTab: "📊 Finanzen", loanTab: "💳 Kreditrechner", percentTab: "📈 Prozent & Rabatt",
            loanAmountLabel: "Kreditbetrag:", loanRateLabel: "Jahreszins (%):", loanTermLabel: "Laufzeit (Monate):",
            calculateBtn: "⚡ Berechnen", monthlyPayLabel: "Monatliche Rate:", totalInterestLabel: "Gesamtzinsen:", totalPaymentLabel: "Gesamtzahlung:",
            pctMode1Title: "1. Prozentwert berechnen", pctMode2Title: "2. Rabattrechner", pctMode3Title: "3. Prozentsatz ermitteln",
            currencyRateTitle: "Wechselkurse", refreshBtn: "Aktualisieren", discPayLabel: "Endpreis:", discSavedLabel: "Ersparnis:"
        },
        fr: {
            currencyTab: "💱 Devises", financeTab: "📊 Finance", loanTab: "💳 Simulateur de crédit", percentTab: "📈 Pourcentage & Remise",
            loanAmountLabel: "Montant du prêt:", loanRateLabel: "Taux annuel (%):", loanTermLabel: "Durée (mois):",
            calculateBtn: "⚡ Calculer", monthlyPayLabel: "Mensualité:", totalInterestLabel: "Intérêts totaux:", totalPaymentLabel: "Total à rembourser:",
            pctMode1Title: "1. Calculer le pourcentage", pctMode2Title: "2. Calculateur de remise", pctMode3Title: "3. Ratio en pourcentage",
            currencyRateTitle: "Taux de Change", refreshBtn: "Actualiser", discPayLabel: "Prix final:", discSavedLabel: "Économie:"
        },
        id: {
            currencyTab: "💱 Valuta", financeTab: "📊 Keuangan", loanTab: "💳 Kalkulator Pinjaman", percentTab: "📈 Persen & Diskon",
            loanAmountLabel: "Jumlah Pinjaman:", loanRateLabel: "Bunga Tahunan (%):", loanTermLabel: "Jangka Waktu (bulan):",
            calculateBtn: "⚡ Hitung", monthlyPayLabel: "Cicilan Bulanan:", totalInterestLabel: "Total Bunga:", totalPaymentLabel: "Total Pembayaran:",
            pctMode1Title: "1. Hitung persen dari angka", pctMode2Title: "2. Kalkulator diskon", pctMode3Title: "3. Rasio persentase",
            currencyRateTitle: "Kurs Mata Uang", refreshBtn: "Perbarui", discPayLabel: "Bayar:", discSavedLabel: "Hemat:"
        },
        ar: {
            currencyTab: "💱 العملات", financeTab: "📊 المالية", loanTab: "💳 حاسبة القروض", percentTab: "📈 النسبة والخصم",
            loanAmountLabel: "مبلغ القرض:", loanRateLabel: "الفائدة السنوية (%):", loanTermLabel: "المدة (أشهر):",
            calculateBtn: "⚡ احسب", monthlyPayLabel: "القسط الشهري:", totalInterestLabel: "إجمالي الفائدة:", totalPaymentLabel: "إجمالي المبلغ:",
            pctMode1Title: "1. حساب النسبة المئوية", pctMode2Title: "2. حاسبة الخصم", pctMode3Title: "3. نسبة الجزء من الكل",
            currencyRateTitle: "أسعار العملات", refreshBtn: "تحديث", discPayLabel: "السعر النهائي:", discSavedLabel: "التوفير:"
        },
        ja: {
            currencyTab: "💱 為替", financeTab: "📊 財務", loanTab: "💳 ローン計算機", percentTab: "📈 パーセント・割引",
            loanAmountLabel: "借入金額:", loanRateLabel: "年利 (%):", loanTermLabel: "期間 (月):",
            calculateBtn: "⚡ 計算する", monthlyPayLabel: "月々の返済額:", totalInterestLabel: "利息総額:", totalPaymentLabel: "総返済額:",
            pctMode1Title: "1. 割合を計算", pctMode2Title: "2. 割引・お得額計算", pctMode3Title: "3. 割合の比率",
            currencyRateTitle: "為替レート", refreshBtn: "更新", discPayLabel: "支払額:", discSavedLabel: "お得額:"
        },
        ko: {
            currencyTab: "💱 환율", financeTab: "📊 금융", loanTab: "💳 대출 계산기", percentTab: "📈 퍼센트 및 할인",
            loanAmountLabel: "대출 금액:", loanRateLabel: "연이율 (%):", loanTermLabel: "기간 (개월):",
            calculateBtn: "⚡ 계산하기", monthlyPayLabel: "월 납입금:", totalInterestLabel: "총 이자:", totalPaymentLabel: "총 상환금액:",
            pctMode1Title: "1. 숫자의 퍼센트 구하기", pctMode2Title: "2. 할인율 계산", pctMode3Title: "3. 비율 퍼센트 구하기",
            currencyRateTitle: "실시간 환율", refreshBtn: "새로고침", discPayLabel: "최종 가격:", discSavedLabel: "절약 금액:"
        }
    };
    Object.keys(EXTRA_TRANSLATIONS).forEach(lang => {
        if (TRANSLATIONS[lang]) {
            Object.assign(TRANSLATIONS[lang], EXTRA_TRANSLATIONS[lang]);
        }
    });

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
            if (window.AdMobController) window.AdMobController.onProActivated();
        } else {
            proBadgeBtn.textContent = '⭐ PRO';
            proBadgeBtn.classList.remove('active-pro');
            adMobBanner.classList.remove('hidden-pro');
            if (window.AdMobController) window.AdMobController.onProDeactivated();
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
    const currencyTabBtn = document.getElementById('currencyTabBtn');
    const financeTabBtn = document.getElementById('financeTabBtn');
    const calculatorSection = document.getElementById('calculatorSection');
    const converterSection = document.getElementById('converterSection');
    const currencySection = document.getElementById('currencySection');
    const financeSection = document.getElementById('financeSection');

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

    // Currency Elements
    const currencyInput = document.getElementById('currencyInput');
    const currencyOutput = document.getElementById('currencyOutput');
    const fromCurrencySelect = document.getElementById('fromCurrencySelect');
    const toCurrencySelect = document.getElementById('toCurrencySelect');
    const swapCurrencyBtn = document.getElementById('swapCurrencyBtn');
    const refreshRatesBtn = document.getElementById('refreshRatesBtn');
    const ratePreview = document.getElementById('ratePreview');
    const rateDateText = document.getElementById('rateDateText');

    // Finance Elements
    const loanSubtabBtn = document.getElementById('loanSubtabBtn');
    const percentSubtabBtn = document.getElementById('percentSubtabBtn');
    const loanCard = document.getElementById('loanCard');
    const percentCard = document.getElementById('percentCard');
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanRateInput = document.getElementById('loanRateInput');
    const loanTermInput = document.getElementById('loanTermInput');
    const calculateLoanBtn = document.getElementById('calculateLoanBtn');
    const loanMonthlyPay = document.getElementById('loanMonthlyPay');
    const loanTotalInterest = document.getElementById('loanTotalInterest');
    const loanTotalPayment = document.getElementById('loanTotalPayment');

    // Percent Elements
    const pctValY = document.getElementById('pctValY');
    const pctRateX = document.getElementById('pctRateX');
    const pctResult1 = document.getElementById('pctResult1');
    const discPrice = document.getElementById('discPrice');
    const discPercent = document.getElementById('discPercent');
    const discFinalPrice = document.getElementById('discFinalPrice');
    const discSavings = document.getElementById('discSavings');
    const ratioPart = document.getElementById('ratioPart');
    const ratioTotal = document.getElementById('ratioTotal');
    const pctResult3 = document.getElementById('pctResult3');

    // Scientific Elements & State
    const degRadBtn = document.getElementById('degRadBtn');
    let isRadMode = false;

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
        `;
        categorySelect.value = selectedVal;
        initConverterCategory();
    }

    function switchTab(tab) {
        triggerHaptic();
        [calcTabBtn, converterTabBtn, currencyTabBtn, financeTabBtn].forEach(b => {
            if (b) b.classList.remove('active');
        });
        [calculatorSection, converterSection, currencySection, financeSection].forEach(s => {
            if (s) s.classList.add('hidden');
        });

        if (tab === 'calc') {
            calcTabBtn.classList.add('active');
            calculatorSection.classList.remove('hidden');
        } else if (tab === 'converter') {
            converterTabBtn.classList.add('active');
            converterSection.classList.remove('hidden');
            initConverterCategory();
        } else if (tab === 'currency') {
            currencyTabBtn.classList.add('active');
            currencySection.classList.remove('hidden');
            initCurrencyDropdowns();
        } else if (tab === 'finance') {
            financeTabBtn.classList.add('active');
            financeSection.classList.remove('hidden');
            calculateLoan();
            calculatePercents();
        }
        if (window.AdMobController) window.AdMobController.onTabSwitched(tab);
    }

    calcTabBtn.addEventListener('click', () => switchTab('calc'));
    converterTabBtn.addEventListener('click', () => switchTab('converter'));
    currencyTabBtn.addEventListener('click', () => switchTab('currency'));
    financeTabBtn.addEventListener('click', () => switchTab('finance'));

    // CURRENCY CONVERTER SYSTEM (LIVE API + OFFLINE CACHE)
    const DEFAULT_CURRENCY_RATES = {
        USD: 1,
        UZS: 12850,
        EUR: 0.92,
        RUB: 96.5,
        GBP: 0.77,
        KZT: 488,
        TRY: 34.2,
        CNY: 7.12,
        AED: 3.67,
        SAR: 3.75,
        JPY: 152.5,
        KRW: 1380,
        CHF: 0.86,
        CAD: 1.38,
        AUD: 1.51,
        KGS: 86.2,
        TJS: 10.65
    };

    const CURRENCY_LIST = [
        { code: 'USD', name: 'AQSH Dollari', flag: '🇺🇸' },
        { code: 'UZS', name: "O'zbek so'mi", flag: '🇺🇿' },
        { code: 'EUR', name: 'Yevro', flag: '🇪🇺' },
        { code: 'RUB', name: 'Rossiya rubli', flag: '🇷🇺' },
        { code: 'GBP', name: 'Angliya funti', flag: '🇬🇧' },
        { code: 'KZT', name: 'Qozog\'iston tengesi', flag: '🇰🇿' },
        { code: 'TRY', name: 'Turkiya lirasi', flag: '🇹🇷' },
        { code: 'CNY', name: 'Xitoy yuani', flag: '🇨🇳' },
        { code: 'AED', name: 'BAA dirhami', flag: '🇦🇪' },
        { code: 'SAR', name: 'Saudiya riyoli', flag: '🇸🇦' },
        { code: 'JPY', name: 'Yaponiya iyenasi', flag: '🇯🇵' },
        { code: 'KRW', name: 'Janubiy Koreya voni', flag: '🇰🇷' },
        { code: 'CHF', name: 'Shveysariya franki', flag: '🇨🇭' },
        { code: 'CAD', name: 'Kanada dollari', flag: '🇨🇦' },
        { code: 'AUD', name: 'Avstraliya dollari', flag: '🇦🇺' },
        { code: 'KGS', name: 'Qirg\'iziston somi', flag: '🇰🇬' },
        { code: 'TJS', name: 'Tojikiston somoniysi', flag: '🇹🇯' }
    ];

    let currencyRates = { ...DEFAULT_CURRENCY_RATES };
    const savedRates = localStorage.getItem('cachedCurrencyRates');
    if (savedRates) {
        try {
            currencyRates = Object.assign(currencyRates, JSON.parse(savedRates));
        } catch (e) {}
    }

    let isCurrencyInitialized = false;
    function initCurrencyDropdowns() {
        if (!isCurrencyInitialized) {
            fromCurrencySelect.innerHTML = '';
            toCurrencySelect.innerHTML = '';

            CURRENCY_LIST.forEach(item => {
                fromCurrencySelect.innerHTML += `<option value="${item.code}">${item.flag} ${item.code} - ${item.name}</option>`;
                toCurrencySelect.innerHTML += `<option value="${item.code}">${item.flag} ${item.code} - ${item.name}</option>`;
            });

            fromCurrencySelect.value = 'USD';
            toCurrencySelect.value = 'UZS';
            isCurrencyInitialized = true;
        }
        performCurrencyConversion();
    }

    function performCurrencyConversion() {
        const val = parseFloat(currencyInput.value.replace(/\s+/g, '')) || 0;
        const fromCode = fromCurrencySelect.value;
        const toCode = toCurrencySelect.value;

        const fromRate = currencyRates[fromCode] || 1;
        const toRate = currencyRates[toCode] || 1;

        const inUSD = val / fromRate;
        const result = inUSD * toRate;

        currencyOutput.value = formatNumber(formatResult(result));

        const unitRate = (1 / fromRate) * toRate;
        ratePreview.textContent = `1 ${fromCode} = ${formatNumber(formatResult(unitRate))} ${toCode}`;
    }

    async function fetchLiveCurrencyRates() {
        rateDateText.textContent = "Yuklanmoqda...";
        try {
            const resp = await fetch('https://open.er-api.com/v6/latest/USD');
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.rates) {
                    Object.keys(DEFAULT_CURRENCY_RATES).forEach(code => {
                        if (data.rates[code]) {
                            currencyRates[code] = data.rates[code];
                        }
                    });
                    localStorage.setItem('cachedCurrencyRates', JSON.stringify(currencyRates));
                    rateDateText.textContent = `Jonli kurslar (${new Date().toLocaleDateString()})`;
                    performCurrencyConversion();
                    return;
                }
            }
        } catch (e) {}
        rateDateText.textContent = "Oflayn kurslar (USD bazasi)";
    }

    fromCurrencySelect.addEventListener('change', () => {
        triggerHaptic();
        performCurrencyConversion();
    });

    toCurrencySelect.addEventListener('change', () => {
        triggerHaptic();
        performCurrencyConversion();
    });

    currencyInput.addEventListener('input', performCurrencyConversion);

    swapCurrencyBtn.addEventListener('click', () => {
        triggerHaptic();
        const tmp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tmp;
        performCurrencyConversion();
    });

    refreshRatesBtn.addEventListener('click', () => {
        triggerHaptic();
        fetchLiveCurrencyRates();
    });

    document.querySelectorAll('.quick-cur-btn[data-amt]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            currencyInput.value = btn.dataset.amt;
            performCurrencyConversion();
        });
    });

    document.querySelectorAll('.curr-key').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            const key = btn.dataset.key;
            if (key === 'CLR') {
                currencyInput.value = '0';
            } else if (key === 'DEL') {
                currencyInput.value = currencyInput.value.length > 1 ? currencyInput.value.slice(0, -1) : '0';
            } else if (key === '.') {
                if (!currencyInput.value.includes('.')) currencyInput.value += '.';
            } else if (key === '00') {
                if (currencyInput.value !== '0') currencyInput.value += '00';
            } else {
                if (currencyInput.value === '0') currencyInput.value = key;
                else currencyInput.value += key;
            }
            performCurrencyConversion();
        });
    });

    // FINANCE & PERCENTAGE CALCULATOR SYSTEM
    loanSubtabBtn.addEventListener('click', () => {
        triggerHaptic();
        loanSubtabBtn.classList.add('active');
        percentSubtabBtn.classList.remove('active');
        loanCard.classList.remove('hidden');
        percentCard.classList.add('hidden');
        calculateLoan();
    });

    percentSubtabBtn.addEventListener('click', () => {
        triggerHaptic();
        percentSubtabBtn.classList.add('active');
        loanSubtabBtn.classList.remove('active');
        percentCard.classList.remove('hidden');
        loanCard.classList.add('hidden');
        calculatePercents();
    });

    function calculateLoan() {
        const rawAmount = loanAmountInput.value.replace(/\s+/g, '');
        const amount = parseFloat(rawAmount) || 0;
        const annualRate = parseFloat(loanRateInput.value) || 0;
        const months = parseInt(loanTermInput.value) || 1;

        if (amount <= 0 || months <= 0) {
            loanMonthlyPay.textContent = '0 so\'m';
            loanTotalInterest.textContent = '0 so\'m';
            loanTotalPayment.textContent = '0 so\'m';
            return;
        }

        let monthlyPay = 0;
        let totalPayment = 0;
        let totalInterest = 0;

        if (annualRate <= 0) {
            monthlyPay = amount / months;
            totalPayment = amount;
            totalInterest = 0;
        } else {
            const monthlyRate = annualRate / 12 / 100;
            monthlyPay = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
            totalPayment = monthlyPay * months;
            totalInterest = totalPayment - amount;
        }

        loanMonthlyPay.textContent = `${formatNumber(formatResult(monthlyPay))} so'm`;
        loanTotalInterest.textContent = `${formatNumber(formatResult(totalInterest))} so'm`;
        loanTotalPayment.textContent = `${formatNumber(formatResult(totalPayment))} so'm`;
    }

    calculateLoanBtn.addEventListener('click', () => {
        triggerHaptic();
        calculateLoan();
    });

    [loanAmountInput, loanRateInput, loanTermInput].forEach(inp => {
        inp.addEventListener('input', calculateLoan);
    });

    function calculatePercents() {
        // Mode 1: What is X% of Y?
        const y = parseFloat(pctValY.value) || 0;
        const x = parseFloat(pctRateX.value) || 0;
        const res1 = (y * x) / 100;
        pctResult1.textContent = formatNumber(formatResult(res1));

        // Mode 2: Discount
        const price = parseFloat(discPrice.value) || 0;
        const discount = parseFloat(discPercent.value) || 0;
        const savings = (price * discount) / 100;
        const finalPrice = Math.max(0, price - savings);
        discFinalPrice.textContent = formatNumber(formatResult(finalPrice));
        discSavings.textContent = formatNumber(formatResult(savings));

        // Mode 3: Ratio
        const part = parseFloat(ratioPart.value) || 0;
        const total = parseFloat(ratioTotal.value) || 0;
        if (total === 0) {
            pctResult3.textContent = '0%';
        } else {
            const ratio = (part / total) * 100;
            pctResult3.textContent = `${formatResult(ratio)}%`;
        }
    }

    [pctValY, pctRateX, discPrice, discPercent, ratioPart, ratioTotal].forEach(inp => {
        inp.addEventListener('input', calculatePercents);
    });

    function initConverterCategory() {
        const catKey = categorySelect.value;
        const catData = CONVERSION_DATA[catKey];

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
                .replace(/π/g, `(${Math.PI})`)
                .replace(/e/g, `(${Math.E})`)
                .replace(/\s+/g, '');
            
            // Auto balance unclosed parentheses
            const openCount = (cleanExpr.match(/\(/g) || []).length;
            const closeCount = (cleanExpr.match(/\)/g) || []).length;
            if (openCount > closeCount) {
                cleanExpr += ')'.repeat(openCount - closeCount);
            }

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

    // ENHANCED SCIENTIFIC CALCULATOR ENGINE
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
                if (isRadMode) {
                    result = Math.sin(currentValue);
                } else {
                    let sinDeg = (currentValue % 360 + 360) % 360;
                    if (sinDeg === 0 || sinDeg === 180) result = 0;
                    else if (sinDeg === 90) result = 1;
                    else if (sinDeg === 270) result = -1;
                    else result = Math.sin(currentValue * Math.PI / 180); 
                }
                break;
            case 'cos': 
                if (isRadMode) {
                    result = Math.cos(currentValue);
                } else {
                    let cosDeg = (currentValue % 360 + 360) % 360;
                    if (cosDeg === 90 || cosDeg === 270) result = 0;
                    else if (cosDeg === 0) result = 1;
                    else if (cosDeg === 180) result = -1;
                    else result = Math.cos(currentValue * Math.PI / 180); 
                }
                break;
            case 'tan': 
                if (isRadMode) {
                    result = Math.tan(currentValue);
                } else {
                    let tanDeg = (currentValue % 360 + 360) % 360;
                    if (Math.abs(tanDeg - 90) < 1e-6 || Math.abs(tanDeg - 270) < 1e-6) {
                        result = t.errUndefined;
                        isErrorStr = true;
                    } else if (tanDeg === 0 || tanDeg === 180) {
                        result = 0;
                    } else {
                        result = Math.tan(currentValue * Math.PI / 180);
                    }
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
            case 'log': 
                if (currentValue <= 0) {
                    result = t.errNegLn;
                    isErrorStr = true;
                } else {
                    result = Math.log10(currentValue);
                }
                break;
            case 'n!': 
                if (currentValue < 0 || !Number.isInteger(currentValue)) {
                    result = t.errMath;
                    isErrorStr = true;
                } else if (currentValue > 170) {
                    result = Infinity;
                    isErrorStr = true;
                } else {
                    let f = 1;
                    for (let i = 2; i <= currentValue; i++) f *= i;
                    result = f;
                }
                break;
            case '1/x': 
                if (currentValue === 0) {
                    result = t.errZeroDiv;
                    isErrorStr = true;
                } else {
                    result = 1 / currentValue;
                }
                break;
            case '|x|': 
                result = Math.abs(currentValue);
                break;
            case '%': 
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
        if (window.AdMobController) window.AdMobController.onCalculationCompleted();
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

    if (degRadBtn) {
        degRadBtn.addEventListener('click', () => {
            triggerHaptic();
            isRadMode = !isRadMode;
            degRadBtn.textContent = isRadMode ? 'RAD' : 'DEG';
            degRadBtn.classList.toggle('active-deg', !isRadMode);
        });
    }

    document.querySelectorAll('.paren-btn[data-paren]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            const paren = btn.dataset.paren;
            if (paren === '(') {
                if (!isNewInput && displayValue !== '0' && fullExpression.length === 0) {
                    fullExpression = `${formatNumber(displayValue)} × ( `;
                } else if (!isNewInput && displayValue !== '0' && /[+\-×÷^]\s*$/.test(fullExpression)) {
                    fullExpression += `${formatNumber(displayValue)} × ( `;
                } else {
                    fullExpression += '( ';
                }
                displayValue = '0';
                isNewInput = true;
            } else if (paren === ')') {
                if (!isNewInput) {
                    fullExpression += `${formatNumber(displayValue)} ) `;
                } else {
                    fullExpression += ') ';
                }
                isNewInput = true;
            }
            updateDisplay();
        });
    });

    document.querySelectorAll('.const-btn[data-const]').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            const c = btn.dataset.const;
            if (c === 'π') {
                displayValue = formatResult(Math.PI);
            } else if (c === 'e') {
                displayValue = formatResult(Math.E);
            }
            isNewInput = false;
            updateDisplay();
        });
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
        if (!converterSection.classList.contains('hidden') || !currencySection.classList.contains('hidden') || !financeSection.classList.contains('hidden')) return;

        if (e.key >= '0' && e.key <= '9') onNumberClick(e.key);
        else if (e.key === '.') onDecimalClick();
        else if (e.key === '+') onOperationClick('+');
        else if (e.key === '-') onOperationClick('-');
        else if (e.key === '*') onOperationClick('×');
        else if (e.key === '/') onOperationClick('÷');
        else if (e.key === '^') onOperationClick('^');
        else if (e.key === '%') onInstantScientificClick('%');
        else if (e.key === '(') {
            if (!isNewInput && displayValue !== '0' && fullExpression.length === 0) {
                fullExpression = `${formatNumber(displayValue)} × ( `;
            } else {
                fullExpression += '( ';
            }
            displayValue = '0';
            isNewInput = true;
            updateDisplay();
        }
        else if (e.key === ')') {
            if (!isNewInput) fullExpression += `${formatNumber(displayValue)} ) `;
            else fullExpression += ') ';
            isNewInput = true;
            updateDisplay();
        }
        else if (e.key === 'Enter' || e.key === '=') onEqualsClick();
        else if (e.key === 'Backspace') onBackspaceClick();
        else if (e.key === 'Escape') onClearClick();
    });

    // Initialize Language & Theme
    setLanguage(currentLang);
});
