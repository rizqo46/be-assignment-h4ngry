CREATE TABLE "order_items" (
	"uuid" uuid NOT NULL UNIQUE DEFAULT uuid_generate_v1mc(),
    "order_id" integer NOT NULL,
    "menu_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    "sub_total" integer NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now ()),
    "updated_at" timestamp NOT NULL DEFAULT (now ())
);

ALTER TABLE "order_items" ADD FOREIGN KEY ("menu_id") REFERENCES "menus" ("id");
ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

CREATE TRIGGER order_item_moddatetime
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime (updated_at);