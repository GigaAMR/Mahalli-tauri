//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use sea_orm::{entity::prelude::*, Set};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "clients")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    pub full_name: String,
    pub created_at: String,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub image: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::invoices::Entity")]
    Invoices,
    #[sea_orm(has_many = "super::quotes::Entity")]
    Quotes,
}

impl Related<super::invoices::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Invoices.def()
    }
}

impl Related<super::quotes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Quotes.def()
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        Self {
            id: Set(Uuid::now_v7().to_string()),
            ..ActiveModelTrait::default()
        }
    }
}
