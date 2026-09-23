
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSqlConnectionPool,
} from "@/lib/db";

import sql from "mssql";


export async function GET(
  request: NextRequest
) {
  try {

    const {
      searchParams,
    } = new URL(request.url);

    const fromDate =
      searchParams.get("fromDate");

    const toDate =
      searchParams.get("toDate");

    const branchCode =
      searchParams.get("branchCode");


    const pool =
      await getSqlConnectionPool();


    const requestSql =
      pool.request();


    let query = `
      SELECT

        ISNULL(
          SUM(DR),
          0
        ) AS TotalDR,

        ISNULL(
          SUM(CR),
          0
        ) AS TotalCR,

        ISNULL(
          SUM(DR - CR),
          0
        ) AS Balance

      FROM dbo.tb_CashBook

      WHERE 1 = 1
    `;


    if (fromDate) {

      query += `
        AND [Date] >= @FromDate
      `;

      requestSql.input(
        "FromDate",
        sql.Date,
        fromDate
      );
    }


    if (toDate) {

      query += `
        AND [Date] <= @ToDate
      `;

      requestSql.input(
        "ToDate",
        sql.Date,
        toDate
      );
    }


    if (
      branchCode &&
      branchCode !== "ALL"
    ) {

      query += `
        AND BranchCode = @BranchCode
      `;

      requestSql.input(
        "BranchCode",
        sql.VarChar(50),
        branchCode
      );
    }


    const result =
      await requestSql.query(query);


    return NextResponse.json({
      success: true,
      data:
        result.recordset[0],
    });

  } catch (error) {

    console.error(error);


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to calculate balance",
      },
      {
        status: 500,
      }
    );
  }
}