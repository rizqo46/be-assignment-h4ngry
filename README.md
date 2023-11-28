# H4ngry Back-end Case Study

Stack that I used in this project: Node.js (v20.10.0), Typescript (v5.3.2), Nest.js, nestjs/swagger, Postgres(v14.9), Kyseley, Yarn (v1.22.2)

## How to run

1. Setup database

    I use [migrate](https://github.com/golang-migrate/migrate) to handle migration and seed some data. Download and [install](https://github.com/golang-migrate/migrate/releases) it first. To migrate run:

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
3. Install nestjs/swagger
    ```
    yarn add @nestjs/swagger
    ```
4. Run the app
    ```
    yarn start
    ```
    Tha app will run on [http://localhost:3000](http://localhost:3000) or [http://localhost:PORT](http://localhost:PORT) if you specify PORT on env.

## API Docs

OpenAPI Swagger Docs is available after app startup on [http://localhost:3000/api](http://localhost:3000/api) or you can import from file [api-docs.json](docs/api-docs.json) to Postman, Insomnia or etc.

## ERD
![alt](db/erd.png)

### Extended Functionalities:
- The user must log in to add menus to the cart and make an order
    - Use simple JWT for auth