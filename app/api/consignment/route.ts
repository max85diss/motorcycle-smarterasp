
import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "mssql";

import {
  getSqlConnectionPool,
} from "@/lib/db";


// ========================================
// GET CONSIGNMENTS
// ========================================

export async function GET() {

  try {

    const pool =
      await getSqlConnectionPool();

    const result =
      await pool
        .request()
        .query(`
          SELECT
            ID,
            SysNo,
            [Date],
            ConNO,
            NoOfItems,
            Status,
            APED,
            BranchCode,
            BranchName,
            EmpCode,
            EmpName
          FROM tb_consignment WHERE APED ='Entering'
          ORDER BY ID DESC 
        `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load consignments.",
      },
      { status: 500 }
    );

  }

}




// ========================================
// CREATE CONSIGNMENT
// ========================================

export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    // ------------------------------------
    // Validation
    // ------------------------------------

    if (!body.Date) {
      return NextResponse.json(
        {
          success: false,
          message: "Date is required.",
        },
        { status: 400 }
      );
    }

    if (!body.ConNO) {
      return NextResponse.json(
        {
          success: false,
          message: "Consignment No is required.",
        },
        { status: 400 }
      );
    }

    if (!body.BranchCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Branch Code is required.",
        },
        { status: 400 }
      );
    }

    const pool =
      await getSqlConnectionPool();

    // ------------------------------------
    // Transaction
    // ------------------------------------

    const transaction =
      new sql.Transaction(pool);

    // SERIALIZABLE is important here.
    // It prevents two users from generating
    // the same BranchSysId simultaneously.
    await transaction.begin(
      sql.ISOLATION_LEVEL.SERIALIZABLE
    );

    try {

      // ====================================
      // 1. Generate Branch Sequence
      // ====================================

      const sequenceRequest =
        new sql.Request(transaction);

      sequenceRequest.input(
        "BranchCode",
        sql.VarChar(50),
        body.BranchCode
      );

      const sequenceResult =
        await sequenceRequest.query(`
          
          SELECT LastNo
          FROM tb_BranchConsignmentSequence
          WHERE BranchCode = @BranchCode

        `);

      let branchNo: number;

      if (
        sequenceResult.recordset.length === 0
      ) {

        // First consignment for this branch

        branchNo = 1;

        const insertSequenceRequest =
          new sql.Request(transaction);

        insertSequenceRequest.input(
          "BranchCode",
          sql.VarChar(50),
          body.BranchCode
        );

        insertSequenceRequest.input(
          "LastNo",
          sql.Int,
          branchNo
        );

        await insertSequenceRequest.query(`
          
          INSERT INTO tb_BranchConsignmentSequence
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

        // Existing branch

        branchNo =
          Number(
            sequenceResult
              .recordset[0]
              .LastNo
          ) + 1;

        const updateSequenceRequest =
          new sql.Request(transaction);

        updateSequenceRequest.input(
          "BranchCode",
          sql.VarChar(50),
          body.BranchCode
        );

        updateSequenceRequest.input(
          "LastNo",
          sql.Int,
          branchNo
        );

        await updateSequenceRequest.query(`
          
          UPDATE tb_BranchConsignmentSequence

          SET LastNo = @LastNo

          WHERE BranchCode = @BranchCode

        `);
      }

      // ====================================
      // 2. Generate BranchSysId
      // ====================================

      const branchSysId =
        body.BranchCode +
        "-" +
        String(branchNo).padStart(
          6,
          "0"
        );

      // Example:
      //
      // BR001 + 1
      //     ↓
      // BR001-000001
      //
      // BR001 + 2
      //     ↓
      // BR001-000002
      //
      // BR002 + 1
      //     ↓
      // BR002-000001


      // ====================================
      // 3. Insert Consignment
      // ====================================

      const insertRequest =
        new sql.Request(transaction);

      insertRequest
        .input(
          "Date",
          sql.Date,
          body.Date
        )

        .input(
          "ConNO",
          sql.VarChar(50),
          body.ConNO
        )

        .input(
          "Status",
          sql.VarChar(20),
          body.Status || "Active"
        )

        .input(
          "APED",
          sql.VarChar(20),
          "Entering"
        )

        .input(
          "BranchCode",
          sql.VarChar(50),
          body.BranchCode
        )

        .input(
          "BranchName",
          sql.VarChar(200),
          body.BranchName
        )

        .input(
          "EmpCode",
          sql.VarChar(50),
          body.EmpCode
        )

        .input(
          "EmpName",
          sql.VarChar(200),
          body.EmpName
        )

        .input(
          "BranchSysId",
          sql.VarChar(50),
          branchSysId
        );

      const insertResult =
        await insertRequest.query(`

          INSERT INTO tb_consignment
          (
            SysNo,
            [Date],
            ConNO,
            NoOfItems,
            [Status],
            APED,
            BranchCode,
            BranchName,
            EmpCode,
            EmpName,
            BranchSysId
          )

          OUTPUT
            INSERTED.ID

          VALUES
          (
            'TMP',

            @Date,
            @ConNO,
            0,
            @Status,
            @APED,
            @BranchCode,
            @BranchName,
            @EmpCode,
            @EmpName,
            @BranchSysId
          )

        `);


      // ====================================
      // 4. Get Global ID
      // ====================================

      const newID =
        insertResult
          .recordset[0]
          .ID;


      // ====================================
      // 5. Generate Global SysNo
      // ====================================

      const sysNo =
        "CON" +
        String(newID).padStart(
          6,
          "0"
        );


      // ====================================
      // 6. Update Global SysNo
      // ====================================

      const updateRequest =
        new sql.Request(transaction);

      updateRequest
        .input(
          "ID",
          sql.Int,
          newID
        )

        .input(
          "SysNo",
          sql.VarChar(30),
          sysNo
        );

      await updateRequest.query(`

        UPDATE tb_consignment

        SET
          SysNo = @SysNo

        WHERE ID = @ID

      `);


      // ====================================
      // 7. Commit
      // ====================================

      await transaction.commit();


      // ====================================
      // 8. Return
      // ====================================

      return NextResponse.json({

        success: true,

        message:
          "Consignment saved successfully.",

        data: {

          ID: newID,

          // Global number
          SysNo: sysNo,

          // Branch number
          BranchSysId: branchSysId,

        },

      });

    } catch (error) {

      await transaction.rollback();

      throw error;

    }

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save consignment.",
      },
      {
        status: 500,
      }
    );
  }
}