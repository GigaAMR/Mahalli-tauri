#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate diesel;
extern crate diesel_migrations;
extern crate dotenv;

// modes
mod csvparsing;
mod db;
mod models;
mod reposotories;
mod schema;

use crate::csvparsing::{export, import};
use reposotories::cmd;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            import::get_csv_records,
            export::export_db_csv,
            cmd::get_product,
            cmd::get_products,
            cmd::create_product,
            cmd::update_product,
            cmd::delete_product
        ])
        .plugin(tauri_plugin_oauth::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
