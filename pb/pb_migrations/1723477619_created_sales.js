/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "2i0abyusgbijdtr",
    "created": "2024-08-12 15:46:59.573Z",
    "updated": "2024-08-12 15:46:59.573Z",
    "name": "sales",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "bhwzlcbp",
        "name": "date",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "69hblxaq",
        "name": "units",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "2wzdcney",
        "name": "employees",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "7cbftsw0",
        "name": "products",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "k0srmyip",
        "name": "rates",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != null",
    "viewRule": "@request.auth.id != null",
    "createRule": "@request.auth.id != null",
    "updateRule": "@request.auth.id != null",
    "deleteRule": "@request.auth.id != null",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("2i0abyusgbijdtr");

  return dao.deleteCollection(collection);
})
