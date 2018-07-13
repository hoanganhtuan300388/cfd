
// 初期表示する銘柄　: 「日本225」
export const DefaultProductCode = '00001060000';

export const ON   = 'on';
export const OFF  = 'off';

export const OrderTypeList = [
  { value: "1", text: "成行" },
  { value: "2", text: "指値" },
  { value: "3", text: "逆指値" },
  { value: "4", text: "IFD" },
  { value: "5", text: "OCO" },
  { value: "6", text: "IFD-OCO" },
];

// 初期レイアウト
export const defaultLayout = {
  "layoutid_1":[
    {
      "windows_1":{
        "external":false,
        "position":{
          "x":1,
          "y":530
        },
        "windowId":"03020300"
      },
      "windows_2":{
        "external":false,
        "position":{
          "width":1465,"x":0,"y":0
        },
        "windowId":"03030100"
      },
      "windows_3":{
        "external":false,
        "position":{"x":1,"y":278},
        "windowId":"03020400"
      },
      "windows_4":{
        "external":false,
        "position":{"height":607,"width":465,"x":1000,"y":278},
        "windowId":"03030600"
      }
    }
  ]
};
