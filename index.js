let express = require('express');
let multer = require('multer');
let fs = require('fs');
let path = require('path');
let { exec } = require('child_process');
let app = express();
let port = 3005;

// Настройка загрузки изображений
let upload = multer({
    dest: 'uploads/', // Папка для временного хранения загруженных файлов
    limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение на размер файла 5MB
    fileFilter: (req, file, cb) => {
        let allowedTypes = /jpeg|jpg|png/;
        let extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        let mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Ошибка: Неподдерживаемый тип файла'));
    },
});

// Настройки Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use('/result', express.static(path.join(__dirname, 'detection_result')));

// Главная страница
app.get('/', (req, res) => {
    res.render('main');
});

// Страница для загрузки изображения
app.get('/classification', (req, res) => {
    res.render('classification');
});

// Процесс классификации
app.post('/classify', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Нет файла для загрузки');
    }
    // Получаем путь к временно загруженному файлу
    let tempPath = path.join(__dirname, req.file.path);
    // Определяем расширение файла
    let extname = path.extname(req.file.originalname).toLowerCase();
    // Генерируем имя файла с правильным расширением
    let newFileName = req.file.filename + extname;
    // Новый путь к файлу с правильным расширением
    let newFilePath = path.join(__dirname, 'uploads', newFileName);
    // Переименовываем файл
    fs.rename(tempPath, newFilePath, (err) => {
        if (err) {
            console.error('Ошибка при переименовании файла:', err);
            return res.status(500).send('Ошибка при обработке файла');
        }
        console.log(`Файл сохранен как: ${newFilePath}`);
        // Команда для запуска Python-скрипта
        let command = `python "D:/Students/pet-project/python/main.py" "${newFilePath}"`;
        // Запуск Python-скрипта
        exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка выполнения скрипта: ${error.message}`);
                return res.status(500).send('Ошибка при классификации изображения');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            // Логируем вывод для отладки
            console.log('stdout (raw):', stdout);
            
            // Применяем регулярное выражение для извлечения только JSON
            const jsonMatch = stdout.match(/(\{.*\})/);  // Находим первый JSON-объект
            if (!jsonMatch) {
                console.error('Ошибка: не удалось извлечь JSON из вывода');
                return res.status(500).send('Ошибка при классификации изображения');
            }

            // Очищаем вывод от BOM и других символов
            let cleanedResult = jsonMatch[0];  // Извлекаем только JSON строку

            console.log('Очистка вывода:', cleanedResult); // Логируем очищенный вывод

            try {
                let parsedResult = JSON.parse(cleanedResult);  // Преобразуем строку в объект
                console.log('Распарсенный результат:', parsedResult);
                res.json(parsedResult);
            } catch (e) {
                console.error('Ошибка при парсинге результата:', e);
                return res.status(500).send('Ошибка при классификации изображения');
            }

            // Удаляем файл после обработки
            fs.unlink(newFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Ошибка при удалении файла:', unlinkErr);
                }
            });
        });
    });
});

// Страница для загрузки изображения
app.get('/detection', (req, res) => {
    res.render('detection');
});

// Процесс детектирования
app.post('/detect', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Нет файла для загрузки');
    }

    let tempPath = path.join(__dirname, req.file.path);
    let extname = path.extname(req.file.originalname).toLowerCase();
    let newFileName = req.file.filename + extname;
    let newFilePath = path.join(__dirname, 'uploads', newFileName);

    // Переименовываем файл
    fs.rename(tempPath, newFilePath, (err) => {
        if (err) {
            console.error('Ошибка при переименовании файла:', err);
            return res.status(500).send('Ошибка при обработке файла');
        }

        console.log(`Файл сохранен как: ${newFilePath}`);
        // Запуск Python-скрипта для детектирования
        let command = `python "D:/Students/pet-project/python/yolo.py" "${newFilePath}"`;

        exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка выполнения скрипта: ${error.message}`);
                return res.status(500).send('Ошибка при детектировании изображения');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            let resultPath = stdout.trim(); // Путь к обработанному изображению
            if (!resultPath) {
                console.error('Ошибка: пустой результат из скрипта');
                return res.status(500).send('Ошибка при детектировании изображения');
            }

            // Отправляем путь к обработанному изображению
            let relativePath = path.relative(__dirname, resultPath);
            res.json({ resultImagePath: `/result/${path.basename(resultPath)}?t=${new Date().getTime()}` });

            // Удаляем файл после обработки
            fs.unlink(newFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Ошибка при удалении файла:', unlinkErr);
                }
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
