
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";

export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    const {
      ConsignmentNo,
    } = body;

    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()
      .input(
        "ConsignmentNo",
        sql.VarChar(50),
        ConsignmentNo
      )
      .query(`
        UPDATE dbo.tb_ConsignmentOtherItemsStock
        SET APED = 'AP'
        WHERE ConsignmentNo = @ConsignmentNo
          AND APED = 'Entering';

        SELECT
            COUNT(*) AS ItemCount
        FROM dbo.tb_ConsignmentOtherItemsStock
        WHERE ConsignmentNo = @ConsignmentNo
      `);

    return NextResponse.json({
      success: true,
      message: "Items sent to approval",
      itemCount: result.recordset[0].ItemCount,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send approval",
      },
      {
        status: 500,
      }
    );
  }
}