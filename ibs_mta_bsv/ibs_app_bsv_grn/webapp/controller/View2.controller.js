sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "com/ibs/bsv/ibsappbsvgrn/model/formatter",
    "sap/ui/export/library"
],
function (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel,formatter,down,exportLibrary) {
    "use strict";
    var that,invoiceNo,appId,appPath,appModulePath,aData;
    // var EdmType = exportLibrary.EdmType;
    return Controller.extend("com.ibs.bsv.ibsappbsvgrn.controller.View2", {
        formatter:formatter,
        onInit: function () {
            that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("View2");
            var getRoute = oRouter.getRoute("View2");
            getRoute.attachMatched(that._onRouteMatched, this);
        },
        _onRouteMatched:function(oEvent){
            
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            invoiceNo = oEvent.getParameter("arguments").InvoiceNo;
            that.getOwnerComponent().getModel("customerHeaderModel");
            aData = that.getOwnerComponent().getModel("customerHeaderModel");

            var vDeliveryAmount = that.getOwnerComponent().getModel("customerHeaderModel").oData.DeliveryAmount;
            var vDeliveryTaxAmount = that.getOwnerComponent().getModel("customerHeaderModel").oData.DeliveryAmountTax;

            var vTotalAmount = Number(vDeliveryAmount) + Number(vDeliveryTaxAmount);

            that.getView().getModel("customerHeaderModel").setProperty("/TotalAmount",vTotalAmount);
        },
        onNavBar:function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
        },
        // onConfirm:function(){
        //     MessageBox.information("Are you sure you want to accept GRN?",{
        //         actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        //         onClose: function (Action) {
        //             if(Action === "YES"){
        //                 that.onAccept();
        //             }
        //         }
        //     });
        // },
        // onAccept:function(){
        //     ;
        //     BusyIndicator.show();
        //     var aItems = [];
        //     for(var i = 0;i<aData.oData.GRNHEADTOITEM.results.length;i++){
        //         var oItems = {
        //             INVOICE_NO : aData.oData.GRNHEADTOITEM.results[i].InvoiceNo,
        //             ITEM_NO : Number(aData.oData.GRNHEADTOITEM.results[i].InvoiceItem),
        //             MATERIAL_GROUP : "",
        //             MATERIAL_GROUP_DESC : "",
        //             MATERIAL_CODE : aData.oData.GRNHEADTOITEM.results[i].MaterialCode,
        //             MATERIAL_DESC : aData.oData.GRNHEADTOITEM.results[i].MaterialDesc,
        //             BATCH : aData.oData.GRNHEADTOITEM.results[i].Batch,
        //             EXPIRY_DATE : "2024-08-08",
        //             HSN_CODE : "",
        //             UNIT_OF_MEASURE : aData.oData.GRNHEADTOITEM.results[i].Uom,
        //             UNIT_PRICE : aData.oData.GRNHEADTOITEM.results[i].MrpPrice,
        //             PTR_PRICE : aData.oData.GRNHEADTOITEM.results[i].PtrPrice,
        //             PTS_PRICE : aData.oData.GRNHEADTOITEM.results[i].PtsPrice,
        //             OPENING_STOCK : "",
        //             QUANTITY : aData.oData.GRNHEADTOITEM.results[i].Quantity,
        //             ACCEPTED_QUANTITY : aData.oData.GRNHEADTOITEM.results[i].Quantity,
        //             CGST_PERC : aData.oData.GRNHEADTOITEM.results[i].CgstPercentage,
        //             CGST_AMOUNT : "",
        //             SGST_PERC : aData.oData.GRNHEADTOITEM.results[i].SgstPercentage,
        //             SGST_AMOUNT : "",
        //             IGST_PERC : aData.oData.GRNHEADTOITEM.results[i].IgstPercentage,
        //             IGST_AMOUNT : "",
        //             TAX_AMOUNT : "0.00",
        //             TOTAL_AMOUNT : "0.00"
        //         }
        //         aItems.push(oItems);
        //     }
        //     var vDeliveryDate =new Date(aData.oData.DeliveryDate);
        //     var vInvoiceDate =  new Date(aData.oData.InvoiceDate);
        //     var vDeliveryDateCon = vDeliveryDate.toISOString().split('T')[0];
        //     var vInvoiceDateCon = vInvoiceDate.toISOString().split('T')[0];
        //     var payload = {
        //         "sAction":"ACCEPT",
        //         "aGrnHeader":[{
        //             STOCKIST_ID :aData.oData.StockistId,
        //             STOCKIST_NAME :"",
        //             DELIVERY_NO :aData.oData.DeliveryNo,
        //             INVOICE_NO :aData.oData.InvoiceNo,
        //             INVOICE_DATE :vInvoiceDateCon,
        //             DELIVERY_DATE :vDeliveryDateCon,
        //             ACCEPTED_DATE :"2024-08-08",
        //             INVOICE_AMOUNT :aData.oData.DeliveryAmount,
        //             STATUS :1,
        //             SAP_ORDER_NO :aData.oData.SalesorderNo                            

        //         }],
        //         "aGrnItems":aItems,
        //         "oUserDetails":{
        //             "USER_ROLE" : "STOCKIST",
        //             "USER_ID"   : "V.J@gmail.com"
        //         }
        //     }

        //     var url = appModulePath + "/odata/v4/ideal-bsv-grn-srv/AcceptGrn";
        //     var Postdata = JSON.stringify(payload);
        //     $.ajax({
        //         url: url,
        //         type: 'POST',
        //         data: Postdata,
        //         contentType: 'application/json',
        //         success: function (data, responce) {
        //             
        //             BusyIndicator.hide();
        //             MessageBox.success(data.value, {
        //                 actions: [MessageBox.Action.OK],
        //                 onClose: function (oAction) {
        //                     if (oAction === "OK") {
        //                         BusyIndicator.hide();
        //                         var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
        //                         oRouter.navTo("RouteView1");
        //                     }
        //                 }
        //             });
        //         },
        //         error: function (e) {
        //             BusyIndicator.hide();
        //             var oXMLMsg, oXML;
        //             if (that.isValidJsonString(e.responseText)) {
        //                 oXML = JSON.parse(e.responseText);
        //                 oXMLMsg = oXML.error["message"];
        //             } else {
        //                 oXMLMsg = e.responseText;
        //             }
        //             MessageBox.error(oXMLMsg);
        //         }
        //     })
        // }
    });
});
