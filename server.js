import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './database.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/'), (req, res) => {
  res.send("I'm fine.");
}

// API для работы с книгами

// Получить все книги
app.get('/books', (req, res) => {
  db.all('SELECT * FROM Books', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Добавить новую книгу
app.post('/books', (req, res) => {
  const { title, author, total_count } = req.body;
  db.run(
    'INSERT INTO Books (title, author, total_count) VALUES (?, ?, ?)',
    [title, author, total_count],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Удалить книгу
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Books WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// API для работы с пользователями

// Получить всех пользователей
app.get('/users', (req, res) => {
  db.all('SELECT * FROM Users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Добавить нового пользователя
app.post('/users', (req, res) => {
  const { first_name, last_name } = req.body;
  db.run(
    'INSERT INTO Users (first_name, last_name) VALUES (?, ?)',
    [first_name, last_name],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Удалить пользователя
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// API для работы с взятыми книгами

// Получить все взятые книги
app.get('/borrowed-books', (req, res) => {
  db.all('SELECT * FROM BorrowedBooks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Взять книгу
app.post('/borrowed-books', (req, res) => {
  const { book_id, user_id, borrow_date, return_date } = req.body;

  // Проверка доступности книги
  db.get('SELECT total_count FROM Books WHERE id = ?', [book_id], (err, book) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!book) {
      res.status(404).json({ error: 'Книга не найдена' });
      return;
    }

    db.get(
      'SELECT COUNT(*) as count FROM BorrowedBooks WHERE book_id = ? AND status = "active"',
      [book_id],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (result.count >= book.total_count) {
          res.status(400).json({ error: 'Нет доступных книг' });
          return;
        }

        // Если книга доступна, создаем запись
        db.run(
          'INSERT INTO BorrowedBooks (book_id, user_id, borrow_date, return_date, status) VALUES (?, ?, ?, ?, "active")',
          [book_id, user_id, borrow_date, return_date],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID });
          }
        );
      }
    );
  });
});

// Маршрут для возврата книги
app.put('/borrowed-books/:id/return', (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE BorrowedBooks SET status = "returned" WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Запись не найдена или книга уже возвращена' });
        return;
      }
      res.json({ updated: this.changes });
    }
  );
});

// Удалить запись о взятой книге
app.delete('/borrowed-books/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM BorrowedBooks WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
