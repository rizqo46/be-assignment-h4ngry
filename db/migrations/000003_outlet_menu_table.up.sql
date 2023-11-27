-- Create the 'outlets_menus' table with columns 'outlet_id', 'menu_id', 'is_available', 'created_at', and 'updated_at'
CREATE TABLE outlets_menus (
  outlet_id integer NOT NULL,
  menu_id integer NOT NULL,
  is_available bool NOT NULL,
  created_at timestamp NOT NULL DEFAULT (now()),
  updated_at timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT outlet_menu_unq UNIQUE (outlet_id, menu_id)
);

-- Add foreign keys to reference 'menu_id' and 'outlet_id' columns to 'id' columns in 'menus' and 'outlets' tables respectively
ALTER TABLE outlets_menus ADD FOREIGN KEY (menu_id) REFERENCES menus (id);
ALTER TABLE outlets_menus ADD FOREIGN KEY (outlet_id) REFERENCES outlets (id);

-- Create indexes on 'outlets_menus' table
CREATE UNIQUE INDEX ON outlets_menus (outlet_id, menu_id);
CREATE INDEX outlet_menu_menu_id ON outlets_menus(menu_id);

-- Insert data into 'outlets_menus' table using a loop
INSERT INTO outlets_menus (menu_id, outlet_id, is_available)
SELECT
  i,
  j,
  random() > 0.15
FROM
  generate_series(1, 30) AS i,
  generate_series(1, 10) AS j;