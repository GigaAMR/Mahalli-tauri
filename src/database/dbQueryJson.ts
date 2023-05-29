export const statsJoins = `
    SELECT
        json_object(
            'bought', json_group_array(
                json_object(
                    'product_id', p.id,
                    'product_name', p.name,
                    'quantity', SUM(CASE WHEN sm.model = 'bought' THEN sm.quantity ELSE 0 END)
                )
            ),
            'sold', json_group_array(
                json_object(
                    'product_id', p.id,
                    'product_name', p.name,
                    'quantity', SUM(CASE WHEN sm.model = 'sold' THEN sm.quantity ELSE 0 END)
                )
            )
        ) AS data
    FROM
        stock_mouvements sm
    INNER JOIN
        products p ON sm.product_id = p.id
    WHERE
        sm.date >= DATE('now', '-3 months')
    GROUP BY
        sm.date;

`;

export const clientDetailsJoins = `
    SELECT p.name AS name, strftime('%Y-%m', i.created_at) AS month, COALESCE(SUM(ABS(ii.quantity)), 0) AS quantity
    FROM clients c
    JOIN invoices i ON c.id = i.client_id
    JOIN invoice_items ii ON i.id = ii.invoice_id
    JOIN products p ON ii.product_id = p.id
    WHERE c.id = $1
    GROUP BY p.name, month
    ORDER BY month ASC;
`;

export const inOutStatsJoins = `
    SELECT strftime('%Y-%m', date) AS group_month,
        SUM(CASE WHEN model = 'IN' THEN quantity ELSE 0 END) AS total_in,
        SUM(CASE WHEN model = 'OUT' THEN quantity ELSE 0 END) AS total_out
    FROM stock_mouvements
    GROUP BY group_month
    ORDER BY id DESC
    LIMIT 3;
`;

export const stockJoins = `
    SELECT json_object(
        'id', sm.id,
        'date', sm.date,
        'model', sm.model,
        'quantity', sm.quantity,
        'orderItem', json_object(
            'order_id', ci.order_id,
            'price', ci.price
        ),
        'invoiceItem', json_object(
            'invoice_id', ii.invoice_id
        ),
        'product_id', sm.product_id,
        'product', json_object(
            'name', p.name,
            'price', p.price
        )
    ) AS data
    FROM stock_mouvements sm
    LEFT JOIN order_items ci ON sm.id = ci.stock_id
    LEFT JOIN invoice_items ii ON sm.id = ii.stock_id
    LEFT JOIN products p ON sm.product_id = p.id OR sm.product_id = p.id
    ORDER BY sm.id DESC;
`;

export const ordersJoins = `
    SELECT json_object(
        'id', c.id,
        'status', c.status,
        'created_at', c.created_at,
        'seller_id', c.seller_id,
        'seller', json_object(
            'id', s.id,
            'name', s.name
        ),
        'orderItems', (
            SELECT json_group_array(
                json_object(
                    'id', ci.id,
                    'price', ci.price,
                    'quantity', ci.quantity,
                    'product_id', ci.product_id,
                    'stock_id', ci.stock_id,
                    'product', json_object(
                        'id', p.id,
                        'name', p.name,
                        'price', p.price
                    )
                )
            )
            FROM order_items ci
            INNER JOIN products p ON ci.product_id = p.id
            WHERE ci.order_id = c.id
        )
    ) AS data
    FROM orders c
    INNER JOIN sellers s ON c.seller_id = s.id
    ORDER BY c.id DESC;
`;

export const invoicesJoins = `
    SELECT json_object(
        'id', i.id,
        'total', (
            SELECT SUM(ABS(ii.quantity) * p.price)
            FROM invoice_items ii
            INNER JOIN products p ON ii.product_id = p.id
            WHERE ii.invoice_id = i.id
        ),
        'created_at', i.created_at,
        'client_id', i.client_id,
        'status', i.status,
        'client', json_object(
            'id', c.id,
            'name', c.name
        ),
        'invoiceItems', (
            SELECT json_group_array(
                json_object(
                    'id', ii.id,
                    'quantity', ABS(ii.quantity),
                    'stock_id', ii.stock_id,
                    'product_id', ii.product_id,
                    'product', json_object(
                        'id', p.id,
                        'name', p.name,
                        'price', p.price
                    )
                )
            )
            FROM invoice_items ii
            INNER JOIN products p ON ii.product_id = p.id
            WHERE ii.invoice_id = i.id
        )
    ) AS data
    FROM invoices i
    INNER JOIN clients c ON i.client_id = c.id
    ORDER BY i.id DESC;
`;

export const orderDetailsJoins = `
    SELECT json_object(
        'id', c.id,
        'status', c.status,
        'created_at', c.created_at,
        'seller', json_object(
            'id', s.id,
            'name', s.name,
            'phone', s.phone,
            'email', s.email,
            'address', s.address,
            'image', s.image
        ),
        'orderItems', json_group_array(
            json_object(
                'id', ci.id,
                'price', ci.price,
                'quantity', ci.quantity,
                'product_id', ci.product_id,
                'product', json_object(
                    'id', p.id,
                    'name', p.name,
                    'description', p.description,
                    'price', p.price,
                    'tva', p.tva,
                    'image', p.image
                )
            )
        )
    ) AS data
    FROM orders c
    INNER JOIN sellers s ON c.seller_id = s.id
    INNER JOIN order_items ci ON c.id = ci.order_id
    INNER JOIN products p ON ci.product_id = p.id
    WHERE c.id = $1;
`;

export const invoiceDetailsJoins = `
    SELECT json_object(
        'id', i.id,
        'total', i.total,
        'created_at', i.created_at,
        'client_id', i.client_id,
        'client', json_object(
            'id', c.id,
            'name', c.name,
            'phone', c.phone,
            'email', c.email,
            'address', c.address,
            'image', c.image
        ),
        'invoiceItems', json_group_array(
            json_object(
                'id', ii.id,
                'quantity', ABS(ii.quantity),
                'product_id', ii.product_id,
                'product', json_object(
                    'id', p.id,
                    'name', p.name,
                    'description', p.description,
                    'price', p.price,
                    'tva', p.tva,
                    'image', p.image
                )
            )
        )
    ) AS data
    FROM invoices i
    INNER JOIN clients c ON i.client_id = c.id
    INNER JOIN invoice_items ii ON i.id = ii.invoice_id
    INNER JOIN products p ON ii.product_id = p.id
    WHERE i.id = [invoice_id];

`;
