// /**-----------------------------------------------------------------------------
//  * enum
//  *
//  *----------------------------------------------------------------------------*/
// export class ResponseStatus{
//   static OK = "0";
//   static NG = "1";
// }

/**-----------------------------------------------------------------------------
 * インポート部
 *
 *----------------------------------------------------------------------------*/
// HTTP Protocol
import { IReqOrderList, IResOrderList, IResOrderItem } from "./http/orderList"
import { IReqOrderDetail, IResOrderDetail } from "./http/orderDetail"
import { IReqExecutionList, IResExecutionList, IResExecutionItem } from "./http/executionList"
import { IReqExecutionProductList, IResExecutionProductList } from "./http/executionProductList"
import { IReqPositionList, IResPositionList,IReqProductPosition, IResPositionInfo} from "./http/positionList"
import { IReqProductList, IResProductList, IProductInfo } from "./http/productList"
import { IReqOrderProductList, IResOrderProductList} from "./http/orderProductList"
import { IResconversionRate, IConversionRate } from "./http/conversion-rate"

//speed
import { IReqSpeedOrder, IResSpeedOrder } from "./http/speedOrder"
import { IReqSpeedAllSettleOrder, IResSpeedAllSettleOrder } from "./http/speedAllSettleOrder"

import { IReqIfdocoOrder, IResIfdocoOrder } from "./http/ifdocoOrder"
import { IReqIfdOrder, IResIfdOrder } from "./http/ifdOrder"
import { IReqOcoOrder, IResOcoOrder,shiteiUmeParamList } from "./http/ocoOrder"

import { IReqSingleOrder, IResSingleOrder,ShiteiUmes } from "./http/singleOrder"
import { IReqChangeOrder, IResChangeOrder } from "./http/changeOrder"
import { IReqCancelOrder, IResCancelOrder } from "./http/cancelOrder"

import { IReqPriceList, IResPriceList, IResPrice } from "./http/priceList"
import { IReqClassifiedProducts, IResClassifiedProducts } from "./http/classifiedProducts"

import { IReqMarketSummary, IResMarketSummary } from "./http/marketSummary"
import { IReqMarketCalendarInfo, IResMarketCalendarInfo, MarketCalendarList } from "./http/marketCalendarInfo"
import { IReqNewsList, IResNewsList, NewsList } from "./http/newsList"
import { IReqProductDetailList, IReqProductDetail, IResProductDetail } from "./http/productDetail"
import { IReqAttentionInfo, IResAttentionInfo } from "./http/attentionInfo"
import { IReqPowerAmount, IResPowerAmount, IPowerAmount } from "./http/powerAmount"
import { IReqUpdateWatchList, IResUpdateWatchList } from "./http/updateWatchList"
import { IReqWatchList, IResWatchList } from "./http/watchList"
import { IReqAddWatchList, IReqPutWatchList, IResAddWatchList, IResPutWatchList } from "./http/addWatchList"
import { IReqDelWatchList, IResDelWatchList } from "./http/delWatchList"
import { IReqInformationList, IResInformationList } from "./http/informationList"
import { IReqInformationMessage, IResInformationMessage } from "./http/informationMessage"
import { IReqCashTransfer, IResCashTransfer } from "./http/cashTransfer"
import { IReqGetCashTransferInfo, IResGetCashTransferInfo } from "./http/cashTransferInfo"
import { IReqCashTransferHistory, IResCashTransferHistory } from "./http/cashTransferHistory"
import { IReqLosscutRateInfoList, IReqLosscutRateInfo, IResLosscutRateInfo } from "./http/losscutRateInfo"
import { IReqCalcLosscutRate, IResCalcLosscutRate } from "./http/calcLosscutRate"
import { IReqChangeLosscutRate, IResChangeLosscutRate } from "./http/changeLosscutRate"
import { IReqFundInfo, IResFundInfo } from "./http/fundInfo"
import { IReqCorporateInfo, IResCorporateInfo } from "./http/corporateInfo"
import { IReqUserInfo, IResUserInfo } from "./http/userInfo"
import { IReqLayoutSave, IReqLayoutLoad, IResLayoutSave, IResLayoutLoad, ILayoutInfo } from "./http/layout"
import { IReqFeedback, IResFeedback } from "./http/feedback"
import { IReqSearch, IResSearch } from "./http/search"


import { IReqOHLC, IResOHLC } from "./http/ohlc"
import { IReqChartTick, IResChartTick } from "./http/chartTick"  // #2090

// web socket
import { IReqStreamPrice, IResStreamPrice, IStreamPrice } from "./stream/price"
import { IResStreamConversionRate, IStreamConversionRate } from "./stream/conversion-rate"
import { IEventNotice, IEventOrder, IEventPosition } from "./stream/notice-event"

/**-----------------------------------------------------------------------------
 * エクスポート部
 *
 *----------------------------------------------------------------------------*/
// HTTP Protocol
export { IReqOrderList, IResOrderList, IResOrderItem }
export { IReqOrderProductList, IResOrderProductList }
export { IReqOrderDetail, IResOrderDetail }

export { IReqExecutionList, IResExecutionList, IResExecutionItem }
export { IReqExecutionProductList, IResExecutionProductList }
export { IReqProductList, IResProductList, IProductInfo }
export { IReqPositionList, IResPositionList,IReqProductPosition, IResPositionInfo}

export { IReqPriceList, IResPriceList, IResPrice }
export { IReqClassifiedProducts, IResClassifiedProducts }

export { IReqSpeedOrder, IResSpeedOrder }
export { IReqSpeedAllSettleOrder, IResSpeedAllSettleOrder }


export { IReqIfdocoOrder, IResIfdocoOrder }
export { IReqIfdOrder, IResIfdOrder }
export { IReqOcoOrder, IResOcoOrder,shiteiUmeParamList }

export { IReqSingleOrder, IResSingleOrder,ShiteiUmes }
export { IReqChangeOrder, IResChangeOrder }
export { IReqCancelOrder, IResCancelOrder }

export { IReqMarketSummary, IResMarketSummary }
export { IReqMarketCalendarInfo, IResMarketCalendarInfo, MarketCalendarList }
export { IReqNewsList, IResNewsList, NewsList }
export { IReqProductDetailList, IReqProductDetail, IResProductDetail }
export { IReqAttentionInfo, IResAttentionInfo }
export { IReqPowerAmount, IResPowerAmount, IPowerAmount }
export { IReqUpdateWatchList, IResUpdateWatchList }
export { IReqWatchList, IResWatchList } 
export { IReqAddWatchList, IReqPutWatchList, IResAddWatchList, IResPutWatchList } 
export { IReqDelWatchList, IResDelWatchList } 
export { IReqInformationList, IResInformationList }
export { IReqInformationMessage, IResInformationMessage }
export { IReqCashTransfer, IResCashTransfer } 
export { IReqGetCashTransferInfo, IResGetCashTransferInfo }
export { IReqCashTransferHistory, IResCashTransferHistory }
export { IReqLosscutRateInfoList, IReqLosscutRateInfo, IResLosscutRateInfo }
export { IReqCalcLosscutRate, IResCalcLosscutRate }
export { IReqChangeLosscutRate, IResChangeLosscutRate }
export { IReqFundInfo, IResFundInfo }
export { IReqCorporateInfo, IResCorporateInfo }

export { IResconversionRate, IConversionRate }
export { IReqUserInfo, IResUserInfo }

export { IReqFeedback, IResFeedback }
export { IReqSearch, IResSearch }

export { IReqOHLC, IResOHLC }
export { IReqLayoutSave, IReqLayoutLoad, IResLayoutSave, IResLayoutLoad, ILayoutInfo }

export { IReqChartTick, IResChartTick } // #2090


// web socket
export { IReqStreamPrice, IResStreamPrice, IStreamPrice }
export { IResStreamConversionRate, IStreamConversionRate }
export { IEventNotice, IEventOrder, IEventPosition }