import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import { sendLowStockAlert } from '../utils/emailService.js';

/**
 * Create a new bill
 * POST /api/billing
 */
const createBill = async (req, res) => {
    try {
        const { items, customerName, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in the bill'
            });
        }

        // Validate items and check stock
        let billItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findOne({ sku: item.sku }); // Find by SKU
            // Or find by ID if passed: const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with SKU ${item.sku} not found`
                });
            }

            if (product.currentStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name} (Available: ${product.currentStock})`
                });
            }

            const itemTotal = product.unitPrice * item.quantity;
            subtotal += itemTotal;

            billItems.push({
                product: product._id,
                sku: product.sku,
                name: product.name,
                quantity: item.quantity,
                unitPrice: product.unitPrice,
                total: itemTotal
            });

            // Decrease stock
            product.currentStock -= item.quantity;
            await product.save();

            // Check if stock is low after update
            if (product.currentStock <= product.reorderPoint) {
                // Send alert asynchronously (don't await)
                sendLowStockAlert({
                    productName: product.name,
                    sku: product.sku,
                    currentStock: product.currentStock,
                    reorderPoint: product.reorderPoint
                });
            }
        }

        // For simplicity, we can assume tax is 0 or calculated
        const tax = 0;
        const totalAmount = subtotal + tax;

        const bill = await Bill.create({
            items: billItems,
            subtotal,
            tax,
            totalAmount,
            customerName,
            paymentMethod,
            createdBy: req.session.userId // record who made the bill
        });

        res.status(201).json({
            success: true,
            data: bill,
            message: 'Bill created successfully'
        });

    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating bill'
        });
    }
};

/**
 * Get all bills
 * GET /api/billing
 */
const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bills'
        });
    }
};

/**
 * Get bill by ID
 * GET /api/billing/:id
 */
const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        res.json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('Get bill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bill'
        });
    }
};

export { createBill, getAllBills, getBillById };
