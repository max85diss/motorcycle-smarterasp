

import { NextRequest, NextResponse } from "next/server";
 import sql from "mssql";
  import { getSqlConnectionPool } from "@/lib/db";
  
  // GET ALL ITEMS 
  export async function GET() {
     try { 
        const pool = await getSqlConnectionPool();
         const result = await pool .request() 
         .query(` SELECT PartNo, Type, Model, Color, Price, Description, Status FROM tb_bikeModelDetails ORDER BY PartNo `);
         
         console.log(result.recordset);
         return NextResponse.json({ success: true, data: result.recordset, }); } 
         catch (error)
          { 
            console.error(error);
             return NextResponse.json( { success: false, message: "Unable to load items.", }, { status: 500, } ); 
            } 
        
        }


        export async function POST( request: NextRequest )
         { 
            try 
            { 
                const body = await request.json(); 
                if (!body.PartNo) {
                     return NextResponse.json( { success: false, message: "Part No is required.", }, { status: 400, } );
                     } 
                     const pool = await getSqlConnectionPool();
                      // Check duplicate PartNo 
                     const existing = await pool .request() 
                     .input( "PartNo", sql.VarChar(50), body.PartNo ) 
                     .query(` SELECT PartNo FROM tb_bikeModelDetails WHERE PartNo = @PartNo `);
                     
                     if (existing.recordset.length > 0) {
                         return NextResponse.json( { success: false, message: "Part No already exists.", }, { status: 409, } );
                         } 
                         
                         await pool .request() 
                         .input( "PartNo", sql.VarChar(50), body.PartNo ) 
                         .input( "Type", sql.VarChar(100), body.Type ) 
                         .input( "Model", sql.VarChar(100), body.Model ) 
                         .input( "Color", sql.VarChar(100), body.Color ) 
                         .input( "Price", sql.Decimal(18, 2), body.Price || 0 )
                          .input( "Description", sql.VarChar(500), body.Description ) 
                          .input( "Status", sql.VarChar(20), body.Status )
                           .query(` INSERT INTO tb_bikeModelDetails ( PartNo, Type, Model, Color, Price, Description, Status ) VALUES ( @PartNo, @Type, @Model, @Color, @Price, @Description, @Status ) `);
                            return NextResponse.json({ success: true, message: "Item saved successfully.", });
                         } catch (error) {
                             console.error(error); 
                             return NextResponse.json( { success: false, message: "Unable to save item.", }, { status: 500, } );
                             }
                            
                            }


