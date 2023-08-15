use crate::diesel::prelude::*;
use crate::models::{InvoiceItem, NewInvoiceItem};
use crate::schema;

pub fn get_invoice_items(page: i32, connection: &mut SqliteConnection) -> Vec<InvoiceItem> {
    let offset = (page - 1) * 17;

    let result = schema::invoice_items::dsl::invoice_items
        .order(schema::invoice_items::id.desc())
        .limit(17)
        .offset(offset as i64)
        .load::<InvoiceItem>(connection)
        .expect("Error fetching all invoices");
    result
}

// pub fn get_invoice_item(ii_id: i32,connection: &mut SqliteConnection) -> InvoiceItem {
//
//     let result = schema::invoices::dsl::invoices
//         .find(&ii_id)
//         .first::<InvoiceItem>( connection)
//         .expect("Error fetching invoice");

//     result
// }

pub fn insert_invoice_item(
    new_ii: NewInvoiceItem,
    connection: &mut SqliteConnection,
) -> InvoiceItem {
    diesel::insert_into(schema::invoice_items::dsl::invoice_items)
        .values(new_ii)
        .execute(connection)
        .expect("Error adding invoice");

    let result = schema::invoice_items::dsl::invoice_items
        .order(schema::invoice_items::id.desc())
        .first::<InvoiceItem>(connection)
        .expect("Error fetching all invoices");

    result
}

pub fn delete_invoice_item(ii_id: i32, connection: &mut SqliteConnection) -> usize {
    let result = diesel::delete(schema::invoices::dsl::invoices.find(&ii_id))
        .execute(connection)
        .expect("Error deleting invoice");

    result
}

pub fn update_invoice_item(
    ii_update: InvoiceItem,
    ii_id: i32,
    connection: &mut SqliteConnection,
) -> usize {
    let result = diesel::update(schema::invoice_items::dsl::invoice_items.find(&ii_id))
        .set(schema::invoice_items::quantity.eq(ii_update.quantity))
        .execute(connection)
        .expect("Error updating invoice");

    result
}
