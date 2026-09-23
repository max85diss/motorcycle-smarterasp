
import { NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";
import {getUserCookies} from "@/lib/cookies"

export async function GET() {
  try {

    const user = await getUserCookies();
    const branchCode = user.BranchCode
    const position = user.Position

    let queryStr =` SELECT
          SysNo,
          BranchSysId,
          [Date],
          NoOfItems,
          APED,
          BranchCode,
          BranchName
      FROM tb_consignment
   `

      if (position === 'Admin' || 'Manager')
      {
          queryStr = queryStr + "ORDER BY ID DESC"
      }else{
        queryStr = queryStr + " WHERE BranchCode ='" + branchCode + "' " + "ORDER BY ID DESC"
      }
    const pool = await getSqlConnectionPool();

    const result = await pool.request().query(queryStr);

    return NextResponse.json(result.recordset);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load consignments",
      },
      {
        status: 500,
      }
    );
  }
}