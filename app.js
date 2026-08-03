document.addEventListener('DOMContentLoaded', () => {
    let displayValue = "0";
    let fullExpression = "";
    let isNewInput = true;
    let history = [];
    let memoryValue = 0;

    const mainDisplay = document.getElementById('mainDisplay');
    const equationDisplay = document.getElementById('equationDisplay');
    const historyPanel = document.getElementById('historyOverlay');
    const historyList = document.getElementById('historyList');
    const scientificKeypad = document.getElementById('scientificKeypad');
    const toggleModeBtn = document.getElementById('toggleModeBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    const memClearBtn = document.getElementById('memClear');
    const memRecallBtn = document.getElementById('memRecall');
    const memAddBtn = document.getElementById('memAdd');
    const memSubBtn = document.getElementById('memSub');

    function formatNumber(numStr) {
        if (!numStr || typeof numStr !== 'string') return numStr;
        if (numStr === "Xato" || numStr.includes("mumkin emas") || numStr.includes("mavjud emas")) {
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
            mainDisplay.style.fontSize = '2.1rem';
        } else if (cleanLen > 8) {
            mainDisplay.style.fontSize = '2.6rem';
        } else {
            mainDisplay.style.fontSize = '3.2rem';
        }

        if (fullExpression) {
            equationDisplay.textContent = fullExpression;
        } else {
            equationDisplay.textContent = '';
        }
    }

    function formatResult(value) {
        if (isNaN(value)) return "Matematik xato";
        if (!isFinite(value)) return "Nolga bo'lish mumkin emas";
        if (Math.abs(value) < 1e-10 && value !== 0) return "0";
        if (value % 1 === 0) return value.toString();
        
        let formatted = value.toFixed(6).replace(/\.?0+$/, "");
        return formatted;
    }

    function evaluateExpression(exprStr) {
        try {
            let cleanExpr = exprStr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/\s+/g, '');
            
            if (!/^[0-9+\-*/.()]+$/.test(cleanExpr.replace(/\*\*/g, ''))) {
                return "Matematik xato";
            }

            let res = Function('"use strict"; return (' + cleanExpr + ')')();
            return res;
        } catch (e) {
            return "Matematik xato";
        }
    }

    function onNumberClick(number) {
        if (displayValue === "Nolga bo'lish mumkin emas" || displayValue === "Matematik xato" || displayValue.includes("mavjud emas")) {
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
        if (isNewInput) {
            displayValue = "0.";
            isNewInput = false;
        } else if (!displayValue.includes(".")) {
            displayValue += ".";
        }
        updateDisplay();
    }

    function onOperationClick(operation) {
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
        const currentValue = parseFormattedNumber(displayValue);
        if (isNaN(currentValue)) return;

        let result = currentValue;
        let isErrorStr = false;

        switch (operation) {
            case '√': 
                if (currentValue < 0) {
                    result = "Manfiy son ildizi mavjud emas";
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
                    result = "Manfiy son logarifmi mavjud emas";
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
        displayValue = "0";
        fullExpression = "";
        isNewInput = true;
        equationDisplay.textContent = '';
        updateDisplay();
    }

    function onBackspaceClick() {
        if (!isNewInput && displayValue.length > 0) {
            displayValue = displayValue.length === 1 ? "0" : displayValue.slice(0, -1);
            if (displayValue === "-" || displayValue === "") displayValue = "0";
            updateDisplay();
        }
    }

    if (memClearBtn) {
        memClearBtn.addEventListener('click', () => {
            memoryValue = 0;
            memRecallBtn.style.opacity = '0.5';
        });
    }

    if (memRecallBtn) {
        memRecallBtn.addEventListener('click', () => {
            if (memoryValue !== 0) {
                displayValue = formatResult(memoryValue);
                isNewInput = true;
                updateDisplay();
            }
        });
    }

    if (memAddBtn) {
        memAddBtn.addEventListener('click', () => {
            const val = parseFormattedNumber(displayValue);
            if (!isNaN(val)) {
                memoryValue += val;
                memRecallBtn.style.opacity = '1';
            }
        });
    }

    if (memSubBtn) {
        memSubBtn.addEventListener('click', () => {
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
        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-msg">Hali hisoblashlar mavjud emas</li>';
            return;
        }
        historyList.innerHTML = history.map(item => `<li class="history-item">${item}</li>`).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
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
        scientificKeypad.classList.toggle('hidden');
        toggleModeBtn.textContent = scientificKeypad.classList.contains('hidden') ? 'Ilmiy Rejim' : 'Oddiy Rejim';
    });

    toggleHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        renderHistory();
    });

    window.addEventListener('keydown', (e) => {
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
});
