
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSqlConnectionPool,
} from "@/lib/db";

import sql from "mssql";

import {
  getUserCookies,
} from "@/lib/cookies";


export async function GET(
  request: NextRequest
) {
  try {

    const {
      searchParams,
    } = new URL(request.url);

    const fromDate =
      searchParams.get("fromDate");

    const toDate =
      searchParams.get("toDate");

    const branchCode =
      searchParams.get("branchCode");


    const pool =
      await getSqlConnectionPool();


    let query = `
      SELECT
          GCBNo,
          BranchCBNo,
          RefNo,
          [Date],
          [Description],
          DR,
          CR,
          [State],
          BranchCode,
          BranchName,
          EmpCode,
          EmpName
      FROM dbo.tb_CashBook
      WHERE 1 = 1
    `;


    const requestSql =
      pool.request();


    if (fromDate) {

      query += `
        AND [Date] >= @FromDate
      `;

      requestSql.input(
        "FromDate",
        sql.Date,
        fromDate
      );
    }


    if (toDate) {

      query += `
        AND [Date] <= @ToDate
      `;

      requestSql.input(
        "ToDate",
        sql.Date,
        toDate
      );
    }


    if (
      branchCode &&
      branchCode !== "ALL"
    ) {

      query += `
        AND BranchCode = @BranchCode
      `;

      requestSql.input(
        "BranchCode",
        sql.VarChar(50),
        branchCode
      );
    }


    query += `
      ORDER BY
          [Date] DESC,
          ID DESC
    `;


    const result =
      await requestSql.query(query);


    return NextResponse.json({
      success: true,
      data: result.recordset,
    });

  } catch (error) {

    console.error(
      "Cashbook GET error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load cashbook",
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

    const body =
      await request.json();


    if (!body.Description) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Description is required",
        },
        {
          status: 400,
        }
      );
    }


    const dr =
      Number(body.DR || 0);

    const cr =
      Number(body.CR || 0);


    if (
      (dr <= 0 && cr <= 0) ||
      (dr > 0 && cr > 0)
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Enter either DR or CR",
        },
        {
          status: 400,
        }
      );
    }


    const user =
      await getUserCookies();


    if (
      !user.BranchCode ||
      !user.EmpCode
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "User branch information is missing",
        },
        {
          status: 401,
        }
      );
    }


    const date =
      body.Date ||
      new Date()
        .toISOString()
        .substring(0, 10);


    const pool =
      await getSqlConnectionPool();


    const transaction =
      new sql.Transaction(pool);


    await transaction.begin();


    try {

      /*
       * Generate branch CB number
       * safely inside transaction.
       */

      const seqRequest =
        new sql.Request(
          transaction
        );


      seqRequest.input(
        "BranchCode",
        sql.VarChar(50),
        user.BranchCode
      );


      const seqResult =
        await seqRequest.query(`
          UPDATE dbo.tb_BranchCashBookSequence
          SET LastNo = LastNo + 1
          OUTPUT INSERTED.LastNo
          WHERE BranchCode = @BranchCode
        `);


      let branchNo: number;


      if (
        seqResult.recordset.length === 0
      ) {

        await new sql.Request(
          transaction
        )
          .input(
            "BranchCode",
            sql.VarChar(50),
            user.BranchCode
          )
          .query(`
            INSERT INTO
              dbo.tb_BranchCashBookSequence
            (
              BranchCode,
              LastNo
            )
            VALUES
            (
              @BranchCode,
              1
            )
          `);


        branchNo = 1;

      } else {

        branchNo =
          Number(
            seqResult.recordset[0]
              .LastNo
          );
      }


      const branchCBNo =
        "CB" +
        branchNo
          .toString()
          .padStart(6, "0");


      const insertRequest =
        new sql.Request(
          transaction
        );


      insertRequest.input(
        "BranchCBNo",
        sql.VarChar(30),
        branchCBNo
      );

      insertRequest.input(
        "RefNo",
        sql.VarChar(100),
        body.RefNo || null
      );

      insertRequest.input(
        "Date",
        sql.Date,
        date
      );

      insertRequest.input(
        "Description",
        sql.VarChar(500),
        body.Description
      );

      insertRequest.input(
        "DR",
        sql.Decimal(18, 2),
        dr
      );

      insertRequest.input(
        "CR",
        sql.Decimal(18, 2),
        cr
      );

      insertRequest.input(
        "State",
        sql.VarChar(30),
        "Active"
      );

      insertRequest.input(
        "BranchCode",
        sql.VarChar(50),
        user.BranchCode
      );

      insertRequest.input(
        "BranchName",
        sql.VarChar(200),
        user.BranchName
      );

      insertRequest.input(
        "EmpCode",
        sql.VarChar(50),
        user.EmpCode
      );

      insertRequest.input(
        "EmpName",
        sql.VarChar(200),
        user.EmpName
      );


      const result =
        await insertRequest.query(`
            IF EXISTS
(
    SELECT 1
    FROM dbo.tb_CashBookDayClose
    WHERE BranchCode = @BranchCode
      AND [Date] = @Date
)
BEGIN
    THROW 50001,
          'Cashier is already closed for this date.',
          1;
END
          INSERT INTO dbo.tb_CashBook
          (
            BranchCBNo,
            RefNo,
            [Date],
            [Description],
            DR,
            CR,
            [State],
            BranchCode,
            BranchName,
            EmpCode,
            EmpName
          )
          OUTPUT
            INSERTED.GCBNo,
            INSERTED.BranchCBNo,
            INSERTED.RefNo,
            INSERTED.[Date],
            INSERTED.[Description],
            INSERTED.DR,
            INSERTED.CR,
            INSERTED.BranchCode,
            INSERTED.BranchName,
            INSERTED.EmpCode,
            INSERTED.EmpName
          VALUES
          (
            @BranchCBNo,
            @RefNo,
            @Date,
            @Description,
            @DR,
            @CR,
            @State,
            @BranchCode,
            @BranchName,
            @EmpCode,
            @EmpName
          )
        `);


      await transaction.commit();


      return NextResponse.json({
        success: true,
        data:
          result.recordset[0],
      });

    } catch (error) {

      await transaction.rollback();

      throw error;
    }


  } catch (error) {

    console.error(
      "Cashbook POST error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save cashbook transaction",
      },
      {
        status: 500,
      }
    );
  }
}