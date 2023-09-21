use serde_json::{json, Value};

use crate::diesel::prelude::*;
use crate::models::{NewOrder, Order, OrderItem, Product, Seller, UpdateOrder};
use crate::schema::orders::{seller_id, status};
use crate::schema::{order_items, orders, products, sellers};

pub fn get_orders(page: i32, connection: &mut SqliteConnection) -> Value {
    let offset = (page - 1) * 17;

    let result = orders::table
        .inner_join(sellers::table.on(orders::seller_id.eq(sellers::id)))
        .select((orders::all_columns, sellers::all_columns))
        .order(orders::id.desc())
        .limit(17)
        .offset(offset as i64)
        .load::<(Order, Seller)>(connection)
        .expect("Error fetching orders with sellers");

    let count: Vec<i64> = orders::table
        .count()
        .get_results(connection)
        .expect("coudnt get the count");

    json!({
        "count": count[0],
        "data": result
            .into_iter()
            .map(|(order, seller)| {
                let order_items: Vec<(OrderItem, Product)> = order_items::table
                    .inner_join(products::table.on(order_items::product_id.eq(products::id)))
                    .select((order_items::all_columns, products::all_columns))
                    .filter(order_items::order_id.eq(order.id))
                    .load::<(OrderItem, Product)>(connection)
                    .expect("Error fetching order items with products");

                let order_items_json = json!({
                    "order_items": order_items.into_iter().map(|(item, product)| {
                        json!({
                            "id": item.id,
                            "price": item.price,
                            "quantity": item.quantity,
                            "product_id": item.product_id,
                            "inventory_id": item.inventory_id,
                            "product": {
                                "id": product.id,
                                "name": product.name,
                                "price": product.price
                            }
                        })
                    }).collect::<Vec<_>>()
                });

                json!({
                    "id": order.id,
                    "status": order.status,
                    "created_at": order.created_at,
                    "seller_id": order.seller_id,
                    "seller": {
                        "id": seller.id,
                        "name": seller.name
                    },
                    "order_items": order_items_json["order_items"]
                })
            })
            .collect::<Vec<_>>()
    })
}

pub fn get_order(o_id: i32, connection: &mut SqliteConnection) -> Value {
    let result = orders::table
        .inner_join(sellers::table.on(orders::seller_id.eq(sellers::id)))
        .filter(orders::id.eq(o_id))
        .select((orders::all_columns, sellers::all_columns))
        .load::<(Order, Seller)>(connection)
        .expect("Error fetching orders with sellers");

    let (order, seller) = result.first().unwrap();

    let order_items: Vec<(OrderItem, Product)> = order_items::table
        .inner_join(products::table.on(order_items::product_id.eq(products::id)))
        .select((order_items::all_columns, products::all_columns))
        .filter(order_items::order_id.eq(order.id))
        .load::<(OrderItem, Product)>(connection)
        .expect("Error fetching order items with products");

    let order_items_json = json!({
        "order_items": order_items.into_iter().map(|(item, product)| {
            json!({
                "id": item.id,
                "price": item.price,
                "quantity": item.quantity,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "inventory_id": item.inventory_id,
                "product": product
            })
        }).collect::<Vec<_>>()
    });

    json!({
        "id": order.id,
        "status": order.status,
        "created_at": order.created_at,
        "seller_id": order.seller_id,
        "seller": seller,
        "order_items": order_items_json["order_items"]
    })
}

pub fn insert_order(new_o: NewOrder, connection: &mut SqliteConnection) -> i32 {
    diesel::insert_into(orders::dsl::orders)
        .values((status.eq(new_o.status), seller_id.eq(new_o.seller_id)))
        .execute(connection)
        .expect("Error adding order");

    let result = orders::dsl::orders
        .order_by(orders::id.desc())
        .select(orders::id)
        .first::<i32>(connection)
        .expect("error get all orders");

    result
}

pub fn delete_order(o_id: i32, connection: &mut SqliteConnection) -> usize {
    let result = diesel::delete(orders::dsl::orders.find(&o_id))
        .execute(connection)
        .expect("Error deleting order");

    result
}

pub fn update_order(o_update: UpdateOrder, o_id: i32, connection: &mut SqliteConnection) -> usize {
    let result = diesel::update(orders::dsl::orders.find(&o_id))
        .set(orders::status.eq(o_update.status))
        .execute(connection)
        .expect("Error updating order");

    result
}