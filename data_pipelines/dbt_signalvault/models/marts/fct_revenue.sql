-- Gold Mart: fct_revenue
-- Aggregates revenue for Executive Dashboards
with orders as (
    select * from {{ ref('stg_orders') }}
)

select
    order_date,
    count(distinct order_id) as total_orders,
    count(distinct customer_id) as active_customers,
    sum(amount) as gross_revenue,
    round(avg(amount), 2) as average_order_value
from orders
group by order_date
