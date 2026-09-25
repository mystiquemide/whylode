     H DFTACTGRP(*NO) ACTGRP(*CALLER)
     H OPTION(*SRCSTMT)
      *
      * EDIOUT - EDI 810 Invoice Output
      * Formats approved invoice records into EDI 810 transaction sets
      * and writes them to the outbound EDI spool file EDISPOOL.
      *
      * EDI 810 date segments use format YYYYMMDD per ISA/GS convention.
      * The trading partner's 997 acknowledgement uses the same format.
      *
      * Maintenance log:
      *   2018-06 RLT  Initial version, date format MMDDYY per legacy spec
      *   2020-02 RLT  Changed date format to YYYYMMDD per partner request #4471
      *
     FEDISPOOL  O    E             DISK
      *
     D InvNo           S              8P 0
     D InvDate         D
     D CustNo          S              7P 0
     D InvAmt          S             11P 2
     D TaxAmt          S             11P 2
     D EDILine         S            256A
     D DateStr         S              8A
     D SeqNo           S              9P 0
      *
      * Format invoice date as YYYYMMDD for EDI 810 BIG segment
     C                   EVAL      DateStr  = %CHAR(InvDate:*ISO0)
      *
      * ISA segment - interchange control header
     C                   EVAL      EDILine  =
     C                                'ISA*00*          *00*          ' +
     C                                '*ZZ*SENDER         *ZZ*RECEIVER       ' +
     C                                '*' + %SUBST(DateStr:3:6) +
     C                                '*' + %SUBST(DateStr:9:4) +
     C                                '*^*00501*' +
     C                                %EDITC(SeqNo:'Z') +
     C                                '*0*P*>'
     C                   WRITE     EDIREC
      *
      * GS segment - functional group header
     C                   EVAL      EDILine  =
     C                                'GS*IN*SENDER*RECEIVER*' +
     C                                DateStr + '*' +
     C                                %SUBST(DateStr:9:4) +
     C                                '*1*X*005010'
     C                   WRITE     EDIREC
      *
      * BIG segment - beginning segment for invoice
      * Date in YYYYMMDD format per current EDI 810 spec
     C                   EVAL      EDILine  =
     C                                'BIG*' + DateStr +
     C                                '*' + %EDITC(InvNo:'Z') +
     C                                '**'
     C                   WRITE     EDIREC
      *
      * ITD - terms of sale / deferred terms
     C                   EVAL      EDILine  =
     C                                'ITD*01*3***' +
     C                                '***30*'
     C                   WRITE     EDIREC
      *
      * TDS - total monetary value summary
     C                   EVAL      EDILine  =
     C                                'TDS*' +
     C                                %EDITC(InvAmt * 100:'Z')
     C                   WRITE     EDIREC
      *
      * TXI - tax information
     C                   EVAL      EDILine  =
     C                                'TXI*ST*' +
     C                                %EDITC(TaxAmt:'1') +
     C                                '****ST'
     C                   WRITE     EDIREC
      *
     C                   EVAL      *INLR = *ON
