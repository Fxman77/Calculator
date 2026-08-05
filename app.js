document.addEventListener('DOMContentLoaded', () => {
    // State
    let displayValue = "0";
    let fullExpression = "";
    let isNewInput = true;
    let history = [];
    let memoryValue = 0;

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
            errMath: "수학 오류"
        }
    };

    const langSelect = document.getElementById('langSelect');
    let currentLang = localStorage.getItem('calcLang') || 'uz';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('calcLang', lang);
        langSelect.value = lang;
        const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

        // Set RTL for Arabic
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

        populateCategoryOptions();
        renderHistory();
    }

    langSelect.addEventListener('change', (e) => {
        triggerHaptic();
        setLanguage(e.target.value);
    });

    // THEME SWITCHER
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const currentTheme = localStorage.getItem('calcTheme') || 'dark';

    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            themeToggleBtn.textContent = '🌙 Dark';
            localStorage.setItem('calcTheme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = '☀️ Light';
            localStorage.setItem('calcTheme', 'dark');
        }
    }

    setTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        triggerHaptic();
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
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

    // Conversion Database
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
                'm3': { name: 'Kvadrat metr (m³)', factor: 1000 },
                'gal': { name: 'Gallon (US)', factor: 3.78541178 },
                'cup': { name: 'Stakan (cup)', factor: 0.24 }
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

    // TAB NAVIGATION
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

    // UNIT CONVERTER LOGIC
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

        let resStr = "";
        if (result % 1 === 0) resStr = result.toString();
        else resStr = result.toFixed(6).replace(/\.?0+$/, "");

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

    // Converter Keypad Buttons
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

    // CALCULATOR CORE FUNCTIONS
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

    function formatResult(value) {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        if (isNaN(value)) return t.errMath;
        if (!isFinite(value)) return t.errZeroDiv;
        if (Math.abs(value) < 1e-10 && value !== 0) return "0";
        if (value % 1 === 0) return value.toString();
        
        let formatted = value.toFixed(6).replace(/\.?0+$/, "");
        return formatted;
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
        return val === t.errZeroDiv || val === t.errNegSqrt || val === t.errNegLn || val === t.errMath;
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

    function onOperationClick(operation) {
        triggerHaptic();
        const currentValue = parseFormattedNumber(displayValue);
        if (isNaN(currentValue)) return;

        if (isNewInput && fullExpression.length > 0) {
            fullExpression = fullExpression.trim().replace(/[+\-×÷^]$/, operation) + " ";
        } else {
            fullExpression += `${formatNumber(displayValue)} ${operation} `;
        }

        let currentEval = evaluateExpression(fullExpression.slice(0, -2));
        if (typeof currentEval === 'number') {
            displayValue = formatResult(currentEval);
        }

        isNewInput = true;
        updateDisplay();
    }

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
                result = Math.sin(currentValue * Math.PI / 180); 
                break;
            case 'cos': 
                result = Math.cos(currentValue * Math.PI / 180); 
                break;
            case 'tan': 
                result = Math.tan(currentValue * Math.PI / 180); 
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

    function renderHistory() {
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        if (history.length === 0) {
            historyList.innerHTML = `<li class="empty-msg">${t.emptyHistory}</li>`;
            return;
        }
        historyList.innerHTML = history.map(item => `<li class="history-item">${item}</li>`).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const parts = item.textContent.split('=');
                if (parts.length > 1) {
                    displayValue = parts[parts.length - 1].trim().replace(/\s+/g, '');
                    isNewInput = true;
                    updateDisplay();
                    historyPanel.classList.add('hidden');
                }
            });
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

    // Initialize Language
    setLanguage(currentLang);
});
