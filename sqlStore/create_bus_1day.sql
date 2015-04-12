-- Table: bus_test

-- DROP TABLE bus_test;

CREATE TABLE bus_test
(
  id integer NOT NULL,
  "timestamp" timestamp without time zone,
  latitude double precision,
  longitude double precision,
  routeid character varying,
  busid integer,
  sdpoint geometry,
  no bigint,
  CONSTRAINT bus_test_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE bus_test
  OWNER TO postgres;

-- Index: bus_test_index

-- DROP INDEX bus_test_index;

CREATE INDEX bus_test_index
  ON bus_test
  USING btree
  (id);

-- Index: busid_index

-- DROP INDEX busid_index;

CREATE INDEX busid_index
  ON bus_test
  USING btree
  (busid);

-- Index: location_index

-- DROP INDEX location_index;

CREATE INDEX location_index
  ON bus_test
  USING btree
  (latitude, longitude);

-- Index: route_index

-- DROP INDEX route_index;

CREATE INDEX route_index
  ON bus_test
  USING btree
  (routeid COLLATE pg_catalog."default");

-- Index: time_index

-- DROP INDEX time_index;

CREATE INDEX time_index
  ON bus_test
  USING btree
  ("timestamp");

