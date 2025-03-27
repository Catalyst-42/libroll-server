# Libroll - server

Серверная часть приложения для учёта созданных займов книг в библиотеке. Написана на Node.js с использованием Express и PostgreSQL. База данных может быть удалённой или локальной. Для удалённой используется сервис Neon. 

### Установка и запуск

Для установки зависимостей выполните команду:

```sh
npm i
```

Для запуска сервера выполните команду:

```sh
npm start
```

### Конфигурация

В приложении используется файл `.env` для настройки параметров базы данных:

```
# JWT
SECRET_KEY=:(

# Database
LOCAL=true

LOCAL_DATABASE_URL=postgresql://localhost/libroll
REMOTE_DATABASE_URL=postgres://user:privatecode.aws.neon.tech/neondb?sslmode=require

# Export app for Vercel
VERCEL=false
```

<!--
TODO:

-->
