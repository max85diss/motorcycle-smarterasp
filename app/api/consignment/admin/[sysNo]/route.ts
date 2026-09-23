
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getSqlConnectionPool,
} from "@/lib/db";

import sql from "mssql";



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

        const { sysNo } =
            await params;

        const body =
            await request.json();

        // ============================================
        // Validate action
        // ============================================

        if (
            body.action !== "APPROVE"
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid approval action.",
                },
                {
                    status: 400,
                }
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
            // 1. Get Consignment
            // ========================================

            const consignmentRequest =
                new sql.Request(
                    transaction
                );

            consignmentRequest.input(
                "SysNo",
                sql.VarChar(50),
                sysNo
            );


            const consignmentResult =
                await consignmentRequest.query(`
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
                        Status,
                        BranchSysId
                    FROM tb_consignment WITH (UPDLOCK)
                    WHERE SysNo = @SysNo
                `);
console.log(consignmentResult)

            if (
                consignmentResult
                    .recordset
                    .length === 0
            ) {

                throw new Error(
                    "Consignment not found."
                );
            }


            const consignment =
                consignmentResult
                    .recordset[0];


            // ========================================
            // 2. Must be AP
            // ========================================

            if (
                consignment.APED !== "AP"
            ) {

                throw new Error(
                    `Consignment is not pending approval. Current state: ${consignment.APED}`
                );
            }


            // ========================================
            // 3. Load Items
            // ========================================

            const itemsRequest =
                new sql.Request(
                    transaction
                );

            itemsRequest.input(
                "SysNo",
                sql.VarChar(50),
                sysNo
            );


            const itemsResult =
                await itemsRequest.query(`
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
                    FROM tb_consignmentItems
                    WHERE ConsignmentNo = @SysNo
                    ORDER BY No
                `);


            const items =
                itemsResult.recordset;


            if (
                items.length === 0
            ) {

                throw new Error(
                    "This consignment has no items."
                );
            }


            // ========================================
            // 4. Check item count
            // ========================================

            if (
                Number(
                    consignment.NoOfItems
                ) !== items.length
            ) {

                throw new Error(
                    `Item count mismatch. Header: ${consignment.NoOfItems}, Actual: ${items.length}`
                );
            }


// ========================================
// 5. Generate Branch Stock Sequence
// ========================================

const branchCode = consignment.BranchCode;
const itemCount = items.length;

const sequenceRequest =
    new sql.Request(transaction);

sequenceRequest.input(
    "BranchCode",
    sql.VarChar(50),
    branchCode
);

const sequenceResult =
    await sequenceRequest.query(`
        SELECT LastNo
        FROM tb_BranchStockSequence WITH (UPDLOCK, HOLDLOCK)
        WHERE BranchCode = @BranchCode
    `);

let firstBranchStockNo: number;
let lastBranchStockNo: number;

if (sequenceResult.recordset.length === 0) {

    // ==================================
    // First stock items for branch
    // ==================================

    firstBranchStockNo = 1;

    lastBranchStockNo =
        itemCount;

    const insertSequenceRequest =
        new sql.Request(transaction);

    insertSequenceRequest.input(
        "BranchCode",
        sql.VarChar(50),
        branchCode
    );

    insertSequenceRequest.input(
        "LastNo",
        sql.Int,
        lastBranchStockNo
    );

    await insertSequenceRequest.query(`
        INSERT INTO tb_BranchStockSequence
        (
            BranchCode,
            LastNo
        )
        VALUES
        (
            @BranchCode,
            @LastNo
        )
    `);

} else {

    // ==================================
    // Existing branch
    // ==================================

    const lastNo =
        Number(
            sequenceResult.recordset[0].LastNo
        );

    firstBranchStockNo =
        lastNo + 1;

    lastBranchStockNo =
        lastNo + itemCount;

    const updateSequenceRequest =
        new sql.Request(transaction);

    updateSequenceRequest.input(
        "BranchCode",
        sql.VarChar(50),
        branchCode
    );

    updateSequenceRequest.input(
        "LastNo",
        sql.Int,
        lastBranchStockNo
    );

    await updateSequenceRequest.query(`
        UPDATE tb_BranchStockSequence
        SET LastNo = @LastNo
        WHERE BranchCode = @BranchCode
    `);
}

// ========================================
// 6. Insert Items into Stock
// ========================================

let currentBranchStockNo =
    firstBranchStockNo;

for (const item of items) {

    const branchStockID =
        branchCode +
        "-STK-" +
        String(
            currentBranchStockNo
        ).padStart(
            6,
            "0"
        );

    const stockRequest =
        new sql.Request(transaction);

    stockRequest
        .input(
            "BranchStockID",
            sql.VarChar(60),
            branchStockID
        )
        .input(
            "ConsignmentNo",
            sql.VarChar(50),
            item.ConsignmentNo
        )
        .input(
            "ConsignmentItemNo",
            sql.VarChar(50),
            item.SysRefNo
        )
        .input(
            "PartNo",
            sql.VarChar(100),
            item.PartNo
        )
        .input(
            "SerialNo",
            sql.VarChar(100),
            item.SerialNo ?? null
        )
        .input(
            "ENO",
            sql.VarChar(100),
            item.ENO ?? null
        )
        .input(
            "FNO",
            sql.VarChar(100),
            item.FNO ?? null
        )
        .input(
            "BranchCode",
            sql.VarChar(50),
            item.BranchCode
        )
        .input(
            "BranchName",
            sql.VarChar(200),
            item.BranchName
        )
        .input(
            "Status",
            sql.VarChar(30),
            "Available"
        );

    await stockRequest.query(`
        INSERT INTO tb_stock
        (
            BranchStockID,
            ConsignmentNo,
            ConsignmentItemNo,
            PartNo,
            SerialNo,
            ENO,
            FNO,
            BranchCode,
            BranchName,
            Status,
            CreatedDate
        )
        VALUES
        (
            @BranchStockID,
            @ConsignmentNo,
            @ConsignmentItemNo,
            @PartNo,
            @SerialNo,
            @ENO,
            @FNO,
            @BranchCode,
            @BranchName,
            @Status,
            GETDATE()
        )
    `);

    currentBranchStockNo++;
}


            // ========================================
            // 7. Update Consignment
            // ========================================

            const updateRequest =
                new sql.Request(
                    transaction
                );


            updateRequest.input(
                "SysNo",
                sql.VarChar(50),
                sysNo
            );


            await updateRequest.query(`
                UPDATE tb_consignment
                SET APED = 'APED'
                WHERE SysNo = @SysNo
                  AND APED = 'AP'
            `);


            // ========================================
            // 8. Commit
            // ========================================

            await transaction.commit();


            return NextResponse.json({

                success: true,

                message:
                    "Consignment approved successfully and stock created.",

                data: {

                    SysNo:
                        sysNo,

                    BranchCode:
                        branchCode,

                    ItemsAdded:
                        items.length,

                    FirstBranchStockID:
                        branchCode +
                        "-STK-" +
                        String(
                            firstBranchStockNo
                        ).padStart(
                            6,
                            "0"
                        ),

                    LastBranchStockID:
                        branchCode +
                        "-STK-" +
                        String(
                            currentBranchStockNo -
                            1
                        ).padStart(
                            6,
                            "0"
                        ),

                    APED:
                        "APED",
                },

            });

        } catch (error) {

            await transaction.rollback();

            throw error;
        }


    } catch (error) {

        console.error(
            "Consignment approval error:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to approve consignment.",
            },
            {
                status: 500,
            }
        );
    }
}