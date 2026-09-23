

import { NextRequest, NextResponse } from "next/server";

import sql from "mssql";
 import { getSqlConnectionPool } from "@/lib/db"; 
 
 // GET ONE ITEM 
 
 export async function GET( request: NextRequest, { params, }: { params: Promise<{ partNo: string }>; } )
  {
     try {
         const { partNo } = await params;
          const pool = await getSqlConnectionPool();
           const result = await pool .request()
            .input( "PartNo", sql.VarChar(50), partNo ) 
            .query(` SELECT PartNo, Type, Model, Color, Price, Description, Status FROM tb_bikeModelDetails WHERE PartNo = @PartNo `); 
            
            if (result.recordset.length === 0)
                 {
                     return NextResponse.json( { success: false, message: "Item not found.", }, { status: 404, } );
                     } 
                     return NextResponse.json({ success: true, data: result.recordset[0], }); 
                    } catch (error) 
                    { 
                        console.error(error);
                         return NextResponse.json( { success: false, message: "Unable to load item.", }, { status: 500, } ); 
                        } 
                    }



export async function PUT( request: NextRequest, { params, }: { params: Promise<{ partNo: string }>; } )
 { 
    try { 
        const { partNo } = await params;
         const body = await request.json(); 
         const pool = await getSqlConnectionPool();

         await pool .request() 
         .input( "PartNo", sql.VarChar(50), partNo ) 
         .input( "Type", sql.VarChar(100), body.Type ) 
         .input( "Model", sql.VarChar(100), body.Model )
          .input( "Color", sql.VarChar(100), body.Color )
           .input( "Price", sql.Decimal(18, 2), body.Price || 0 )
            .input( "Description", sql.VarChar(500), body.Description )
             .input( "Status", sql.VarChar(20), body.Status ) 
             .query(` UPDATE tb_bikeModelDetails SET Type = @Type, Model = @Model, Color = @Color, Price = @Price, Description = @Description, Status = @Status WHERE PartNo = @PartNo `);
             
             return NextResponse.json({ success: true, message: "Item updated successfully.", }); }
             catch (error) 
             { 
                console.error(error); 
                return NextResponse.json( { success: false, message: "Unable to update item.", }, { status: 500, } );
             }
             }