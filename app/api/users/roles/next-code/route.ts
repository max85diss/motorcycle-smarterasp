import { NextResponse } from "next/server";
 import { getSqlConnectionPool } from "@/lib/db"; 
 
 
 
 export async function GET() {
    
    try { 
        const pool = await getSqlConnectionPool(); 
        const result = await pool.request().query(` SELECT TOP 1 EmpCode FROM tb_userPosition ORDER BY ID DESC `); 
        let nextNumber = 1; 
        if (result.recordset.length > 0) {
             const lastCode = result.recordset[0].EmpCode;
              const match = lastCode.match(/\d+/);
               if (match) { nextNumber = parseInt(match[0], 10) + 1; }
             } 
               const empCode = "EMP" + nextNumber.toString().padStart(5, "0");
                return NextResponse.json({ success: true, code: empCode, });
             } catch (error) { 
                console.error(error); 
                return NextResponse.json( { success: false, message: "Unable to generate employee code.", }, { status: 500, } ); 
            } 
            }

