const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '30d',
    });
};

const { sendUserCredentialsEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        const userExists = await db.UserProfile.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default role 'Public User' (ID 4 based on previous context), or lookup
        // Enforcing Public User role selection logic
        let publicRole = await db.Role.findOne({ where: { label: 'Public User' } });

        // If exact label match fails, try key 'public_user' as fallback
        if (!publicRole) {
            publicRole = await db.Role.findOne({ where: { key: 'public_user' } });
        }

        const roleId = publicRole ? publicRole.id : 4;
        const roleLabel = publicRole ? publicRole.label : 'Public User';

        const user = await db.UserProfile.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role_id: roleId,
            status: 'Available'
        });

        // Send Welcome Email with Credentials
        await sendUserCredentialsEmail(email, {
            first_name,
            role: roleLabel,
            email,
            password // Sending plain text password as requested for "registration mail"
        });

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: 'public_user',
                token: generateToken(user.id)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.UserProfile.findOne({
            where: { email },
            include: [
                {
                    model: db.Role,
                    as: 'roleData',
                    include: [{ model: db.Permission, as: 'permissions' }]
                }
            ]
        });

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            // Extract permission keys
            const permissions = user.roleData && user.roleData.permissions
                ? user.roleData.permissions.map(p => p.key)
                : [];

            res.json({
                success: true,
                data: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.roleData ? user.roleData.key : 'user', // e.g. 'administrator'
                    roleLabel: user.roleData ? user.roleData.label : 'User',
                    permissions: permissions,
                    token: generateToken(user.id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
