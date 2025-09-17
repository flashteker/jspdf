import { LightningElement, api, track } from 'lwc';


import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToast } from "c/commonShowToast";
//import { CloseActionScreenEvent } from 'lightning/actions';
import jspdf from '@salesforce/resourceUrl/jspdf';
import pdfviewer from '@salesforce/resourceUrl/pdfviewer';



export default class JsPdfCmp extends LightningElement {

    @api TYPE_HORIZONTAL = 'horizontal';
    @api TYPE_STACK = 'stack';
    @api TYPE_TEXT = 'text';
    @api TYPE_TABLE = 'table';
    @api TYPE_IMAGE = 'image';
    @api TYPE_LINE = 'line';
    @api TYPE_PAGE = 'page';


    @api recordId; //no use
    @api headerTitle;
    @api pageMargin = 0;
    @api pageNumberVisible;



    isSpinner;
    doc;
    base64PDF;
    header;
    pageNumberSpace = 10;//페이지 숫자 공간


    availableWidth; //pdf를 그릴 수 있는 width
    availableHeight; //pdf를 그릴 수 있는 height

    colorBlack = { r: 0, g: 0, b: 0 };
    colorGray = {r:230, g:230, b:230};
    colorWhite = { r: 255, g: 255, b: 255 };

    handleClose() {
        this.dispatchEvent(new CustomEvent('close', {}));
    }

    handleSave() {
        const kEvent = {detail:{base64PDF:this.base64PDF}}
        this.dispatchEvent(new CustomEvent('save', kEvent));
    }

    /**
    1. pdf 라이브러리 로딩
    2. pdf 그리기 준비가 완료되면 완료되었다는 것을 상위 콤포넌트에 전달한다.
    */
    async connectedCallback() {
        //console.log('JsPdfCmp connected call back called');
        setTimeout(() => {
            this.loadLibrary();
        }, 300);
    }

    /**
    * 라이브러리를 로드한다.
    Load jsPDF - 순서가 중요하여 로딩을 나누었다.(load jsPDF > load autoTable > get data from server > generate PDF)
    */
    async loadLibrary() {
        try {
            this.isSpinner = true;
            await Promise.all([
                loadScript(this, jspdf + '/jspdf.umd.min.js'),
                loadScript(this, pdfviewer + '/build/pdf.js'),
                loadScript(this, pdfviewer + '/build/pdf.worker.js'),
                loadScript(this, pdfviewer + '/web/viewer.js')
            ]);
            await Promise.all([
                loadScript(this, jspdf + '/jspdf.plugin.autotable.js')
            ]);

            //변수 초기화 !!!
            const { jsPDF } = await window.jspdf;
            this.doc = new jsPDF('p', 'mm', 'a4');

            const {pageWidth, pageHeight} = this.getPageDimension(this.doc);
            this.availableWidth = pageWidth - (this.pageMargin * 2);
            this.availableHeight = pageHeight - (this.pageMargin * 2);
            // Page
            this.doc.page = 1;


            ShowToast.showSuccess(this, 'library load done!')
            //상위에 준비상황 전달
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('drawready', {}));
            }, 200);

        } catch (error) {
            ShowToast.showError(this, error);
        }
        this.isSpinner = false;
    }


    /**
     * 항상 startDraw(data)으로 그리기를 시작한다.
     * 전체 구조는
     * 1. Stack Layout으로 시작한다.
     * 2. Line과 Table을 제외한 뷰는 모두 Horizontal Layout에 담아서 그린다.
     */
    @api
    startDraw(data) {
        this.isSpinner = true;
        //console.log('startDraw called >>>> ', JSON.stringify(data));
        this.header = data.header;
        //맨처음 외부에서 호출때는 이 속성이 없다. 그래서 초기 값을 넣어준다. 처음에는 margin값 이 pageMargin으로 대신한다.
        //const kArea = { x: this.pageMargin, y: this.pageMargin, w: this.availableWidth };
        let kArea = this.drawHeader(this.header);
        kArea.y = kArea.y + kArea.h;
        //====== 처음 그릴때는 무조건 vertical layout ====
        const kStackLayout = {children:data.bodies};
        const kPrevArea = this.drawStackLayout(kStackLayout, kArea, true);

        //=== body를 다 그린 후 footer를 그린다.
        this.drawFooter(data.footer, kPrevArea);
        //footer까지 다 그리면 페이지 번호를 그린다.
        this.drawPageNumber(this.doc);
        //=== 그리기를 마치면 자동을 publish 한다.
        this.publishPDF(this.doc);
        this.isSpinner = false;
    }

    /**
    1. 페이지를 추가한다.
    2. Header가 있다면 헤더를 추가한다.
    */
    addPage(){
        this.doc.addPage();
        return this.drawHeader(this.header);
    }

    /**
    header를 그린다.
    */
    drawHeader(data){
        let kArea = { x: this.pageMargin, y: this.pageMargin, w: this.availableWidth };
        if(!data?.height) {
            kArea.h = 0;
            return kArea;
        }

        const kType = data.child.type;
        let kChild = this.modifyNullData(data.child);
        if (kType != this.TYPE_HORIZONTAL) {
            kChild = {
                type:this.TYPE_HORIZONTAL,
                children:[kChild],
                margin:kChild.margin,
                border:kChild.border
            };
        }

        this.drawHorizontalLayout(kChild, kArea);
        kArea.h = data.height;
        return kArea;

    }


    /**
    * Footer를 그린다.
    * 하단에서 여백이 충분한지 검토한 후 페이지를 추가여부 결정한다.
    * prevArea는 여백을 계산하기 위해서 사용된다.
    */
    drawFooter(data, prevArea){
        if(!data?.child || !data?.height) return;

        const {bottomY} = this.getPageDimension(this.doc);
        const kType = data.child.type;
        let kChild = this.modifyNullData(data.child);
        if (kType != this.TYPE_HORIZONTAL) {
            kChild = {
                type:this.TYPE_HORIZONTAL,
                children:[kChild],
                margin:kChild.margin,
                border:kChild.border
            };
        }

        const kRemainingSpace = bottomY - (prevArea.y + prevArea.h + kChild.margin.top);//하단 여백
        if(kRemainingSpace < data.height){
            //this.doc.addPage();
            this.addPage();
        }

        const kArea = {
            x:this.pageMargin,
            y:bottomY - data.height,
            w:this.availableWidth };
        this.drawHorizontalLayout(kChild, kArea);
        return {x:this.pageMargin, y:kArea.y, w:this.availableWidth, h:data.height}
    }

    drawStackLayout(data, area, isTopDepth) {
        data = this.modifyNullData(data);
        //console.log('drawStackLayout called >>>> ', JSON.stringify(data));
        //child area를 위해 필요한 값들을 설정한다.
        const kMarginLeft = data.margin.left;
        const kMarginTop = data.margin.top;
        const kMarginRight = data.margin.right;
        const kStartX = area.x + kMarginLeft;
        const kStartY = area.y + kMarginTop;
        const kWidth = area.w - (kMarginLeft + kMarginRight);
        let kNextChildArea = {x:kStartX, y:kStartY, w:kWidth};
        let kMaxY = kNextChildArea.y;

        let kReturnRect;
        const {pageHeight, bottomY} = this.getPageDimension(this.doc);
        data.children.forEach((child, index) => {
            const kType = child.type;
            let kChild = this.modifyNullData(child);

            //==== 새로운 페이지 추가 ===========
            if(kType == this.TYPE_PAGE){
                if(isTopDepth){
                    kReturnRect = this.addPage();
                    kMaxY = kReturnRect.y + kReturnRect.h;
                    kNextChildArea.y = kMaxY;
//                    kMaxY = this.pageMargin;
//                    kNextChildArea.y = this.pageMargin;
                }
                return;
            }
            //================================
            if(kType == this.TYPE_LINE){
                //line은 하나의 Horizontal layout으로 변경하지 않고 그린다.
                kReturnRect = this.drawLine(kChild, kNextChildArea);
            }else if(kType == this.TYPE_TABLE){
                //table은 하나의 Horizontal layout으로 변경하지 않고 그린다.
                kReturnRect = this.drawTable(kChild, kNextChildArea);
            }else {
                if (kType != this.TYPE_HORIZONTAL) {
                    /*
                    horizontallayout이 아닌 View도 HorizontalLayout으로 그릴 수 있도록 조정한다. text조차도 그냥 그리지 않고 layout(table)으로 그린다.
                    */
                    kChild = {
                        type:this.TYPE_HORIZONTAL,
                        children:[kChild],
                        margin:kChild.margin,
                        border:kChild.border
                    };
                }
                kNextChildArea.x = kStartX + kChild.margin.left;
                kNextChildArea.y = kNextChildArea.y + kChild.margin.top;

                kReturnRect = this.drawHorizontalLayout(kChild, kNextChildArea);
            }

            //다음 그릴 요소들을 위해 가장 큰 endY를 찾는다.
            kMaxY = kReturnRect.h + kReturnRect.y;

            //========================
             //stacklayout에서 x와 w는 변하지 않는다.//child간의 y값에는 margin을 적용하지 않는다.
             kNextChildArea = {x:kStartX, y:kMaxY, w:kWidth};

            //top depth인 경우에만 페이지를 추가할 수 있다.
            if(isTopDepth){
                /*
                다음 뷰의 높이를 계산하여 페이지를 넘어 갈 것으로 판단되면 새로운 페이지를 추가한다.
                addPage()는 맨 상위 depth(stack)에서만 이루어진다.
                text가 아닌 경우엔 그 높이를 계산하기 힘들어 pageNumberSpace만큼만 지정
                */
                let kNextHeight = this.pageNumberSpace;
                if(data.children.length > (index + 1)){
                    let kNextChild = data.children[index + 1];
                    kNextChild = this.modifyNullData(kNextChild);
                    if(kNextChild.type == this.TYPE_TEXT){
                        const kDimension = this.getTextSize(kNextChild.text, kNextChild.styles.fontSize ,kWidth);
                        kNextHeight = kDimension.totalH + kNextChild.margin.top ;
                    }
                }
                //페이지 추가
                if((kMaxY + kNextHeight) > bottomY){
                     kReturnRect = this.addPage();
                     kMaxY = kReturnRect.y + kReturnRect.h;
                     kNextChildArea.y = kMaxY;
//                     kMaxY = this.pageMargin;
//                     kNextChildArea.y = this.pageMargin;
                }
            }
        });


        return {x:area.x, y:area.y , w:area.w, h:kMaxY-area.y};
    }


    drawHorizontalLayout(data, area) {

        //data의 type은 "horizontal_layout"이다.
        //console.log('drawHorizontalLayout called >>>> ', JSON.stringify(data));
        //horizontal table body의 데이타 형식 (1행, 다열): [[data, data....]]
        let kBodies = [[]];
        const kCellWidth = area.w/data.children.length;
        //필요한 데이터만 채운다. text만 데이타를 채우고 그외는 비어 있는 공백 문자
        data.children.forEach((child, index) => {
            let kType = child.type;
            const kStyles = this.getCellStyles(child.styles, child.border);
            kStyles.cellWidth = kCellWidth;
            if(kType == this.TYPE_TEXT){
                kBodies[0].push({content:child.text, styles:kStyles});
            }else{
                kBodies[0].push({content:'', styles:kStyles});
            }
        });
        //data는 horizontal Layout
        return this.drawHorizontalTable(data, area, kBodies);
    }



    /**
    *순수하게 텍스트로만 이루어진 테이블을 그린다.
    * data의 type은 "table"
    */
    drawTable(data, area){

        data = this.modifyNullData(data);
        let kHeadData;//헤더는 row가 하나
        let kBodyData = [];
        if(data.head?.length){
            kHeadData = [[]]
           data.head.forEach((txt, i) => {
               let kCell = {content:txt};
               if(data.headStyles?.length > i){
                  kCell.styles = this.getCellStyles(data.headStyles[i], data.border);
               }
               kHeadData[0].push(kCell);
           })
        }
        data.body.forEach((txtArray, row) => {
            const kCellArray = txtArray.map((txt, i)=>{
                let kCell = {content:txt};
               if(data.bodyStyles?.length > i){
                  kCell.styles = this.getCellStyles(data.bodyStyles[i], data.border);
               }
               return kCell;
            })
           kBodyData.push(kCellArray);
        })

       // kHeadData = kHeadData ? [kHeadData] : null;
        const kTheme = data.border.thick ? 'grid':'plain';
        const kMarginLeft = data.margin.left;//space from parent
        const kMarginTop = data.margin.top;//space from parent
        const kX = area.x + kMarginLeft;//posX
        const kY = area.y + kMarginTop;
        const kTableWidth = area.w - kMarginLeft;//왼쪽만 이동한 만큼 폭을 줄인다.(오른쪽은 줄이지 않는다.)
        const kCellPadding = data.cellPadding == null ? 1 : data.cellPadding;
        this.doc.autoTable({
            theme:kTheme, //plain : no-border, grid:border,
            startY:kY, //pos y
            margin:{left:kX, bottom:0}, //pos x
            tableWidth:kTableWidth,
            head:kHeadData,
            body:kBodyData,
            styles:{cellPadding:kCellPadding, overflow:'linebreak'},
            headStyles:{cellPadding:kCellPadding}
        });
        //const kHeight = this.doc.lastAutoTable.finalY - area.y + kMarginTop;
        //마진가지 합쳐서 높이를 던져줄 필요는 없다.
        const kHeight = this.doc.lastAutoTable.finalY - area.y;
        //drawing후 리턴은 그려진 area를 넘긴다.(즉 h만 계산해서 보내면 된다.)
        return {x:area.x, y:area.y, w:area.w, h:kHeight};
    }

    /**
    * data : type = horizontal_layout
    */
    drawHorizontalTable(data, area, bodies){
        //이건 실지로 테이블을 이용하여 horizontal layout(one-row table)을 그리는 것이다. 요소의 속성을 변경하기 위해서는 didDrawCell()에서 한다.
        //console.log("drawHorizontalTable >>>> ", JSON.stringify(data))

        let kCellRects = [];//이후 테두리를 그릴 영역을 저장하기 위한 배열
        let kMaxY = area.y;//이걸 구해서 외곽선을 그린다.

        this.doc.autoTable({
            theme:"plain", //plain : no-border, grid:border,
            startY:area.y, //pos y
            margin:{left:area.x, bottom:0}, //pos x
            tableWidth:area.w,
            body:bodies,
            styles:{overflow:'linebreak', cellPadding:0},

            didDrawCell: (cellData) => {
                const kChild = data.children[cellData.column.index];
                let kReturnRect;
                const kType = kChild.type;
                if(kType == this.TYPE_TEXT){
                    //텍스트는 바로 셀에 쓰기 때문에 새로이 그릴 필요 없다.
                    kReturnRect = {x:cellData.cell.x, y:cellData.cell.y, w:cellData.cell.width, h:cellData.cell.height};
                }else{
                   kReturnRect = this.drawCellContent(cellData, kChild);
                }
                kCellRects.push(kReturnRect);

                kMaxY = Math.max(kReturnRect.h + kReturnRect.y, kMaxY);
            }
        });

        //cell에 외곽선을 그린다.
        const kMaxHeight = kMaxY - area.y;
        if(data.border?.thick){
            kCellRects.forEach(cellRect => {
                cellRect.h = kMaxHeight;
                this.drawRect(cellRect, data.border);
            });
        }
        //const {bottomY} = this.getPageDimension(this.doc);
        //console.log('max Y >>>>> ', kMaxY, ">>>bottom Y >>>", bottomY)
        return {x:area.x, y:area.y, w:area.w, h:kMaxHeight};
    }


    drawCellContent(cellData, content) {
        //console.log("drawCellContent >>>> ", JSON.stringify(content))
        const { x, y, width, height } = cellData.cell;
        content = this.modifyNullData(content);
        const kArea = {x:x, y:y, w:width};

        let kReturnRect;
        let kHeight = height;
        const kType = content.type;
        if (kType == this.TYPE_IMAGE) {
            kReturnRect = this.drawImage(content, kArea);
        }else if(kType == this.TYPE_HORIZONTAL){
            kReturnRect = this.drawHorizontalLayout(content, kArea);
        }else if(kType == this.TYPE_STACK){
             kReturnRect = this.drawStackLayout(content, kArea);
        }else if(kType == this.TYPE_TABLE){
             kReturnRect = this.drawTable(content, kArea);
        }else if(kType == this.TYPE_LINE){
              kReturnRect = this.drawLine(content, kArea);
        }
        //리턴되는 rect의 x/y/w는 셀의 크기로 변하면 안된다. 변하는 것은 height뿐이다.
        return {x:x, y:y, w:width, h: kReturnRect.h};
    }



    drawImage(data, area){
        data = this.modifyNullData(data);
        this.doc.addImage(
            data.image.src,
            "PNG",
            area.x + data.margin.left,
            area.y + data.margin.top,
            data.image.w,
            data.image.h
        );
        const kReturnRect = {x:area.x, y:area.y, w:area.w, h:data.image.h + data.margin.top + data.margin.bottom};
        return kReturnRect;
    }
    


//


    drawRect(rect, border) {
        if(!border?.thick) return;
        const kColor = this.modifyColor(border.color);
        this.doc.setDrawColor(kColor.r, kColor.g, kColor.b);
        this.doc.setLineWidth(border.thick);
        this.doc.rect(rect.x, rect.y, rect.w, rect.h);
    }

    @api
    drawLine(data, drawArea) {

        this.doc.setLineWidth(data.border.thick);
        this.doc.setDrawColor(data.border.color.r,data.border.color.g,data.border.color.b);
        const kStartX = drawArea.x + data.margin.left;
        const kStartY = drawArea.y + data.margin.top;
        const kEndX = (data.width == null) ? kStartX:  kStartX + data.width;
        const kEndY = (data.height == null) ? kStartY: kStartY + data.height;

        this.doc.line(kStartX, kStartY, kEndX, kEndY);
        drawArea.h = kEndY - drawArea.y;
        return drawArea;//area를 리턴한다.
    }

    publishPDF(doc) {
        // Set URL
        const kPdfUrl = URL.createObjectURL(doc.output('blob'));
        // Apex 전달 > Content Version으로 저장
        // PDF -> base64 string
        this.base64PDF = doc.output('datauristring').split(',')[1];

        const kIFrame = this.template.querySelector('iframe');
        kIFrame.src = `${pdfviewer}/web/viewer.html?file=${encodeURIComponent(kPdfUrl)}`;
    }


    drawPageNumber(doc){
        if(!this.pageNumberVisible) return;
        // 전체 페이지 수
        const kTotalPages = doc.getNumberOfPages();
        const {pageWidth, pageHeight} = this.getPageDimension(doc);
        // 하단 중앙에 페이지 번호 삽입
        for (let i = 1; i <= kTotalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.text(`${i} / ${kTotalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        }
    }


    //===========================
    getTextSize(aTxt, aFontSize, aMaxWidth) {

        if (!aTxt) return { w: 0, h: 0, totalH: 0 };
        let kSingleLineDimension = this.doc.getTextDimensions(aTxt, { fontSize: aFontSize });

        let kMultiLineDimension = this.doc.getTextDimensions(aTxt, { fontSize: aFontSize, maxWidth: aMaxWidth ?? 0 });
        return { w: kSingleLineDimension.w, h: kSingleLineDimension.h, totalH: kMultiLineDimension.h };
        //return {w:kDimension.w, h:kSingleDimension.h, totalH:kDimension.h + (aFontSize/2)};
    }


    getPageDimension(doc){
        const pageWidth = doc.internal.pageSize.width || doc.getPageWidth(); //약 210
        const pageHeight = doc.internal.pageSize.height || doc.getPageHeight(); //약 297
        return {pageWidth:pageWidth, pageHeight:pageHeight, bottomY:pageHeight-this.pageNumberSpace};
    }

    /**
    type이 'table'인 테이블의 셀 스타일
    */
    getCellStyles(styles, border){
        let kStyles = styles ?? {};
        const kTxtColor = this.modifyColor(kStyles.color);
        kStyles.textColor = [kTxtColor.r, kTxtColor.g, kTxtColor.b];

        const kBgColor = this.modifyColor(kStyles.bgColor, this.colorWhite);
        kStyles.fillColor = [kBgColor.r, kBgColor.g, kBgColor.b];


        kStyles.lineWidth = border?.thick;
        const kLineColor = this.modifyColor(border?.color, this.colorWhite);
        kStyles.lineColor = [kLineColor.r, kLineColor.g, kLineColor.b];

        return kStyles;
    }

    modifyNullData(data){
        //margin
        const kMarginLeft = data.margin?.left == null ? 0:data.margin.left;
        const kMarginTop = data.margin?.top == null ? 0:data.margin.top;
        const kMarginRight = data.margin?.right == null ? 0:data.margin.right;
        const kMarginBottom = data.margin?.bottom == null ? 0:data.margin.bottom;
        data.margin = {left:kMarginLeft, top:kMarginTop, right:kMarginRight, bottom:kMarginBottom};
        //border
        const kThick = data.border?.thick ?? 0;
        const kBorderColor = this.modifyColor(data.border?.color);
        data.border = {thick:kThick, color:kBorderColor};
        //
        if(data.type == this.TYPE_TEXT){
            data.styles = data.styles ?? {};
            data.styles.fontSize = data.styles.fontSize ?? 11;
            data.styles.color = data.styles.color ?? this.colorBlack;
        }

        return data;
    }

    modifyColor(color, alt){
        const kAlt = alt ?? this.colorBlack;
        const kColor = color ?? kAlt;
        kColor.r = kColor.r == null ? kAlt.r : kColor.r;
        kColor.g = kColor.g == null ? kAlt.g : kColor.g;
        kColor.b = kColor.b == null ? kAlt.b : kColor.b;
        return kColor;
    }


    //위치 확인을 위한 테스트용
    testDrawLine(x1, y1, x2, y2, color){
        color = this.modifyColor(color, {r:255,g:0, b:50})
        this.doc.setLineWidth(1);
        this.doc.setDrawColor(color.r, color.g, color.b);
        this.doc.line(x1, y1, x2, y2);
    }

}




//drawText(data) {
//        //console.log('drawText called >>>> ', JSON.stringify(data));
//
//        let kRect = data.rect;
//        kRect.w = kRect.w ?? this.availableWidth;
//        data.font = this.setFontProperties(data.font);
//        let kTxtDimension = this.getTextSize(data.text, data.font.size, kRect.w);
//        kRect.h =  kTxtDimension.totalH;
//
//        //
//        let kPosX = kRect.x;
//        const kAlignH = data.align?.horizontal;
//        const kRestWidth = kRect.w - kTxtDimension.w;//정렬을 위해 미리 계산
//        if ('center' == kAlignH) {
//            kPosX = kPosX + kRestWidth / 2;
//        }else if('right' == kAlignH){
//            kPosX = kPosX + kRestWidth;
//        }
//        //================
//        let kPosY = kRect.y + kTxtDimension.h; //텍스트와 rect의 기준점이 다르다. rect : 오른쪽 상단, 텍스트: 오른쪽 하단
//        const kAlignV = data.align?.vertical;
//        const kRestHeight = kRect.h - kTxtDimension.h;//정렬을 위해 미리 계산
//        if ('center' == kAlignV) {
//            kPosY = kPosY + (kRestHeight / 2) - 1; //1 : 어쩔 수 없는 빈틈 상수
//        }else if('bottom' == kAlignV){
//            kPosY = kPosY + kRestHeight - 1;
//        }
//
//        this.doc.text(data.text, kPosX, kPosY, { maxWidth: kRect.w });
//
//        //==============
//        if(data.border?.thick){
//            this.drawRect(data, kRect);
//        }
//
//
//        return kRect;
//    }


//    setFontProperties(aFont) {
//        let kFont = aFont ?? {};
//        if (!kFont.size) kFont.size = 12;
//        if (!kFont.color) kFont.color = this.colorBlack;
//        if (!kFont.style) kFont.style = 'normal';
//
//        this.doc.setFont('helvetica', kFont.style);
//        this.doc.setFontSize(kFont.size);
//        this.doc.setTextColor(kFont.color.r, kFont.color.g, kFont.color.b);
//        return kFont;
//    }