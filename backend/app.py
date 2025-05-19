from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import base64

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
