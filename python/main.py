import tensorflow as tf
import sys
import json
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Указание пути к модели и изображениям
model_path = "D:/Students/pet-project/model/mobilenetv2_model.h5"
image_path = sys.argv[1]

# Список классов и их перевод на русский
selected_classes = {
    'Su57': 'Су-57',
    'Su34': 'Су-34',
    'Su25': 'Су-25',
    'Su24': 'Су-24',
    'Mig31': 'МиГ-31',
    'Mig29': 'МиГ-29',
    'An124': 'Ан-124-100'
}

# Загружаем модель
try:
    model = load_model(model_path)
except Exception as e:
    sys.stderr.write(f"Ошибка при загрузке модели: {e}\n")
    sys.exit(1)

# Загружаем и подготавливаем изображение
try:
    img = image.load_img(image_path, target_size=(180, 180))  # Укажите нужный размер
    img_array = image.img_to_array(img) / 255.0  # Нормализация
    img_array = np.expand_dims(img_array, axis=0)  # Добавляем размерность для батча
except Exception as e:
    sys.stderr.write(f"Ошибка при загрузке изображения: {e}\n")
    sys.exit(1)

# Делаем предсказание
try:
    prediction = model.predict(img_array)
except Exception as e:
    sys.stderr.write(f"Ошибка при предсказании: {e}\n")
    sys.exit(1)

# Находим индекс класса с наибольшей вероятностью
predicted_class_index = np.argmax(prediction)

# Получаем название класса на русском языке
predicted_class_name = selected_classes[list(selected_classes.keys())[predicted_class_index]]

# Возвращаем результат в формате JSON
result = {"prediction": predicted_class_name}
# Печатаем результат в формате JSON с кодировкой UTF-8
sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))

