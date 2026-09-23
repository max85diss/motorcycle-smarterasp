import { NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
          ItemCode,
          Description,
          [Status]
      FROM tb_OtherItemDetails
      WHERE [Status] = 'Active' AND IsItConsignmentItem = 'true'
      ORDER BY Description
    `);

    return NextResponse.json(result.recordset);

  } catch (error) {
    console.error("Other item details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load item descriptions",
      },
      {
        status: 500,
      }
    );
  }
}