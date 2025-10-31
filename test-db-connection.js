const { getConnection } = require("./app/lib/db.js");

(async () => {
  try {
    console.log("Testing database connection...");
    const connection = await getConnection();
    console.log("✅ Database connection successful");

    // Test a simple query
    const [rows] = await connection.query("SELECT 1 as test");
    console.log("✅ Query test successful:", rows);

    connection.release();
    console.log("✅ Connection released");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Full error:", error);
  }
})();
