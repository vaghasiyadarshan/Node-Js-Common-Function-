const httpStatus = require("http-status");
const ApiError = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/ApiError");
const constants = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/constants");
const {
  UserPermission,
} = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = function (modulePermissions) {
  return async function (req, res, next) {
    let user = req.user;
    let permissionGranted = false;

    if (user.isSubUser) {
      for (let i = 0; i < modulePermissions.length; i++) {
        const modulePermission = modulePermissions[i];

        let permissionDoc = await UserPermission.aggregate([
          {
            $match: {
              role: ObjectId(user.role),
            },
          },
          {
            $lookup: {
              from: "modules",
              localField: "module",
              foreignField: "_id",
              as: "module",
            },
          },
          {
            $unwind: {
              path: "$module",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "module.deleted": {
                $ne: true,
              },
              "module.code": modulePermission.module,
              [modulePermission.permission]: true,
            },
          },
        ]);

        if (permissionDoc.length > 0) {
          permissionGranted = true;
          next();
          break;
        }
      }

      if (!permissionGranted) {
        next(
          new ApiError(
            httpStatus.FORBIDDEN,
            JSON.stringify({
              status: false,
              type: constants.SYSTEM,
              error: {
                message: "Permission Denied",
              },
            })
          )
        );
      }
    } else {
      next();
    }
  };
};
