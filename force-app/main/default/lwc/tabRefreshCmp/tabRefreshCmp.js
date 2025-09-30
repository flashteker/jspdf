/****************************************************************************************
Project Name : OrgA
File Name : tabRefreshCmp
Description : 필수 작성
Copyright : Copyright © I2max. All Rights Reserved. 2025
Created Date : 9/29/25
****************************************************************************************/


import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { RefreshEvent } from "lightning/refresh";

export default class TabRefreshCmp extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api fieldApiName;

    prevValue;

    //특정 필드만 wire시키기 위해서는 컴파일 전에 오브젝트.필드 schema가 준비되어 있어야 하기에 api로 불러들인 변수를 사용할 수 없다.
    //그래서 전체 schema를 읽어 올 수 있는 layoutTypes/modes 방식을 이용하여 모든 필드의 변경을 캐치한다.
    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'],modes: ['View'] })
    wiredRecord({data, error}){
        if(data){
            const kWiredFieldValue = getFieldValue(data, {fieldApiName:this?.fieldApiName, objectApiName:this?.objectApiName});
            if(kWiredFieldValue){
                if(!this.prevValue){
                    this.prevValue = kWiredFieldValue;
                }else if(this.prevValue != kWiredFieldValue){
                    //this.dispatchEvent(new RefreshEvent());//detail fields만 변경
                    window.location.reload();
                }
            }
        }else if(error){
            console.log("error >>> ", error)
        }
    }

}