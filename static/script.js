// API Key localStorage management
const apiKeyInput = document.getElementById('apiKey');

// Load API key from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
});

// Save API key to localStorage when user types
apiKeyInput.addEventListener('input', (e) => {
    const apiKey = e.target.value;
    if (apiKey) {
        localStorage.setItem('geminiApiKey', apiKey);
    } else {
        localStorage.removeItem('geminiApiKey');
    }
});

// Toggle accordion
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');

    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        header.classList.add('active');
    } else {
        content.style.display = 'none';
        header.classList.remove('active');
    }
}

// Aspect ratio selection
const aspectButtons = document.querySelectorAll('.btn-aspect');
aspectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        aspectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
})
    ;

// Prompt Display Functions
function getSelectedOptionText(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return '';
    const selectedOption = select.options[select.selectedIndex];
    return selectedOption ? selectedOption.text : '';
}

function getCharSelectText(charNum, selectClass) {
    const select = document.querySelector(`.${selectClass}[data-char="${charNum}"]`);
    if (!select) return '';
    const selectedOption = select.options[select.selectedIndex];
    return selectedOption ? selectedOption.text : '';
}

function buildJapaneseSettings(data) {
    const common = data.common;
    const characters = data.characters;
    let settings = [];

    // 共通設定
    settings.push('【共通設定】');

    if (common.art_style) {
        settings.push(`画風: ${common.art_style}`);
    }

    // 背景
    if (common.background_type === 'text' && common.background_text) {
        settings.push(`背景: ${common.background_text}`);
    } else if (common.background_type === 'white') {
        settings.push(`背景: 背景白`);
    } else if (common.background_type === 'upload') {
        settings.push(`背景: 画像アップロード`);
    }

    settings.push(`アスペクト比: ${common.aspect_ratio}`);

    if (common.story) {
        settings.push(`ストーリー: ${common.story}`);
    }

    // 構図オプション
    if (common.distance && common.distance !== '指定なし') {
        const distanceText = getSelectedOptionText('distance');
        settings.push(`距離・範囲: ${distanceText}`);
    }

    if (common.angle && common.angle !== '指定なし') {
        const angleText = getSelectedOptionText('angle');
        settings.push(`アングル: ${angleText}`);
    }

    if (common.lens && common.lens !== '指定なし') {
        const lensText = getSelectedOptionText('lens');
        settings.push(`レンズ・効果: ${lensText}`);
    }

    if (common.multi_person && common.multi_person !== '指定なし') {
        const multiText = getSelectedOptionText('multiPerson');
        settings.push(`多人数・関係: ${multiText}`);
    }

    if (common.special && common.special !== '指定なし') {
        const specialText = getSelectedOptionText('special');
        settings.push(`特殊演出: ${specialText}`);
    }

    // キャラクター設定
    characters.forEach((char, index) => {
        if (char.enabled) {
            const charNum = index + 1;
            settings.push('');
            settings.push(`【キャラ${charNum}】`);

            if (char.name) {
                settings.push(`名前: ${char.name}`);
            }

            if (char.appearance) {
                settings.push(`見た目プロンプト: ${char.appearance}`);
            }

            if (char.expression) {
                settings.push(`表情: ${char.expression}`);
            }

            if (char.onomatopoeia) {
                settings.push(`オノマトペ: ${char.onomatopoeia}`);
            }

            settings.push(`コマ内のキャラ位置: ${char.position}`);

            if (char.face_direction && char.face_direction !== '指定なし') {
                const faceText = getCharSelectText(charNum, 'char-face-direction');
                settings.push(`顔の向き: ${faceText}`);
            }

            settings.push(`体の向き: ${char.body_orientation}`);

            if (char.body_movement) {
                settings.push(`体の動き: ${char.body_movement}`);
            }

            if (char.direction && char.direction !== '指定なし') {
                const directionText = getCharSelectText(charNum, 'char-direction');
                settings.push(`方向・視点: ${directionText}`);
            }

            if (char.composition && char.composition !== '指定なし') {
                const compositionText = getCharSelectText(charNum, 'char-composition');
                settings.push(`配置・構図: ${compositionText}`);
            }

            if (char.lighting && char.lighting !== '指定なし') {
                const lightingText = getCharSelectText(charNum, 'char-lighting');
                settings.push(`ライティング: ${lightingText}`);
            }
        }
    });

    return settings.join('\n');
}

function copyPrompt(type) {
    const textareaId = type === 'english' ? 'englishPrompt' : 'japaneseSettings';
    const textarea = document.getElementById(textareaId);

    if (!textarea) return;

    // Select and copy text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        alert(type === 'english' ? '✅ 英語プロンプトをコピーしました！' : '✅ 日本語設定をコピーしました！');
    } catch (err) {
        alert('コピーに失敗しました。手動で選択してコピーしてください。');
    }

    // Deselect
    window.getSelection().removeAllRanges();
}

// Background type handling
const backgroundRadios = document.querySelectorAll('input[name="background"]');
const backgroundUpload = document.getElementById('backgroundUpload');
const backgroundText = document.getElementById('backgroundText');

backgroundRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'upload') {
            backgroundUpload.style.display = 'block';
            backgroundText.style.display = 'none';
        } else if (e.target.value === 'text') {
            backgroundUpload.style.display = 'none';
            backgroundText.style.display = 'block';
        } else {
            backgroundUpload.style.display = 'none';
            backgroundText.style.display = 'none';
        }
    });
});

// Image stock management
let selectedImages = [];
const maxSelection = 2;

function addToStock(imageData) {
    const gallery = document.getElementById('imageStock');
    const emptyMessage = gallery.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }

    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.dataset.index = gallery.children.length;

    const img = document.createElement('img');
    img.src = 'data:image/png;base64,' + imageData;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = '📥 保存';
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        downloadImage(imageData);
    };

    imageItem.appendChild(img);
    imageItem.appendChild(downloadBtn);

    imageItem.addEventListener('click', () => toggleImageSelection(imageItem));

    gallery.appendChild(imageItem);
}

function toggleImageSelection(imageItem) {
    const index = parseInt(imageItem.dataset.index);

    if (selectedImages.includes(index)) {
        selectedImages = selectedImages.filter(i => i !== index);
        imageItem.classList.remove('selected');
        const badge = imageItem.querySelector('.select-badge');
        if (badge) badge.remove();
    } else {
        if (selectedImages.length >= maxSelection) {
            // Remove first selection
            const firstIndex = selectedImages[0];
            const firstItem = document.querySelector(`.image-item[data-index="${firstIndex}"]`);
            firstItem.classList.remove('selected');
            const badge = firstItem.querySelector('.select-badge');
            if (badge) badge.remove();
            selectedImages.shift();
        }

        selectedImages.push(index);
        imageItem.classList.add('selected');

        const badge = document.createElement('div');
        badge.className = 'select-badge';
        badge.textContent = selectedImages.length;
        imageItem.appendChild(badge);
    }

    updateMergeButtons();
}

function updateMergeButtons() {
    const mergeVertical = document.getElementById('mergeVertical');
    const mergeHorizontal = document.getElementById('mergeHorizontal');

    if (selectedImages.length === 2) {
        mergeVertical.disabled = false;
        mergeHorizontal.disabled = false;
    } else {
        mergeVertical.disabled = true;
        mergeHorizontal.disabled = true;
    }
}

function downloadImage(imageData, filename = 'manga_panel.png') {
    const link = document.createElement('a');
    link.href = 'data:image/png;base64,' + imageData;
    link.download = filename;
    link.click();
}

// Collect form data
function collectFormData() {
    const data = {
        api_key: document.getElementById('apiKey').value,
        common: {
            art_style: document.getElementById('artStyle').value,
            background_type: document.querySelector('input[name="background"]:checked').value,
            background_text: document.getElementById('backgroundText').value,
            aspect_ratio: document.querySelector('.btn-aspect.active').dataset.ratio,
            story: document.getElementById('story').value,
            distance: document.getElementById('distance').value,
            angle: document.getElementById('angle').value,
            lens: document.getElementById('lens').value,
            multi_person: document.getElementById('multiPerson').value,
            special: document.getElementById('special').value
        },
        characters: []
    };

    // Collect character data
    for (let i = 1; i <= 3; i++) {
        const enabled = document.querySelector(`.char-enable[data-char="${i}"]`).checked;

        if (enabled) {
            const char = {
                enabled: true,
                name: document.querySelector(`.char-name[data-char="${i}"]`).value,
                appearance: document.querySelector(`.char-appearance[data-char="${i}"]`).value,
                expression: document.querySelector(`.char-expression[data-char="${i}"]`).value,
                onomatopoeia: document.querySelector(`.char-onomatopoeia[data-char="${i}"]`).value,
                position: document.querySelector(`input[name="char${i}Position"]:checked`).value,
                face_direction: document.querySelector(`.char-face-direction[data-char="${i}"]`).value,
                body_orientation: document.querySelector(`input[name="char${i}BodyOrient"]:checked`).value,
                body_movement: document.querySelector(`.char-body-movement[data-char="${i}"]`).value,
                direction: document.querySelector(`.char-direction[data-char="${i}"]`).value,
                composition: document.querySelector(`.char-composition[data-char="${i}"]`).value,
                lighting: document.querySelector(`.char-lighting[data-char="${i}"]`).value
            };

            data.characters.push(char);
        }
    }

    return data;
}

// Generate image
document.getElementById('generateBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;

    if (!apiKey) {
        alert('APIキーを入力してください');
        return;
    }

    const formData = collectFormData();

    // Show loading
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('generateBtn').disabled = true;

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            addToStock(result.image);

            // Display prompts
            document.getElementById('englishPrompt').value = result.prompt || '';
            document.getElementById('japaneseSettings').value = buildJapaneseSettings(formData);
            document.getElementById('promptDisplay').style.display = 'block';

            // Scroll to prompt display
            document.getElementById('promptDisplay').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert('エラー: ' + (result.error || '画像生成に失敗しました'));
        }
    } catch (error) {
        alert('エラー: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('generateBtn').disabled = false;
    }
});

// Merge images
async function mergeImages(direction) {
    if (selectedImages.length !== 2) {
        alert('2枚の画像を選択してください');
        return;
    }

    try {
        const response = await fetch('/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                indices: selectedImages,
                direction: direction
            })
        });

        const result = await response.json();

        if (result.success) {
            downloadImage(result.image, `merged_${direction}.png`);
        } else {
            alert('エラー: ' + (result.error || '画像結合に失敗しました'));
        }
    } catch (error) {
        alert('エラー: ' + error.message);
    }
}

document.getElementById('mergeVertical').addEventListener('click', () => {
    mergeImages('vertical');
});

document.getElementById('mergeHorizontal').addEventListener('click', () => {
    mergeImages('horizontal');
});
