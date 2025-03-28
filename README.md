# ⚍ Libroll - server

Серверная часть приложения для учёта созданных займов книг в библиотеке. Написано на Node.js с использованием Express и PostgreSQL. База данных может быть удалённой или локальной. Для удалённой используется сервис Neon. Приложение может работать как локально так и на хостинге Vercel. 

> [!NOTE]  
> Frontend часть приложения лежит в репозитории [libroll-client](https://github.com/Catalyst-42/libroll-client).  

### Конечные точки API

- Общие
  - `GET`       `/` - Приветствие от сервера.
  - `GET`       `/health` - Проверка живоспособности сервера.
  - `GET`       `/database-health` - Проверка живоспособности базы данных.
  - `GET`       `/stats` - Получение статистики по записям: количество книг, пользователей, займов всего, активных и неактивных.
- Аутентификация
  - `POST`      `/auth/login` - Вход пользователя.
  - `POST`      `/auth/register` - Регистрация нового суперпользователя.
- Книги
  - `GET`       `/books` - Получить список всех книг.
  - `POST`      `/books` - Добавить новую книгу.
  - `GET`       `/books/:id` - Получить информацию о книге.
  - `PUT`       `/books/:id` - Обновить информацию о книге.
  - `DELETE`    `/books/:id` - Удалить книгу.
- Пользователи
  - `GET`       `/users` - Получить список всех пользователей.
  - `POST`      `/users` - Добавить нового пользователя.
  - `GET`       `/users/:id` - Получить информацию о пользователе.
  - `PUT`       `/users/:id` - Обновить информацию о пользователе.
  - `DELETE`    `/users/:id` - Удалить пользователя.
- Займы
  - `GET`       `/borrows` - Получить список всех займов.
  - `POST`      `/borrows` - Создать новый заём.
  - `GET`       `/borrows/:id` - Получить информацию о займе.
  - `PUT`       `/borrows/:id` - Обновить информацию о займе.
  - `DELETE`    `/borrows/:id` - Удалить заём.

Запросы на изменение данных требуют наличие JWT токена авторизации в заголовке запроса. Тогда запрос с использованием этого токена будет выглядеть примерно следующим образом: 

```sh
# Получаем JWT токен
curl -X POST http://localhost:5000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "username": "Cat",
  "password": "*****"
}'

# Ответ
{"token":"eyJhbGci.eZNlczN9.OjWJRDV"}

# Добавляем книгу
curl -X POST http://localhost:5000/books \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGci.eZNlczN9.OjWJRDV" \
-d '{
  "title": "Гарри Поттер и методы рационального мышления",
  "author": "Элиезер Юдковский",
  "total_count": "42"
}'

# Ответ
{"id":2}
```

А вообще лучше всего, конечно, использовать frontend приложение, специально для этого предназначенное. 

### Установка и запуск

Для установки зависимостей выполните команду:

```sh
npm i
```

Чтобы запустить приложение локально, убедитесь, что у вас установлены Node JS, PostgreSQL, и существует `.env` файл в корне проекта. Пример `.env` файла приведён ниже. 

```ini
# JWT
SECRET_KEY=:(

# Database
LOCAL=true

LOCAL_DATABASE_URL=postgresql://localhost/libroll
REMOTE_DATABASE_URL=postgres://user:privatecode.aws.neon.tech/neondb?sslmode=require

# Export app for Vercel
VERCEL=false
PORT=5000
```

Для запуска сервера выполните команду:

```sh
npm start
```

<!-- TODO:

 -->
