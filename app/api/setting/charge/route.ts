

import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";


// GET ALL CHARGES
export async function GET() {
  try {
    const pool = await getSqlConnectionPool();

    const result = await pool
      .request()
      .query(`
        SELECT
          ID,
          CHNo,
          Description,
          Amount,
          IsItFixed,
          Status
        FROM tb_charges
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
        message: "Unable to load charges.",
      },
      {
        status: 500,
      }
    );
  }
}


// CREATE CHARGE
export async function POST(
  request: NextRequest
) {
  try {

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

    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {

      const requestInsert =
        new sql.Request(transaction);

      // Insert temporary CHNo.
      // It will be replaced after ID is generated.

      const insertResult =
        await requestInsert
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
            INSERT INTO tb_charges
            (
              CHNo,
              Description,
              Amount,
              IsItFixed,
              Status
            )
            OUTPUT INSERTED.ID
            VALUES
            (
              CONCAT('TMP-', NEWID()),
              @Description,
              @Amount,
              @IsItFixed,
              @Status
            )
          `);

      const newID =
        insertResult.recordset[0].ID;

      // Generate CHNo from ID
      // Example:
      // ID 1  -> CH000001
      // ID 25 -> CH000025

      const chNo =
        "CH" +
        String(newID).padStart(6, "0");


      const updateRequest =
        new sql.Request(transaction);

      await updateRequest
        .input(
          "ID",
          sql.Int,
          newID
        )
        .input(
          "CHNo",
          sql.VarChar(20),
          chNo
        )
        .query(`
          UPDATE tb_charges
          SET CHNo = @CHNo
          WHERE ID = @ID
        `);


      await transaction.commit();


      return NextResponse.json({
        success: true,
        message: "Charge saved successfully.",
        data: {
          ID: newID,
          CHNo: chNo,
        },
      });

    } catch (error) {

      await transaction.rollback();

      throw error;
    }

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save charge.",
      },
      {
        status: 500,
      }
    );
  }
}