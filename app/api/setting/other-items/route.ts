


import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";


// ========================================
// GET ALL ITEMS
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
            ItemCode,
            Description,
            IssuedAmountForInvoice,
            IsItConsignmentItem,
            IsItFreeItem,
            SalesPrice,
            Status
          FROM tb_OtherItemDetails
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
          "Unable to load other items.",
      },
      {
        status: 500,
      }
    );

  }

}



// ========================================
// CREATE ITEM
// ========================================

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      await request.json();


    if (!body.Description?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Description is required.",
        },
        {
          status: 400,
        }
      );

    }


    const pool =
      await getSqlConnectionPool();


    /*
      Transaction is important here.

      1. Insert record.
      2. SQL Server generates ID.
      3. Generate OTI + ID.
      4. Update ItemCode.
    */

    const transaction =
      new sql.Transaction(pool);


    await transaction.begin();


    try {

      const insertRequest =
        new sql.Request(transaction);


      /*
        Temporary ItemCode is used because
        ItemCode is NOT NULL and is the
        primary key.

        It will immediately be replaced
        with OTI + generated ID.
      */

      const insertResult =
        await insertRequest

          .input(
            "Description",
            sql.VarChar(500),
            body.Description
          )

          .input(
            "IssuedAmountForInvoice",
            sql.Decimal(10, 2),
            Number(
              body.IssuedAmountForInvoice || 0
            )
          )

          .input(
            "IsItConsignmentItem",
            sql.Bit,
            Boolean(
              body.IsItConsignmentItem
            )
          )

          .input(
            "IsItFreeItem",
            sql.Bit,
            Boolean(
              body.IsItFreeItem
            )
          )

          .input(
            "SalesPrice",
            sql.Decimal(10, 2),
            Number(
              body.SalesPrice || 0
            )
          )

          .input(
            "Status",
            sql.VarChar(20),
            body.Status || "Active"
          )

          .query(`
            INSERT INTO tb_OtherItemDetails
            (
              ItemCode,
              Description,
              IssuedAmountForInvoice,
              IsItConsignmentItem,
              IsItFreeItem,
              SalesPrice,
              Status
            )

            OUTPUT INSERTED.ID

            VALUES
            (
              CONCAT(
                'TMP-',
                CONVERT(
                  varchar(36),
                  NEWID()
                )
              ),

              @Description,
              @IssuedAmountForInvoice,
              @IsItConsignmentItem,
              @IsItFreeItem,
              @SalesPrice,
              @Status
            )
          `);


      const newID =
        insertResult.recordset[0].ID;


      /*
        Generate:

        ID 1   -> OTI000001
        ID 25  -> OTI000025
        ID 125 -> OTI000125
      */

      const itemCode =
        "OTI" +
        String(newID).padStart(
          6,
          "0"
        );


      const updateRequest =
        new sql.Request(transaction);


      await updateRequest

        .input(
          "ID",
          sql.Int,
          newID
        )

        .input(
          "ItemCode",
          sql.VarChar(50),
          itemCode
        )

        .query(`
          UPDATE tb_OtherItemDetails

          SET
            ItemCode = @ItemCode

          WHERE
            ID = @ID
        `);


      await transaction.commit();


      return NextResponse.json({
        success: true,

        message:
          "Other item saved successfully.",

        data: {
          ID: newID,
          ItemCode: itemCode,
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
        message:
          "Unable to save other item.",
      },
      {
        status: 500,
      }
    );

  }

}

