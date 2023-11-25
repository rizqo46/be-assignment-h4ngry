CREATE TABLE outlets_menus (
  "outlet_id" integer NOT NULL ,
  "menu_id" integer NOT NULL ,
  "is_available" bool NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT outlet_menu_unq UNIQUE (outlet_id, menu_id)
);

CREATE INDEX outlet_menu_outlet_id ON outlets_menus(outlet_id);
CREATE INDEX outlet_menu_omenu_id ON outlets_menus(menu_id);

DO $$ 
BEGIN
  FOR i IN 1..30 LOOP
    INSERT INTO outlets_menus (menu_id, outlet_id, is_available)
    VALUES 
    (i, 1, random()>0.15),
    (i, 2, random()>0.15),
    (i, 3, random()>0.15),
    (i, 4, random()>0.15),
    (i, 5, random()>0.15),
    (i, 6, random()>0.15),
    (i, 7, random()>0.15),
    (i, 8, random()>0.15),
    (i, 9, random()>0.15),
    (i, 10, random()>0.15);
  END LOOP;
END $$;