const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const mongoose_delete = require('mongoose-delete')
const { toJSON, paginate } = require('./plugins')
const { number } = require('joi')

const memberShipSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      trim: true
    },
    currencyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Country',
    },
    period: {
      type: Number,
      required: true,
      trim: true
    },
    periodUnit:{
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    addedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin'
    }
  },
  {
    timestamps: true,
    autoCreate: true
  }
)

// add plugin that converts mongoose to json
memberShipSchema.plugin(toJSON)
memberShipSchema.plugin(paginate)
memberShipSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: 'all'
})
/**
 * Check if name is taken
 * @param {string} name - The user's email
 * @param {ObjectId} [excludeId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
memberShipSchema.statics.isNameTaken = async function (name, excludeId) {
  const membership = await this.findOne({ name, _id: { $ne: excludeId } });
  return !!membership;
};

/**
 * @typedef User
 */
const MemberShip = mongoose.model('membership', memberShipSchema)

module.exports = MemberShip
