-- Gold Mart: customer_360
-- Unified 360 customer profile
with customers as (
    select * from {{ ref('stg_customers') }}
),
orders as (
    select * from {{ ref('stg_orders') }}
)

select
    c.customer_id,
    c.email,
    c.age_bracket,
    c.country,
    count(o.order_id) as lifetime_orders,
    coalesce(sum(o.amount), 0) as lifetime_spend
from customers c
left join orders o on c.customer_id = o.customer_id
group by c.customer_id, c.email, c.age_bracket, c.country
