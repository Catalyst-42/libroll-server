# Libroll - server
Серверная часть приложения для учёта созданных займов книг в библиотеке. Написана на Node.js с использованием Express и SQLite. 

Для удалённой базы данных используется сервис sqlitecloud. 

### Установка и запуск

Для установки зависимостей выполните команду:

```sh
npm i
```

Для запуска сервера выполните команду:

```sh
npm start
```

В приложении может находится .env файл с конфигурацией базы данных и других параметров:

```.env
# JWT
SECRET_KEY=:(

# Database
LOCAL=true
DATABASE_URL=https://example.com/db?apikey=42

# Export app for Vercel
VERCEL=false
```

<!-- TODO:
- [x] Separate .env settings for local and external database and for vercel
-->
