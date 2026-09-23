

import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "mssql";

import {
  getSqlConnectionPool,
} from "@/lib/db";


// ========================================
// GET ONE ITEM
// ========================================

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      itemCode: string;
    }>;
  }
) {

  try {

    const {
      itemCode,
    } = await params;


    const pool =
      await getSqlConnectionPool();


    const result =
      await pool
        .request()

        .input(
          "ItemCode",
          sql.VarChar(50),
          itemCode
        )

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

          WHERE
            ItemCode = @ItemCode
        `);


    if (
      result.recordset.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Other item not found.",
        },
        {
          status: 404,
        }
      );

    }


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
          "Unable to load other item.",
      },
      {
        status: 500,
      }
    );

  }

}



// ========================================
// UPDATE ITEM
// ========================================

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      itemCode: string;
    }>;
  }
) {

  try {

    const {
      itemCode,
    } = await params;


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


    const result =
      await pool
        .request()

        .input(
          "ItemCode",
          sql.VarChar(50),
          itemCode
        )

        .input(
          "Description",
          sql.VarChar(500),
          body.Description
        )

        .input(
          "IssuedAmountForInvoice",
          sql.Decimal(18, 2),
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
          sql.Decimal(18, 2),
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
          UPDATE tb_OtherItemDetails

          SET

            Description =
              @Description,

            IssuedAmountForInvoice =
              @IssuedAmountForInvoice,

            IsItConsignmentItem =
              @IsItConsignmentItem,

            IsItFreeItem =
              @IsItFreeItem,

            SalesPrice =
              @SalesPrice,

            Status =
              @Status

          WHERE
            ItemCode = @ItemCode
        `);


    if (
      result.rowsAffected[0] === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Other item not found.",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json({
      success: true,
      message:
        "Other item updated successfully.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update other item.",
      },
      {
        status: 500,
      }
    );

  }

}

