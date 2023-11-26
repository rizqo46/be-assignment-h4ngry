BEGIN;
CREATE TYPE order_status AS ENUM ('in_progress', 'finished');

CREATE TABLE "orders" (
    "id" serial4 PRIMARY KEY,
    "uuid" uuid NOT NULL UNIQUE DEFAULT uuid_generate_v1mc(),
    "user_id" integer NOT NULL,
    "outlet_id" integer NOT NULL,
    "total" integer NOT NULL,
    "status" order_status NOT NULL DEFAULT 'in_progress',
    "created_at" timestamp NOT NULL DEFAULT (now ()),
    "updated_at" timestamp NOT NULL DEFAULT (now ())
);

CREATE TRIGGER order_moddatetime
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime (updated_at);

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("outlet_id") REFERENCES "outlets" ("id");

CREATE INDEX order_user_updated_at ON orders(user_id, updated_at);

COMMIT;