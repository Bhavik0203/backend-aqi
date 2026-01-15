const db = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await db.Transaction.findAll({
        include: [
            {
                model: db.Order,
                as: 'order',
                include: [{ model: db.Kit, as: 'kit' }]
            }
        ],
        order: [['transaction_date', 'DESC']]
    });
    res.json({ success: true, data: transactions });
});

exports.createTransaction = asyncHandler(async (req, res) => {
    const { total_order_amount, ...transactionData } = req.body;
    const transaction = await db.Transaction.create(transactionData);

    // Update Order Total Amount if provided
    if (total_order_amount && transactionData.order_id) {
        await db.Order.update(
            { total_amount: total_order_amount },
            { where: { id: transactionData.order_id } }
        );
    }

    res.status(201).json({ success: true, data: transaction });
});

exports.getTransactionStats = asyncHandler(async (req, res) => {
    const totalRevenue = await db.Transaction.sum('amount', { where: { payment_status: 'completed' } }) || 0;
    const pendingAmount = await db.Transaction.sum('amount', { where: { payment_status: 'pending' } }) || 0;
    const completedCount = await db.Transaction.count({ where: { payment_status: 'completed' } });
    const failedCount = await db.Transaction.count({ where: { payment_status: 'failed' } });

    res.json({
        success: true,
        data: {
            totalRevenue,
            pendingAmount,
            completedCount,
            failedCount
        }
    });
});
