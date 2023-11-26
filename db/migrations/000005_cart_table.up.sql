BEGIN;
-- Create "carts" table
CREATE TABLE "carts" (
    "id" serial4 PRIMARY KEY,
    "uuid" uuid NOT NULL UNIQUE DEFAULT uuid_generate_v1mc(),
    "user_id" integer NOT NULL,
    "outlet_id" integer NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now ()),
    "updated_at" timestamp NOT NULL DEFAULT (now ())
);

CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Add updated at auto update trigger
CREATE TRIGGER carts_moddatetime
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime (updated_at);

-- Add foreign key constraints to "carts" table
ALTER TABLE "carts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "carts" ADD FOREIGN KEY ("outlet_id") REFERENCES "outlets" ("id");

-- Create unique index on "carts" table
CREATE UNIQUE INDEX ON "carts" ("user_id", "outlet_id");

-- Create index on "updated_at" column of "carts" table
CREATE INDEX cart_updated_at ON carts(updated_at);

COMMIT;