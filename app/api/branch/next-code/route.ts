import { NextResponse } from "next/server";
import { getSqlConnectionPool } from "@/lib/db";


export async function GET() {

  try {

    const pool = await getSqlConnectionPool();


    const result = await pool.request()
      .query(`
        SELECT TOP 1 branchCode
        FROM tb_branch
        ORDER BY Id DESC
      `);


    let nextNumber = 1;
        console.log(result)

    if (result.recordset.length > 0) {

      const lastCode = result.recordset[0].branchCode;
      
      // BR-0005 => 5
      const lastNumber = parseInt(
        lastCode.replace("BR-", "")
      );

      nextNumber = lastNumber + 1;
    }


    const newCode =
      "BR-" +
      nextNumber.toString().padStart(4, "0");


    return NextResponse.json({
      success: true,
      code: newCode,
    });


  } catch (error) {

    console.error(
      "Generate branch code error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate branch code",
      },
      {
        status: 500,
      }
    );

  }

}