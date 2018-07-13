// angular base
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

// 3rd party
import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';
import { DynamicHTMLModule, DynamicComponentModule } from 'ng-dynamic';
import { DndModule } from 'ng2-dnd';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ContextMenuModule } from 'ngx-contextmenu';
import { PopoverModule } from "../assets/libs/ngx-popover";
import { ColorPickerModule } from 'ngx-color-picker';

// service
import { PanelManageService } from './service/panel-manage.service';
import { BusinessService } from './service/business.service';
import { ResourceService } from './service/resource.service';
import { WindowService } from './service/window.service';

// #1540
import { ManagerService } from './service/manager.service';
//

import { ConfirmComponent } from './core/confirmModal';

// pipes
import { SymbolStockPipe } from './pipes/symbol-stock-pipe';
import { FromToDatePipe } from './pipes/from-to-date-pipe';
import { DatexPipe } from './pipes/datex-pipe';

// util
import { Draggable } from './util/draggable.directive';
import { Resizeable } from './util/resizeable.directive';
import { LongPress } from './util/longpress.directive';
import { ValidatorNumber } from './util/validator.directive';
import { BlinkElement } from './util/blink-element.directive';
import { InputRestrict } from './util/input-restrict.directive';
import { TabIndexDirective } from './util/tab-index.directive';

// controls
import { DropdownComponent } from './ctrls/dropdown/dropdown.component';
import { CalendarComponent } from './ctrls/calendar/calendar.component';

import { MiniChartComponent } from './ctrls/mini-chart/mini-chart.component';
import { SymbolCfdComponent } from './ctrls/symbol-cfd/symbol-cfd.component';

// pages
import { Scr03010100Component } from './panel/0301/scr-03010100/scr-03010100.component';  // main screen
import { Scr03010101Component } from './panel/0301/scr-03010101/scr-03010101.component';  //
import { Scr03010200Component } from './panel/0301/scr-03010200/scr-03010200.component';  // login
import { Scr03010300Component } from './panel/0301/scr-03010300/scr-03010300.component';
import { Scr03010400Component } from './panel/0301/scr-03010400/scr-03010400.component';
import { Scr03010500Component } from './panel/0301/scr-03010500/scr-03010500.component';

import { Scr03020100Component } from './panel/0302/scr-03020100/scr-03020100.component';
import { Scr03020101Component } from './panel/0302/scr-03020101/scr-03020101.component';
import { Scr03020102Component } from './panel/0302/scr-03020102/scr-03020102.component';
import { Scr03020103Component } from './panel/0302/scr-03020103/scr-03020103.component';
import { Scr03020104Component } from './panel/0302/scr-03020104/scr-03020104.component';
import { Scr03020200Component } from './panel/0302/scr-03020200/scr-03020200.component';
import { Scr03020300Component } from './panel/0302/scr-03020300/scr-03020300.component';
import { Scr03020301Component } from './panel/0302/scr-03020301/scr-03020301.component';
import { Scr03020400Component } from './panel/0302/scr-03020400/scr-03020400.component';
import { Scr03020500Component } from './panel/0302/scr-03020500/scr-03020500.component';
import { Scr03020600Component } from './panel/0302/scr-03020600/scr-03020600.component';
import { Scr03020700Component } from './panel/0302/scr-03020700/scr-03020700.component';

import { Scr03030100Component } from './panel/0303/scr-03030100/scr-03030100.component';
import { Scr03030101Component } from './panel/0303/scr-03030101/scr-03030101.component';
import { Scr03030102Component } from './panel/0303/scr-03030102/scr-03030102.component';
import { Scr03030103Component } from './panel/0303/scr-03030103/scr-03030103.component';
import { Scr03030200Component } from './panel/0303/scr-03030200/scr-03030200.component';
import { Scr03030300Component } from './panel/0303/scr-03030300/scr-03030300.component';
import { Scr03030400Component } from './panel/0303/scr-03030400/scr-03030400.component';
import { Scr03030500Component } from './panel/0303/scr-03030500/scr-03030500.component';
import { Scr03030501Component } from './panel/0303/scr-03030501/scr-03030501.component';
import { Scr03030600Component } from './panel/0303/scr-03030600/scr-03030600.component';
import { Scr03030601Component } from './panel/0303/scr-03030601/scr-03030601.component'; // #1952
import { Scr03030602Component } from './panel/0303/scr-03030602/scr-03030602.component'; // #2247

// components
import { MenuBarComponent } from './component/menu-bar/menu-bar.component';
import { MenuBarPowerAmountComponent } from './component/menu-bar-amount/menu-bar-amount.component';
import { TaskBarComponent } from './component/task-bar/task-bar.component';
import { TitleBarComponent } from './component/title-bar/title-bar.component';
import { WindowControllerComponent } from './component/window-controller/window-controller.component';
import { MdiAreaComponent } from './component/mdi-area/mdi-area.component';
import { AskBidUnitComponent } from './component/ask-bid-unit/ask-bid-unit.component';

import { ConfigChartColorComponent } from './component/config-chart-color/config-chart-color.component';
import { ConfigChartDisplayComponent } from './component/config-chart-display/config-chart-display.component';
import { ConfigChartTechnicalComponent } from './component/config-chart-technical/config-chart-technical.component';
import { ConfigDisplayComponent } from './component/config-display/config-display.component';
import { ConfigOrderComponent } from './component/config-order/config-order.component';
import { ConfigOrderSymbolComponent } from './component/config-order-symbol/config-order-symbol.component';
import { ConfigSoundComponent } from './component/config-sound/config-sound.component';

import { OrderCancelComponent } from './component/order-cancel/order-cancel.component';
import { OrderConfirmComponent } from './component/order-confirm/order-confirm.component';
import { SettleConfirmComponent } from './component/settle-confirm/settle-confirm.component';
import { OrderInputComponent } from './component/order-input/order-input.component';
import { OrderModifyComponent } from './component/order-modify/order-modify.component';
import { OrderModifyConfirmComponent} from './component/order-modify-confirm/order-modify-confirm.component';

import { SpeedOrderConfirmComponent } from './component/speed-order-confirm/speed-order-confirm.component';
import { SpeedOrderComponent } from './component/speed-order/speed-order.component';
import { SpeedOrderQTYComponent } from './component/speed-order-qty/speed-order-qty.component';
import { PriceListComponent } from './component/price-list/price-list.component';
import { PriceWatchComponent } from './component/price-watch/price-watch.component';
import { PriceWatchUnitComponent } from './component/price-watch-unit/price-watch-unit.component';
import { orderDetailComponent  } from './component/orderDetail/orderDetail.component';
import { orderSingleMultiComponent } from './component/order-singleMulti/order-singleMulti.component';
import { OrderSendButtonComponent } from './component/order-sendButton/order-sendButton.component';

import { ChartCfdMiniComponent } from './component/chart-cfd-mini/chart-cfd-mini.component'; // #2247

// #1540
import { ChartCfdComponent } from './component/chart-cfd/chart-cfd.component';
//

// #1556
import { ChartSettingComponent } from './component/chart-setting/chart-setting.component';
//

// #1594
import { ChartConfigComponent } from './component/chart-config/chart-config.component';
//

// #2019
import { ChartInfoPanelComponent } from './component/chart-info-panel/chart-info-panel.component';
//

import { SettleInputComponent } from './component/settle-input/settle-input.component';
import { AlertAddModifyComponent } from './component/alert-add-modify/alert-add-modify.component';
import { AlertModifyDialogComponent } from './component/alert-modify-dialog/alert-modify-dialog.component';
import { WithLinkDialogComponent } from './component/with-link-dialog/with-link-dialog.component';

// dynamic load module.
var dynamicHtmls = [
  { component: Scr03010100Component, selector: 'scr-03010100' },
  { component: Scr03010101Component, selector: 'scr-03010101' },
  { component: Scr03010200Component, selector: 'scr-03010200' },
  { component: Scr03010300Component, selector: 'scr-03010300' },
  { component: Scr03010400Component, selector: 'scr-03010400' },
  { component: Scr03010500Component, selector: 'scr-03010500' },

  { component: Scr03020100Component, selector: 'scr-03020100' },
  { component: Scr03020101Component, selector: 'scr-03020101' },
  { component: Scr03020102Component, selector: 'scr-03020102' },
  { component: Scr03020103Component, selector: 'scr-03020103' },
  { component: Scr03020104Component, selector: 'scr-03020104' },
  { component: Scr03020200Component, selector: 'scr-03020200' },
  { component: Scr03020300Component, selector: 'scr-03020300' },
  { component: Scr03020301Component, selector: 'scr-03020301' },
  { component: Scr03020400Component, selector: 'scr-03020400' },
  { component: Scr03020500Component, selector: 'scr-03020500' },
  { component: Scr03020600Component, selector: 'scr-03020600' },
  { component: Scr03020700Component, selector: 'scr-03020700' },

  { component: Scr03030100Component, selector: 'scr-03030100' },
  { component: Scr03030101Component, selector: 'scr-03030101' },
  { component: Scr03030102Component, selector: 'scr-03030102' },
  { component: Scr03030103Component, selector: 'scr-03030103' },
  { component: Scr03030200Component, selector: 'scr-03030200' },
  { component: Scr03030300Component, selector: 'scr-03030300' },
  { component: Scr03030400Component, selector: 'scr-03030400' },
  { component: Scr03030500Component, selector: 'scr-03030500' },
  { component: Scr03030501Component, selector: 'scr-03030501' },
  { component: Scr03030600Component, selector: 'scr-03030600' },
  { component: Scr03030601Component, selector: 'scr-03030601' }, // #1952
  { component: Scr03030602Component, selector: 'scr-03030602' }, // #2247

];

// component list
var components = [
  AppComponent,

  // util
  Draggable,
  Resizeable,
  LongPress,
  ValidatorNumber,
  BlinkElement,
  InputRestrict,
  TabIndexDirective,

  // control
  DropdownComponent,
  CalendarComponent,

  MiniChartComponent,
  SymbolCfdComponent,

  // pipes
  SymbolStockPipe,
  FromToDatePipe,
  DatexPipe,
  ConfirmComponent,
  OrderModifyConfirmComponent,

  // panel
  Scr03010100Component,
  Scr03010101Component,
  Scr03010200Component,
  Scr03010300Component,
  Scr03010400Component,
  Scr03010500Component,

  Scr03020100Component,
  Scr03020101Component,
  Scr03020102Component,
  Scr03020103Component,
  Scr03020104Component,
  Scr03020200Component,
  Scr03020300Component,
  Scr03020301Component,
  Scr03020400Component,
  Scr03020500Component,
  Scr03020600Component,
  Scr03020700Component,

  Scr03030100Component,
  Scr03030101Component,
  Scr03030102Component,
  Scr03030103Component,
  Scr03030200Component,
  Scr03030300Component,
  Scr03030400Component,
  Scr03030500Component,
  Scr03030501Component,
  Scr03030600Component,
  Scr03030601Component, // #1952
  Scr03030602Component, // #2247

  // component
  MenuBarComponent,
  MenuBarPowerAmountComponent,
  TaskBarComponent,
  TitleBarComponent,
  WindowControllerComponent,
  MdiAreaComponent,
  AskBidUnitComponent,

  ConfigChartColorComponent,
  ConfigChartDisplayComponent,
  ConfigChartTechnicalComponent,
  ConfigDisplayComponent,
  ConfigOrderComponent,
  ConfigOrderSymbolComponent,
  ConfigSoundComponent,
  OrderCancelComponent,
  OrderConfirmComponent,
  SettleConfirmComponent,
  OrderInputComponent,
  OrderModifyComponent,
  SpeedOrderConfirmComponent,
  SpeedOrderComponent,
  SpeedOrderQTYComponent,
  PriceListComponent,
  PriceWatchComponent,
  PriceWatchUnitComponent,
  orderDetailComponent,
  orderSingleMultiComponent,
  OrderSendButtonComponent,

  ChartCfdMiniComponent, // #2247

  // #1540
  ChartCfdComponent,
  //
  // #1556
  ChartSettingComponent,
  // #1594
  ChartConfigComponent,
  //
  ChartInfoPanelComponent,  // #2019

  SettleInputComponent,
  AlertAddModifyComponent,
  AlertModifyDialogComponent,
  WithLinkDialogComponent
];

@NgModule({
  declarations: [components],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ContextMenuModule,
    PopoverModule,
    BootstrapModalModule,
    Ng2BootstrapModule.forRoot(),
    NguiDatetimePickerModule,
    ColorPickerModule,
    DndModule.forRoot(),
    DynamicHTMLModule.forRoot({
      components: dynamicHtmls
    })
  ],
  entryComponents: [
	  OrderConfirmComponent,
	  SettleConfirmComponent,
    SpeedOrderConfirmComponent,
    ChartConfigComponent, // #1594
    AlertModifyDialogComponent,
    WithLinkDialogComponent
  ],
  providers: [
              // {provide: ErrorHandler, useClass: MyErrorHandler},
              PanelManageService,
              BusinessService,
              ResourceService,
              WindowService,
              ManagerService,
              ],
  bootstrap: [AppComponent]
})
export class AppModule { }
