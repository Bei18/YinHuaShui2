const monthNamesEnShort = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const EXCHANGE_RATE_HKD_TO_CNY = 0.92;

function generateRandomFileNo(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const rand4 = Math.floor(1000 + Math.random() * 9000);
    return `91/${y}${m}${d}-${rand4}`;
}

function generateRandomShroffNo() {
    const rand1 = Math.floor(1 + Math.random() * 9);
    const rand7 = Math.floor(1000000 + Math.random() * 9000000);
    const rand1Check = Math.floor(Math.random() * 10);
    return `${rand1}-${rand7}-${rand1Check}`;
}

function calculateAndSync() {
    const rawZhName = document.getElementById('input-name-zh').value.trim();
    const rawEnName = document.getElementById('input-name-en').value.trim();
    const cnyInputVal = document.getElementById('input-amount-cny').value.trim();

    let nameStr = "";
    if (rawEnName && rawZhName) {
        nameStr = `${rawEnName.toUpperCase()} (${rawZhName})`;
    } else if (rawEnName) {
        nameStr = rawEnName.toUpperCase();
    } else if (rawZhName) {
        nameStr = rawZhName;
    }
    document.getElementById('display-taxpayer-name').innerText = nameStr;

    if (cnyInputVal !== "") {
        const cnyAmount = parseFloat(cnyInputVal) || 0;
        const hkdAmount = cnyAmount / EXCHANGE_RATE_HKD_TO_CNY;
        
        const hkdFormatted = hkdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const cnyFormatted = cnyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        document.getElementById('display-paid-amount').innerText = `HK$ ${hkdFormatted} (折合RMB ${cnyFormatted})`;
    } else {
        document.getElementById('display-paid-amount').innerText = `HK$ 0.00 (折合RMB 0.00)`;
    }
}

function triggerWarning(msg) {
    const panel = document.getElementById('action-control-panel');
    panel.classList.remove('shake');
    void panel.offsetWidth; 
    panel.classList.add('shake');
    showToast(msg, 'error');
}

function copyReceiptAsImage() {
    const zhName = document.getElementById('input-name-zh').value.trim();
    const enName = document.getElementById('input-name-en').value.trim();
    const amountCny = document.getElementById('input-amount-cny').value.trim();

    if (!zhName || !enName || !amountCny) {
        triggerWarning("请完整填写（姓名与人民币金额）后再生成！");
        return;
    }

    const targetElement = document.getElementById('receipt-capture-area');
    const copyBtn = document.getElementById('btn-copy');
    
    html2canvas(targetElement, {
        scale: 3, 
        dpi: 300,
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        canvas.toBlob(blob => {
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => {
                    copyBtn.classList.add('copied');
                    copyBtn.innerText = "已复制至剪贴板";
                    showToast("已复制至剪贴板", "success");
                    
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerText = "生成并复制图片";
                    }, 3000);
                    
                }).catch(err => {
                    console.error("写入剪贴板失败: ", err);
                    showToast("剪贴板写入失败，请重试", "error");
                });
            } else {
                showToast("当前浏览器不支持直接复制图片，请使用 Chrome 或 Edge", "error");
            }
        }, "image/png");
    });
}

function showToast(msg, type = 'error') {
    const toast = document.getElementById('customToast');
    toast.innerText = msg;
    toast.className = 'custom-toast';
    toast.classList.add(type);
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function initAutoDateAndFileNo() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    const fullDateStr = `${d}/${m}/${y}`;
    
    document.getElementById('display-date-top').innerText = fullDateStr;
    document.getElementById('display-pay-date').innerText = fullDateStr;
    
    const mIndex = today.getMonth();
    document.getElementById('display-stamp-date').innerText = `${d} ${monthNamesEnShort[mIndex]} ${y}`;
    
    document.getElementById('display-tax-year').innerText = `${y - 1}/${String(y).slice(-2)}`;

    document.getElementById('display-file-no').innerText = generateRandomFileNo(today);
    document.getElementById('display-shroff-no').innerText = generateRandomShroffNo();
}

document.addEventListener('DOMContentLoaded', function() {
    initAutoDateAndFileNo();
    calculateAndSync();

    document.querySelectorAll('.control-panel input').forEach(element => {
        element.addEventListener('input', calculateAndSync);
    });

    const copyBtn = document.getElementById('btn-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyReceiptAsImage);
    }
});
