export const catchAsync = function (fn) {
  /**
   * @fn function which is wrapperd by the catchAsync function to use the DRY method.
   * passdown the request, response and the next argumens into the innerfunction.
   */

  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
     
      res.json("error occured in server");
    });
  };
};

export const httpStatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INVALID_INPUT: 422,
  NOT_ACCEPTABLE: 406,
  INTERNAL_SERVER: 500,
  UNAUTHORIZATION: 401,
};
