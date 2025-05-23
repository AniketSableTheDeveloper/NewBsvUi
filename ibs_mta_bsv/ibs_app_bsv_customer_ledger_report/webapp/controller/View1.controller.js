sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "com/ibs/bsv/ibsappbsvcustomerledgerreport/model/formatter",
    "com/ibs/bsv/ibsappbsvcustomerledgerreport/model/down",
    "sap/ui/export/library"
],
function (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel,formatter,down,exportLibrary) {
    "use strict";
    var that,appId,appPath,appModulePath;
    var PropertyModel
    var EdmType = exportLibrary.EdmType;
    return Controller.extend("com.ibs.bsv.ibsappbsvcustomerledgerreport.controller.View1", {
        formatter:formatter,
        onInit: function () {
            that=this;

            // sap.ushell.Container.getRenderer(
            //     "fiori2"
            //     ).hideHeaderItem(
            //     "backBtn"
            //     , false);
                
            that.oDataModel = this.getOwnerComponent().getModel();
            that.getUserAttributes();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteView1").attachMatched(this._onRouteMatched, this);

            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
          
        },
        _onRouteMatched: async function(){
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            that.checkDevice();
        },
        onClear:function(){
        
        this.getView().byId("status").setSelectedKey();
        this.getView().byId("FromDateId").setValue();
        this.getView().byId("ToDateId").setValue();
        this.getView().byId("FromDateId").setEditable(true);
        this.getView().byId("ToDateId").setEditable(true);

        },
        onStatus:function(){
            
            if(this.getView().byId("status").getSelectedKey() === "1"){
                this.getView().byId("FromDateId").setValue();
                this.getView().byId("ToDateId").setValue();
                var vValidFrom = new Date();
                var vValidFromCon = vValidFrom.toISOString().split('T')[0];
                this.getView().byId("FromDateId").setValue(vValidFromCon);
                this.getView().byId("ToDateId").setValue(vValidFromCon);
                this.getView().byId("FromDateId").setEditable(false);
                this.getView().byId("ToDateId").setEditable(false);
            }
            else{
                this.getView().byId("FromDateId").setValue();
                this.getView().byId("ToDateId").setValue();
                this.getView().byId("FromDateId").setEditable(true);
                this.getView().byId("ToDateId").setEditable(true);
            }
          
        },
        onReadS4:function(oEvent){
            
            var oUserData = that.getOwnerComponent().getModel("userModel");
            var oAmount = {
                vCr : 0,
                vDr : 0
            }
            var oModelCrDr = new JSONModel(oAmount);
			that.getView().setModel(oModelCrDr,"StockistDataCrDr");

            var oModel = new JSONModel();
            that.getView().setModel(oModel,"StockistDataS4");

            var vDateTo = new Date();
            var oToModel = new JSONModel({
                maxDate: new Date(vDateTo.setDate(vDateTo.getDate()))
            });
            that.getView().setModel(oToModel, "ToModel");
            
            var vstatus = this.getView().byId("status").getSelectedKey();
            var vFromDate = this.getView().byId("FromDateId").getValue();
            var vToDate =  this.getView().byId("ToDateId").getValue();
            if((vstatus === '' || vstatus === null || vstatus === undefined) && (vFromDate || vToDate))
            {
                MessageBox.warning("Please select status")
                BusyIndicator.hide();
                return;
            }
            if(vstatus === ''||vstatus === null || vstatus === undefined)
            {
                BusyIndicator.show();
                var oModel = new JSONModel();
                that.getView().setModel(oModel,"StockistDataS4");
                BusyIndicator.hide();
            }
            else{
                
                var aFilter = [];
            if(vstatus === "1"){
                var vValidFrom = new Date();
                var vValidFromCon = vValidFrom.toISOString().split('T')[0];
                var oFilter = new sap.ui.model.Filter("StockistId", sap.ui.model.FilterOperator.EQ, oUserData.oData.loginName);
                aFilter.push(oFilter);
                var oFilter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, vstatus);
                aFilter.push(oFilter1);
                var oFilter2 = new sap.ui.model.Filter("FromDate", sap.ui.model.FilterOperator.EQ, vValidFromCon);
                aFilter.push(oFilter2);
                var oFilter3 = new sap.ui.model.Filter("ToDate", sap.ui.model.FilterOperator.EQ, vValidFromCon);
                aFilter.push(oFilter3);
            }
            else{
                if(vFromDate === "" || vToDate === "" || vFromDate === null || vToDate === null || vFromDate === undefined || vToDate === undefined)
                {
                    MessageBox.warning("Please select date")
                    BusyIndicator.hide();
                    return;
                }
                var vValidFrom = new Date(this.getView().byId("FromDateId").getValue());
                vValidFrom.setHours(vValidFrom.getHours() + 5);
                vValidFrom.setMinutes(vValidFrom.getMinutes() + 30);
                var vValidTo =  new Date(this.getView().byId("ToDateId").getValue());
                vValidTo.setHours(vValidTo.getHours() + 5);
                vValidTo.setMinutes(vValidTo.getMinutes() + 30);
                var vValidFromCon = vValidFrom.toISOString().split('T')[0];
                var vValidToCon = vValidTo.toISOString().split('T')[0];
            
                var oFilter = new sap.ui.model.Filter("StockistId", sap.ui.model.FilterOperator.EQ, oUserData.oData.loginName);
                aFilter.push(oFilter);
                var oFilter1 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, vstatus);
                aFilter.push(oFilter1);
                var oFilter2 = new sap.ui.model.Filter("FromDate", sap.ui.model.FilterOperator.EQ, vValidFromCon);
                aFilter.push(oFilter2);
                var oFilter3 = new sap.ui.model.Filter("ToDate", sap.ui.model.FilterOperator.EQ, vValidToCon);
                aFilter.push(oFilter3);
            }
            BusyIndicator.show();
            that.oDataModel.read("/CUSTOMER_LEDGERSet", {
                filters : aFilter,
                success: function (data) {
                    
                    var oAmount = {
                        vCr : 0,
                        vDr : 0
                    }
                    // var vCr = 0;
					// var vDr = 0;
					for(var i = 0;i<data.results.length;i++)
					{
						oAmount.vCr = oAmount.vCr + Number(data.results[i].LocalCurrencyAmountcr);
						oAmount.vDr = oAmount.vDr + Number(data.results[i].LocalCurrencyAmount);
					}
                    var oModelCrDr = new JSONModel(oAmount);
					that.getView().setModel(oModelCrDr,"StockistDataCrDr");
                    
                    BusyIndicator.hide();
                    // for(var i = 0;i<data.results.length;i++){
                    //     delete data.results[i].ToDate;
                    // }
                    var oModel = new JSONModel(data);
                    that.getView().setModel(oModel,"StockistDataS4");
                    
                    // that.getView().byId("idCustomerLedgerTbl").setVisibleRowCount(data.results.length);
                },
                error: function (e) {
                    BusyIndicator.hide();
                    var oXMLMsg, oXML;
                    if (that.isValidJsonString(e.responseText)) {
                        oXML = JSON.parse(e.responseText);
                        oXMLMsg = oXML.error["message"].value;
                    } else {
                        oXMLMsg = e.responseText;
                    }
                    MessageBox.error(oXMLMsg);
                    // MessageBox.information("Update Under Process");
                }
            });
            }
        },
        OnSearch:function(oEvent){
            
            that.onReadS4();
        },
        onFromDate:function(oEvent){
            
            that.getView().byId("ToDateId").setValue();
            var vDate = new Date(oEvent.getParameters().value);
            var oFromModel = new JSONModel({
                minDate: new Date(vDate.setDate(vDate.getDate()+1))
            });
            that.getView().setModel(oFromModel, "FromModel");

        },
        isValidJsonString: function (sDataString) {
			var value = null;
			var oArrObj = null;
			var sErrorMessage = "";
			try {
				if (sDataString === null || sDataString === "" || sDataString === undefined) {
					throw "No data found.";
				}
				value = JSON.parse(sDataString);
				if (toString.call(value) === '[object Object]' && Object.keys(value).length > 0) {
					return true;
				} else {
					throw "Error";
				}
			} catch (errorMsg) {
				if (errorMsg === "No data found.") {
					sErrorMessage = errorMsg;
				} else {
					sErrorMessage = "Invalid JSON data."
				}
				return false;
			}
        	return true;
		},
        onBeforeExport: function(oEvent) {
            var oExportSettings = oEvent.getParameter("exportSettings");
            var aColumns = oExportSettings.workbook.columns;

            var iDocDateColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "DocumentsDate";
            });
            var iNetDueDateColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "NetdueDate";
            });
            var iFromDateColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "FromDate";
            });
           
            if (iDocDateColumnIndex !== -1 || iNetDueDateColumnIndex !== -1 || iFromDateColumnIndex !== -1) {
                aColumns[iDocDateColumnIndex] = {
                    label: 'Document Date',
                    type: EdmType.Date,
                    property: 'DocumentsDate',
                    textAlign: 'Center',
                    inputFormat: 'yyyymmdd',
                    format:'dd.mm.yyyy'                    
                }
                aColumns[iNetDueDateColumnIndex] = {
                    label: 'Net Due Date',
                    type: EdmType.Date,
                    property: 'NetdueDate',
                    textAlign: 'Center',
                    inputFormat: 'yyyymmdd',
                    format:'dd.mm.yyyy'
                }
                aColumns[iFromDateColumnIndex] = {
                    label: 'Posting Date',
                    type: EdmType.Date,
                    property: 'FromDate',
                    textAlign: 'Center',
                    inputFormat: 'yyyymmdd',
                    format:'dd.mm.yyyy'                    
                }
            }
        },
        getUserAttributes:function(){
            that = this;
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            // var obj = {
            //     userId: "rkpharmabp@gmail.com",
            //     userName: "RK Pharma",
            //     loginName: 101023
            // }
            // var oModel = new JSONModel(obj);
            // that.getOwnerComponent().setModel(oModel, "userModel");

            var attr = appModulePath + "/user-api/attributes";
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: attr,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, response) {
                        
                        // if(data.Groups[0] !== "BSV_STOCKIST_ROLE"){
                        //         MessageBox.error("Only Stockists are allowed to login");
                        // }
                        var obj = {
                            userId: data.email.toLowerCase(),
                            userName: data.firstname + " " + data.lastname,
                            loginName: data.name
                            // login_name[0]
                        }
                        var oModel = new JSONModel(obj);
                        that.getOwnerComponent().setModel(oModel, "userModel");
                    },
                    error: function (oError) {
                        // 
                        MessageBox.error("Error while reading User Attributes");
                    }
                });
            });
        },
        onNavigateDashboard: function (oEvent) {
            // var param = {};
            var param = {};
            var oSemantic = "dashboard";
            var hash = {};
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: oSemantic,
                    action: "display"
                }
                ,
                params: param
            })); // generate the Hash to display a Supplier
          
            //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
          },

          onNavigateOrderStatus: function (oEvent) {
            // var param = {};
            var param = {"OrderStatus":"OST"};
            var oSemantic = "orderstatustracking";
            var hash = {};
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: oSemantic,
                    action: "display"
                }
                ,
                params: param
            })); // generate the Hash to display a Supplier

            //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
        },

        
        onNavigateOrderCreation: function (oEvent) {
            // 

            var param = {};
            var oSemantic = "procreation";
            var hash = {};
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: oSemantic,
                    action: "display"
                }
                ,
                params: param
            })) || ""; // generate the Hash to display a Supplier


            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
        },


        
            onNavigateGRNReport: async function (oEvent) {
                var param = {}; // Define any parameters you need here
                var oSemantic = "grn_report"; // Define your semantic object
            
                try {
                    // Asynchronously get the CrossApplicationNavigation service
                    const oCrossAppNavigator = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
            
                    if (oCrossAppNavigator) {
                        // Generate the hash for the target application
                        var hash = oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: oSemantic,
                                action: "display"
                            },
                            params: param
                        });
            
                        // Trigger the navigation using the generated hash
                        oCrossAppNavigator.toExternal({
                            target: {
                                shellHash: hash
                            }
                        });
                    } else {
                        console.error("CrossApplicationNavigation service is not available.");
                    }
                } catch (error) {
                    console.error("Error during cross-app navigation:", error);
                }
            },
            onNavigateOrderHistory: function (oEvent) {
                // 

                var param = {};
                var oSemantic = "orderhistory";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })) || ""; // generate the Hash to display a Supplier

                //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            onNavigateGRN: function (oEvent) {


                // var param = {};
                var param = {};
                var oSemantic = "grn";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })); // generate the Hash to display a Supplier

                //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            
        onNavigateScheme: function (oEvent) {
            // var param = {};
            var param = {};
            var oSemantic = "dashboard";
            var hash = {};
            var additionalHash ="&/Scheme"
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: oSemantic,
                    action: "display"
                }
                ,
                params: param
            })); // generate the Hash to display a Supplier
          
            //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash + additionalHash
                }
            });
          },
          
            // Device funtion check (Phone/Tablet/Desktop)
            checkDevice: function () {

                if (sap.ui.Device.system.phone === true) {
                
                    PropertyModel.setProperty("/Menu", true);
                    PropertyModel.setProperty("/HBOx", false);
                    
                }
                else if (sap.ui.Device.system.tablet === true) {

         
                    PropertyModel.setProperty("/Menu", true);
                    PropertyModel.setProperty("/HBOx", false);
                    
                }

                else if (sap.ui.Device.system.desktop === true) {

                    PropertyModel.setProperty("/Menu", false);
                    PropertyModel.setProperty("/HBOx", true);
                   
                }
            }
            

          
    });
});
