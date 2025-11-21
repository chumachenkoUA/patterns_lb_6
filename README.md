# SOLID Users Service

Навчальний бекенд-проєкт, що демонструє реалізацію SOLID-принципів на стеку **Node.js + Express + MySQL + Prisma**. Сервіс надає повний CRUD для користувачів із ролями `USER`, `ADMIN`, `SUPER_ADMIN` та використовує UUID як публічний ідентифікатор.

## Необхідні інструменти

- Node.js 18+
- npm 9+
- MySQL/MariaDB 10.5+ (або сумісний MySQL 8+)
- Prisma CLI (`npm run prisma:generate`)

## Встановлення залежностей

```bash
npm install
```

## Налаштування середовища

Створіть файл `.env` у корені та налаштуйте змінні (приклад):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=solid_users_db
DATABASE_URL="mysql://root:secret@127.0.0.1:3306/solid_users_db"
PORT=3000
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=3600
DEFAULT_USER_PASSWORD=ChangeMe123!
```

## Створення бази даних

```sql
CREATE DATABASE IF NOT EXISTS solid_users_db;
USE solid_users_db;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

> Під час запуску `npm run dev` застосунок автоматично виконує `CREATE TABLE IF NOT EXISTS ...`, тож достатньо створити лише базу (`CREATE DATABASE ...`). Усі DDL-команди логуються в термінал у форматованому вигляді.

> Для контрольованих змін схеми використовуйте `npm run prisma:migrate` (бере SQL із `prisma/migrations/0001_init/migration.sql`). Після редагування `schema.prisma` не забудьте `npm run prisma:generate`, щоб оновити Prisma Client.

## Запуск сервера

```bash
npm run dev   # запуск із nodemon
# або
npm start
```

Сервер слухає `http://localhost:3000` (порт можна змінити в `.env`). Переконайтеся, що перед запуском ви створили БД та виконали міграції Prisma.

## REST API

Усі відповіді мають вигляд:

```json
{ "success": true, "data": ... }
```

Або при помилці:

```json
{ "success": false, "error": "message" }
```

### 1. Отримати список користувачів

```bash
curl -X GET http://localhost:3000/api/users
curl -X GET "http://localhost:3000/api/users?role=ADMIN"
```

### 2. Отримати користувача за `public_id`

```bash
curl -X GET http://localhost:3000/api/users/<public_id>
```

### 3. Пошук користувача (email або внутрішній `id`)

```bash
# за email
curl -G http://localhost:3000/api/users/search --data-urlencode "email=john@example.com"

# за numeric id
curl -G http://localhost:3000/api/users/search --data-urlencode "id=5"
```

### 4. Створити користувача

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123","role":"ADMIN"}'
```

### 5. Оновити користувача

```bash
curl -X PUT http://localhost:3000/api/users/<public_id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","role":"SUPER_ADMIN"}'
```

### 6. Видалити користувача

```bash
curl -X DELETE http://localhost:3000/api/users/<public_id>
```

### 7. Статус сервісу

```bash
curl -X GET http://localhost:3000/status
```

### 8. Реєстрація та логін (JWT на 1 годину)

```bash
# реєстрація звичайного користувача
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Tester","email":"jane@test.com","password":"secret123"}'

# логін (отримати новий токен)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@test.com","password":"secret123"}'
```

У відповіді сервер повертає `token`, `expiresAt` (UNIX-мітка), `expiresIn` (секунди) та дані користувача без пароля. Токен можна зберігати в `localStorage` на клієнті; він дійсний 1 годину.

> Якщо в БД уже існують користувачі без паролів, під час старту сервісу їм автоматично виставиться пароль із `DEFAULT_USER_PASSWORD` (за замовчуванням `ChangeMe123!`). Змініть цю змінну в `.env`, залогіньтесь під старими акаунтами та поміняйте пароль.

## Архітектура

- `src/models` – доменні моделі.
- `src/repositories` – робота з базою даних через Prisma Client.
- `src/services` – бізнес-логіка (DIP: залежить від абстракції репозиторію).
- `src/controllers` – HTTP-рівень.
- `src/routes` – оголошення маршрутів.
- `src/middleware` – валідація та обробка помилок.
- `prisma/schema.prisma` та `prisma/migrations` – опис схеми й SQL-міграції (включно з `DEFAULT (UUID())` для `public_id`), які відповідають реальній БД.

Такий поділ відповідає принципам SRP, OCP, LSP, ISP та DIP: кожен шар має власну відповідальність, сервіси працюють через абстракції репозиторіїв, і в разі потреби реалізацію репозиторію можна замінити без змін у бізнес-логіці.
