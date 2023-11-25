CREATE TABLE
    users (
        "id" serial4 PRIMARY KEY,
        "username" text NOT NULL UNIQUE,
        "created_at" timestamp NOT NULL DEFAULT (now ())
    );

INSERT INTO
    users (username)
VALUES
    ('h4ngry1'),
    ('h4ngry2');