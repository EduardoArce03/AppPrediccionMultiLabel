from flask import Flask, request, jsonify, render_template
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import base64
from io import BytesIO
from flask_cors import CORS


# Configuración del servidor Flask
app = Flask(__name__)

# Habilitar CORS
CORS(app)


# Ruta al modelo entrenado
MODEL_PATH = "/home/eduardo-arce/Documentos/Inteligencia Artificial/Segundo_Interciclo/Modelos/best_model.keras"
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
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Guardar el archivo
        upload_folder = os.path.join('static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)

    elif 'image-data' in request.form:
        image_data = request.form['image-data']
        image_data = image_data.split(',')[1]  # Remover el encabezado de base64
        image = Image.open(BytesIO(base64.b64decode(image_data)))

        # Asegurarse de que la imagen esté en modo RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')  # Convertir a RGB para guardar como JPEG

        file_path = os.path.join('static', 'uploads', 'captured_image.jpg')
        image.save(file_path, 'JPEG')  # Especificar explícitamente el formato JPEG

    
    else:
        return jsonify({'error': 'No image data provided'}), 400

    # Realizar la predicción
    try:
        predicted_categories, _ = predict_image(model, file_path, threshold=0.2)
        # Log de las predicciones en la consola
        print(f"Predicciones realizadas: {predicted_categories}")
        return jsonify({'predictions': predicted_categories})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ejecución del servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
