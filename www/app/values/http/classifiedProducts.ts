
export interface IReqClassifiedProducts {
    
}


export interface IResClassifiedProducts {
  message:string;
  result:[{
    categoryLabel:string;
    productList:list[];
  }];
  status:string;
  datetime:string;
}

// order list
interface list{
    cfdProductCode:string;                              
    companyName1:string;                                
    companyName2:string;                                
    companyName3:string;                                
    displayOrder:string;                                
    meigaraEiji:string;                                 
    meigaraRyakuKana:string;                                
    meigaraRyakuKanji:string;                               
    meigaraSeiBkana:string;                                 
    meigaraSeiKana:string;                              
    meigaraSeiKanji:string;                             
    securitiesCode:string;                              
    symbolName:string;                              


}