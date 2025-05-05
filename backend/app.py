from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os
import time
from werkzeug.utils import secure_filename

# 📌 Veritabanı bağlantısı
conn = psycopg2.connect(
    host="localhost",
    database="calorie_snap_db",
    user="postgres",
    password="1451236asd",
    port="5432"
)

app = Flask(__name__)
CORS(app)

# 📌 Nutritionix API bilgileri
NUTRITIONIX_APP_ID = "6ed1c98f"
NUTRITIONIX_API_KEY = "75ca2a99aa995cfb2791eb434e475359"

# 📌 Mobil uygulamadan gelen fotoğrafı kaydeden route
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya bulunamadı.'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Dosya seçilmedi.'}), 400

    if file:
        filename = secure_filename(file.filename)
        timestamp = int(time.time())
        extension = os.path.splitext(filename)[1]
        new_filename = f"upload_{timestamp}{extension}"
        save_path = os.path.join(UPLOAD_FOLDER, new_filename)
        file.save(save_path)

        print(f"Dosya kaydedildi: {save_path}")
        return jsonify({'message': 'Fotoğraf başarıyla yüklendi.', 'filename': new_filename}), 200
    else:
        return jsonify({'error': 'Geçersiz dosya.'}), 400

# 📌 Yeni: Görselden sınıflandırma tahmini yapan endpoint
@app.route('/predict', methods=['GET'])
def predict_meal_from_latest_image():
    try:
        # uploads klasöründeki en son görseli bul
        files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(('.jpg', '.jpeg', '.png'))]
        if not files:
            return jsonify({"error": "Hiçbir fotoğraf bulunamadı."}), 404

        latest_file = max(files, key=lambda x: os.path.getctime(os.path.join(UPLOAD_FOLDER, x)))
        latest_path = os.path.join(UPLOAD_FOLDER, latest_file)

        print(f"Son yüklenen fotoğraf: {latest_file}")

        # 🔮 Burada yapay zeka modeliyle tahmin yapılabilir
        # Örnek olarak sabit bir yanıt dönüyoruz
        predicted_label = "banana"

        return jsonify({
            "filename": latest_file,
            "prediction": predicted_label
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📌 Yiyecek bilgisinden veri çekip veritabanına kaydeden route
@app.route('/nutrition', methods=['POST'])
def add_meal_from_nutrition():
    try:
        data = request.get_json()
        food = data.get('food')

        if not food:
            return jsonify({"error": "Yiyecek bilgisi eksik."}), 400

        url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "query": food,
            "timezone": "Europe/Istanbul"
        }

        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            return jsonify({"error": "API isteği başarısız.", "status_code": response.status_code}), 500

        result = response.json()
        foods = result.get('foods', [])

        if not foods:
            return jsonify({"error": "Yiyecek bulunamadı."}), 404

        food_data = foods[0]
        meal = {
            "meal_name": food_data.get("food_name"),
            "calories": food_data.get("nf_calories"),
            "protein": food_data.get("nf_protein"),
            "carbs": food_data.get("nf_total_carbohydrate"),
            "fat": food_data.get("nf_total_fat"),
            "created_at": datetime.now()
        }

        cur = conn.cursor()
        insert_query = """
            INSERT INTO meals (meal_name, calories, protein, carbs, fat, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cur.execute(insert_query, (
            meal["meal_name"],
            meal["calories"],
            meal["protein"],
            meal["carbs"],
            meal["fat"],
            meal["created_at"]
        ))
        conn.commit()
        cur.close()

        meal["created_at"] = meal["created_at"].strftime("%Y-%m-%d %H:%M:%S")

        return jsonify(meal), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📌 Veritabanındaki tüm meals kayıtlarını getiren route
@app.route('/meals', methods=['GET'])
def get_meals():
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM meals')
        meals = cur.fetchall()
        cur.close()

        for meal in meals:
            if meal.get('created_at'):
                meal['created_at'] = meal['created_at'].strftime("%Y-%m-%d %H:%M:%S")

        return jsonify(meals), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📌 Sunucuyu çalıştır
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
