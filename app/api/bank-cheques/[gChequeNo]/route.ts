
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { cookies } from "next/headers";
import { getSqlConnectionPool } from "@/lib/db";

export async function PUT(
    request: NextRequest,
    {
        params
    }: {
        params: Promise<{
            gChequeNo: string
        }>
    }
) {

    try {

        const {
            gChequeNo
        } = await params;

        const body =
            await request.json();

        const {
            ChequeNo,
            ChequeDate,
            Payee,
            Payer,
            Amount,
            ChequeType,
            State,
            Description
        } = body;

        const cookieStore =
            await cookies();

        const EmpCode =
            cookieStore.get(
                "EmpCode"
            )?.value ?? "";

        const EmpName =
            cookieStore.get(
                "EmpName"
            )?.value ?? "";

        const pool =
            await getSqlConnectionPool();

        await pool.request()

            .input(
                "GChequeNo",
                sql.VarChar(20),
                gChequeNo
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
                "State",
                sql.VarChar(30),
                State
            )

            .input(
                "Description",
                sql.VarChar(500),
                Description || null
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
                UPDATE dbo.tb_BankCheque

                SET
                    ChequeNo = @ChequeNo,
                    ChequeDate = @ChequeDate,
                    Payee = @Payee,
                    Payer = @Payer,
                    Amount = @Amount,
                    ChequeType = @ChequeType,
                    [State] = @State,
                    [Description] = @Description,
                    EmpCode = @EmpCode,
                    EmpName = @EmpName,
                    ModifiedDate = GETDATE()

                WHERE GChequeNo = @GChequeNo
            `);

        return NextResponse.json({
            success: true,
            message:
                "Cheque updated"
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update cheque"
            },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: NextRequest,
    {
        params
    }: {
        params: Promise<{
            gChequeNo: string
        }>
    }
) {

    try {

        const {
            gChequeNo
        } = await params;

        const pool =
            await getSqlConnectionPool();

        /*
         * Do not physically delete
         * cleared cheques.
         */

        const result =
            await pool.request()

                .input(
                    "GChequeNo",
                    sql.VarChar(20),
                    gChequeNo
                )

                .query(`
                    UPDATE dbo.tb_BankCheque
                    SET
                        [State] = 'Cancelled',
                        ModifiedDate = GETDATE()
                    WHERE
                        GChequeNo = @GChequeNo
                `);

        return NextResponse.json({
            success: true,
            message:
                "Cheque cancelled"
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to cancel cheque"
            },
            { status: 500 }
        );
    }
}