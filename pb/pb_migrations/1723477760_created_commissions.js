/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "o1vz3a8z6eecpao",
    "created": "2024-08-12 15:49:20.801Z",
    "updated": "2024-08-12 15:49:20.801Z",
    "name": "commissions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hqhtde43",
        "name": "sale_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "2i0abyusgbijdtr",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "kztbyzar",
        "name": "employee_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "s1ezhbmvmiwh7hd",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "jfqbb4ae",
        "name": "commission",
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
    "createRule": "@request.auth.id != null",
    "updateRule": "@request.auth.id != null",
    "deleteRule": "@request.auth.id != null",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("o1vz3a8z6eecpao");

  return dao.deleteCollection(collection);
})
