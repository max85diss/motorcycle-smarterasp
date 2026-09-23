

import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {

    const { id } = await params;

    const body = await request.json();

    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()

      .input(
        "ID",
        sql.Int,
        Number(id)
      )

      .input(
        "ConsignmentNo",
        sql.VarChar(50),
        body.ConsignmentNo
      )

      .input(
        "ItemCode",
        sql.VarChar(100),
        body.ItemCode
      )

      .input(
        "ItemDescription",
        sql.VarChar(500),
        body.Description
      )

      .input(
        "ReqQTY",
        sql.Decimal(18, 3),
        Number(body.ReqQTY ?? 0)
      )

      .input(
        "ReceivedQTY",
        sql.Decimal(18, 3),
        Number(body.ReceivedQTY ?? 0)
      )

      .query(`
        UPDATE dbo.tb_ConsignmentOtherItemsStock
        SET
            ConsignmentNo = @ConsignmentNo,
            ItemCode = @ItemCode,
            ItemDescription = @ItemDescription,
            ReqQTY = @ReqQTY,
            ReceivedQTY = @ReceivedQTY,
            ModifiedDate = GETDATE()
        WHERE ID = @ID
          AND APED = 'Entering';

        SELECT
            ID,
            ConsignmentNo,
            ItemCode,
            ItemDescription,
            ReqQTY,
            ReceivedQTY,
            Different,
            [Date],
            APED
        FROM dbo.tb_ConsignmentOtherItemsStock
        WHERE ID = @ID;
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
        message: "Failed to update item",
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
    params: Promise<{ id: string }>;
  }
) {
  try {

    const { id } = await params;

    const pool = await getSqlConnectionPool();

    await pool
      .request()
      .input(
        "ID",
        sql.Int,
        Number(id)
      )
      .query(`
        DELETE FROM dbo.tb_ConsignmentOtherItemsStock
        WHERE ID = @ID
          AND APED = 'Entering'
      `);

    return NextResponse.json({
      success: true,
      message: "Item deleted",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete item",
      },
      {
        status: 500,
      }
    );
  }
}