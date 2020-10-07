CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    content TEXT NOT NULL,
    user_id REFERENCES users(id) ON DELETE CASCADE NOT NULL
);