# Harf Lab SaaS Architecture

## Core stack
- Frontend: React + Vite
- Hosting: Vercel
- Auth / DB / Storage: Supabase
- Payments: Stripe or local provider later

## Main user roles
- Admin
- Client

## Main product flow
1. Client signs up / signs in
2. Client submits service order
3. Files are uploaded to Supabase Storage
4. Admin reviews and prices the order
5. Client pays
6. Admin moves order through workflow
7. Final delivery link is attached
8. Client tracks order status

## Main pages
### Public
- /
- /services
- /login
- /signup

### Client
- /app
- /app/orders
- /app/orders/new
- /app/orders/:id
- /track/:id

### Admin
- /admin
- /admin/orders
- /admin/orders/:id
- /admin/clients
- /admin/payments
- /admin/settings

## Database outline
- profiles
- services
- orders
- order_files
- payments
- deliveries
- activity_logs
