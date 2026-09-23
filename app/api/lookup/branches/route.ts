

import { NextResponse } from "next/server";
 import { getSqlConnectionPool } from "@/lib/db";
 
 
 export async function GET() { 
    try {
         const pool = await getSqlConnectionPool();
          const result = await pool .request() .query(` SELECT BranchCode, BranchName, Location FROM tb_branch WHERE Status = 'Active' ORDER BY BranchName `); 
          
          return NextResponse.json({ success: true, data: result.recordset, }); 
        
        } catch (error) 
        { 
            console.error(error);
             return NextResponse.json( { success: false, message: "Unable to load branch list." }, { status: 500 } );
             }
         }