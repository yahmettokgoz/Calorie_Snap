from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya bulunamadı'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Dosya ismi boş'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return jsonify({'message': 'Dosya başarıyla yüklendi', 'filename': filename}), 200


@app.route('/predict', methods=['POST'])
def predict_image():
    data = request.get_json()

    if not data or 'filename' not in data:
        return jsonify({'error': 'Geçersiz veri'}), 400

    filename = data['filename']
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return jsonify({'error': 'Dosya bulunamadı'}), 404

    # MOCK TAHMİN (gerçek model entegrasyonu burada yapılabilir)
    result = "banana"  # Örneğin sabit bir çıktı veriyoruz test için

    return jsonify({'prediction': result}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
