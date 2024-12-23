import torch
import sys
import os
from pathlib import Path
import shutil
from PIL import Image

# Пути
MODEL_PATH = "D:/Students/pet-project/model/best.pt"
IMAGE_PATH = sys.argv[1]  # Путь к изображению, переданный в командной строке
SAVE_DIR = Path("D:/Students/pet-project/detection_result")

# Удаляем старые результаты, если они есть
if SAVE_DIR.exists():
    shutil.rmtree(SAVE_DIR)  # Удаляем старую папку, чтобы избежать создания новых папок

# Создаем новую папку для сохранения результатов
os.makedirs(SAVE_DIR)

# Загружаем модель
model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, force_reload=True)

# Выполняем предсказание
results = model(IMAGE_PATH)

# Сохраняем только одно изображение с использованием метода .save(), но без создания дополнительных папок
# Вместо того чтобы использовать results.save(), копируем результат вручную:
result_image_path = SAVE_DIR / "processed_image.jpg"

# Сохраняем первое изображение (если их несколько) в нужную папку
results.render()  # Это рендерит изображение с результатами в память
image_result = results.ims[0]  # Доступ к первому изображению после рендеринга

# Сохраняем его
image_result_pil = Image.fromarray(image_result)
image_result_pil.save(result_image_path)

# Выводим путь к изображению
print(f"Результат сохранен в: {result_image_path}")
