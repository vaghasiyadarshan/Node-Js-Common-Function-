const httpStatus = require("http-status");
const ApiError = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/ApiError");
const constants = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/utils/constants");
const {
  Permission,
} = require("d:/NexusLink_Projects/DashBook-Projects/dashbook_apis/src/models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = function (modulePermissions) {
  return async function (req, res, next) {
    let admin = req.admin;
    let permissionGranted = false;

    if (admin.isStaff) {
      for (let i = 0; i < modulePermissions.length; i++) {
        const modulePermission = modulePermissions[i];

        let permissionDoc = await Permission.aggregate([
          {
            $match: {
              role: ObjectId(admin.role),
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
