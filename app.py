import os
import io
import base64
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Password for app access
APP_PASSWORD = os.environ.get('APP_PASSWORD', 'shigotoyou27-')


@app.route('/')
def login():
    """Login page"""
    if session.get('authenticated'):
        return redirect(url_for('main'))
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def do_login():
    """Handle login"""
    password = request.form.get('password', '')
    if password == APP_PASSWORD:
        session['authenticated'] = True
        return redirect(url_for('main'))
    return render_template('login.html', error='パスワードが正しくありません')


@app.route('/logout')
def logout():
    """Logout"""
    session.clear()
    return redirect(url_for('login'))


@app.route('/main')
def main():
    """Main application page"""
    if not session.get('authenticated'):
        return redirect(url_for('login'))
    
    # Initialize image stock in session if not exists
    if 'image_stock' not in session:
        session['image_stock'] = []
    
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image using Gemini API"""
    if not session.get('authenticated'):
        return jsonify({'error': '認証が必要です'}), 401
    
    try:
        data = request.json
        api_key = data.get('api_key', '')
        
        if not api_key:
            return jsonify({'error': 'APIキーを入力してください'}), 400
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Build prompt from form data
        prompt = build_prompt(data)
        
        # Generate image using Gemini
        model = genai.ImageGenerationModel('imagen-3.0-generate-001')
        
        # Get aspect ratio
        aspect_ratio = data.get('common', {}).get('aspect_ratio', '1:1')
        aspect_ratio_map = {
            '1:1': '1:1',
            '2:3': '3:4',  # Closest match
            '16:9': '16:9'
        }
        
        result = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio=aspect_ratio_map.get(aspect_ratio, '1:1'),
            safety_filter_level='block_only_high',
            person_generation='allow_adult'
        )
        
        # Convert image to base64
        image = result.images[0]
        buffered = io.BytesIO()
        image._pil_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Store image in session
        if 'image_stock' not in session:
            session['image_stock'] = []
        session['image_stock'].append(img_str)
        session.modified = True
        
        return jsonify({
            'success': True,
            'image': img_str,
            'prompt': prompt
        })
        
    except Exception as e:
        return jsonify({'error': f'画像生成エラー: {str(e)}'}), 500


def build_prompt(data):
    """Build prompt from form data"""
    common = data.get('common', {})
    characters = data.get('characters', [])
    
    prompt_parts = []
    
    # Art style
    if common.get('art_style'):
        prompt_parts.append(f"Art style: {common['art_style']}")
    
    # Story content
    if common.get('story'):
        prompt_parts.append(f"Scene: {common['story']}")
    
    # Background
    bg_type = common.get('background_type', 'white')
    if bg_type == 'text' and common.get('background_text'):
        prompt_parts.append(f"Background: {common['background_text']}")
    elif bg_type == 'white':
        prompt_parts.append("Background: white background")
    
    # Common composition options
    composition_fields = [
        ('distance', '距離・範囲'),
        ('angle', 'アングル'),
        ('lens', 'レンズ・効果'),
        ('multi_person', '多人数・関係'),
        ('special', '特殊演出')
    ]
    
    for field, label in composition_fields:
        value = common.get(field, '')
        if value and value != '指定なし':
            prompt_parts.append(f"{label}: {value}")
    
    # Characters
    enabled_chars = [char for char in characters if char.get('enabled')]
    
    if enabled_chars:
        char_descriptions = []
        for i, char in enumerate(enabled_chars, 1):
            char_parts = []
            
            if char.get('name'):
                char_parts.append(f"Name: {char['name']}")
            
            if char.get('appearance'):
                char_parts.append(f"Appearance: {char['appearance']}")
            else:
                char_parts.append("Appearance: determined from story context")
            
            if char.get('expression'):
                char_parts.append(f"Expression: {char['expression']}")
            else:
                char_parts.append("Expression: appropriate for the scene")
            
            # Position
            position = char.get('position', '真ん中')
            char_parts.append(f"Position in frame: {position}")
            
            # Face direction
            face_dir = char.get('face_direction', '')
            if face_dir and face_dir != '指定なし':
                char_parts.append(f"Face direction: {face_dir}")
            
            # Body orientation
            body_orient = char.get('body_orientation', '正面')
            char_parts.append(f"Body orientation: {body_orient}")
            
            # Body movement
            if char.get('body_movement'):
                char_parts.append(f"Movement: {char['body_movement']}")
            
            # Additional composition
            for field in ['direction', 'composition', 'lighting']:
                value = char.get(field, '')
                if value and value != '指定なし':
                    char_parts.append(f"{field}: {value}")
            
            # Onomatopoeia
            if char.get('onomatopoeia'):
                char_parts.append(f"Sound effect: {char['onomatopoeia']}")
            
            char_descriptions.append(f"Character {i}: {', '.join(char_parts)}")
        
        prompt_parts.extend(char_descriptions)
    
    # No dialogue text in image
    prompt_parts.append("No text or dialogue in the image")
    
    # Manga/comic style
    prompt_parts.append("Manga/comic panel style illustration")
    
    return ". ".join(prompt_parts)


@app.route('/merge', methods=['POST'])
def merge_images():
    """Merge two images vertically or horizontally"""
    if not session.get('authenticated'):
        return jsonify({'error': '認証が必要です'}), 401
    
    try:
        data = request.json
        indices = data.get('indices', [])
        direction = data.get('direction', 'vertical')
        
        if len(indices) != 2:
            return jsonify({'error': '2枚の画像を選択してください'}), 400
        
        image_stock = session.get('image_stock', [])
        
        if not all(0 <= i < len(image_stock) for i in indices):
            return jsonify({'error': '無効な画像インデックス'}), 400
        
        # Load images from base64
        img1_data = base64.b64decode(image_stock[indices[0]])
        img2_data = base64.b64decode(image_stock[indices[1]])
        
        img1 = Image.open(io.BytesIO(img1_data))
        img2 = Image.open(io.BytesIO(img2_data))
        
        # Merge images
        if direction == 'vertical':
            # Stack vertically
            max_width = max(img1.width, img2.width)
            total_height = img1.height + img2.height
            
            merged = Image.new('RGB', (max_width, total_height), 'white')
            merged.paste(img1, (0, 0))
            merged.paste(img2, (0, img1.height))
        else:
            # Stack horizontally
            total_width = img1.width + img2.width
            max_height = max(img1.height, img2.height)
            
            merged = Image.new('RGB', (total_width, max_height), 'white')
            merged.paste(img1, (0, 0))
            merged.paste(img2, (img1.width, 0))
        
        # Convert merged image to base64
        buffered = io.BytesIO()
        merged.save(buffered, format="PNG")
        merged_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': merged_str
        })
        
    except Exception as e:
        return jsonify({'error': f'画像結合エラー: {str(e)}'}), 500


@app.route('/clear_stock', methods=['POST'])
def clear_stock():
    """Clear image stock"""
    if not session.get('authenticated'):
        return jsonify({'error': '認証が必要です'}), 401
    
    session['image_stock'] = []
    session.modified = True
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
