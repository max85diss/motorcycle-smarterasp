
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSqlConnectionPool,
} from "@/lib/db";

import sql from "mssql";

import {
  getUserCookies,
} from "@/lib/cookies";


export async function POST(
  request: NextRequest
) {
  try {

    const body =
      await request.json();

    const date =
      body.Date;


    if (!date) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Date is required",
        },
        {
          status: 400,
        }
      );
    }


    const user =
      await getUserCookies();


    const pool =
      await getSqlConnectionPool();


    const transaction =
      new sql.Transaction(pool);


    await transaction.begin();


    try {

      /*
       * Check whether already closed.
       */

      const existing =
        await new sql.Request(
          transaction
        )
          .input(
            "BranchCode",
            sql.VarChar(50),
            user.BranchCode
          )
          .input(
            "Date",
            sql.Date,
            date
          )
          .query(`
            SELECT ID
            FROM dbo.tb_CashBookDayClose
            WHERE BranchCode = @BranchCode
              AND [Date] = @Date
          `);


      if (
        existing.recordset.length > 0
      ) {

        throw new Error(
          "Cashier is already closed for this date."
        );
      }


      /*
       * Calculate day totals.
       */

      const totals =
        await new sql.Request(
          transaction
        )
          .input(
            "BranchCode",
            sql.VarChar(50),
            user.BranchCode
          )
          .input(
            "Date",
            sql.Date,
            date
          )
          .query(`
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
              ) AS ClosingBalance

            FROM dbo.tb_CashBook

            WHERE BranchCode =
                  @BranchCode

              AND [Date] =
                  @Date
          `);


      const total =
        totals.recordset[0];


      /*
       * Insert day close record.
       */

      await new sql.Request(
        transaction
      )
        .input(
          "BranchCode",
          sql.VarChar(50),
          user.BranchCode
        )
        .input(
          "BranchName",
          sql.VarChar(200),
          user.BranchName
        )
        .input(
          "Date",
          sql.Date,
          date
        )
        .input(
          "OpeningBalance",
          sql.Decimal(18, 2),
          0
        )
        .input(
          "TotalDR",
          sql.Decimal(18, 2),
          total.TotalDR
        )
        .input(
          "TotalCR",
          sql.Decimal(18, 2),
          total.TotalCR
        )
        .input(
          "ClosingBalance",
          sql.Decimal(18, 2),
          total.ClosingBalance
        )
        .input(
          "ClosedByEmpCode",
          sql.VarChar(50),
          user.EmpCode
        )
        .input(
          "ClosedByEmpName",
          sql.VarChar(200),
          user.EmpName
        )
        .query(`
          INSERT INTO dbo.tb_CashBookDayClose
          (
            BranchCode,
            BranchName,
            [Date],
            OpeningBalance,
            TotalDR,
            TotalCR,
            ClosingBalance,
            ClosedByEmpCode,
            ClosedByEmpName,
            [State]
          )
          VALUES
          (
            @BranchCode,
            @BranchName,
            @Date,
            @OpeningBalance,
            @TotalDR,
            @TotalCR,
            @ClosingBalance,
            @ClosedByEmpCode,
            @ClosedByEmpName,
            'Closed'
          )
        `);


      await transaction.commit();


      return NextResponse.json({
        success: true,
        message:
          "Cashier closed successfully",
        data: total,
      });


    } catch (error) {

      await transaction.rollback();

      throw error;
    }


  } catch (error: any) {

    console.error(error);


    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to close cashier",
      },
      {
        status: 500,
      }
    );
  }
}