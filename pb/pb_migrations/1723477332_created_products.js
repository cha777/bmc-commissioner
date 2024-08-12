/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "176y808adtxzlja",
    "created": "2024-08-12 15:42:12.863Z",
    "updated": "2024-08-12 15:42:12.863Z",
    "name": "products",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ihg8wph5",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "j0r9vuiq",
        "name": "price",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != null",
    "viewRule": "@request.auth.id != null",
    "createRule": null,
    "updateRule": "@request.auth.id != null",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("176y808adtxzlja");

  return dao.deleteCollection(collection);
})
