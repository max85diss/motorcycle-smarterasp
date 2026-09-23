
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";

export async function GET(
    request: NextRequest
) {
    try {

        const { searchParams } =
            new URL(request.url);

        const status =
            searchParams.get("status");

        const allowedStatuses = [
            "Entering",
            "AP",
            "APED",
        ];
        console.log(status)
        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status.",
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
                    "APED",
                    sql.VarChar(20),
                    status
                )
                .query(`
                    SELECT
                        ID,
                        SysNo,
                        [Date],
                        ConNO,
                        NoOfItems,
                        APED,
                        BranchCode,
                        BranchName,
                        EmpCode,
                        EmpName,
                        BranchSysId
                    FROM dbo.tb_consignment
                    WHERE APED = @APED
                    ORDER BY ID DESC
                `);

                

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });

    } catch (error) {

        console.error(
            "Consignment admin GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to load consignments.",
            },
            { status: 500 }
        );
    }
}