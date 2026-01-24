import mongoose from "mongoose";

await mongoose.connect(process.env.DATABASE_URL!).catch((error) => {
  console.log("Error connecting to database:", error);
});

const dbname = process.env.MODE === "prod" ? "billdee" : "better-dev";

const client = mongoose.connection.getClient().db(dbname);

export { client };
