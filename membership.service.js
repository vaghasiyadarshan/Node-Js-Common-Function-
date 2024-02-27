const { MemberShip, Country } = require('../../models')
const CustomResponse = require('../../utils/CustomResponse')
const httpStatus = require('http-status')
const constants = require('../../utils/constants')
const ObjectId = require('mongoose').Types.ObjectId

let projectionQuery = [
  {
    $project: {
      _id: 0,
      id: '$_id',
      name: 1,
      price: 1,
      currencyId: 1,
      periodUnit: 1, 
      period: 1,
      description: 1,
      deleted: 1
    }
  }
]

/**
 * Add MemberShip
 *
 * @param {Object} data
 * @param {String|ObjectId} adminId
 * @returns
 */
const addMemberShip = async (data, adminId) => {
  let { name, price, currencyId, period, description, periodUnit } = data
  // check if name is already taken or not
  if (await MemberShip.isNameTaken(name)) {
    throw new CustomResponse(
      httpStatus.OK,
      JSON.stringify({
        status: false,
        type: constants.VALIDATION,
        error: {
          name: 'Name is already taken',
        },
      })
    );
  }
  /**
   * check if currency exist or not if currencyId is given
   * else assigning default currency
   */
  if (currencyId) {
    let currencyDoc = await Country.findOne({ _id: ObjectId(currencyId) })

    if (!currencyDoc) {
      throw new CustomResponse(
        httpStatus.OK,
        JSON.stringify({
          status: false,
          type: constants.NOT_FOUND,
          error: {
            message: 'Currency not found'
          }
        })
      )
    }
  } else {
    let currencyDoc = await Country.findOne({
      identifier: process.env.DEFAULT_CURRENCY_COUNTRY_IDENTIFIER
    })

    if (!currencyDoc) {
      throw new CustomResponse(
        httpStatus.OK,
        JSON.stringify({
          status: false,
          type: constants.NOT_FOUND,
          error: {
            message: 'Currency not found'
          }
        })
      )
    }
    currencyId = currencyDoc._id
  }

  let MemberShipDoc = await MemberShip.create({
    name: name,
    price: price,
    currencyId: ObjectId(currencyId),
    period: period,
    periodUnit: periodUnit,
    description: description,
    addedByAdminId: ObjectId(adminId)
  })

  return MemberShipDoc
}

/**
 * Update MemberShip Details
 *
 * @param {ObjectId} memberShipId
 * @param {Object} data
 * @param {String|ObjectId} adminId
 * @returns
 */
const updateMemberShip = async (memberShipId, data, adminId) => {
  let { name, price, currencyId, period, description, periodUnit } = data
  
  let memberShipDoc = await MemberShip.findOne({
    _id: ObjectId(memberShipId)
  })

  if (!memberShipDoc) {
    throw new CustomResponse(
      httpStatus.OK,
      JSON.stringify({
        status: false,
        type: constants.NOT_FOUND,
        error: {
          message: 'MemberShip not found'
        }
      })
    )
  }

  // check if name is already taken or not
  if (await MemberShip.isNameTaken(name,memberShipId)) {
    throw new CustomResponse(
      httpStatus.OK,
      JSON.stringify({
        status: false,
        type: constants.VALIDATION,
        error: {
          name: 'Name is already taken',
        },
      })
    );
  }
  /**
   * check if currency exist or not if currencyId is given
   * else assigning default currency
   */
  if (currencyId) {
    let currencyDoc = await Country.findOne({ _id: ObjectId(currencyId) })

    if (!currencyDoc) {
      throw new CustomResponse(
        httpStatus.OK,
        JSON.stringify({
          status: false,
          type: constants.NOT_FOUND,
          error: {
            message: 'Currency not found'
          }
        })
      )
    }
  } else {
    let currencyDoc = await Country.findOne({
      identifier: process.env.DEFAULT_CURRENCY_COUNTRY_IDENTIFIER
    })

    if (!currencyDoc) {
      throw new CustomResponse(
        httpStatus.OK,
        JSON.stringify({
          status: false,
          type: constants.NOT_FOUND,
          error: {
            message: 'Currency not found'
          }
        })
      )
    }
    currencyId = currencyDoc._id
  }

  memberShipDoc.name = name
  memberShipDoc.price = price
  memberShipDoc.currencyId = ObjectId(currencyId)
  memberShipDoc.period = period
  memberShipDoc.periodUnit = periodUnit
  memberShipDoc.description = description
  memberShipDoc.addedByAdminId = ObjectId(adminId)

  await memberShipDoc.save()

  return memberShipDoc
}

/**
 * Get MemberShip Details
 *
 * @param {ObjectId} memberShipId
 */
const getMemberShip = async (memberShipId) => {
  let memberShipDoc = await MemberShip.findOne({
    _id: ObjectId(memberShipId)
  })

  if (!memberShipDoc) {
    throw new CustomResponse(
      httpStatus.OK,
      JSON.stringify({
        status: false,
        type: constants.NOT_FOUND,
        error: {
          message: 'MemberShip not found'
        }
      })
    )
  }

  return memberShipDoc
}

/**
 * Get List of memberShips
 *
 * @param {Object} query
 * @param {Boolean} includeDisabled - include disabled memberShips
 */
const getMemberShips = async (query, includeDisabled = true) => {
  let {
    pagination = 'false',
    filter,
    rowsPerPage,
    page,
    descending,
    sortBy
  } = query

  page = parseInt(page) ? parseInt(page) : 1
  let limit = parseInt(rowsPerPage) ? parseInt(rowsPerPage) : 10
  let skip = (page - 1) * limit
  sortBy = sortBy && sortBy !== '' ? sortBy : 'createdAt'
  descending = descending == 'true' ? -1 : 1

  let filterQuery = {}

  if (!includeDisabled) {
    filterQuery.isActive = true
  }

  let searchQuery = []

  if (filter) {
    let search = filter

    searchQuery = [
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { price: { $eq: parseInt(search) } }
          ]
        }
      }
    ]
  }

  let aggregateQuery = [
    {
      $match: filterQuery
    },
    ...searchQuery,
    {
      $sort: {
        [sortBy]: descending
      }
    }
  ]

  if (pagination == 'false') {
    return MemberShip.aggregate([...aggregateQuery, ...projectionQuery])
  }

  let paginationQuery = [
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]

  // getting results
  let results = await MemberShip.aggregate([
    ...aggregateQuery,
    ...paginationQuery,
    ...projectionQuery
  ])

  // calculating total records
  let totalResults = await MemberShip.aggregate([
    ...aggregateQuery,
    {
      $count: 'id'
    }
  ])

  totalResults = totalResults[0] && totalResults[0].id ? totalResults[0].id : 0

  return {
    results,
    page: page,
    limit: limit,
    totalPages: page > 0 ? Math.ceil(Number(totalResults) / Number(limit)) : 0,
    totalResults: totalResults
  }
}

/**
 * Soft Delete Member Ship
 *
 * @param {ObjectId} memberShipId
 * @param {String|ObjectId} adminId
 */
const deleteMemberShip = async (memberShipId, adminId) => {
  let memberShipDoc = await MemberShip.findOne({
    _id: ObjectId(memberShipId)
  })

  if (!memberShipDoc) {
    throw new CustomResponse(
      httpStatus.OK,
      JSON.stringify({
        status: false,
        type: constants.NOT_FOUND,
        error: {
          message: 'MemberShip not found'
        }
      })
    )
  }

  await MemberShip.delete(
    {
      _id: ObjectId(memberShipId)
    },
    ObjectId(adminId)
  )
}

module.exports = {
  addMemberShip,
  updateMemberShip,
  getMemberShips,
  getMemberShip,
  deleteMemberShip
}
