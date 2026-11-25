-- Staging Customers Model
with raw_customers as (
    select
        customer_id,
        email,
        age_bracket,
        country,
        created_at
    from {{ source('lakehouse_bronze', 'customers') }}
)

select * from raw_customers
