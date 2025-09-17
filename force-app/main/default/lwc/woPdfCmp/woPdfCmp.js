
import { LightningElement, api, track, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';

import hyundai_logo from '@salesforce/resourceUrl/hyundai_logo';

export default class WoPdfCmp extends LightningElement {

    @api recordId;
    pdfPageMargin = 4;
    pageNumberVisible = true;
    logoBase64;
    imageRatio;//width/height

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



    async handleOnDrawReady(event){
        this.logoBase64 = await this.preloadImage(hyundai_logo);
        const kPdfCmp = this.template.querySelector('c-js-pdf-cmp');
        const kBodies = [
            this.getImageData(20,20,{left:10, top:100}),
            {type:'page'},
            this.getImageData(20,20,{left:10, top:10}),
        ];
        kPdfCmp.startDraw({bodies:kBodies})
    }

    async handleOnDrawReady2(event){
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
//            this.getHeaderView(),//'horizontal'

            this.getCategoryTitle('Parts List'),//Text View
            this.getTableView(),// Table view
            this.getSummaryTableData(),//table View


            this.getCategoryTitle('Labor List'),//Text View
            this.getTableView(),// Table view
            this.getSummaryTableData(),//table View

{type:'page'},
            this.getCategoryTitle('Etc List'),//Text View
            this.getTableView(),// Table view
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

    getFooterView(){
        return {
            type:'horizontal',
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
            type:'stack',
            margin:{left:0},
            children : [
                {type:'text', styles:{fontSize:10}, text:"Signed by "},
                this.getImageData(30,25),
                {type:'line', border:{thick:0.5}, margin:{top:0},width:50},
                {type:'text', styles:{fontSize:10}, text:title}
            ]
        }
    }






    getHeaderView(){
        return {
          type: 'horizontal',
          margin:{top:5},
          border:{thick:0.5, color:{r:0, g:70, b:0}},
          children:[
              {
                  type:'stack',
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
                  type : 'stack',
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

                      this.getImageData(40,null,{left:10}),

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

    getTableView(){
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




}