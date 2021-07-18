CREATE TABLE "crypto" (
	"id"	INTEGER,
	"fecha"	TEXT NOT NULL,
	"from_moneda"	TEXT NOT NULL,
	"from_cantidad"	REAL NOT NULL,
	"to_moneda"	TEXT NOT NULL,
	"to_cantidad"	REAL NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)