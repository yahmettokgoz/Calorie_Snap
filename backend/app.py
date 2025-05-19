from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import base64
import requests
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 📥 /upload: Fotoğraf yükleme
@app.route('/upload', methods=['POST'])
def upload_image():
    data = request.get_json()
    filename = data.get('filename')
    image_data = data.get('image_data')

    if not filename or not image_data:
        return jsonify({'error': 'Eksik veri'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, 'wb') as f:
        f.write(base64.b64decode(image_data))

    print("🟢 [UPLOAD] Base64 dosya kaydedildi:", file_path)
    return jsonify({'message': 'Dosya başarıyla yüklendi', 'filename': filename}), 200

# 🍽️ /search-foods: Besin arama
@app.route('/search-foods')
def search_foods():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Arama ifadesi eksik'}), 400

    API_ID = os.getenv("NUTRITIONIX_APP_ID") or "6ed1c98f"
    API_KEY = os.getenv("NUTRITIONIX_APP_KEY") or "75ca2a99aa995cfb2791eb434e475359"

    headers = {
        'x-app-id': API_ID,
        'x-app-key': API_KEY,
        'x-remote-user-id': '0',
    }

    params = {
        'query': query,
        'detailed': False,
    }

    try:
        response = requests.get(
            'https://trackapi.nutritionix.com/v2/search/instant',
            headers=headers,
            params=params
        )
        data = response.json()
        common = data.get('common', [])[:5]

        results = []
        for food in common:
            food_name = food.get('food_name', 'Unknown')
            # Detaylı bilgi için besin adı ile yeni istek at
            detail_response = requests.post(
                'https://trackapi.nutritionix.com/v2/natural/nutrients',
                headers=headers,
                json={"query": food_name}
            )
            detail_data = detail_response.json()
            if detail_data.get('foods'):
                calories = detail_data['foods'][0].get('nf_calories', 0)
            else:
                calories = 0

            results.append({
                'name': food_name.title(),
                'calories': round(calories)
            })

        return jsonify({'foods': results}), 200

    except Exception as e:
        print("❌ API Hatası:", e)
        return jsonify({'error': 'API bağlantı hatası'}), 500

# 🔍 /predict: filename üzerinden tahmin (şimdilik mock)
@app.route('/predict', methods=['POST'])
def predict_image():
    print("🟡 [PREDICT] Headers:", request.headers)
    print("🟡 [PREDICT] Raw Data:", request.data)

    data = request.get_json()
    if not data or 'filename' not in data:
        print("❌ [PREDICT] Geçersiz JSON veri.")
        return jsonify({'error': 'Geçersiz veri'}), 400

    filename = data['filename']
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        print("❌ [PREDICT] Dosya bulunamadı:", file_path)
        return jsonify({'error': 'Dosya bulunamadı'}), 404

    # Mock sonuç döndür
    result = "banana"
    print("✅ [PREDICT] Tahmin sonucu:", result)

    return jsonify({'prediction': result}), 200

@app.route('/food-details', methods=['POST'])
def get_food_details():
    data = request.get_json()
    food_name = data.get('food_name')

    if not food_name:
        return jsonify({'error': 'Yemek adı eksik'}), 400

    API_ID = os.getenv("NUTRITIONIX_APP_ID")
    API_KEY = os.getenv("NUTRITIONIX_APP_KEY")

    headers = {
        'x-app-id': API_ID,
        'x-app-key': API_KEY,
        'Content-Type': 'application/json',
    }

    payload = {
        'query': food_name
    }

    try:
        response = requests.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            headers=headers,
            json=payload
        )
        data = response.json()
        food = data.get('foods', [])[0]

        result = {
            'name': food.get('food_name', 'Unknown').title(),
            'calories': food.get('nf_calories', 0),
            'protein': food.get('nf_protein', 0),
            'fat': food.get('nf_total_fat', 0),
            'carbs': food.get('nf_total_carbohydrate', 0)
        }

        return jsonify(result), 200

    except Exception as e:
        print("❌ Detay API Hatası:", e)
        return jsonify({'error': 'Detaylar alınamadı'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
