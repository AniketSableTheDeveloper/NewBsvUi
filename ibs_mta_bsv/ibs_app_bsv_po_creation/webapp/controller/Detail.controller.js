sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvpocreation/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller,JSONModel,MessageBox,BusyIndicator,formatter,Filter,FilterOperator) {
    "use strict";
    var that;
    var localmodel, oProductModel;
    var prno, url


    return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.Detail", {
        formatter : formatter,
        onInit: function () {
            that = this;
            //
            
       
            // BusyIndicator.hide();
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Detail").attachPatternMatched(this._onRouteMatched, this);

        },
        onBeforeRebindTable: function(oEvent){
        
            var binding = oEvent.getParameter("bindingParams");
            binding.filters = [];
            var oFilter = new sap.ui.model.Filter("PURCHASE_REQUEST_NO", FilterOperator.EQ, prno);
            binding.filters.push(oFilter);        
        },
        _onRouteMatched: function (oEvent) {
            
           // 
            // BusyIndicator.hide();

             //Refresh smart table
             var oView = that.getView().byId("idOrderList")
             oView.rebindTable();
 

            this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
            prno = Number(oEvent.getParameters().arguments.PURCHASE_REQUEST_NO)
            // var selectedObject =  that.getOwnerComponent().getModel("RequestModel").getData();

            // var model = new JSONModel(selectedObject);
            // that.getView().setModel(model,"requestModel")

            // var myJSONModel = new JSONModel();
            // myJSONModel.setData(selectedObject);
            // that.getView().setModel(myJSONModel, "requestModel");
           
           
            // var RequestNo = Number(oEvent.getParameters().arguments.PO_Number)

            // previousData =that.getOwnerComponent().getModel("orderDetails").getData()

            
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);

            url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrHeader?$filter=PURCHASE_REQUEST_NO eq " + prno + "&$expand=TO_STATUS";
    
           that.readUserMasterEntities(url);
        //    that.readUserMasterEntities2(url);
           that.OpenEvent();

           var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
           var appPath = appId.replaceAll(".", "/");
           var appModulePath = jQuery.sap.getModulePath(appPath);
           var url2 = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrItems?$filter=PURCHASE_REQUEST_NO eq " + prno + "";
           that.oDataModel = this.getOwnerComponent().getModel();

           $.ajax({
               url: url2,
               type: 'GET',
               data: null,
               contentType: 'application/json',
               success: function (data, responce) {
                   // //
                   BusyIndicator.hide();
                   var tableitems = new JSONModel(data.d.results);
                   data.d.results.forEach(function (item) {
                    // Format the ORDER_QUANTITY to have two decimal places
                    item.ORDER_QUANTITY = parseFloat(item.ORDER_QUANTITY).toFixed(2);
                });
                //    data.ORDER_QUANTITY

                   tableitems.setSizeLimit(data.d.results.length);
                   that.getView().setModel(tableitems, "itemsModel");
                //    that.headerData();


              

                //    var headerprice=0
                //    var headerTax=0
                //     var headerGrand=0

                //    for (var i = 0; i < data.value.length; i++) {

                  

                //        headerprice += parseInt(data.value[i].NET_AMOUNT) * data.value[i].QUANTITY;

                //        var iTax = data.value[i].QUANTITY * parseInt(data.value[i].NET_AMOUNT) * ((data.value[i].TAXES_AMOUNT)/100)
                       
                //        var tableProTotal=  (data.value[i].QUANTITY * parseInt(data.value[i].NET_AMOUNT)) + iTax
                //        headerTax += data.value[i].QUANTITY * parseInt(data.value[i].NET_AMOUNT) * ((data.value[i].TAXES_AMOUNT)/100)
                //        headerGrand += tableProTotal
                //        that.getView().getModel("iModel").setProperty("/value/" + i + "/TABLE_TOTAL", tableProTotal);
                //    }
                   
                //    that.getView().getModel("iModel").setProperty("/Totamt", headerprice)
                //    that.getView().getModel("iModel").setProperty("/Totax", headerTax)
                //    that.getView().getModel("iModel").setProperty("/TotalIcTax", headerGrand)



                   

                //    var tableData = that.getView().getModel("iModel").getData().value
                //    var imodelLen = data.value.length;
                //    that.getView().byId("table").setVisibleRowCount(imodelLen);

               },
               error: function (e) {
                   ////
                   BusyIndicator.hide()
                   MessageBox.error(e.responseText);
               }
           });

           

              
           

        },

        readUserMasterEntities: function (url) {
            //
            BusyIndicator.show(0);
           
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    //
                    BusyIndicator.hide();
                    if(data.d.results[0].STATUS ===1){

                        // that.getView().byId("idSAPDocumentNumber").setVisible(false);
                        that.getView().byId("idsapdoc").setVisible(false);
                        // that.getView().byId("idreference").setVisible(false);
                    }
                    else if(data.d.results[0].STATUS ===2){

                        // that.getView().byId("idSAPDocumentNumber").setVisible(true);
                        that.getView().byId("idsapdoc").setVisible(true);
                        // that.getView().byId("idreference").setVisible(true);
                    }
                    var model = new JSONModel(data);
                    that.getView().setModel(model,"stockistDetails");

                },
                error: function (e) {
                    //
                    BusyIndicator.hide();
                    MessageBox.error(e.responseText);
                }
            });
        },
        onFullScreen: function () {

            if (this.getView().getModel("appView").getProperty("/layout") == "TwoColumnsMidExpanded") {
                this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
                this.getView().byId("idFullSc").setIcon("sap-icon://exit-full-screen");
                that.getView().byId("idTotalAmount").addStyleClass("sapUiLargeMarginBegin")
            } else {
                this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
                that.getView().byId("idTotalAmount").addStyleClass("sapUiTinyMarginBegin")
               
            }

        },
        onExit: function () {

            this.getView().getModel("appView").setProperty("/layout", "OneColumn");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMaster"
             
            );

            // that.getView().byId("sapNO").setVisible(false)
        },
        Content: function () {
            ////
            // BusyIndicator.show();
            // oDataModel.refresh(true);
    
            var dynamicSideContentState = this.getView().byId("DynamicSideContent").getShowSideContent();
            var iWindowWidth = window.innerWidth;
            if (dynamicSideContentState === true) {
                this.getView().byId("DynamicSideContent").setShowSideContent(false);
            }
            else {
                this.getView().byId("DynamicSideContent").setShowSideContent(true);
                if(iWindowWidth < 600){
                    this.onMainContent(false);
                }
            }
        },
        CloseEvent: function (oEvent) {
            this.getView().byId("DynamicSideContent").setShowSideContent(false);

        },
        OpenEvent :function (){
            //
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrEventLog?$expand=TO_EVENT_STATUS&$filter=PURCHASE_REQUEST_NO eq " + prno + "";

            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    ////
                    BusyIndicator.hide();
                    //  eventLog.setData(data);
                    var eventLog = new JSONModel(data);
                    that.getView().setModel(eventLog, "eventData");

                },
                error: function (e) {
                    ////
                    BusyIndicator.hide()
                    MessageBox.error(e.responseText);
                }
            });
        },
        printReq: function () {
            //
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            // var surl = appModulePath + "/odata/v4/ideal-purchase-creation-srv/CreatePurchase"
            var tabeldata = this.getView().getModel("itemsModel").getData();
            var headerData = this.getView().getModel("stockistDetails").getData();
            sessionStorage.setItem("itemsModel", JSON.stringify(tabeldata));
            sessionStorage.setItem("stockistDetails", JSON.stringify(headerData));
            // window.open("https://port8080-workspaces-ws-f2dfm.us10.applicationstudio.cloud.sap/print.html?PR_NO="  + prno )
            window.open(appModulePath + "/print.html?PR_NO=" + prno)
            // window.open( surl + "/print.html?PR_NO=" + prno);
        },
        onViewEventOpen:function(){
            var dynamicSideContentState = that.getView().byId("DynamicSideContent").getShowSideContent();
            if (dynamicSideContentState === true) {
                that.getView().byId("DynamicSideContent").setShowSideContent(false);
            }
            else {
                that.getView().byId("DynamicSideContent").setShowSideContent(true); 
            }
        },
        onViewEventHide: function(){
            that.getView().byId("DynamicSideContent").setShowSideContent(false);
        }


    });
});
