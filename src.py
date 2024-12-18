from flask import Flask, request, jsonify, render_template
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

# Configuración del servidor Flask
app = Flask(__name__)

# Ruta al modelo entrenado
MODEL_PATH = '/home/eduardo-arce/Documentos/Inteligencia Artificial/Segundo_Interciclo/App_IA/best_model.keras'
model = load_model(MODEL_PATH)

# Configuración de categorías (COCO)
from pycocotools.coco import COCO

ANNOTATIONS_FILE = "/home/eduardo-arce/Descargas/annotations_trainval2017/annotations/instances_train2017.json"
coco = COCO(ANNOTATIONS_FILE)
categories = coco.loadCats(coco.getCatIds())

# Mapeo de ID de categoría a índice
category_id_to_index = {cat['id']: idx for idx, cat in enumerate(categories)}

# Función de predicción
def predict_image(model, image_path, threshold=0.5):
    img_size = (256, 256)  # Tamaño esperado por el modelo
    img = Image.open(image_path).convert('RGB').resize(img_size)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # Añadir batch dimension

    prediction = model.predict(img_array)[0]  # Predicción para un batch único
    predicted_categories = [
        categories[idx]['name'] for idx, prob in enumerate(prediction) if prob > threshold
    ]
    return predicted_categories, img_array[0]

# Rutas Flask
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    # Obtener el archivo subido
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Guardar el archivo temporalmente
    file_path = os.path.join('uploads', file.filename)
    os.makedirs('uploads', exist_ok=True)
    file.save(file_path)

    # Realizar la predicción
    try:
        predicted_categories, img_array = predict_image(model, file_path, threshold=0.2)
        return jsonify({'predictions': predicted_categories})
    finally:
        # Eliminar el archivo temporal
        os.remove(file_path)

# Ejecución del servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
