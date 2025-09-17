
import { LightningElement, api, track, wire } from 'lwc';
//import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
//import { ShowToast } from "c/commonShowToast";
import { CloseActionScreenEvent } from 'lightning/actions';




//
//// APEX
//import getData from '@salesforce/apex/WorkOrderPDFController.getData';
//import savePDFToContentVersion from '@salesforce/apex/WorkOrderPDFController.savePDFToContentVersion';
//import getSignatures from '@salesforce/apex/WorkOrderPDFController.getSignatures';
//
//// Static Resource
//import jspdf_umd_min from '@salesforce/resourceUrl/jspdf_umd_min';
//import jspdf_plugin_autotable from '@salesforce/resourceUrl/jspdf_plugin_autotable';
//import jspdf_view from '@salesforce/resourceUrl/jspdf_view';
import hyundai_logo from '@salesforce/resourceUrl/hyundai_logo';

export default class WoPdfCmp extends LightningElement {

    @api recordId;
    pdfPageMargin = 4;


    handleClose() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleSave(event) {
        const kBase64PDF = event.detail.base64PDF;
        //do something for saving
        this.handleClose();
    }



    longTxt = "1 Dealer is authorized to use the vehicle for purposes of the transaction-related purpose, including testing, inspection and/or delivery at customer’s own risk. 1 Dealer is authorized to use the vehicle for purposes of the transaction-related purpose, including testing, inspection and/or delivery at customer’s own risk. "

    txtTermsList = [
            "1. Dealer is authorized to use the vehicle for purposes of the transaction, including testing, inspection and/or delivery, at customer’s risk.",

            "2. The Dealer shall not be held responsible for any loss or damage arising out of an accident involving the vehicle whilst being  driven for testing and inspection purposes.",

            "3. The customer shall absorb and indemnify the Dealer for any claim brought by any third party against the Dealer out of any  accidents involving the vehicle while it is driven for testing and inspection purposes.",

            "4. The Customer acknowledges an express mechanic's lien to secure payment for any repairs or work performed.",

            "5. The Dealer shall not be liable for any loss or damage to the vehicle or items left inside it due to any cause beyond  the Dealer’s control including but not limited to acts of force majeure which may include but not limited to acts of  government, strikes, lockout, fire, lighting, aircraft, explosion, flooding, riots, civil commotions, act of war, malicious mischief or theft. ",

            "6. The Customer must remove the vehicle from the Dealer’s premises within seven (7) days of receiving notice. Delayed removal will incur a  storage fee of RM50.00 per day until the vehicle is collected.",

            "7. The Dealer may withhold the release of the vehicle until all outstanding amounts are fully paid.",

            "8. The Customer must raise any damage claims at the time of delivery, release, or receipt. Claims made afterward will not be considered.",

            "9. The Customer warrants rightful possession of the vehicle and releases the Dealer from any related civil or criminal claims.  The Dealer shall not be held liable for any stolen vehicle claims.",
//
            "10. The Dealer disclaims responsibility and liability for the presence of firearms, prohibited drugs, or explosives found inside the vehicle."
        ];


    logoBase64;


    imageRatio;//width/height
    async handleOnDrawReady(event){
        console.log('handleOnDrawReady called >>> ');
        //먼저 pdf에 필요한 이미지들을 미리 업로드 해 놓는다.
        this.logoBase64 = await this.preloadImage(hyundai_logo);
        if(!this.logoBase64){
            alert('no logo image');
            return;
        }else{
            const { width, height } = await this.getImageSize(this.logoBase64);
            this.imageRatio  = width/height;
        }

        const kPdfCmp = this.template.querySelector('c-js-pdf-cmp');

        if(!kPdfCmp) return;

        const kBodies = [
            this.getHeaderTitle(),//Text View
//            this.getHeaderView(),//'layout_horizontal'

            this.getCategoryTitle('Parts List'),//Text View
            this.getTableData(),// Table view
            this.getSummaryTableData(),//table View


            this.getCategoryTitle('Labor List'),//Text View
            this.getTableData(),// Table view
            this.getSummaryTableData(),//table View

{type:'page'},
            this.getCategoryTitle('Etc List'),//Text View
            this.getTableData(),// Table view
            this.getSummaryTableData(),//table View


            this.getTextData("Terms And Condition",{top:20}, {fontSize:16})
        ];

        this.txtTermsList.forEach(txt => {
            const kTxtData = this.getTextData(txt,{top:0},{fontSize:12});
            kBodies.push(kTxtData);
        })


        kPdfCmp.startDraw({
            bodies:kBodies,
            footer:{height:45, child:this.getFooterView()},
            header:{height:60, child:this.getHeaderView()}
        })
    }

    getFooterView(){
        return {
            type:'layout_horizontal',
            border:{thick:0.2,color:{r:255}},
            children:[
                this.getSignatureView('Director'),
                this.getSignatureView('Dealer'),
                this.getSignatureView('Customer')
            ]

        }
    }

    getSignatureView(title){
        return {
            type:'layout_stack',
            margin:{left:0},
            children : [
                {type:'text', styles:{fontSize:10}, text:"Signed by "},
                this.getImageData(30,25),
                {type:'line', border:{thick:0.5}, margin:{top:0},width:50},
                {type:'text', styles:{fontSize:10}, text:title}
            ]
        }
    }


    getHeaderTitle(){
        return {
           type:'text',
           text:'Work Order Invoice',
           styles:{
               halign:"center",
               fontSize:20,
               fontStyle:"bold",
               color:{r:0,g:0,b:250}
           },
           margin:{top:4}
        }
    }



    getHeaderView(){
        return {
          type: 'layout_horizontal',
          margin:{top:5},
          border:{thick:0.5, color:{r:0, g:70, b:0}},
          children:[

              {
                  type:'layout_stack',
                  children:[
                      {
                      type:'text',
                      text:'Customer Info',
                      styles:{
                        halign:"center",
                        fontSize:16,
                        fontStyle:"bold",
                        color:{r:60,g:60,b:60}
                      },
                      margin:{left:2, top:2}
                     },
                      {
                        type:'table',
                        margin:{left:2,top:6},//space from parent
                        cellPadding:0.7,//셀과 텍스트간의 간격 head, body 구분하지 않음
                        bodyStyles:[
                            {cellWidth:20, halign:"center",valign:"middle", fontSize:12, fontStyle:"bold", color:{r:60, g:255, b:60}},
                            {fontSize:11, valign:'middle'}
                        ],
                        body:[
                            ['Name', "HOJIN YI"],
                            ['Role', "CEO"],
                            ['Address', "S.Korea Seoul Mapo Dongkyo Street 123456 Philp Apt. 1506-3456"],
                            ["Tel.", "0012-456-987"]
                        ]
                    }
                  ]
              },

              {
                  type : 'layout_stack',
                  children :[
                      {
                        type:'text',
                        text:'Dealer Info',
                        styles:{
                          halign:"center",
                          fontSize:16,
                          fontStyle:"bold",
                          color:{r:60,g:60,b:60}
                        },
                        margin:{left:2, top:2}
                      },

                      this.getImageData(40,null,{left:4}),

                      {
                        type:'table',
                        margin:{left:2,top:2},//space from parent
                        cellPadding:0.5,//셀과 텍스트간의 간격 head, body 구분하지 않음
                        bodyStyles:[
                            {cellWidth:20, fontSize:10},
                            {fontSize:10}
                        ],
                        body:[
                            ['Dealer', "Song JI Hoon"],
                            ['Rank', "JJOLDDAGU"],
                            ['Company', "I2Max Seoul Gong DUK. doesn't knoow K-Pop Demom Hunters."],
                            ["Tel.", "000-0000-000"]
                        ]
                    }
                  ]
              }
          ]
       }
    }


    getCategoryTitle(txt){
        return {
           type:'text',
           text:txt,
           styles:{
               fontSize:16,
               fontStyle:"bold",
               color:{r:255,g:0,b:250}
           },
           margin:{top:8}
        }
    }

    getTableData(){
        const kHeadBgColor = {r:240, g:240, b:240}
        const kHeadStyles = [
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
            {halign:"center", fontSize:13, bgColor:kHeadBgColor},
        ]
        const kBodyStyles = [
            {halign:"center", fontSize:12},
            {halign:"left", fontSize:12},
            {halign:"left", fontSize:12},
            {halign:"right", fontSize:12},
            {halign:"right", fontSize:12},
            {halign:"right", fontSize:12, fontStyle:"bold"},
        ];


        return{
            type:'table',
            border:{thick:0.2, color:{r:230, g:230, b:230}},
            margin:{top:6},//space from parent
            cellPadding:2,//셀과 텍스트간의 간격 head, body 구분하지 않음
            headStyles:kHeadStyles,
            bodyStyles:kBodyStyles,
            head:['Part Name','Part No.', 'Part Code', 'Price', 'Amount', 'Total Price'],
            body:[
                ['Bolt 12', 'a123', 'bo_123', '$3,000', '30','$345,000'],
                ['Nut 12', 'bbq123', 'nu_123', '$3,000', '30','$345,000'],
                ['Hammer 12', 'ac123', 'acc_123', '$3,000', '30','$345,000']
            ]
        }
    }

    getSummaryTableData(){
        const kBodyStyles = [
            {fontSize:12, color:{b:255}},
            {halign:"right", fontSize:12, color:{r:255}}
        ];
        return{
            type:'table',
            margin:{left:100},
            border:{thick:0.2, color:{r:200, g:200, b:0}},
            bodyStyles:kBodyStyles,
            body:[
                ['Total Price', "$1,000,000"],
                ['Total TAX', "$4,000"],
                ['Total Amount', "$1,040,000"]
            ]
        }
    }

    getImageData(width, height, margin){
        let kWidth = width;
        let kHeight = height;
        if(kWidth && !kHeight){
            kHeight = (kWidth / this.imageRatio);
        }
        if(!kWidth && kHeight){
            kWidth = kHeight * this.imageRatio;
        }
        return {
            type:"image",
            margin:margin,
            image:{src:this.logoBase64, w:kWidth, h:kHeight}
        }
    }


    getTextData(aTxt, margin, styles, border){
        return {
            type:'text',
            styles:styles,
            border:border,
           text:aTxt,
           margin:margin
        }
    }


    async preloadImage(imgUrl) {
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            return  base64 ;
        } catch (e) {
            console.error('Failed to load damage legend image:', imgUrl, e);
            return null;
        }

    }

    async getImageSize(base64) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = base64;
        });
      }


//    async connectedCallback() {
//        console.log('connected call back');
//        super.connectedCallback();
//        await this.init();
//    }

//    async init() {
//        try {
//            this.isSpinner = true;
//
//            // Load jsPDF
//            await Promise.all([loadScript(this, jspdf_umd_min)]);
//            await Promise.all([loadScript(this, jspdf_view + '/build/pdf.js')]);
//            await Promise.all([loadScript(this, jspdf_view + '/build/pdf.worker.js')]);
//            await Promise.all([loadScript(this, jspdf_view + '/web/viewer.js')]);
//            // await Promise.all([loadStyle(this, jspdf_view + '/web/viewer.css')]);
//            await Promise.all([loadScript(this, jspdf_plugin_autotable)]);
//            this.jsPDFInitialized = true;
//            // Get Target Data
//            await this.getTargetData();
//            this.signatures = await getSignatures({ recordId: this.recordId });
//            // Generate PDF
//            await this.generatePDF();
//            this.isSpinner = false;
//        } catch(error) {
//            this.isSpinner = false;
//            ShowToast.showError(this, error);
//        }
//    }

    /* --------------------------------------------------------------------------------------------------------
    * Logic Method
    -------------------------------------------------------------------------------------------------------- */
//    fetchedData;
//    async getTargetData() {
//
//        this.isSpinner = true;
//        await getData({recordId: this.recordId})
//        .then(result => {
//            this.fetchedData = result;
//            this.workOrderWrapper = result.workOrderWrapper;
//            // console.log('this.repairQuoteWrapper > ' , JSON.stringify(this.repairQuoteWrapper));
//
//            this.laborList = this.workOrderWrapper.laborList;
//            // console.log('this.laborList > ' , JSON.stringify(this.laborList));
//
//            this.partList = this.workOrderWrapper.partList;
//            // console.log('this.partList > ' , JSON.stringify(this.partList));
//
//            this.subletList = this.workOrderWrapper.subletList;
//            // console.log('this.materialList > ' , JSON.stringify(this.materialList));
//
//            this.repairQuoteInfo = this.workOrderWrapper.repairQuote;
//            // console.log('this.repairQuoteInfo > ' , JSON.stringify(this.repairQuoteInfo));
//
//            this.totalAmountInfo = this.workOrderWrapper.totalAmountWrapper;
//            // console.log('this.totalAmountInfo > ' , JSON.stringify(this.totalAmountInfo));
//
//            this.totalDiscountAmountInfo = this.workOrderWrapper.totalDiscountWrapper;
//            // console.log('this.totalDiscountAmountInfo > ' , JSON.stringify(this.totalDiscountAmountInfo));
//        })
//        .catch(error => {
//            this.isSpinner = false;
//            ShowToast.showError(this, error?.body?.message);
//        });
//    }
//
//
//    checkAddPage (currentY) {
//        const pageHeight = this.pageHeight;
//        const requiredSpace = 10; // 다음 텍스트 블록 높이 예측값
//        let startY = 20; // 시작하는 Y값
//
//        const pageCount = this.doc.internal.getNumberOfPages();
//
//        if (this.doc && (currentY + requiredSpace > pageHeight)) {
//            this.doc.addPage();
//            startY = 60; // 새로운 페이지로 넘어갈시 시작하는 y값
//            this.currentPageNumber++;
//        } else {
//            startY = currentY;
//            if(pageCount !== this.currentPageNumber) {
//                this.currentPageNumber = pageCount;
//            }
//        }
//        return startY;
//    }
//
//    setDefaultPage() {
//        // 페이지 번호 텍스트
//        const pageCount = this.doc.internal.getNumberOfPages();
//        let pageText = ' - ' + pageCount + ' - ';
//        this.doc.setFontSize(8);
//        // this.doc.text(pageText, 100, 295);
//
//        // Rectangular
//        // this.doc.setLineWidth(0.2);
//        // this.doc.rect(2, 2, this.pageWidth - 4, this.pageHeight - 10);
//    }
//
//    formatNumber = (num) =>
//        (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
//
//    /**
//     * @description Text 길이 계산하여, 우측 정렬
//     */
//    drawRightAlignedText(text, xRight, y) {
//        const textWidth = this.doc.getTextWidth(text);
//        this.doc.text(text, xRight - textWidth, y);
//    }
//
//    /**
//     * @description Header 이름과 Document No. Document Date, Page No. 고정
//     */
//    drawHeader(pageNumber, totalPages) {
//        this.doc.setFontSize(15);
//        this.doc.setFont('helvetica', 'bold');
//        this.doc.text('REPAIR ORDER', 138, 30);
//        this.doc.setFontSize(10);
//        this.doc.setFont('helvetica', 'normal');
//        this.doc.text(`Document No. : ${this.fetchedData.workOrder.WorkOrderNumber}`, 138, 36);
//        this.doc.setTextColor(0, 0, 0);
//        const today = new Date();
//        const dd = String(today.getDate()).padStart(2, '0');
//        const mm = String(today.getMonth() + 1).padStart(2, '0');
//        const yyyy = today.getFullYear();
//        const documentDate = `${dd}-${mm}-${yyyy}`;
//
//        this.doc.text(`Document Date : ${documentDate}`, 138, 40);
//        this.doc.text(`Page No. : ${pageNumber} of ${totalPages}`, 138, 44);
//    }
//

//
//
//
//
//
//
//    pageWidth;
//    pageHeight;
//    availableWidth;
//    availableHeight;
//    marginSize = 6;
//    distX = 2;
//    distY = 4;
//    colorBlack = {r:0,g:0,b:0};
//    colorRed = {r:255,g:0,b:0};
//    /**
//     * @description PDF View 구성
//     */
//     async generatePDF() {
//
//         const kWorkOrder = this.fetchedData.workOrder;
//         const kRepair = kWorkOrder.Repair__r ?? {};
//
//         this.isSpinner = true;
//        if(this.jsPDFInitialized) {
//            try{
//                const { jsPDF } = window.jspdf;
//                this.doc = new jsPDF('p', 'mm', 'a4');
//
//                this.pageWidth = this.doc.internal.pageSize.width || this.doc.getPageWidth();//약 210
//                this.pageHeight = this.doc.internal.pageSize.height || this.doc.getPageHeight();//약 297
//                this.availableWidth = this.pageWidth - (this.marginSize * 2);
//                this.availableHeight = this.pageHeight - (this.marginSize * 2);
//                // Page
//                this.doc.page = 1;
//                this.currentPageNumber = 1;
//
//                //--Head : Dealer info + logo
//                let kRect = this.generateArea_Header();
//
//                //Info - Customer Info(left)
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Info(kRect);
//
//                //Info - Work Order Info
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Info2(kRect);
//
//                //--- Customer Request Content + Advisor instruction + Sympton Desc
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Explanation(kRect, 'Job Description', this.nullToBlank(kWorkOrder.JobPerformed__c));
//
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Explanation(kRect, 'Recommendation', this.nullToBlank(kWorkOrder.Recommendation__c));
//
//                //=========== WorkOrderLineItem Data Table ====
//                //-- Labor
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Labor(kRect);
//                //-- Part
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Part(kRect);
//                //-- Sublet
//                kRect = {x:this.marginSize, y:kRect.y + kRect.h + this.distY, w:this.availableWidth, h:0};
//                kRect = this.generateArea_Sublet(kRect);
//
//                //============ total summary
//                kRect = {x:this.pageWidth/2, y:kRect.y + this.distY + 2, w:this.availableWidth/2, h:0};
//                kRect = this.generateArea_Total(kRect);
//
//
//                //=========== 사인 고정 위치 지정
//                const fixedSignatureStartY = this.pageHeight - 30;
//                const estimatedTermsHeight = 120;
//                const termsStartY = fixedSignatureStartY - estimatedTermsHeight;
//
//                //위쪽 내용이 Terms 침범할 경우 새 페이지 추가
//                if (kRect.y + this.distY > termsStartY) {
//                    this.doc.addPage();
//                    this.currentPageNumber++;
//                    kRect = {x:this.marginSize, y:this.marginSize, w:this.availableWidth, h:0};
//                }
//
//                //=========== Terms and Conditions (하단 고정)
//                let termsRect = { x: this.marginSize, y: termsStartY, w: this.availableWidth, h: 0 };
//                termsRect = this.generateArea_TermsAndConditions(termsRect);
//
//                //=========== Signature (맨 하단 고정)
//                let signRect = { x: this.marginSize, y: fixedSignatureStartY, w: this.availableWidth, h: 0 };
//                signRect = this.generateArea_Signature(signRect);
//
//                // 모든 내용 출력이 끝 난 후 페이지 별로 drawHeader
//                const totalPages = this.doc.internal.getNumberOfPages();
//                for (let i = 1; i <= totalPages; i++) {
//                    this.doc.setPage(i);
//                    this.drawHeader(i, totalPages);
//                }
//
//                //==== Now DRAWING !!!!!
//                this.renderDocToIFrame(this.doc);
//            }catch(e){
//                ShowToast.showError(this, e);
//            }
//
//        }else{
//          ShowToast.showError(this, 'No PDF Data');
//        }
//        this.isSpinner = false;
//     }
//
//     renderDocToIFrame(aDoc){
//         // Set URL
//         const pdfUrl = URL.createObjectURL(aDoc.output('blob'));
//         // Apex 전달 > Content Version으로 저장
//         // PDF -> base64 string
//         this.base64PDF = aDoc.output('datauristring').split(',')[1];
//
//         const kIFrame = this.template.querySelector('iframe');
//         kIFrame.src = `${jspdf_view}/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;
//     }
//
//
//
//    /*
//    Header part : 맨 상단 Title/Summary + Logo
//    */
//
//    generateArea_Header() {
//        const kWorkOrder = this.fetchedData.workOrder;
//        const kRepair = kWorkOrder.Repair__r ?? {};
//
//        // 좌측 딜러 정보
//        let kRect = {x: this.marginSize, y: 7, w: this.availableWidth / 2, h: 7};
//        let kTxtInfo = {rect: kRect, txt: this.workOrderWrapper.dealerName, size: 11, color: this.colorBlack, marginX: 1, bold: true};
//        this.drawText(kTxtInfo);
//
//        kRect.y += kRect.h;
//        kTxtInfo.txt = this.nullToBlank(this.workOrderWrapper.dealerBillingStreet) + ", " + this.nullToBlank(this.workOrderWrapper.dealerBillingCity) + ", ";
//        kTxtInfo.bold = false;
//        this.drawText(kTxtInfo);
//
//        kRect.y += kRect.h;
//        kTxtInfo.txt =  this.nullToBlank(this.workOrderWrapper.dealerBillingState) + ", " + this.nullToBlank(this.workOrderWrapper.dealerBillingPostalCode) + ", " + this.nullToBlank(this.workOrderWrapper.dealerBillingCountry);
//        this.drawText(kTxtInfo);
//
//        // HYUNDAI 로고
//        const kImgWidth = 60;
//        const kImgHeight = 16;
//        const kImgY = 4;
//        const kRightX = this.pageWidth - (kImgWidth + this.marginSize);
//        this.doc.addImage(hyundai_logo, 'JPEG', kRightX, kImgY, kImgWidth, kImgHeight);
//
//        // Work Order Title
//        const titleY = kImgY + kImgHeight + 6;
//        return {x: this.marginSize, y: titleY, w: this.availableWidth, h: 0};
//    }
//
//
//    generateArea_Info(aArea) {
//        const kWorkOrder = this.fetchedData.workOrder;
//        const kRepair = kWorkOrder.Repair__r ?? {};
//        const kCustomer = kRepair.Customer__r ?? {};
//        const kVehicle = kRepair.Vehicle__r ?? {};
//
//        const infoWidth = aArea.w * 0.6;  // ← 절반 폭
//        const infoX = aArea.x;            // ← 왼쪽 정렬
//        const headerHeight = 8;
//        const spacing = 2;
//
//        // ===== CUSTOMER INFORMATION =====
//        let rectHeader = { x: infoX, y: aArea.y, w: infoWidth, h: headerHeight };
//        this.doc.setFillColor(240, 240, 240);
//        this.doc.rect(rectHeader.x, rectHeader.y, rectHeader.w, rectHeader.h, 'F'); // 'F' = fill only
//        this.doc.setDrawColor(0); // 테두리 다시 검정으로
//        let txtInfo = {
//            txt: "CUSTOMER INFORMATION",
//            alignH: "left",
//            alignV: "center",
//            size: 11,
//            color: this.colorBlack,
//            rect: rectHeader,
//            bold: true
//        };
//        this.drawText(txtInfo);
//        this.doc.setLineWidth(0.1);
//        this.doc.line(rectHeader.x, rectHeader.y + rectHeader.h, rectHeader.x + rectHeader.w, rectHeader.y + rectHeader.h); // underline
//
//        // Body
//        let rectBody = {
//            x: infoX,
//            y: rectHeader.y + rectHeader.h + spacing,
//            w: infoWidth,
//            h: 24
//        };
//        let customerTxt = "Customer Name : " + this.nullToBlank(kCustomer.Name) + "\n";
//        customerTxt += "Address              : " + this.nullToBlank(kCustomer.BillingStreet) + ", " + "\n";
//        customerTxt +=  "                             " + this.nullToBlank(kCustomer.BillingCity) + ", " +
//            this.nullToBlank(kCustomer.BillingPostalCode) + ", " +
//            this.nullToBlank(kCustomer.BillingCountry) + "\n";
//        const phone = kCustomer.IsPersonAccount ? kCustomer.Phone : kCustomer.CompanyPhone__c;
//        customerTxt += "Contact No          : " + this.nullToBlank(phone) + "\n";
//        customerTxt += "Driver Name        : " + this.nullToBlank(this.workOrderWrapper.vehicleUserName) + "\n";
//        customerTxt += "Driver Contact     : " + this.nullToBlank(this.workOrderWrapper.vehicleUserContact);
//
//        txtInfo = { txt: customerTxt, size: 9, color: this.colorBlack, rect: rectBody };
//        this.drawText(txtInfo);
//
//        this.drawRect({
//            x: infoX,
//            y: rectHeader.y,
//            w: infoWidth,
//            h: rectHeader.h + spacing + rectBody.h,
//            thick: 0.1
//        });
//
//        return {
//            x: infoX,
//            y: rectBody.y + rectBody.h + spacing,
//            w: infoWidth,
//            h: 0
//        };
//    }
//
//    generateArea_Info2(aArea) {
//        const kWorkOrder = this.fetchedData.workOrder;
//        const kRepair = kWorkOrder.Repair__r ?? {};
//        const kVehicle = kRepair.Vehicle__r ?? {};
//
//        let txtInfo;
//        const headerHeight = 8;
//        const spacing = 2;
//
//        // ===== REPAIR ORDER INFORMATION =====
//        let rectHeader = { x: aArea.x, y: aArea.y, w: aArea.w, h: headerHeight };
//        this.doc.setFillColor(240, 240, 240);
//        this.doc.rect(rectHeader.x, rectHeader.y, rectHeader.w, rectHeader.h, 'F'); // 'F' = fill only
//        this.doc.setDrawColor(0); // 테두리 다시 검정으로
//        txtInfo = {
//            txt: "REPAIR ORDER INFORMATION",
//            alignH: "left",
//            alignV: "center",
//            size: 11,
//            color: this.colorBlack,
//            rect: rectHeader,
//            bold: true
//        };
//
//        this.drawText(txtInfo);
//        this.doc.line(rectHeader.x, rectHeader.y + rectHeader.h, rectHeader.x + rectHeader.w, rectHeader.y + rectHeader.h); // underline
//
//        let repairBody = {
//            x: aArea.x,
//            y: rectHeader.y + rectHeader.h + spacing,
//            w: aArea.w,
//            h: 21
//        };
//
//        let leftTxt =
//            "Service Advisor     : " + this.nullToBlank(kRepair.ServiceAdvisor__r?.Name) + "\n" +
//            "VIN                        : " + this.nullToBlank(kVehicle.Name) + "\n" +
//            "Registration No     : " + this.nullToBlank(kVehicle.PlateNo__c) + "\n" +
//            "Registration Date  : " + this.dateToString(kVehicle.RegistrationDate__c) + "\n" +
//            "Vehicle Model       : " + this.nullToBlank(kVehicle?.VehicleSpecName__c);
//
//
//        let rightTxt =
//            "Job Type                  : " + this.nullToBlank(kRepair.JobType__c) + "\n" +
//            "Mileage (km)            : " + this.nullToBlank(kVehicle.LatestMileage__c) + "\n" +
//            "Start Date / Time In  : " + this.dateTimeToString(kWorkOrder.StartDate) + "\n" +
//            "End Date                  : " + this.dateToString(kWorkOrder.EndDate) + "\n" +
//            "Est. Time Ready      : " + this.dateTimeToString(kRepair.EstimatedDeliveryDate__c);
//
//        // Left Column
//        let halfW = aArea.w / 2;
//        txtInfo = {
//            txt: leftTxt,
//            size: 9,
//            color: this.colorBlack,
//            rect: { x: aArea.x, y: repairBody.y, w: halfW, h: repairBody.h }
//        };
//        this.drawText(txtInfo);
//
//        // Right Column - right align
//        txtInfo = {
//            txt: rightTxt,
//            size: 10,
//            color: this.colorBlack,
//            rect: { x: aArea.x + halfW, y: repairBody.y, w: halfW, h: repairBody.h },
//            alignH: "right"
//        };
//        this.drawText(txtInfo);
//
//        this.drawRect({
//            x: aArea.x,
//            y: rectHeader.y,
//            w: aArea.w,
//            h: headerHeight + spacing + repairBody.h,
//            thick: 0.1
//        });
//
//        return {
//            x: aArea.x,
//            y: repairBody.y + repairBody.h + spacing,
//            w: aArea.w,
//            h: 0
//        };
//    }
//
//    generateArea_Explanation(aArea, aTitle, aBody){
//
//          //Head
//          // Head Rect 정의
//          let kRect = { thick: 0.3, x: aArea.x, y: aArea.y, w: aArea.w, h: 8 };
//
//          // 1) 배경 사각형 먼저 그림
//          this.doc.setFillColor(240, 240, 240);
//          this.doc.rect(kRect.x, kRect.y, kRect.w, kRect.h, 'F'); // 'F' = fill only
//          this.doc.setDrawColor(0); // 테두리 다시 검정으로
//          let kTxtInfo = {txt:aTitle, alignH:"center", alignV:"center", size:10, color:this.colorBlack, rect:kRect, bold:true};
//
//          this.drawText(kTxtInfo);
//
//          //Body
//          if(aBody){
//              let kDimension = this.getTextSize(this.doc, aBody, 9, aArea.w);
//              kRect = {thick:0.3, x:aArea.x, y:kRect.y + kRect.h, w:aArea.w, h:kDimension.totalH };
//              kTxtInfo = {txt:aBody,  size:10, color:this.colorBlack, rect:kRect};
//              this.drawText(kTxtInfo);
//          }
//          return kRect;
//    }
//
//    itemTableColumnStyle =  {
//        0: { cellWidth: 10 },
//        1: { cellWidth: 25 },
//        2: { cellWidth: 58 },
//        3: { cellWidth: 25 },
//        4: { cellWidth: 15 },
//        5: { cellWidth: 20 },
//        6: { cellWidth: 20 },
//        7: { cellWidth: 25 }
//    };
//    tableLineThick = 0.3;
//    tableLineColor = [0, 0, 0];
//    indexFieldCellStyle = {halign: 'center', lineColor: this.tableLineColor, lineWidth: this.tableLineThick, cellPadding: [0.5, 0.5]};
//    basicCellStyle = {lineColor: this.tableLineColor, lineWidth: this.tableLineThick, cellPadding: [0.5, 0.5]};
//    moneyFieldCellStyle = {halign: 'right', lineColor: this.tableLineColor, lineWidth: this.tableLineThick, cellPadding: [0.5, 0.5]};
//
//    generateArea_Labor(aArea){
//
//        const kItemList = this.fetchedData.workOrderWrapper.laborList;
//        //title 생성
//        let kRect = {x:aArea.x, y:aArea.y, w:this.availableWidth, h:6};
//
//        // 테이블 데이터 생성
//        const kTableBodyData = kItemList.map((item, index) => [
//            {content:index + 1, styles:this.indexFieldCellStyle},
//            {content:item.productCode || '', styles:this.basicCellStyle},
//            {content:item.productName || '', styles:this.basicCellStyle},
//            {content:item.issueType || '', styles:this.basicCellStyle},
//            {content:item.hours || 0, styles:this.moneyFieldCellStyle},
//            {content:this.formatNumber(item.retailPrice) || 0, styles:this.moneyFieldCellStyle},
//            {content:this.formatNumber(item.discountRate) || 0, styles:this.moneyFieldCellStyle},
//            {content:this.formatNumber(item.totalPrice) || 0, styles:this.moneyFieldCellStyle}
//        ]);
//
//        // 테이블 출력
//        kRect = {x:0, y:aArea.y + kRect.h+4, w:aArea.w, h:12};
//
//        let kTableData = this.getBasicTableData();
//        kTableData.startY = kRect.y;
//        kTableData.body = kTableBodyData;
//        kTableData.bodyStyles = { 0: { cellWidth: this.availableWidth * 0.7 }};
//        kTableData.head = [[
//            {
//              content: 'LABOUR',
//              colSpan: 8,
//              styles: {
//                  halign: 'center',
//                  fontStyle: 'bold',
//                  fillColor: [240, 240, 240],
//                  textColor: [0,0,0],
//                  fontSize: 11,
//                  cellPadding: { top: 1, bottom: 1 }
//              }
//            }
//        ]
//          ,['No.', 'Labour Code', 'Labour Name', 'Issue Type', 'LTS', 'Hr. Rate (RM)', 'Discount (%)', 'Amount (RM)']];
//        kTableData.columnStyles = this.itemTableColumnStyle;
//
//        this.doc.autoTable(kTableData);
//        //========== summary 셀
//        let primary_table = this.doc.lastAutoTable.finalY;   // Table이 출력된 마지막 Y 좌표 (다음 Table 시작 위치 지정 가능)
//
//        let startY = this.checkAddPage(primary_table + 5); // 페이지를 넘겨야 하는지 체크
//        const formatCurrency = (val) => (parseFloat(val) || 0).toFixed(2);
//
//        this.doc.setFontSize(9);
//        this.doc.setFont('helvetica', 'bold');
//        this.doc.text('Sub Total Discount (RM)', 130, startY); // Labor Sub Total Discount
//
//        this.doc.setFont('helvetica', 'bold');
//
//        this.drawRightAlignedText(this.formatNumber(this.totalDiscountAmountInfo.totalLaborDiscount), 203, startY);
//
//        startY = this.checkAddPage(startY + 5); // 페이지를 넘겨야 하는지 체크
//
//
//        this.doc.setFont('helvetica', 'bold');
//        this.doc.text('Sub Total Amount (RM)', 130, startY); // Labor Sub Total Amount
//
//        this.doc.setFont('helvetica', 'bold');
//        this.drawRightAlignedText(this.formatNumber(this.totalAmountInfo.totalLaborCharges), 203, startY);
//
//        startY = this.checkAddPage(startY + 9); // 페이지를 넘겨야 하는지 체크
//
//        return {x:kRect.x, y:startY, w:kRect.w, h:0};
//    }
//
//
//    generateArea_Part(aArea){
//
//         const kItemList = this.fetchedData.workOrderWrapper.partList;
//       //title 생성
//       let kRect = {x:aArea.x, y:aArea.y, w:aArea.w, h:6};
//
//       // 테이블 데이터 생성
//       const kTableBodyData = kItemList.map((item, index) => [
//           {content:index + 1, styles:this.indexFieldCellStyle},
//           {content:item.productCode || '',styles:this.basicCellStyle},
//           {content:item.productName || '',styles:this.basicCellStyle},
//           {content:item.issueType || '',styles:this.basicCellStyle},
//           {content:item.quantity || 0,styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.retailPrice) || 0, styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.discountRate) || 0, styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.totalPrice) || 0, styles:this.moneyFieldCellStyle}
//    ]);
//
//       // 테이블 출력
//       kRect = {x:0, y:aArea.y + kRect.h+4, w:aArea.w, h:20};
//
//       let kTableData = this.getBasicTableData();
//       kTableData.startY = kRect.y;
//       kTableData.body = kTableBodyData;
//       kTableData.head = [[
//           {
//               content: 'PART',
//               colSpan: 8,
//               styles: {
//                   halign: 'center',
//                   fontStyle: 'bold',
//                   fillColor: [240, 240, 240],
//                   textColor: [0,0,0],
//                   fontSize: 11,
//                   cellPadding: { top: 1, bottom: 1 }
//               }
//           }
//       ]
//           ,['No.', 'Part No.', 'Part Name', 'Issue Type', 'Qty', 'Price (RM)', 'Discount (%)', 'Amount (RM)']];
//       kTableData.columnStyles = this.itemTableColumnStyle;
//
//       this.doc.autoTable(kTableData);
//        //========== summary 셀
//        let primary_table = this.doc.lastAutoTable.finalY;   // Table이 출력된 마지막 Y 좌표 (다음 Table 시작 위치 지정 가능)
//
//        let startY = this.checkAddPage(primary_table + 5); // 페이지를 넘겨야 하는지 체크
//        const formatCurrency = (val) => (parseFloat(val) || 0).toFixed(2);
//
//        this.doc.setFontSize(9);
//        this.doc.setFont('helvetica', 'bold');
//        this.doc.text('Sub Total Discount (RM)', 130, startY); // PART Sub Total Discount
//
//        this.doc.setFont('helvetica', 'bold');
//        this.drawRightAlignedText(this.formatNumber(this.totalDiscountAmountInfo.totalPartDiscount), 203, startY);
//
//        startY = this.checkAddPage(startY + 5); // 페이지를 넘겨야 하는지 체크
//
//        this.doc.setFont('helvetica', 'bold');
//        this.doc.text('Sub Total Amount (RM)', 130, startY); // PART Sub Total Amount
//
//        this.doc.setFont('helvetica', 'bold');
//        this.drawRightAlignedText(this.formatNumber(this.totalAmountInfo.totalPartCharges), 203, startY);
//
//        startY = this.checkAddPage(startY + 9); // 페이지를 넘겨야 하는지 체크
//
//        return {x:kRect.x, y:startY, w:kRect.w, h:0};
//    }
//
//   generateArea_Sublet(aArea){
//
//       const kItemList = this.fetchedData.workOrderWrapper.subletList;
//         //title 생성
//         let kRect = {x:aArea.x, y:aArea.y, w:aArea.w, h:6};
//
//         // 테이블 데이터 생성
//       const kTableBodyData = kItemList.map((item, index) => [
//           {content:index + 1, styles:this.indexFieldCellStyle},
//           {content:item.lineItemType || '',styles:this.basicCellStyle},
//           {content:item.productName || '',styles:this.basicCellStyle},
//           {content:item.issueType || '',styles:this.basicCellStyle},
//           {content:item.quantity || 0,styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.retailPrice) || 0, styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.discountRate) || 0, styles:this.moneyFieldCellStyle},
//           {content:this.formatNumber(item.totalPrice) || 0, styles:this.moneyFieldCellStyle}
//       ]);
//
//         // 테이블 출력
//         kRect = {x:0, y:aArea.y + kRect.h+4, w:aArea.w, h:20};
//
//         let kTableData = this.getBasicTableData();
//         kTableData.startY = kRect.y;
//         kTableData.body = kTableBodyData;
//         kTableData.head = [
//             [
//                 {
//                     content: 'SUBLET',
//                     colSpan: 8,
//                     styles: {
//                         halign: 'center',
//                         fontStyle: 'bold',
//                         fillColor: [240, 240, 240],
//                         textColor: [0,0,0],
//                         fontSize: 11,
//                         cellPadding: { top: 1, bottom: 1 }
//                    }
//                }
//            ]
//             ,['No.', 'Sublet Type', 'Sublet Name', 'Issue Type', 'Qty', 'Price (RM)', 'Discount (%)', 'Amount (RM)']];
//         kTableData.columnStyles = this.itemTableColumnStyle;
//
//         this.doc.autoTable(kTableData);
//
//       //========== summary 셀
//       let primary_table = this.doc.lastAutoTable.finalY;   // Table이 출력된 마지막 Y 좌표 (다음 Table 시작 위치 지정 가능)
//
//       let startY = this.checkAddPage(primary_table + 5); // 페이지를 넘겨야 하는지 체크
//       const formatCurrency = (val) => (parseFloat(val) || 0).toFixed(2);
//
//       this.doc.setFontSize(9);
//       this.doc.setFont('helvetica', 'bold');
//       this.doc.text('Sub Total Discount (RM)', 130, startY); // SUBLET Sub Total Discount
//
//       this.doc.setFont('helvetica', 'bold');
//
//       this.drawRightAlignedText(this.formatNumber(this.totalDiscountAmountInfo.totalSubletDiscount), 203, startY);
//
//       startY = this.checkAddPage(startY + 5); // 페이지를 넘겨야 하는지 체크
//
//       this.doc.setFont('helvetica', 'bold');
//       this.doc.text('Sub Total Amount (RM)', 130, startY); // SUBLET Sub Total Amount
//
//       this.doc.setFont('helvetica', 'bold');
//       this.drawRightAlignedText(this.formatNumber(this.totalAmountInfo.totalSubletCharges), 203, startY);
//
//       startY = this.checkAddPage(startY + 9); // 페이지를 넘겨야 하는지 체크
//
//       return {x:kRect.x, y:startY, w:kRect.w, h:0};
//     }
//
//     generateArea_Total(aArea) {
//         const kWorkOrder = this.fetchedData.workOrder;
//         const kQuote = kWorkOrder.RepairQuote__r ?? {};
//          let kTableData = this.getBasicTableData();
//
//
//          kTableData.startY = aArea.y;
//          kTableData.margin = {left:aArea.x, right:this.marginSize};
//          kTableData.tableWidth = aArea.w;
//          let kTitleStyle = {halign: 'left', valign: 'middle', fillColor: [240, 240, 240], lineColor: [0, 0, 0], lineWidth: 0.1, minCellHeight:10, cellWidth:aArea.w * 0.6, cellPadding:[0.5,0.5,0.5,0.5] };
//          let kValueStyle = {halign: 'right', valign: 'middle', fillColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, cellPadding:[0.5,0.5,0.5,0.5]};
//          kTableData.head = [
//              [{content:'Total Excluding Tax (RM)', styles:kTitleStyle},
//              {content:this.formatNumber(kQuote.ru_VATableSales__c) || 0, styles:kValueStyle}],
//
//              [{content:'Total Discount Amount (RM)', styles:kTitleStyle},
//              {content:this.formatNumber(kQuote.fm_TotalDiscountAmount__c) || 0, styles:kValueStyle}],
//
//              [{content:'Service Tax (8%)', styles:kTitleStyle},
//              {content:this.formatNumber(kQuote.fm_VAT__c) || 0, styles:kValueStyle}],
//
//              [{content:'Total Billable Amount', styles:kTitleStyle},
//              {content:this.formatNumber(kQuote.fm_SupplyTotalAmount__c) || 0, styles:kValueStyle}]
//          ];
//          kTableData.body = null;
//          this.doc.autoTable(kTableData);
//            //====
//
//          return {x:aArea.x, y:this.doc.lastAutoTable.finalY, w:aArea.w, h:0};
//     }
//
//    generateArea_TermsAndConditions(aRect) {
//        let kRect = { ...aRect, h: 10 };
//        // WORK ORDER 제목 텍스트
//        let kTxtInfo = {
//            txt: '',
//            size: 11,
//            color: this.colorBlack,
//            rect: kRect,
//            bold: true
//        };
//        kRect = this.drawText(kTxtInfo);
//
//        this.doc.setLineWidth(0.5);                // 라인 두께
//        this.doc.line(kRect.x, kRect.y + kRect.h, kRect.x + kRect.w, kRect.y + kRect.h); // 라인 그리기
//
//        kRect = { x: kRect.x, y: kRect.y + kRect.h + 2, w: kRect.w, h: 0 };
//        kTxtInfo = { txt: this.txtWorkOrderList.join('\n'), size: 10, color: this.colorBlack, rect: kRect };
//        kRect = this.drawText(kTxtInfo);
//
//        kRect = { x: kRect.x, y: kRect.y + kRect.h + 6, w: kRect.w, h: 10 };
//        kTxtInfo = { txt: 'TERMS AND CONDITIONS:', size: 11, color: this.colorBlack, rect: kRect, bold: true };
//        kRect = this.drawText(kTxtInfo);
//
//        kRect = { x: kRect.x, y: kRect.y + kRect.h + 2, w: kRect.w, h: 0 };
//        kTxtInfo = { txt: this.longTxt.join('\n'), size: 10, color: this.colorBlack, rect: kRect };
//        kRect = this.drawText(kTxtInfo);
//
//        return kRect;
//    }
//
//
//     generateArea_Signature(aArea){
//         const kStartY = this.pageHeight - 30;
//         const leftX = 5;
//         const rightX = 110;
//         const imageWidth = 60;
//         const imageHeight = 12;
//
//         const startY = kStartY;
//         //======= 왼쪽 영역
//         // advisor 영역
//         let kRect = {x:aArea.x, y:kStartY, w:this.availableWidth * 0.3, h:0};
//         let kTxtInfo = {txt:'PREPARED BY',  size:9, bold:true,  rect:kRect};
//         kRect = this.drawText(kTxtInfo);
//         if (this.signatures?.AdvisorSignature) {
//             // this.doc.addImage(this.signatures.AdvisorSignature, 'JPEG', leftX, startY, imageWidth, imageHeight, '', 'FAST');
//         }
//         //sign용 라인
//         const kLineY = kRect.y + kRect.h + 8;
//         kRect = {x:kRect.x, y:kLineY, w:kRect.w, h:0};
//         this.doc.line(kRect.x, kRect.y, kRect.x + kRect.w, kRect.y);
//         //라인 밑의 글자 : Service Advisor Signature
//         kRect = {x:kRect.x, y:kLineY + 1, w:kRect.w, h:0};
//         kTxtInfo = {txt:'Service Advisor Signature',  size:7,  rect:kRect};
//         kRect = this.drawText(kTxtInfo);
//         if (this.signatures?.WorkOrderSignature) {
//             // this.doc.addImage(this.signatures.WorkOrderSignature, 'JPEG', rightX, startY, imageWidth, imageHeight, '', 'FAST'); // TODO 잠시 주석
//         }
//
//         //Date영역
//        //--date용 라인
//        kRect = {x:kRect.x + kRect.w + 1, y:kLineY, w:this.availableWidth * 0.15, h:0};
//        this.doc.line(kRect.x, kRect.y, kRect.x + kRect.w, kRect.y);
//        //라인 밑의 글자 : Service Advisor Signature
//        kRect = {x:kRect.x, y:kLineY + 1, w:kRect.w, h:0};
//        kTxtInfo = {txt:'Date',  size:7,  rect:kRect};
//        kRect = this.drawText(kTxtInfo);
//
//
//
//        //======= 오른쪽 영역
//        // Customer 영역
//        kRect = {x:this.pageWidth/2, y:kStartY, w:this.availableWidth * 0.3, h:0};
//        kTxtInfo = {txt:'ACKNOWLEDGED BY',  size:9, bold:true,  rect:kRect};
//        kRect = this.drawText(kTxtInfo);
//        //sign용 라인
//        kRect = {x:kRect.x, y:kLineY, w:kRect.w, h:0};
//        this.doc.line(kRect.x, kRect.y, kRect.x + kRect.w, kRect.y);
//        //라인 밑의 글자 : Service Advisor Signature
//        kRect = {x:kRect.x, y:kLineY + 1, w:kRect.w, h:0};
//        kTxtInfo = {txt:'Customer Signature',  size:7,  rect:kRect};
//        kRect = this.drawText(kTxtInfo);
//
//        //Date영역
//        //--date용 라인
//        kRect = {x:kRect.x + kRect.w + 1, y:kLineY, w:this.availableWidth * 0.15, h:0};
//        this.doc.line(kRect.x, kRect.y, kRect.x + kRect.w, kRect.y);
//        //라인 밑의 글자 : Service Advisor Signature
//        kRect = {x:kRect.x, y:kLineY + 1, w:kRect.w, h:0};
//        kTxtInfo = {txt:'Date',  size:7,  rect:kRect};
//        kRect = this.drawText(kTxtInfo);
//
//     }
//
//     //======== UTILS =====================
//
//
//    getBasicTableData(){
//        const kBodyStyle = { lineWidth: 0.2,lineColor: [0, 0, 0],fontSize: 9 };
//        const kHeadStyle = { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding:[0.5,0.5,0.5,0.5]};
//        const kMargin = {left:this.marginSize, right:this.marginSize, top: 55, bottom: 12};
//        return {
//            margin:kMargin,
//            tableWidth:this.availableWidth,
//            bodyStyles: kBodyStyle,
//            headStyles: kHeadStyle,
//            theme: "plain",
//            tableLineColor: [0, 0, 0],
//            tableLineWidth: 0.1,
//            didParseCell: function (data) {
//                if (data.section === 'body' && [4, 5, 6].includes(data.column.index)) {
//                    data.cell.styles.halign = 'right';
//                }
//            },
//            didDrawPage: (data) => {
//                const pageNumber = this.doc.internal.getCurrentPage ? this.doc.internal.getCurrentPage() : this.doc.internal.getNumberOfPages();
//                this.drawHeader(pageNumber, '');
//            }
//             // didDrawPage : () => {
//             //    this.currentPageNumber = this.doc.internal.getNumberOfPages();
//             // }
//         };
//    }
//
//    /*
//    텍스트를 그린다.
//    테두리를 그리거나 alignH가 center가 아니면 rect.h는 중요치 않다.
//    */
//    drawText(aTxtInfo){
//
//        this.drawRect(aTxtInfo.rect);
//
//        if(aTxtInfo.size)  this.doc.setFontSize(aTxtInfo.size);
//        if(aTxtInfo.color) this.doc.setTextColor(aTxtInfo.color.r, aTxtInfo.color.g, aTxtInfo.color.b);
//        if(aTxtInfo.bold){
//            this.doc.setFont('helvetica', 'bold');
//        }else{
//            this.doc.setFont('helvetica', 'normal');
//        }
//
//        let kDimension = this.getTextSize(this.doc, aTxtInfo.txt, aTxtInfo.size, aTxtInfo.rect.w);
//        let kPosY = aTxtInfo.rect.y + kDimension.h;//텍스트와 rect의 기준점이 다르다. rect : 오른쪽 상단, 텍스트: 오른쪽 하단
//        if('center' == aTxtInfo.alignV){
//            const kRestHeight = aTxtInfo.rect.h - kDimension.h;
//            kPosY = kPosY + (kRestHeight/2) - 1;//1 : 어쩔 수 없는 빈틈 상수
//        }
//
//        let kPosX = aTxtInfo.rect.x;
//        if('center' == aTxtInfo.alignH){
//            const kRestWidth = aTxtInfo.rect.w - kDimension.w;
//            kPosX = aTxtInfo.rect.x + kRestWidth/2;
//        }
//        let kMarginX = aTxtInfo.marginX == null ? 1 : aTxtInfo.marginX;
////        let kMaxWidth = aTxtInfo.wrap ? aTxtInfo.rect.w : 0;//workwrap : 0은 없음
//        this.doc.text(aTxtInfo.txt, kPosX + kMarginX, kPosY, {maxWidth:aTxtInfo.rect.w});
//        //====== 밑줄
//        if(aTxtInfo.underline){
//            this.doc.setLineWidth(0.3);
//            kPosY = kPosY + kDimension.h - 2;
//            this.doc.line(kPosX, kPosY, kPosX + kDimension.w + 2, kPosY); // Labor 살짝 밑에 선 긋기
//        }
//        //======
//        return {x:aTxtInfo.rect.x, y:aTxtInfo.rect.y, w:aTxtInfo.rect.w, h:kDimension.totalH};
//    }
//
//     drawRect(aRect){
//       if(aRect?.thick){
//          this.doc.setLineWidth(aRect.thick);
//          this.doc.rect(aRect.x, aRect.y, aRect.w, aRect.h);
//       }
//    }
//
//    getTextSize(aDoc, aTxt, aFontSize, aMaxWidth){
//        //if(aFontSize)  aDoc.setFontSize(aFontSize);
//        if(!aTxt) return {w:0, h:0, totalH:0};
//        let kSingleDimension =  aDoc.getTextDimensions(aTxt, {fontSize: aFontSize});
//        let kDimension =  aDoc.getTextDimensions(aTxt, {fontSize: aFontSize, maxWidth:aMaxWidth ?? 0});
//        return {w:kDimension.w, h:kSingleDimension.h, totalH:kDimension.h + (aFontSize/2)};
//    }
//
//
//    nullToBlank(aTxt){
//        if(aTxt == null) return "";
//        return aTxt;
//    }
//
//    dateToString(dateValue) {
//        if (!dateValue) return "";
//        let dt = new Date(dateValue);
//        const day = String(dt.getDate()).padStart(2, '0');
//        const month = String(dt.getMonth() + 1).padStart(2, '0');
//        const year = dt.getFullYear();
//        return `${day}-${month}-${year}`;
//    }
//
//    dateTimeToString(dateValue) {
//        if (!dateValue) return "";
//        let dt = new Date(dateValue);
//        const day = String(dt.getDate()).padStart(2, '0');
//        const month = String(dt.getMonth() + 1).padStart(2, '0');
//        const year = dt.getFullYear();
//        const hour = String(dt.getHours()).padStart(2, '0');
//        const minute = String(dt.getMinutes()).padStart(2, '0');
//        return `${day}-${month}-${year} / ${hour}:${minute}`;
//    }


}