const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { mermberShipServiceAdmin } = require("../../services");

const addMemberShip = catchAsync(async (req, res) => {
  let category = await mermberShipServiceAdmin.addMemberShip(
    req.body,
    req.admin._id
  );

  res.status(httpStatus.OK).send({
    status: true,
    data: category,
    message: "MemberShip added successfully",
  });
});

const updateMemberShip = catchAsync(async (req, res) => {
  let category = await mermberShipServiceAdmin.updateMemberShip(
    req.params.id,
    req.body,
    req.admin._id
  );

  res.status(httpStatus.OK).send({
    status: true,
    data: category,
    message: "MemberShip details updated successfully",
  });
});

const getMemberShip = catchAsync(async (req, res) => {
  let category = await mermberShipServiceAdmin.getMemberShip(req.params.id);

  res.status(httpStatus.OK).send({
    status: true,
    data: category,
  });
});

const getMemberShips = catchAsync(async (req, res) => {
  let categories = await mermberShipServiceAdmin.getMemberShips(
    req.query,
    true
  );

  res.status(httpStatus.OK).send({
    status: true,
    data: categories,
  });
});

const deleteMemberShip = catchAsync(async (req, res) => {
  await mermberShipServiceAdmin.deleteMemberShip(req.params.id, req.admin._id);

  res.status(httpStatus.OK).send({
    status: true,
    message: "MemberShip deleted successfully",
  });
});

module.exports = {
  addMemberShip,
  updateMemberShip,
  getMemberShip,
  getMemberShips,
  deleteMemberShip,
};
