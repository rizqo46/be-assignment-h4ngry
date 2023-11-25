CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE outlets (
    id serial4 NOT NULL,
    "uuid" uuid NOT NULL DEFAULT uuid_generate_v1mc(),
    "name" TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude double PRECISION NOT NULL CHECK (latitude >= -90
AND latitude <= 90),
    longitude double PRECISION NOT NULL CHECK (longitude >= -180
AND longitude <= 180),
    created_at timestamp NOT NULL DEFAULT now(),
    src_doc tsvector NOT NULL GENERATED ALWAYS AS (to_tsvector('simple'::regconfig,
(name || ' '::TEXT) || address)) STORED,
    CONSTRAINT outlets_pkey PRIMARY KEY (id),
    CONSTRAINT outlets_uuid_key UNIQUE (uuid)
);

CREATE INDEX outlet_src_doc_idx ON
outlets
  USING GIN(src_doc);

INSERT
  INTO
  outlets
("name",
  address,
  latitude,
  longitude)
VALUES ('MT Haryono',
'Ruko Peterongan Plaza, Jl. MT. Haryono, Wonodri, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50242',
-6.999007348668374,
110.43430452443272),
('Majapahit',
'Jl. Brigjen Sudiarto Jl. Majapahit No.462 A, Pedurungan Tengah, Kec. Semarang Tim., Kota Semarang, Jawa Tengah 50192',
-7.007683397188739,
110.47388333909132),
('Siliwangi',
'Metro Plasa Jend Sudirman A-3, Jl. Jenderal Sudirman No.187-189, Karangayu, Kec. Semarang Barat, Kota Semarang, Jawa Tengah 50149',
-6.977033419158947,
110.39689753749381),
('Andir',
'Jl. Rajawali Timur No.251F, Dungus Cariang, Kec. Andir, Kota Bandung, Jawa Barat 40183',
-6.910889827696859,
107.5803280068512),
('Buah Batu',
'Jl. Karawitan No.31B, Turangga, Kec. Lengkong, Kota Bandung, Jawa Barat 40264',
-6.934048145497913,
107.62733527311353),
('BI',
'Jl. Melong Raya No.45, Gempolsari, Kec. Bandung Kulon, Kota Bandung, Jawa Barat 40215',
-6.923239903389806,
107.55958997633138),
('Mekarwangi',
'Jl. Mekar Utama No.111Q, Mekarwangi, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40235',
-6.949997042320069,
107.608521740594),
('Kopo',
'Kopo Mas Regency, Komplek Ruko, Jl. Raya Kopo No.1, Margasuka, Kec. Babakan Ciparay, Kota Bandung, Jawa Barat 40225',
-6.957441082661144,
107.57924481208208),
('Ahmad Yani',
'Jl. Phh. Mustofa No.27, Suci, Kec. Cibeunying Kaler, Kabupaten Bandung, Jawa Barat 40124',
-6.895581736904768,
107.63863815370757),
('Dipati Ukur',
'Jl. Dipati Ukur No.26, Lebakgede, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132',
-6.893879555535807,
107.6154641391574);