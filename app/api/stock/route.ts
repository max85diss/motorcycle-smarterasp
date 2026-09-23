
import {
    NextRequest,
    NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import {
    getSqlConnectionPool,
} from "@/lib/db";

import {
    getUserCookies,
} from "@/lib/cookies";


import sql from "mssql";


export async function GET(
    request: NextRequest
) {

    try {
        console.log("OK")
        const user =
            await getUserCookies();
        console.log(user)
        if (!user.BranchCode) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "User branch information not found.",
                },
                { status: 401 }
            );
        }


        const { searchParams } =
            new URL(request.url);

        const requestedBranch =
            searchParams.get(
                "branchCode"
            );


        /*
         * IMPORTANT
         *
         * Change this according to your
         * actual cookie containing user position.
         *
         * Example:
         * Manager
         * Admin
         */

        const position =
            user.Position

            console.log(user.Position)
        const isManager =
            position === "Manager" ||
            position === "Admin";


        const pool =
            await getSqlConnectionPool();


        const requestSql =
            pool.request();


        let query = `
            SELECT
                StockID,
                GlobalStockNo,
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

            FROM tb_stock
            WHERE 1 = 1
        `;


        /*
         * Manager/Admin
         *
         * If branchCode is supplied,
         * show that branch.
         *
         * If no branch is supplied,
         * show all branches.
         */

        if (isManager) {

            if (
                requestedBranch &&
                requestedBranch !== "ALL"
            ) {

                requestSql.input(
                    "BranchCode",
                    sql.VarChar(50),
                    requestedBranch
                );

                query += `
                    AND BranchCode =
                        @BranchCode
                `;
            }

        } else {

            /*
             * Normal user:
             * ALWAYS force cookie branch.
             */

            requestSql.input(
                "BranchCode",
                sql.VarChar(50),
                user.BranchCode
            );

            query += `
                AND BranchCode =
                    @BranchCode
            `;
        }


        query += `
            ORDER BY StockID DESC
        `;
        console.log(query)

        const result =
            await requestSql.query(
                query
            );


        return NextResponse.json({
            success: true,

            data:
                result.recordset,

            isManager,

            branchCode:
                isManager
                    ? requestedBranch ||
                      "ALL"
                    : user.BranchCode,
        });


    } catch (error) {

        console.error(
            "Stock GET error:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to load stock.",
            },
            {
                status: 500,
            }
        );
    }
}