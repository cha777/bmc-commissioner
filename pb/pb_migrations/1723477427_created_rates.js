/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "u3kxko5pvouxavz",
    "created": "2024-08-12 15:43:47.168Z",
    "updated": "2024-08-12 15:43:47.168Z",
    "name": "rates",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "f3cucu9d",
        "name": "lower_limit",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "a0zo0wzz",
        "name": "upper_limit",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "awnl5djq",
        "name": "rate",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
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
  const collection = dao.findCollectionByNameOrId("u3kxko5pvouxavz");

  return dao.deleteCollection(collection);
})
