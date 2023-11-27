# H4ngry Back-end Case Study

| Stack                |
| -------------------- |
| Node.js (Typescript) |
| PostgreSQL 14.9      |

## How to run

1. Setup database

    I use [migrate](https://github.com/golang-migrate/migrate) to handle migration and seed some data. To migrate run:

    ```
    migrate -path db/migrations -database ${DB_URL} up
    ```

    for example

    ```
    migrate -path db/migrations -database "postgres://user:password@localhost:5432/db_name?sslmode=disable" up
    ```
2. Setup app env
    Create `.env` file copy from `.env.example`.
    ```
    cat .env.example > .env
    ```
    The important part is `DATABASE_URL`
3. Run the app
    ```
    yarn start
    ```
## API Docs

OpenAPI Swagger Docs is available after app startup on `http://localhost:PORT/api` or you can import from file [api-docs.json](docs/api-docs.json).

## ERD
![alt](db/erd.png)
