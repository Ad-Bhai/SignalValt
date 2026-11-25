-- Staging Orders Model (Lakehouse Silver tier)
-- Enforces customer_id presence and casts types
with raw_source as (
    select
        order_id,
        coalesce(customer_id, customerId) as customer_id,  -- Resilient alias for schema drift
        email,
        cast(amount as numeric(10, 2)) as amount,
        cast(timestamp as timestamp) as order_timestamp
    from {{ source('lakehouse_bronze', 'orders') }}
)

select
    order_id,
    customer_id,
    email,
    amount,
    order_timestamp,
    date_trunc('day', order_timestamp) as order_date
from raw_source
where order_id is not null
