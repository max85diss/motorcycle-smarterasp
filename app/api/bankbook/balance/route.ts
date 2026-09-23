
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getSqlConnectionPool } from "@/lib/db";

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

        const accountNo =
            searchParams.get("accountNo");

        let query = `
            SELECT
                ISNULL(SUM(DR), 0) AS TotalDR,
                ISNULL(SUM(CR), 0) AS TotalCR,
                ISNULL(SUM(DR - CR), 0)
                    AS Balance
            FROM dbo.tb_BankBook
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
            accountNo &&
            accountNo !== "ALL"
        ) {
            query += `
                AND AccountNo = @AccountNo
            `;

            req.input(
                "AccountNo",
                sql.VarChar(50),
                accountNo
            );
        }

        const result =
            await req.query(query);

        return NextResponse.json({
            success: true,
            data: result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to calculate balance"
            },
            { status: 500 }
        );
    }
}