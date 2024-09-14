"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        filepath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING, // Par exemple '.exe' ou '.zip'
            allowNull: false
        },
        fileSize: {
            type: DataTypes.INTEGER, // Taille du fichier en octets
            allowNull: true
        },
        uploadDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return File;
};
