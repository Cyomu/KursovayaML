// Функция для предварительного просмотра изображения
function previewImage() {
    let file = document.getElementById('image').files[0];
    let reader = new FileReader();

    reader.onloadend = function () {
        let imagePreview = document.getElementById('imagePreview');
        let preview = document.getElementById('preview');
        preview.src = reader.result;
        imagePreview.style.display = 'block';
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
        let response = await fetch('/classify', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            let result = await response.json();
            let resultText = document.getElementById('resultText');
            resultText.style.color = 'white';
            resultText.textContent = `Это похоже на: ${result.prediction}`;
            document.getElementById('resultText').style.fontSize = '30px';
            document.getElementById('classificationResult').style.display = 'block';
        } else {
            alert('Ошибка при классификации.');
        }
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка при классификации.');
    }
});
