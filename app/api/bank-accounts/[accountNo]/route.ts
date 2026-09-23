
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSqlConnectionPool } from "@/lib/db";

import sql from "mssql";


export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      accountNo: string;
    }>;
  }
) {

  try {

    const { accountNo } =
      await params;

    const body =
      await request.json();

    const pool =
      await getSqlConnectionPool();

    const result = await pool
      .request()

      .input(
        "AccountNo",
        sql.VarChar(50),
        accountNo
      )

      .input(
        "Date",
        sql.Date,
        body.Date
      )

      .input(
        "BankName",
        sql.VarChar(200),
        body.BankName
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
        UPDATE dbo.tb_BankAccounts
        SET
            [Date] = @Date,
            BankName = @BankName,
            Branch = @Branch,
            Manager = @Manager,
            Address = @Address,
            TP = @TP,
            Mobile = @Mobile,
            AccountType = @AccountType,
            [State] = @State,
            ModifiedDate = GETDATE()
        WHERE AccountNo = @AccountNo;

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

    if (
      result.recordset.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bank account not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.recordset[0],
      }
    );

  } catch (error) {

    console.error(
      "Bank account PUT error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update bank account",
      },
      {
        status: 500,
      }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      accountNo: string;
    }>;
  }
) {

  try {

    const { accountNo } =
      await params;

    const pool =
      await getSqlConnectionPool();

    const result = await pool
      .request()

      .input(
        "AccountNo",
        sql.VarChar(50),
        accountNo
      )

      .query(`
        DELETE FROM dbo.tb_BankAccounts
        WHERE AccountNo = @AccountNo
      `);

    if (
      result.rowsAffected[0] === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bank account not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Bank account deleted successfully",
    });

  } catch (error) {

    console.error(
      "Bank account DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete bank account",
      },
      {
        status: 500,
      }
    );
  }
}