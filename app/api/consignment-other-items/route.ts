
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";
import { getUserCookies } from "@/lib/cookies";

export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(`
      SELECT
          ID,
          ConsignmentNo,
          ItemCode,
          ItemDescription,
          ReqQTY,
          ReceivedQTY,
          Different,
          [Date],
          APED,
          BranchCode,
          BranchName,
          EmpCode,
          EmpName
      FROM dbo.tb_ConsignmentOtherItemsStock
      ORDER BY ID DESC
    `);

    return NextResponse.json(result.recordset);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load consignment items",
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

    const {
      ConsignmentNo,
      ItemCode,
      Description,
      ReqQTY,
      ReceivedQTY,
      Date,
    } = body;
console.log(Description)
    if (!ConsignmentNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select consignment number",
        },
        { status: 400 }
      );
    }

    if (!ItemCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select item",
        },
        { status: 400 }
      );
    }


    if (!Description) {
      return NextResponse.json(
        {
          success: false,
          message: "Item description is required",
        },
        { status: 400 }
      );
    }

    const user = await getUserCookies();

    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()

      .input(
        "ConsignmentNo",
        sql.VarChar(50),
        ConsignmentNo
      )

      .input(
        "ItemCode",
        sql.VarChar(100),
        ItemCode
      )

      .input(
        "ItemDescription",
        sql.VarChar(500),
        Description
      )

      .input(
        "ReqQTY",
        sql.Decimal(18, 3),
        Number(ReqQTY ?? 0)
      )

      .input(
        "ReceivedQTY",
        sql.Decimal(18, 3),
        Number(ReceivedQTY ?? 0)
      )

      .input(
        "Date",
        sql.Date,
        Date || new Date()
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
        "EmpCode",
        sql.VarChar(50),
        user.EmpCode
      )

      .input(
        "EmpName",
        sql.VarChar(200),
        user.EmpName
      )

      .query(`
        INSERT INTO dbo.tb_ConsignmentOtherItemsStock
        (
            ConsignmentNo,
            ItemCode,
            ItemDescription,
            ReqQTY,
            ReceivedQTY,
            [Date],
            APED,
            BranchCode,
            BranchName,
            EmpCode,
            EmpName
        )
        OUTPUT
            INSERTED.ID,
            INSERTED.ConsignmentNo,
            INSERTED.ItemCode,
            INSERTED.ItemDescription,
            INSERTED.ReqQTY,
            INSERTED.ReceivedQTY,
            INSERTED.Different,
            INSERTED.[Date],
            INSERTED.APED
        VALUES
        (
            @ConsignmentNo,
            @ItemCode,
            @ItemDescription,
            @ReqQTY,
            @ReceivedQTY,
            @Date,
            'Entering',
            @BranchCode,
            @BranchName,
            @EmpCode,
            @EmpName
        )
      `);

    return NextResponse.json({
      success: true,
      data: result.recordset[0],
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save item",
      },
      {
        status: 500,
      }
    );
  }
}