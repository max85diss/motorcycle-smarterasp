

import {
    NextResponse,
} from "next/server";

import {
    getSqlConnectionPool,
} from "@/lib/db";

import {
    getUserCookies,
} from "@/lib/cookies";


export async function GET() {

    try {

        const user =
            await getUserCookies();

            console.log(user.Position)

        const isManager =
            user.Position ===
                "Manager" ||
            user.Position ===
                "Admin";


        if (!isManager) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You are not authorized to view all branches.",
                },
                {
                    status: 403,
                }
            );
        }


        const pool =
            await getSqlConnectionPool();


        const result =
            await pool.request().query(`
                SELECT
                    BranchCode,
                    BranchName
                FROM tb_branch
                WHERE Status = 'Active'
                ORDER BY BranchName
            `);


        return NextResponse.json({
            success: true,
            data:
                result.recordset,
        });


    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to load branches.",
            },
            {
                status: 500,
            }
        );
    }
}