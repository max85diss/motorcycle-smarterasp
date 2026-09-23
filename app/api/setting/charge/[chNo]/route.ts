

import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";


// GET ONE CHARGE

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ chNo: string }>;
  }
) {
  try {

    const { chNo } = await params;

    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()
      .input(
        "CHNo",
        sql.VarChar(20),
        chNo
      )
      .query(`
        SELECT
          ID,
          CHNo,
          Description,
          Amount,
          IsItFixed,
          Status
        FROM tb_charges
        WHERE CHNo = @CHNo
      `);

    if (result.recordset.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "Charge not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.recordset[0],
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load charge.",
      },
      {
        status: 500,
      }
    );
  }
}


// UPDATE CHARGE

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ chNo: string }>;
  }
) {
  try {

    const { chNo } = await params;

    const body = await request.json();

    if (!body.Description?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message: "Description is required.",
        },
        {
          status: 400,
        }
      );
    }

    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()
      .input(
        "CHNo",
        sql.VarChar(20),
        chNo
      )
      .input(
        "Description",
        sql.VarChar(500),
        body.Description
      )
      .input(
        "Amount",
        sql.Decimal(18, 2),
        Number(body.Amount || 0)
      )
      .input(
        "IsItFixed",
        sql.Bit,
        Boolean(body.IsItFixed)
      )
      .input(
        "Status",
        sql.VarChar(20),
        body.Status || "Active"
      )
      .query(`
        UPDATE tb_charges
        SET
          Description = @Description,
          Amount = @Amount,
          IsItFixed = @IsItFixed,
          Status = @Status
        WHERE CHNo = @CHNo
      `);


    if (result.rowsAffected[0] === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "Charge not found.",
        },
        {
          status: 404,
        }
      );
    }


    return NextResponse.json({
      success: true,
      message: "Charge updated successfully.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update charge.",
      },
      {
        status: 500,
      }
    );
  }
}