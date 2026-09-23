

import { NextResponse } from "next/server";
 import { getSqlConnectionPool } from "@/lib/db"; 
 
 export async function GET() {
     try {
         const pool = await getSqlConnectionPool();
          const result = await pool .request() .query(` SELECT UserCode, Fullname FROM tb_users WHERE IsDeleted = 0 ORDER BY UserCode `);
          
          return NextResponse.json({ success: true, data: result.recordset, });
         }
          
          catch (error) { 
            
            console.error(error);
             return NextResponse.json( { success: false, message: "Unable to load users." }, { status: 500 } ); 
            } 
        }