
import { NextRequest, NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import sql from "mssql";

export async function GET(
    request: NextRequest
) {
    try {

        const { searchParams } =
            new URL(request.url);

        const sysNo =
            searchParams.get("sysNo");

        if (!sysNo) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "SysNo is required.",
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
                    "SysNo",
                    sql.VarChar(50),
                    sysNo
                )
                .query(`
                    SELECT
                        No,
                        SysRefNo,
                        SerialNo,
                        PartNo,
                        ENO,
                        FNO,
                        Remark,
                        [Status],
                        ReportNo,
                        ConsignmentNo,
                        BranchCode,
                        BranchName,
                        EmpCode,
                        EmpName
                    FROM dbo.tb_consignmentItems
                    WHERE ConsignmentNo = @SysNo
                    ORDER BY No
                `);

        return NextResponse.json({
            success: true,
            data: result.recordset,
        });

    } catch (error) {

        console.error(
            "Consignment items error:",
            error
        );

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