# POS System – Entity Relationship Diagram & API Docs

This document describes the database structure and relationships for the single-store POS system.

---

## API documentation (Swagger / OpenAPI)

After starting the application:

- **Swagger UI**: [http://localhost:5000/swagger-ui.html](http://localhost:5000/swagger-ui.html) (or `/swagger-ui/index.html`)
- **OpenAPI JSON**: [http://localhost:5000/v3/api-docs](http://localhost:5000/v3/api-docs)

To call protected endpoints from Swagger UI:

1. Call **POST /auth/login** with body `{ "email": "...", "password": "..." }`.
2. Copy the `jwt` from the response.
3. Click **Authorize**, enter the JWT (or `Bearer <your-jwt>`), then **Authorize**.
4. You can then try any `/api/**` endpoint.

---

## Mermaid ER diagram

```mermaid
erDiagram
    STORE ||--o{ USER : "has employees"
    STORE ||--o{ CATEGORY : "has"
    STORE ||--o{ PRODUCT : "sells"
    STORE ||--o{ CUSTOMER : "has"
    STORE ||--o{ ORDER : "has"
    STORE ||--o{ INVENTORY : "has"
    STORE ||--o{ REFUND : "has"
    STORE ||--o{ SHIFT_REPORT : "has"
    USER ||--o{ ORDER : "cashier"
    USER ||--o{ REFUND : "cashier"
    USER ||--o{ SHIFT_REPORT : "cashier"
    STORE ||--o| USER : "store_admin"
    CATEGORY ||--o{ PRODUCT : "contains"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER }o--o| CUSTOMER : "optional"
    ORDER }o--|| STORE : "belongs to"
    ORDER_ITEM }o--|| PRODUCT : "product"
    ORDER_ITEM }o--|| ORDER : "order"
    INVENTORY }o--|| STORE : "store"
    INVENTORY }o--|| PRODUCT : "product"
    REFUND }o--|| ORDER : "order"
    REFUND }o--o| SHIFT_REPORT : "optional"
    REFUND }o--|| USER : "cashier"
    REFUND }o--|| STORE : "store"
    SHIFT_REPORT }o--|| USER : "cashier"
    SHIFT_REPORT }o--|| STORE : "store"

    STORE {
        long id PK
        string brand
        long store_admin_id FK
        string description
        string storeType
        enum status
        string contact_address
        string contact_phone
        string contact_email
        datetime createdAt
        datetime updatedAt
    }

    USER {
        long id PK
        string fullName
        string email UK
        long store_id FK
        string phone
        enum role
        string password
        datetime createdAt
        datetime updatedAt
        datetime lastLogin
    }

    CATEGORY {
        long id PK
        string name
        long store_id FK
    }

    PRODUCT {
        long id PK
        string name
        string sku UK
        string description
        double mrp
        double sellingPrice
        string brand
        string image
        long category_id FK
        long store_id FK
        datetime createdAt
        datetime updatedAt
    }

    CUSTOMER {
        long id PK
        string fullName
        string email
        string phone
        long store_id FK
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        long id PK
        double totalAmount
        datetime createdAt
        datetime updatedAt
        long store_id FK
        long cashier_id FK
        long customer_id FK
        enum paymentType
        string stripePaymentIntentId
    }

    ORDER_ITEM {
        long id PK
        int quantity
        double price
        long product_id FK
        long order_id FK
    }

    INVENTORY {
        long id PK
        long store_id FK
        long product_id FK
        int quantity
        datetime lastUpdate
    }

    REFUND {
        long id PK
        long order_id FK
        string reason
        double amount
        long shift_report_id FK
        long cashier_id FK
        long store_id FK
        enum paymentType
        datetime createdAt
        datetime updatedAt
    }

    SHIFT_REPORT {
        long id PK
        datetime shiftStart
        datetime shiftEnd
        double totalSales
        double totalRefunds
        double netSales
        int totalOrders
        long cashier_id FK
        long store_id FK
    }
```

---

## Relationship summary

| From       | To           | Type        | Description |
|-----------|--------------|------------|-------------|
| **Store** | User         | 1 : N      | Store has many users (owner + staff). |
| **Store** | User         | 1 : 1      | One user is the store admin (`store_admin_id` on Store). |
| **Store** | Category     | 1 : N      | Categories belong to a store. |
| **Store** | Product      | 1 : N      | Products belong to a store. |
| **Store** | Customer     | 1 : N      | Customers can be scoped to a store. |
| **Store** | Order        | 1 : N      | Orders are placed at the store. |
| **Store** | Inventory    | 1 : N      | Inventory is per store (and product). |
| **Store** | Refund       | 1 : N      | Refunds are tied to the store. |
| **Store** | ShiftReport  | 1 : N      | Shift reports are per store. |
| **User**  | Order        | 1 : N      | User (cashier) creates many orders. |
| **User**  | Refund       | 1 : N      | User (cashier) processes refunds. |
| **User**  | ShiftReport  | 1 : N      | User (cashier) has shift reports. |
| **Category** | Product   | 1 : N      | Products belong to a category. |
| **Order** | OrderItem    | 1 : N      | Order has many line items. |
| **Order** | Customer     | N : 1 opt  | Order can optionally link to a customer. |
| **OrderItem** | Product  | N : 1      | Each line item references a product. |
| **OrderItem** | Order     | N : 1      | Each line item belongs to one order. |
| **Refund** | Order       | N : 1      | Refund is for one order. |
| **Refund** | ShiftReport | N : 1 opt  | Refund can be linked to a shift report. |

---

## Enums

- **UserRole**: `ROLE_OWNER`, `ROLE_STAFF`
- **StoreStatus**: `ACTIVE`, `PENDING`, `BLOCKED`
- **PaymentType**: `CASH`, `UPI`, `CARD`

---

## Notes

- **Store** contact fields (address, phone, email) are stored on the Store table via the embedded `StoreContact` type.
- **Order.stripePaymentIntentId** is set when payment is made by card via Stripe; used for refunds.
- **ShiftReport** has transient/computed fields (e.g. payment summaries); `topSellingProducts` and `recentOrders` may use join tables depending on JPA configuration.
- **Single store**: There is no Branch; all relations are Store-centric.
