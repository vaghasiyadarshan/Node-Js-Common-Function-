const express = require('express')
const router = express.Router()
const adminStaffAuth = require('../../../middlewares/adminStaffAuth')
const systemModules = require('../../../utils/systemModules')
const checkPermission = require('../../../middlewares/checkPermission')
const validate = require('../../../middlewares/validate')

const memberShipValidation = require('../../../validations/admin/membership.validation')

const memberShipController = require('../../../controllers/admin/membership.controller')

// Authenticate admin & staff
router.use(adminStaffAuth())

router.post(
  '/',
  checkPermission([{ module: systemModules.MEMBERSHIP, permission: 'canAdd' }]),
  validate(memberShipValidation.addMemberShip),
  memberShipController.addMemberShip
)

router.put(
  '/:id',
  checkPermission([
    { module: systemModules.MEMBERSHIP, permission: 'canUpdate' }
  ]),
  validate(memberShipValidation.updateMemberShip),
  memberShipController.updateMemberShip
)

router.get(
  '/',
  // checkPermission([{ module: systemModules.MEMBERSHIP, permission: 'canRead' }]),
  memberShipController.getMemberShips
)

router.get(
  '/:id',
  checkPermission([
    { module: systemModules.MEMBERSHIP, permission: 'canRead' }
  ]),
  validate(memberShipValidation.getMemberShip),
  memberShipController.getMemberShip
)

router.delete(
  '/:id',
  checkPermission([
    { module: systemModules.MEMBERSHIP, permission: 'canDelete' }
  ]),
  validate(memberShipValidation.deleteMemberShip),
  memberShipController.deleteMemberShip
)

module.exports = router
