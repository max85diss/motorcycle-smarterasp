

import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getSqlConnectionPool,
} from "@/lib/db";

import sql from "mssql";


export async function PUT(
    request: NextRequest
) {

    try {

        const body =
            await request.json();

        const {
            SysNo,
        } = body;


        if (!SysNo) {

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


        const transaction =
            new sql.Transaction(pool);


        await transaction.begin(
            sql.ISOLATION_LEVEL.SERIALIZABLE
        );


        try {

            // ========================================
            // Check header
            // ========================================

            const headerRequest =
                new sql.Request(
                    transaction
                );

            headerRequest.input(
                "SysNo",
                sql.VarChar(50),
                SysNo
            );


            const headerResult =
                await headerRequest.query(`
                    SELECT
                        SysNo,
                        APED
                    FROM dbo.tb_consignment
                    WITH (UPDLOCK)
                    WHERE SysNo = @SysNo
                `);


            if (
                headerResult.recordset.length === 0
            ) {

                throw new Error(
                    "Consignment not found."
                );
            }


            const header =
                headerResult.recordset[0];


            if (
                header.APED !== "Entering"
            ) {

                throw new Error(
                    `Cannot send to approval. Current state: ${header.APED}`
                );
            }


            // ========================================
            // Count items
            // ========================================

            const itemRequest =
                new sql.Request(
                    transaction
                );

            itemRequest.input(
                "SysNo",
                sql.VarChar(50),
                SysNo
            );


            const itemResult =
                await itemRequest.query(`
                    SELECT COUNT(*) AS ItemCount
                    FROM dbo.tb_consignmentItems
                    WHERE ConsignmentNo = @SysNo
                `);


            const itemCount =
                Number(
                    itemResult
                        .recordset[0]
                        .ItemCount
                );


            if (itemCount === 0) {

                throw new Error(
                    "Add at least one item before sending to approval."
                );
            }


            // ========================================
            // AP
            // ========================================

            const updateRequest =
                new sql.Request(
                    transaction
                );

            updateRequest.input(
                "SysNo",
                sql.VarChar(50),
                SysNo
            );

            updateRequest.input(
                "NoOfItems",
                sql.Int,
                itemCount
            );


            await updateRequest.query(`
                UPDATE dbo.tb_consignment
                SET
                    NoOfItems = @NoOfItems,
                    APED = 'AP'
                WHERE SysNo = @SysNo
                  AND APED = 'Entering'
            `);


            await transaction.commit();


            return NextResponse.json({
                success: true,
                message:
                    "Consignment sent to approval.",
                data: {
                    SysNo,
                    APED: "AP",
                    NoOfItems: itemCount,
                },
            });


        } catch (error) {

            await transaction.rollback();

            throw error;
        }


    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to send approval.",
            },
            { status: 500 }
        );
    }
}