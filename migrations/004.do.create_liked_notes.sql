CREATE TABLE liked_notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY ,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE NOT NULL
);