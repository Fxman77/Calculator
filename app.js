document.addEventListener('DOMContentLoaded', () => {
    let displayValue = "0";
    let firstOperand = null;
    let pendingOperation = null;
    let isNewInput = true;
    let history = [];

    const mainDisplay = document.getElementById('mainDisplay');
    const equationDisplay = document.getElementById('equationDisplay');
    const historyPanel = document.getElementById('historyOverlay');
    const historyList = document.getElementById('historyList');
    const scientificKeypad = document.getElementById('scientificKeypad');
    const toggleModeBtn = document.getElementById('toggleModeBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    function updateDisplay() {
        mainDisplay.textContent = displayValue;
        if (displayValue.length > 10) {
            mainDisplay.style.fontSize = '2.1rem';
        } else {
            mainDisplay.style.fontSize = '2.8rem';
        }

        if (firstOperand !== null && pendingOperation !== null) {
            equationDisplay.textContent = `${formatResult(firstOperand)} ${pendingOperation}`;
        } else {
            equationDisplay.textContent = '';
        }
    }

    function formatResult(value) {
        if (isNaN(value) || !isFinite(value)) return "Xato";
        if (value % 1 === 0) return value.toString();
        let formatted = value.toFixed(6).replace(/\.?0+$/, "");
        return formatted;
    }

    function onNumberClick(number) {
        if (isNewInput || displayValue === "0") {
            displayValue = number;
            isNewInput = false;
        } else {
            displayValue += number;
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

    function calculate(op1, op2, operation) {
        switch (operation) {
            case '+': return op1 + op2;
            case '-': return op1 - op2;
            case '×': return op1 * op2;
            case '÷': return op2 !== 0 ? op1 / op2 : NaN;
            case '^': return Math.pow(op1, op2);
            default: return op2;
        }
    }

    function onOperationClick(operation) {
        const currentValue = parseFloat(displayValue);
        if (isNaN(currentValue)) return;

        if (firstOperand === null) {
            firstOperand = currentValue;
        } else if (pendingOperation !== null && !isNewInput) {
            const result = calculate(firstOperand, currentValue, pendingOperation);
            displayValue = formatResult(result);
            firstOperand = result;
        }
        pendingOperation = operation;
        isNewInput = true;
        updateDisplay();
    }

    function onInstantScientificClick(operation) {
        const currentValue = parseFloat(displayValue);
        if (isNaN(currentValue)) return;

        let result = currentValue;
        switch (operation) {
            case '√': result = currentValue >= 0 ? Math.sqrt(currentValue) : NaN; break;
            case 'x²': result = Math.pow(currentValue, 2); break;
            case 'sin': result = Math.sin(currentValue * Math.PI / 180); break;
            case 'cos': result = Math.cos(currentValue * Math.PI / 180); break;
            case 'tan': result = Math.tan(currentValue * Math.PI / 180); break;
            case 'ln': result = currentValue > 0 ? Math.log(currentValue) : NaN; break;
            case '%': result = currentValue / 100; break;
        }

        const formattedRes = formatResult(result);
        const entry = `${operation}(${displayValue}) = ${formattedRes}`;
        addHistory(entry);

        displayValue = formattedRes;
        isNewInput = true;
        updateDisplay();
    }

    function onEqualsClick() {
        const currentValue = parseFloat(displayValue);
        if (isNaN(currentValue)) return;

        if (firstOperand !== null && pendingOperation !== null) {
            const result = calculate(firstOperand, currentValue, pendingOperation);
            const formattedResult = formatResult(result);

            const entry = `${formatResult(firstOperand)} ${pendingOperation} ${displayValue} = ${formattedResult}`;
            addHistory(entry);

            displayValue = formattedResult;
            firstOperand = null;
            pendingOperation = null;
            isNewInput = true;
            updateDisplay();
        }
    }

    function onClearClick() {
        displayValue = "0";
        firstOperand = null;
        pendingOperation = null;
        isNewInput = true;
        updateDisplay();
    }

    function onBackspaceClick() {
        if (!isNewInput && displayValue.length > 0) {
            displayValue = displayValue.length === 1 ? "0" : displayValue.slice(0, -1);
            updateDisplay();
        }
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
                    displayValue = parts[parts.length - 1].trim();
                    isNewInput = true;
                    updateDisplay();
                    historyPanel.classList.add('hidden');
                }
            });
        });
    }

    // Event Listeners
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

    // Keyboard Shortcuts
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
