'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model { }

  City.init({
    city_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'city_name'
    },
    country_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'country_name'
    },
    pollution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'invalid'),
      defaultValue: 'active',
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: true,
    underscored: false
  });

  return City;
};
