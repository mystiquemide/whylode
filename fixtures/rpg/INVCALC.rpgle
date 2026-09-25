     H DFTACTGRP(*NO) ACTGRP(*CALLER)
     H OPTION(*SRCSTMT)
      *
      * INVCALC - Invoice Tax Calculation
      * Receives order amount and customer type, returns tax amount.
      *
      * Maintenance log:
      *   2019-03 RLT  Initial version
      *   2021-11 RLT  Added WH customer handling per sales ops request
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
      * Default: apply standard state rate
     C                   EVAL      TaxRate  = 0.0725
      *
      * Look up rate override in TAXTBL for this customer type
     C     CustType      CHAIN     TAXTBL
     C                   IF        %FOUND
     C                   EVAL      TaxRate  = TBTAXRT
     C                   ENDIF
      *
      * Indicator 42: wholesale customer receives pre-negotiated rate
     C                   IF        CustType = 'WH'
     C                   SETON                                        42
     C                   ENDIF
      *
     C   42              IF        *IN42 = *ON
     C                   EVAL      TaxRate  = 0.0525
     C                   ENDIF
      *
      * Calculate tax on full order amount
     C                   EVAL      CalcBase = OrderAmt
     C                   EVAL      TaxAmt   = CalcBase * TaxRate
      *
      * Round to two decimal places
     C                   EVAL(H)   TaxAmt   = TaxAmt
      *
     C                   EVAL      *INLR = *ON
