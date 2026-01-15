module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Unique key for code checks (e.g., inventory_management)'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Display name for the permission'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'permissions',
        timestamps: true,
        underscored: true
    });

    return Permission;
};
