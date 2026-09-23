
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { cookies } from "next/headers";
import { getSqlConnectionPool } from "@/lib/db";
import {
  getUserCookies,
} from "@/lib/cookies";


export async function GET(
    request: NextRequest
) {
    try {

        const pool =
            await getSqlConnectionPool();

        const { searchParams } =
            new URL(request.url);

        const fromDate =
            searchParams.get("fromDate");

        const toDate =
            searchParams.get("toDate");

        const branchCode =
            searchParams.get("branchCode");

        const state =
            searchParams.get("state");

        let query = `
            SELECT
                GChequeNo,
                GBBNo,
                BankTransactionRefNo,
                AccountNo,
                BankName,
                ChequeNo,
                ChequeDate,
                [Date],
                Payee,
                Payer,
                Amount,
                ChequeType,
                [Description],
                [State],
                BranchCode,
                BranchName,
                EmpCode,
                EmpName
            FROM dbo.tb_BankCheque
            WHERE 1 = 1
        `;

        const req =
            pool.request();

        if (fromDate) {

            query += `
                AND [Date] >= @FromDate
            `;

            req.input(
                "FromDate",
                sql.Date,
                fromDate
            );
        }

        if (toDate) {

            query += `
                AND [Date] <= @ToDate
            `;

            req.input(
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

            req.input(
                "BranchCode",
                sql.VarChar(50),
                branchCode
            );
        }

        if (
            state &&
            state !== "ALL"
        ) {

            query += `
                AND [State] = @State
            `;

            req.input(
                "State",
                sql.VarChar(30),
                state
            );
        }

        query += `
            ORDER BY [Date] DESC, ID DESC
        `;

        const result =
            await req.query(query);

        return NextResponse.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load cheques"
            },
            { status: 500 }
        );
    }
}


export async function POST(
    request: NextRequest
) {

    try {

        const body =
            await request.json();

        const {
            GBBNo,
            BankTransactionRefNo,
            AccountNo,
            BankName,
            ChequeNo,
            ChequeDate,
            Date,
            Payee,
            Payer,
            Amount,
            ChequeType,
            Description
        } = body;

        if (!GBBNo) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "GBBNo is required"
                },
                { status: 400 }
            );
        }

        if (!ChequeNo) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Cheque number is required"
                },
                { status: 400 }
            );
        }

        if (!ChequeDate) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Cheque date is required"
                },
                { status: 400 }
            );
        }

        if (
            Number(Amount || 0) <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid cheque amount"
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

        const pool =
            await getSqlConnectionPool();

        const result =
            await pool.request()

                .input(
                    "GBBNo",
                    sql.VarChar(20),
                    GBBNo
                )

                .input(
                    "BankTransactionRefNo",
                    sql.VarChar(100),
                    BankTransactionRefNo || null
                )

                .input(
                    "AccountNo",
                    sql.VarChar(50),
                    AccountNo
                )

                .input(
                    "BankName",
                    sql.VarChar(200),
                    BankName
                )

                .input(
                    "ChequeNo",
                    sql.VarChar(50),
                    ChequeNo
                )

                .input(
                    "ChequeDate",
                    sql.Date,
                    ChequeDate
                )

                .input(
                    "Date",
                    sql.Date,
                    Date || ChequeDate
                )

                .input(
                    "Payee",
                    sql.VarChar(250),
                    Payee || null
                )

                .input(
                    "Payer",
                    sql.VarChar(250),
                    Payer || null
                )

                .input(
                    "Amount",
                    sql.Decimal(18, 2),
                    Number(Amount)
                )

                .input(
                    "ChequeType",
                    sql.VarChar(30),
                    ChequeType
                )

                .input(
                    "Description",
                    sql.VarChar(500),
                    Description || null
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
                    INSERT INTO dbo.tb_BankCheque
                    (
                        GBBNo,
                        BankTransactionRefNo,
                        AccountNo,
                        BankName,
                        ChequeNo,
                        ChequeDate,
                        [Date],
                        Payee,
                        Payer,
                        Amount,
                        ChequeType,
                        [Description],
                        BranchCode,
                        BranchName,
                        EmpCode,
                        EmpName
                    )

                    OUTPUT
                        INSERTED.GChequeNo

                    VALUES
                    (
                        @GBBNo,
                        @BankTransactionRefNo,
                        @AccountNo,
                        @BankName,
                        @ChequeNo,
                        @ChequeDate,
                        @Date,
                        @Payee,
                        @Payer,
                        @Amount,
                        @ChequeType,
                        @Description,
                        @BranchCode,
                        @BranchName,
                        @EmpCode,
                        @EmpName
                    )
                `);

        return NextResponse.json({
            success: true,
            message:
                "Cheque saved",
            data:
                result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to save cheque"
            },
            { status: 500 }
        );
    }
}