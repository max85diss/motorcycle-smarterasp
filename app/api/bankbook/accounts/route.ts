
import { NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";

export async function GET() {

    try {

        const pool =
            await getSqlConnectionPool();

        const result =
            await pool.request().query(`
                SELECT
                    AccountNo,
                    BankName,
                    Branch,
                    AccountType,
                    State
                FROM dbo.tb_BankAccounts
                WHERE State = 'Active'
                ORDER BY BankName, Branch
            `);

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
                    "Failed to load bank accounts"
            },
            { status: 500 }
        );
    }
}