     H DFTACTGRP(*NO) ACTGRP(*CALLER)
     H OPTION(*SRCSTMT)
      *
      * ORDENT - Order Entry
      * Reads customer master and validates order header before writing
      * the order record to ORDHDR and line items to ORDDTL.
      *
     FCUSTMST   IF   E           K DISK
     FORDHDR    O    E           K DISK
     FORDDTL    O    E           K DISK
      *
     D CustNo          S              7P 0
     D CustName        S             40A
     D CustType        S              2A
     D OrderNo         S              8P 0
     D LineNo          S              3P 0
     D ItemNo          S             10A
     D Qty             S              5P 0
     D UnitPrice       S              9P 2
     D LineAmt         S             11P 2
     D OrderAmt        S             11P 2
     D TaxAmt          S             11P 2
     D ShipDate        S               D
     D ErrFlag         S              1A
      *
     C                   EVAL      ErrFlag = *BLANK
      *
      * Read customer master
     C     CustNo        CHAIN     CUSTMST
     C                   IF        %FOUND
     C                   EVAL      CustName = CMNAME
     C                   EVAL      CustType = CMTYPE
     C                   ELSE
     C                   EVAL      ErrFlag  = 'Y'
     C                   ENDIF
      *
      * Accumulate order lines
     C                   EVAL      OrderAmt = *ZERO
     C                   READ      ORDDTL
     C                   DOW       NOT %EOF(ORDDTL)
     C                   EVAL      LineAmt  = Qty * UnitPrice
     C                   EVAL      OrderAmt = OrderAmt + LineAmt
     C                   READ      ORDDTL
     C                   ENDDO
      *
      * Pass to invoice calculation
     C                   CALL      'INVCALC'
     C                   PARM      CustNo
     C                   PARM      CustType
     C                   PARM      OrderAmt
     C                   PARM      TaxAmt
     C                   PARM      ErrFlag
      *
     C                   EVAL      *INLR = *ON
