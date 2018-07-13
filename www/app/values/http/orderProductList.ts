export interface IReqOrderProductList {
}
    
export interface IResOrderProductList {
    message:string;
    result:{
        orderProductList:IorderProductList[];
    };
    status:string;
    datetime:string;
 }

export interface IorderProductList{
    cfdProductCode:string;  
    meigaraSeiKanji:string;                             
 }