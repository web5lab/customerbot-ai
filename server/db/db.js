import mongoose from "mongoose";
const mongodbUri = process.env.MONGODB_URI;

export const databaseConnection = function (callback) {
   mongoose
      .connect(mongodbUri)
      .then((res) => {
         console.log('database connected');
         callback();
      })
      .catch((err) => {
         console.log(err);
      });
};

