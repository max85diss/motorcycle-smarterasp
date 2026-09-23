
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { cookies } from "next/headers";
import { getSqlConnectionPool } from "@/lib/db";

import {
  getUserCookies,
} from "@/lib/cookies";

export async function GET(request: NextRequest) {
    try {
        const pool = await getSqlConnectionPool();

        const { searchParams } = new URL(request.url);

        const fromDate =
            searchParams.get("fromDate");

        const toDate =
            searchParams.get("toDate");

        const branchCode =
            searchParams.get("branchCode");

        const accountNo =
            searchParams.get("accountNo");

        let query = `
            SELECT
                GBBNo,
                BranchBBNo,
                BankTransactionRefNo,
                RefNo,
                [Date],
                AccountNo,
                BankName,
                [Description],
                DR,
                CR,
                [State],
                BranchCode,
                BranchName,
                EmpCode,
                EmpName
            FROM dbo.tb_BankBook
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

        if (
            accountNo &&
            accountNo !== "ALL"
        ) {
            query += `
                AND AccountNo = @AccountNo
            `;

            requestSql.input(
                "AccountNo",
                sql.VarChar(50),
                accountNo
            );
        }

        query += `
            ORDER BY [Date] DESC, ID DESC
        `;

        const result =
            await requestSql.query(query);

        return NextResponse.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {

        console.error(
            "Bankbook GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load bankbook"
            },
            { status: 500 }
        );
    }
}


export async function POST(
    request: NextRequest
) {
    const transaction =
        new sql.Transaction(
            await getSqlConnectionPool()
        );

    try {

        const body =
            await request.json();

        const {
            Date,
            AccountNo,
            BankName,
            BankTransactionRefNo,
            RefNo,
            Description,
            DR,
            CR
        } = body;

        if (!Date) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Date is required"
                },
                { status: 400 }
            );
        }

        if (!AccountNo) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Bank account is required"
                },
                { status: 400 }
            );
        }

        if (!Description) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Description is required"
                },
                { status: 400 }
            );
        }

        const dr =
            Number(DR || 0);

        const cr =
            Number(CR || 0);

        if (
            (dr <= 0 && cr <= 0) ||
            (dr > 0 && cr > 0)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Enter either DR or CR"
                },
                { status: 400 }
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



        const BranchCode =
             user.BranchCode;

        const BranchName =
             user.BranchName;

        const EmpCode =
            user.EmpCode;

        const EmpName =
             user.EmpName;

        if (!BranchCode) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Branch information not found"
                },
                { status: 401 }
            );
        }

        await transaction.begin();

        /*
         * Generate branch BB number
         * safely inside transaction.
         */

        let branchNo = 0;

        const sequenceResult =
            await new sql.Request(
                transaction
            )
                .input(
                    "BranchCode",
                    sql.VarChar(50),
                    BranchCode
                )
                .query(`
                    UPDATE dbo.tb_BranchBankBookSequence
                    SET LastNo = LastNo + 1
                    OUTPUT INSERTED.LastNo
                    WHERE BranchCode = @BranchCode
                `);

        if (
            sequenceResult.recordset.length === 0
        ) {

            await new sql.Request(
                transaction
            )
                .input(
                    "BranchCode",
                    sql.VarChar(50),
                    BranchCode
                )
                .query(`
                    INSERT INTO
                    dbo.tb_BranchBankBookSequence
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
                sequenceResult
                    .recordset[0]
                    .LastNo;
        }

        const BranchBBNo =
            "BB" +
            String(branchNo)
                .padStart(6, "0");

        const insertResult =
            await new sql.Request(
                transaction
            )
                .input(
                    "BranchBBNo",
                    sql.VarChar(30),
                    BranchBBNo
                )
                .input(
                    "BankTransactionRefNo",
                    sql.VarChar(100),
                    BankTransactionRefNo || null
                )
                .input(
                    "RefNo",
                    sql.VarChar(100),
                    RefNo || null
                )
                .input(
                    "Date",
                    sql.Date,
                    Date
                )
                .input(
                    "AccountNo",
                    sql.VarChar(50),
                    AccountNo
                )
                .input(
                    "BankName",
                    sql.VarChar(200),
                    BankName || ""
                )
                .input(
                    "Description",
                    sql.VarChar(500),
                    Description
                )
                .input(
                    "DR",
                    sql.Decimal(18, 2),
                    dr
                )
                .input(
                    "CR",
                    sql.Decimal(18, 2),
                    cr
                )
                .input(
                    "BranchCode",
                    sql.VarChar(50),
                    BranchCode
                )
                .input(
                    "BranchName",
                    sql.VarChar(200),
                    BranchName
                )
                .input(
                    "EmpCode",
                    sql.VarChar(50),
                    EmpCode
                )
                .input(
                    "EmpName",
                    sql.VarChar(200),
                    EmpName
                )
                .query(`
                    INSERT INTO dbo.tb_BankBook
                    (
                        BranchBBNo,
                        BankTransactionRefNo,
                        RefNo,
                        [Date],
                        AccountNo,
                        BankName,
                        [Description],
                        DR,
                        CR,
                        BranchCode,
                        BranchName,
                        EmpCode,
                        EmpName
                    )
                    OUTPUT
                        INSERTED.GBBNo,
                        INSERTED.BranchBBNo
                    VALUES
                    (
                        @BranchBBNo,
                        @BankTransactionRefNo,
                        @RefNo,
                        @Date,
                        @AccountNo,
                        @BankName,
                        @Description,
                        @DR,
                        @CR,
                        @BranchCode,
                        @BranchName,
                        @EmpCode,
                        @EmpName
                    )
                `);

        await transaction.commit();

        return NextResponse.json({
            success: true,
            message:
                "Bank transaction saved",
            data:
                insertResult.recordset[0]
        });

    } catch (error) {

        try {
            await transaction.rollback();
        } catch {}

        console.error(
            "Bankbook POST error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to save bank transaction"
            },
            { status: 500 }
        );
    }
}