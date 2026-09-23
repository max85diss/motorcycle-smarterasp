
import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "mssql";

import {
  getSqlConnectionPool,
} from "@/lib/db";


export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      sysRefNo: string;
    }>;
  }
) {

  try {

    const {
      sysRefNo,
    } = await params;


    const body =
      await request.json();


    console.log("Request body:", body);


    const pool =
      await getSqlConnectionPool();


    // Get current item and parent

    const current =
      await pool
        .request()

        .input(
          "SysRefNo",
          sql.VarChar(30),
          sysRefNo
        )

        .query(`
          SELECT
            I.ConsignmentNo,
            C.APED

          FROM tb_consignmentItems I

          INNER JOIN tb_consignment C
            ON C.SysNo =
               I.ConsignmentNo

          WHERE
            I.SysRefNo =
              @SysRefNo
        `);


    if (
      current.recordset.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Consignment item not found.",
        },
        { status: 404 }
      );

    }


    if (
      current.recordset[0].APED !==
      "Entering"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Items cannot be updated after approval processing has started.",
        },
        { status: 403 }
      );

    }


    const consignmentNo =
      current.recordset[0]
        .ConsignmentNo;


    await pool
      .request()

      .input(
        "SysRefNo",
        sql.VarChar(30),
        sysRefNo
      )

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
        body.Status
      )

      .input(
        "ReportNo",
        sql.VarChar(100),
        body.ReportNo
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
        UPDATE tb_consignmentItems

        SET

          SerialNo =
            @SerialNo,

          PartNo =
            @PartNo,

          ENO =
            @ENO,

          FNO =
            @FNO,

          Remark =
            @Remark,

          Status =
            @Status,

          ReportNo =
            @ReportNo,

          BranchCode =
            @BranchCode,

          BranchName =
            @BranchName,

          EmpCode =
            @EmpCode,

          EmpName =
            @EmpName

        WHERE
          SysRefNo =
            @SysRefNo
      `);


    return NextResponse.json({
      success: true,
      message:
        "Consignment item updated successfully.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update consignment item.",
      },
      { status: 500 }
    );

  }

}