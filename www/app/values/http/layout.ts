/**-----------------------------------------------------------------------------
 * 情報取得要求 - レイアウト保存
 *
 *----------------------------------------------------------------------------*/
export interface IReqLayoutSave {
  layoutid_1:{};
}
export interface IReqLayoutLoad {
  layoutid_1:{};  
}

/**-----------------------------------------------------------------------------
* 情報取得応答 - レイアウト復元
*
*----------------------------------------------------------------------------*/
export interface IResLayoutSave {
  
}

export interface IResLayoutLoad {
  
}

// 保存情報
export interface ILayoutInfo {
  windowId?:string;
  position?:{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  },                
  external?: boolean;
  productCode?: string;
  chartSetting?: string;
  option?: any;
}

/*
{                
    "layoutid_1": [                
        {                
                
            "windows_1": {                
                
               "windowId": "04010100",                
                "position": {                
                    "x": 100,                
                    "y": 200,                
                    "width": 500,                
                    "height": 600                
                },                
                "external": false,                
                "productCode": "20010010202",                
                "chartSetting": "",
                "option":""              
            },                
            "windows_2": {                 
               "windowId": "05010100",                
                "position": {                
                    "x": 100,                
                    "y": 200,                
                    "width": 500,                
                    "height": 600                
                },                
                "external": false,                
                "productCode": "20010010202",                
                "chartSetting": "",                
                "option":""              
            }                
        }                
    ]                
}      
*/