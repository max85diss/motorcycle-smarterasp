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
      sysNo: string;
    }>;
  }
) {

  try {

    const {
      sysNo,
    } = await params;


    const body =
      await request.json();

    console.log("Request body:", body);
   

    if (!body.BranchCode || !body.EmpCode) {

      return NextResponse.json(
        {
          success: false,
          message:
            "User information is missing from cookies.",
        },
        { status: 401 }
      );

    }


    const pool =
      await getSqlConnectionPool();


    // Check current approval status

    const current =
      await pool
        .request()
        .input(
          "SysNo",
          sql.VarChar(30),
          sysNo
        )
        .query(`
          SELECT APED
          FROM tb_consignment
          WHERE SysNo = @SysNo
        `);


    if (
      current.recordset.length === 0
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


    const currentAPED =
      current.recordset[0].APED;


    /*
      Once AP/APED processing has started,
      don't allow normal editing.
    */

    if (
      currentAPED !== "Entering"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Only Entering consignments can be edited.",
        },
        { status: 403 }
      );

    }


    await pool
      .request()

      .input(
        "SysNo",
        sql.VarChar(30),
        sysNo
      )

      .input(
        "Date",
        sql.Date,
        body.Date
      )

      .input(
        "ConNO",
        sql.VarChar(50),
        body.ConNO
      )

      .input(
        "Status",
        sql.VarChar(20),
        body.Status
      )

      .input(
        "APED",
        sql.VarChar(20),
        body.APED || "Entering"
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
        UPDATE tb_consignment

        SET

          [Date] = @Date,

          ConNO = @ConNO,

          Status = @Status,

          APED = @APED,

          BranchCode = @BranchCode,

          BranchName = @BranchName,

          EmpCode = @EmpCode,

          EmpName = @EmpName

        WHERE
          SysNo = @SysNo
      `);


    return NextResponse.json({
      success: true,
      message:
        "Consignment updated successfully.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update consignment.",
      },
      { status: 500 }
    );

  }

}

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            sysNo: string;
        }>;
    }
) {

    try {

        const { sysNo } =
            await params;

        const pool =
            await getSqlConnectionPool();

        const result =
            await pool
                .request()
                .input(
                    "SysNo",
                    sql.VarChar(50),
                    sysNo
                )
                .query(`
                    SELECT
                        SysNo,
                        [Date],
                        ConNO,
                        NoOfItems,
                        [Status],
                        APED,
                        BranchCode,
                        BranchName,
                        EmpCode,
                        EmpName,
                        BranchConNo,
                        BranchSysId
                    FROM dbo.tb_consignment
                    WHERE SysNo = @SysNo
                `);


        if (
            result.recordset.length === 0
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


        return NextResponse.json({
            success: true,
            data: result.recordset[0],
        });


    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to load consignment.",
            },
            { status: 500 }
        );
    }
}