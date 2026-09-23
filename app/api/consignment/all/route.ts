
import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "mssql";

import {
  getSqlConnectionPool,
} from "@/lib/db";


// ========================================
// GET CONSIGNMENTS
// ========================================

export async function GET() {

  try {

    const pool =
      await getSqlConnectionPool();

    const result =
      await pool
        .request()
        .query(`
          SELECT
            ID,
            SysNo,
            [Date],
            ConNO,
            NoOfItems,
            Status,
            APED,
            BranchCode,
            BranchName,
            EmpCode,
            EmpName
          FROM tb_consignment
          ORDER BY ID DESC
        `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load consignments.",
      },
      { status: 500 }
    );

  }

}