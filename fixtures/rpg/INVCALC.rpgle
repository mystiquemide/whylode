     H DFTACTGRP(*NO) ACTGRP(*CALLER)
     H OPTION(*SRCSTMT)
      *
      * INVCALC - Invoice Tax Calculation
      * Receives order amount and customer type, returns tax amount.
      *
      * Maintenance log:
      *   2019-03 RLT  Initial version
      *   2021-11 RLT  Chg per sales ops req
      *
     FTAXTBL    IF   E           K DISK
      *
     D CustNo          S              7P 0
     D CustType        S              2A
     D OrderAmt        S             11P 2
     D TaxAmt          S             11P 2
     D ErrFlag         S              1A
      *
     D TaxRate         S              7P 4
     D CalcBase        S             11P 2
      *
     C     *ENTRY        PLIST
     C                   PARM      CustNo
     C                   PARM      CustType
     C                   PARM      OrderAmt
     C                   PARM      TaxAmt
     C                   PARM      ErrFlag
      *
      * Set rate
     C                   EVAL      TaxRate  = 0.0725
      *
      * Check override
     C     CustType      CHAIN     TAXTBL
     C                   IF        %FOUND
     C                   EVAL      TaxRate  = TBTAXRT
     C                   ENDIF
      *
      *
     C                   IF        CustType = 'C2'
     C                   SETON                                        42
     C                   ENDIF
      *
     C                   IF        *IN42 = *ON
     C                   EVAL      TaxRate  = 0.0525
     C                   ENDIF
      *
      * Calc tax
     C                   EVAL      CalcBase = OrderAmt
     C                   EVAL      TaxAmt   = CalcBase * TaxRate
      *
      *
     C                   EVAL(H)   TaxAmt   = TaxAmt
      *
     C                   EVAL      *INLR = *ON
