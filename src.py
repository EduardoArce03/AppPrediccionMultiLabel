from flask import Flask, request, jsonify, render_template
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import base64
from io import BytesIO

# Configuración del servidor Flask
app = Flask(__name__)

# Ruta al modelo entrenado
MODEL_PATH = 'C:/Users/pablo/OneDrive/Documentos/GitHub/AppPrediccionMultiLabel/best_model.keras'
model = load_model(MODEL_PATH)

# Configuración de categorías (COCO)
from pycocotools.coco import COCO

ANNOTATIONS_FILE = "C:/Users/pablo/Downloads/annotations_trainval2017/annotations/instances_train2017.json"
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
    # Verificar si se subió un archivo o una imagen de la cámara
    if 'file' in request.files:
        # Procesar archivo subido
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Guardar el archivo en la carpeta 'static/uploads'
        upload_folder = os.path.join('static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)

    elif 'image-data' in request.form:
        # Procesar imagen de la cámara
        image_data = request.form['image-data']
        image_data = image_data.split(',')[1]  # Remover el encabezado de base64
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        file_path = os.path.join('static', 'uploads', 'captured_image.jpg')
        image.save(file_path)
    else:
        return jsonify({'error': 'No image data provided'}), 400

    # Realizar la predicción
    predicted_categories = []
    try:
        predicted_categories, _ = predict_image(model, file_path, threshold=0.2)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Retornar el template con la imagen y las predicciones
    return render_template(
        'index.html', 
        uploaded_image=os.path.basename(file_path), 
        predictions=predicted_categories
    )

# Ejecución del servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
