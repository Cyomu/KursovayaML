// Функция для предварительного просмотра изображения
function previewImage() {
    let file = document.getElementById('image').files[0];
    let reader = new FileReader();

    reader.onloadend = function () {
        let imagePreview = document.getElementById('imagePreview');
        let preview = document.getElementById('preview');
        preview.src = reader.result;
        imagePreview.style.display = 'block';

        // Скрываем предыдущий результат, если он был
        let resultImage = document.getElementById('resultImage');
        resultImage.style.display = 'none';
        document.getElementById('classificationResult').style.display = 'none';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Отправка формы через AJAX
document.getElementById('classificationForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Отменить стандартное поведение формы

    let formData = new FormData(this);

    try {
        let response = await fetch('/detect', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Получаем путь к обработанному изображению
            let result = await response.json();
            let resultImagePath = result.resultImagePath;

            // Обновляем src изображения для результата (с добавлением уникальной метки времени)
            let resultImage = document.getElementById('resultImage');
            resultImage.src = resultImagePath + '?t=' + new Date().getTime(); // Уникальная метка времени
            resultImage.style.display = 'block';

            // Показываем результат
            document.getElementById('classificationResult').style.display = 'block';
        } else {
            alert('Ошибка при детектировании.');
        }
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка при детектировании.');
    }
});

// Обработчик события изменения файла (для загрузки нового изображения)
document.getElementById('image').addEventListener('change', function () {
    // Скрываем старый результат, если был
    let resultImage = document.getElementById('resultImage');
    resultImage.style.display = 'none';
    document.getElementById('classificationResult').style.display = 'none';

    // Показываем превью нового изображения
    previewImage();
});
