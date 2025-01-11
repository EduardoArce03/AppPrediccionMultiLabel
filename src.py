from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import base64
from io import BytesIO
from flask_cors import CORS
import psycopg2  # Para conexión a la base de datos
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
# Configuración del servidor Flask
app = Flask(__name__)

MEGABYTE = (2 ** 10) ** 2
app.config['MAX_CONTENT_LENGTH'] = None
# Max number of fields in a multi part form (I don't send more than one file)
# app.config['MAX_FORM_PARTS'] = ...
app.config['MAX_FORM_MEMORY_SIZE'] = 50 * MEGABYTE
# Habilitar CORS
CORS(app)

#PAVLO
MODEL_PATH = "C:/Users/pablo/OneDrive/Documentos/GitHub/AppPrediccionMultiLabel/best_model.keras"
#MODEL_PATH = "best_model.keras"
#MODEL_PATH = "/home/eduardo-arce/Documentos/Inteligencia Artificial/Segundo_Interciclo/Modelos/best_model.keras"
model = load_model(MODEL_PATH)

# Configuración de categorías (COCO)
from pycocotools.coco import COCO
ANNOTATIONS_FILE = "C:/Users/pablo/Downloads/annotations_trainval2017/annotations/instances_train2017.json"
#ANNOTATIONS_FILE = "C:/Users/dcpor/Downloads/annotations/instances_train2017.json"
#ANNOTATIONS_FILE = "/home/eduardo-arce/Descargas/annotations_trainval2017/annotations/instances_train2017.json"
coco = COCO(ANNOTATIONS_FILE)
categories = coco.loadCats(coco.getCatIds())

# Mapeo de ID de categoría a índicee
category_id_to_index = {cat['id']: idx for idx, cat in enumerate(categories)}

#PASS PAVLO
password = "admin"
#PASS EDU
#password = "edu123"
#password = "postgres"

# Función para conectarse a la base de datos
def get_db_connection():
    conn = psycopg2.connect(
        dbname='postgres', 
        user='postgres', 
        password=password, 
        host='localhost', 
        port='5432'
    )
    return conn

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

# Ruta para guardar los resultados de predicción y la imagen
def save_prediction_to_db(image_url, predictions, user_id, audio_url):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO predictions(image_url, predictions, user_id, audio_url) VALUES (%s, %s, %s, %s)",
                (image_url, ", ".join(predictions), user_id, audio_url)  # Guardar las predicciones como texto
            )
            conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error al guardar en la base de datos: {e}")

# Rutas Flask
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() if request.is_json else request.form
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'Usuario no autenticado'}), 401

    # Validar si se envió un archivo o una imagen codificada en base64
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Generar un nombre único para el archivo
        unique_filename = f"{uuid4().hex}_{file.filename}"
        upload_folder = os.path.join('static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)

        # Generar la URL pública para el archivo
        image_url = f"http://localhost:5000/{file_path.replace(os.path.sep, '/')}"

    elif 'image-data' in request.form:
        image_data = request.form['image-data']
        image_data = image_data.split(',')[1]  # Remover el encabezado de base64
        image = Image.open(BytesIO(base64.b64decode(image_data)))

        # Asegurarse de que la imagen esté en modo RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')  # Convertir a RGB para guardar como JPEG

        # Generar un nombre único para el archivo
        unique_filename = f"{uuid4().hex}.jpg"
        upload_folder = os.path.join('static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, unique_filename)
        image.save(file_path, 'JPEG')  # Especificar explícitamente el formato JPEG

        # Generar la URL pública para el archivo
        image_url = f"http://localhost:5000/static/uploads/{unique_filename}"
    else:
        return jsonify({'error': 'No image data provided'}), 400

    # Realizar la predicción
    try:
        predicted_categories, _ = predict_image(model, file_path, threshold=0.2)
        print(f"Predicciones realizadas: {predicted_categories}")

        # Generar el audio con las predicciones
        audio_filename = generate_audio(predicted_categories)
        
        audio_url = f"http://localhost:5000/{audio_filename}"
                # Guardar la imagen y las predicciones en la base de datos
        save_prediction_to_db(image_url, predicted_categories, user_id, audio_url)
        
        return jsonify({
            'predictions': predicted_categories,
            'audio_url': audio_url
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recent-predictions', methods=['GET'])
def get_recent_predictions():
    user_id = request.args.get('user_id')  # Obtener user_id desde los parámetros GET

    if not user_id:
        return jsonify({'error': 'user_id es requerido'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Seleccionar las predicciones recientes del usuario autenticado
            cursor.execute("""
                SELECT p.image_url, p.predictions, p.timestamp, p.user_id, u.name AS nombre
                FROM predictions p
                JOIN users u 
                ON p.user_id = u.id
                WHERE p.user_id = %s
                ORDER BY p.timestamp DESC
                LIMIT 10;
            """, (user_id,))
            rows = cursor.fetchall()
        conn.close()

        predictions_data = [
            {
                'image_url': row[0],
                'predictions': row[1],
                'timestamp': row[2],
                'nombre': row[4]
            } for row in rows
        ]

        return jsonify({'predictions': predictions_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/all-predictions', methods=['GET'])
def get_predictions():
    user_id = request.args.get('user_id')  # Obtener user_id desde los parámetros GET

    if not user_id:
        return jsonify({'error': 'user_id es requerido'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Seleccionar las predicciones recientes del usuario autenticado
            cursor.execute("""
                SELECT p.image_url, p.predictions, p.timestamp, p.user_id, u.name AS nombre
                FROM predictions p
                JOIN users u 
                ON p.user_id = u.id
                WHERE p.user_id = %s
                ORDER BY p.timestamp DESC;
            """, (user_id,))
            rows = cursor.fetchall()
        conn.close()

        predictions_data = [
            {
                'image_url': row[0],
                'predictions': row[1],
                'timestamp': row[2],
                'nombre': row[4]
            } for row in rows
        ]

        return jsonify({'predictions': predictions_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/graphic-predictions', methods=['GET'])
def get_graphic_predictions():
    user_id = request.args.get('user_id')  # Obtener user_id desde los parámetros GET

    if not user_id:
        return jsonify({'error': 'user_id es requerido'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Seleccionar las predicciones recientes del usuario autenticado
            cursor.execute("""
                SELECT p.predictions
                FROM predictions p
                JOIN users u 
                ON p.user_id = u.id
                WHERE p.user_id = %s
                ORDER BY p.timestamp DESC;
            """, (user_id,))
            rows = cursor.fetchall()
        conn.close()

        # Procesar los datos
        predictions_data = [
            {
                'predictions': row[0].split(', ')  # Convertir la cadena en una lista
            } for row in rows
        ]

        return jsonify({'predictions': predictions_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/total-predictions', methods=['GET'])
def get_all_predictions():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Seleccionar todas las predicciones con información del usuario asociado
            cursor.execute("""
                SELECT p.image_url, p.predictions, p.timestamp, u.id AS user_id, u.name AS nombre
                FROM predictions p
                JOIN users u 
                ON p.user_id = u.id
                ORDER BY p.timestamp DESC;
            """)
            rows = cursor.fetchall()
        conn.close()

        predictions_data = [
            {
                'image_url': row[0],
                'predictions': row[1],
                'timestamp': row[2],
                'user_id': row[3],
                'nombre': row[4]
            } for row in rows
        ]

        return jsonify({'predictions': predictions_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# LOGICA DE AUTENTICACION (REGISTRO Y LOGEO)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                (name, email, hashed_password)
            )
            conn.commit()
        conn.close()
        return jsonify({'message': 'Usuario registrado exitosamente'}), 201
    except Exception as e:
        return jsonify({'error': f'Error al registrar: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Todos los campos son obligatorios'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name, password FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

        conn.close()

        if user and check_password_hash(user[2], password):
            return jsonify({'message': 'Inicio de sesión exitoso', 'user': {'id': user[0], 'name': user[1]}}), 200
        else:
            return jsonify({'error': 'Correo o contraseña incorrectos'}), 401
    except Exception as e:
        return jsonify({'error': f'Error al iniciar sesión: {str(e)}'}), 500


# enviar la imagen al frontend

@app.route('/static/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory('static/uploads', filename)

#API SPEECH TO TEXT
from google.cloud import texttospeech
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'project_clv.json'
client = texttospeech.TextToSpeechClient()
import os
from uuid import uuid4
from google.cloud import texttospeech

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'project_clv.json'
client = texttospeech.TextToSpeechClient()

def generate_audio(predictions):
    predicted_objects = ', '.join(predictions)
    text = f"Los objetos detectados en la imagen son: {predicted_objects}"
    
    synthesis_input = texttospeech.SynthesisInput(text=text)
    
    voice = texttospeech.VoiceSelectionParams(
        language_code="es-ES",
        name="es-ES-Standard-A",
    )
    
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    
    # Crear el directorio 'static/audio' si no existe
    audio_folder = 'static/audio'
    os.makedirs(audio_folder, exist_ok=True)

    audio_filename = os.path.join(audio_folder, f"{uuid4().hex}.mp3")
    with open(audio_filename, "wb") as out:
        out.write(response.audio_content)
        print(f'Audio content written to file {audio_filename}')
    return audio_filename

# Ejecución del servidor Flask
if __name__ == '__main__':
    app.run(debug=True)