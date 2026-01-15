module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Unique key for code logic (e.g., admin, technician)'
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Display name for the role'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'roles',
        timestamps: true,
        underscored: true
    });

    return Role;
};
