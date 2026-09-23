
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";

export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
          AccountNo,
          [Date],
          BankName,
          Branch,
          Manager,
          Address,
          TP,
          Mobile,
          AccountType,
          [State],
          CreatedDate,
          ModifiedDate
      FROM dbo.tb_BankAccounts
      ORDER BY BankName, Branch, AccountNo
    `);

    return NextResponse.json(result.recordset);

  } catch (error) {

    console.error(
      "Bank account GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bank accounts",
      },
      {
        status: 500,
      }
    );
  }
}


export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    if (!body.AccountNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Account No is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.BankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank Name is required",
        },
        {
          status: 400,
        }
      );
    }

    const pool =
      await getSqlConnectionPool();

    const result = await pool
      .request()

      .input(
        "AccountNo",
        sql.VarChar(50),
        body.AccountNo.trim()
      )

      .input(
        "Date",
        sql.Date,
        body.Date || new Date()
      )

      .input(
        "BankName",
        sql.VarChar(200),
        body.BankName.trim()
      )

      .input(
        "Branch",
        sql.VarChar(200),
        body.Branch || null
      )

      .input(
        "Manager",
        sql.VarChar(200),
        body.Manager || null
      )

      .input(
        "Address",
        sql.VarChar(500),
        body.Address || null
      )

      .input(
        "TP",
        sql.VarChar(50),
        body.TP || null
      )

      .input(
        "Mobile",
        sql.VarChar(50),
        body.Mobile || null
      )

      .input(
        "AccountType",
        sql.VarChar(50),
        body.AccountType || "Current"
      )

      .input(
        "State",
        sql.VarChar(30),
        body.State || "Active"
      )

      .query(`
        INSERT INTO dbo.tb_BankAccounts
        (
            AccountNo,
            [Date],
            BankName,
            Branch,
            Manager,
            Address,
            TP,
            Mobile,
            AccountType,
            [State]
        )
        VALUES
        (
            @AccountNo,
            @Date,
            @BankName,
            @Branch,
            @Manager,
            @Address,
            @TP,
            @Mobile,
            @AccountType,
            @State
        );

        SELECT
            AccountNo,
            [Date],
            BankName,
            Branch,
            Manager,
            Address,
            TP,
            Mobile,
            AccountType,
            [State]
        FROM dbo.tb_BankAccounts
        WHERE AccountNo = @AccountNo;
      `);

    return NextResponse.json(
      {
        success: true,
        data: result.recordset[0],
      }
    );

  } catch (error: any) {

    console.error(
      "Bank account POST error:",
      error
    );

    if (
      error?.number === 2627 ||
      error?.number === 2601
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This Account No already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save bank account",
      },
      {
        status: 500,
      }
    );
  }
}