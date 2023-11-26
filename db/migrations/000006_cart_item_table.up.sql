-- Create "cart_items" table
CREATE TABLE "cart_items" (
	"uuid" uuid NOT NULL UNIQUE DEFAULT uuid_generate_v1mc(),
    "cart_id" integer NOT NULL,
    "menu_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now ()),
    "updated_at" timestamp NOT NULL DEFAULT (now ())
);

-- Add updated at auto update trigger
CREATE TRIGGER cart_items_moddatetime
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime (updated_at);

-- Add foreign key constraint to "cart_items" table
ALTER TABLE "cart_items" ADD FOREIGN KEY ("menu_id") REFERENCES "menus" ("id");

-- Create unique index on "cart_items" table
CREATE UNIQUE INDEX ON "cart_items" ("cart_id", "menu_id");

-- Create index on "menu_id" column of "cart_items" table
CREATE INDEX cart_item_menu_id ON cart_items(menu_id);

-- Create index on "updated_at" column of "cart_items" table
CREATE INDEX cart_item_updated_at ON cart_items(updated_at);
