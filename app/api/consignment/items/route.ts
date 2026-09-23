
import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "mssql";

import {
  getSqlConnectionPool,
} from "@/lib/db";


// ========================================
// GET ITEMS
// ========================================

export async function GET(
  request: NextRequest
) {

  try {

    const {
      searchParams,
    } = new URL(
      request.url
    );


    const consignmentNo =
      searchParams.get(
        "consignmentNo"
      );


    if (!consignmentNo) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Consignment number is required.",
        },
        { status: 400 }
      );

    }


    const pool =
      await getSqlConnectionPool();


    const result =
      await pool
        .request()

        .input(
          "ConsignmentNo",
          sql.VarChar(30),
          consignmentNo
        )

        .query(`
          SELECT
            [No],
            SysRefNo,
            SerialNo,
            PartNo,
            ENO,
            FNO,
            Remark,
            Status,
            ReportNo,
            ConsignmentNo,
            BranchCode,
            BranchName,
            EmpCode,
            EmpName

          FROM tb_consignmentItems

          WHERE
            ConsignmentNo =
              @ConsignmentNo

          ORDER BY [No] DESC
        `);


    return NextResponse.json({
      success: true,
      data:
        result.recordset,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load consignment items.",
      },
      { status: 500 }
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


    console.log("Request body:", body);
    

    if (!body.BranchCode || !body.EmpCode) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Branch or employee information is missing.",
        },
        { status: 401 }
      );

    }


    if (!body.ConsignmentNo) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Consignment No is required.",
        },
        { status: 400 }
      );

    }


    const pool =
      await getSqlConnectionPool();


    // Check parent status

    const parent =
      await pool
        .request()

        .input(
          "SysNo",
          sql.VarChar(30),
          body.ConsignmentNo
        )

        .query(`
          SELECT APED
          FROM tb_consignment
          WHERE SysNo = @SysNo
        `);


    if (
      parent.recordset.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Consignment not found.",
        },
        { status: 404 }
      );

    }


    if (
      parent.recordset[0].APED !==
      "Entering"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Items can only be added while the consignment is Entering.",
        },
        { status: 403 }
      );

    }


    const transaction =
      new sql.Transaction(pool);


    await transaction.begin();


    try {

      const insertRequest =
        new sql.Request(
          transaction
        );


      const result =
        await insertRequest

          .input(
            "SerialNo",
            sql.VarChar(100),
            body.SerialNo
          )

          .input(
            "PartNo",
            sql.VarChar(100),
            body.PartNo
          )

          .input(
            "ENO",
            sql.VarChar(100),
            body.ENO
          )

          .input(
            "FNO",
            sql.VarChar(100),
            body.FNO
          )

          .input(
            "Remark",
            sql.VarChar(500),
            body.Remark
          )

          .input(
            "Status",
            sql.VarChar(20),
            body.Status ||
              "Active"
          )

          .input(
            "ReportNo",
            sql.VarChar(100),
            body.ReportNo
          )

          .input(
            "ConsignmentNo",
            sql.VarChar(30),
            body.ConsignmentNo
          )

          .input(
            "BranchCode",
            sql.VarChar(50),
            body.BranchCode
          )

          .input(
            "BranchName",
            sql.VarChar(200),
            body.BranchName
          )

          .input(
            "EmpCode",
            sql.VarChar(50),
            body.EmpCode
          )

          .input(
            "EmpName",
            sql.VarChar(200),
            body.EmpName
          )

          .query(`
            INSERT INTO tb_consignmentItems
            (
              SysRefNo,
              SerialNo,
              PartNo,
              ENO,
              FNO,
              Remark,
              Status,
              ReportNo,
              ConsignmentNo,
              BranchCode,
              BranchName,
              EmpCode,
              EmpName
            )

            OUTPUT INSERTED.[No]

            VALUES
            (
              'tem',

              @SerialNo,
              @PartNo,
              @ENO,
              @FNO,
              @Remark,
              @Status,
              @ReportNo,
              @ConsignmentNo,
              @BranchCode,
              @BranchName,
              @EmpCode,
              @EmpName
            )
          `);


      const newNo =
        result.recordset[0].No;


      const sysRefNo =
        "CI" +
        String(newNo)
          .padStart(6, "0");


      const updateRequest =
        new sql.Request(
          transaction
        );


      await updateRequest

        .input(
          "No",
          sql.Int,
          newNo
        )

        .input(
          "SysRefNo",
          sql.VarChar(30),
          sysRefNo
        )

        .query(`
          UPDATE tb_consignmentItems

          SET
            SysRefNo = @SysRefNo

          WHERE
            [No] = @No
        `);


      // Update item count

      await updateRequest

        .input(
          "ConsignmentNo2",
          sql.VarChar(30),
          body.ConsignmentNo
        )

        .query(`
          UPDATE tb_consignment

          SET
            NoOfItems =
            (
              SELECT COUNT(*)
              FROM tb_consignmentItems
              WHERE ConsignmentNo =
                @ConsignmentNo2
            )

          WHERE
            SysNo =
              @ConsignmentNo2
        `);


      await transaction.commit();


      return NextResponse.json({

        success: true,

        message:
          "Consignment item saved successfully.",

        data: {
          No: newNo,
          SysRefNo:
            sysRefNo,
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
          "Unable to save consignment item.",
      },
      { status: 500 }
    );

  }

}