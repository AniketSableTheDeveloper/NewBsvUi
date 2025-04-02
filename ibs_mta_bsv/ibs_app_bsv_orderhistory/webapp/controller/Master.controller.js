sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvorderhistory/model/formatter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
],
function (Controller,MessageBox,JSONModel,Filter,FilterOperator,BusyIndicator,formatter,exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var that;
    var oDataModel;
    var login_ID;
    var PropertyModel;

    return Controller.extend("com.ibs.bsv.ibsappbsvorderhistory.controller.Master", {
        formatter:formatter,
        onInit: function () {
            that = this;
            oDataModel = that.getOwnerComponent().getModel();
            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");

            PropertyModel.setProperty("/Count","Total Entries");

            that.checkDevice();
            that._userdetails();
          
        },

         // added 22-10-2024
         _userdetails: function () {

            var url;
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            url = appModulePath + "/user-api/attributes";

            // login_ID ="101486" // when run locally.
            // that.readInvHeader(login_ID);


            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, response) {
                        ;
                        login_ID = data.name;
                        // login_ID = data.login_name[0];
                        // data = JSON.parse(data);


                        that.readInvHeader(login_ID);

                    },
                    error: function (oError) {
                        
                    }
                });
            }); // after deploy




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
},



        readInvHeader:function(login_ID)
        {
            BusyIndicator.show(0)
            var filter = new Filter("StockistId","EQ",login_ID);

            oDataModel.read("/INV_HEADERSet",{
                filters:[filter],
                success:function(Data,response)
                {
                    

                    var count = Data.results.length;
                    for(var i = 0; i<Data.results.length;i++)
                    {
                        if(Data.results[i].Ackdate)
                        {
                            var a = Data.results[i].Ackdate
                            var b = a.split(" ");
                            var c = b[0];
                            var d = c.replaceAll("-","/");
                            Data.results[i].Ackdate = d;
                        }
                        if( Data.results[i].InvoiceAmount)
                        {
                            var a =  Data.results[i].InvoiceAmount;
                            var b = Number(a);
                            var c = b.toLocaleString("en-IN");
                            Data.results[i].InvoiceAmount = c;

                        }
                        if( Data.results[i].InvoiceAmountTax)
                        {
                            var a =  Data.results[i].InvoiceAmountTax;
                            var b = Number(a);
                            var c = b.toLocaleString("en-IN");
                            Data.results[i].InvoiceAmountTax = c;

                        }
                        if(Data.results[i].Irn === "" || Data.results[i].Irn === undefined || Data.results[i].Irn === null )
                        {
                            Data.results[i].Irn = "NA";
                        }
                        if(Data.results[i].Ackno === "" || Data.results[i].Ackno === undefined || Data.results[i].Ackno === null )
                        {
                            Data.results[i].Ackno = "NA";
                        }
                        if(Data.results[i].Ackdate === "" || Data.results[i].Ackdate === undefined || Data.results[i].Ackdate === null )
                        {
                            Data.results[i].Ackdate = "NA";
                        }
                        if(Data.results[i].EwayBillNo === "" || Data.results[i].EwayBillNo === undefined || Data.results[i].EwayBillNo === null )
                        {
                            Data.results[i].EwayBillNo = "NA";
                        }
                    }

                    PropertyModel.setProperty("/Count", "Total Entries (" + count + ")");
                    var oModel = new JSONModel(Data.results);
                    that.getView().setModel(oModel,"InvHeader");
                    BusyIndicator.hide()
                },
                error:function(Error)
                {
                    MessageBox.error(Error.responseText)
                    BusyIndicator.hide()
                }

            });
        },

        //FilterBar Go
        onSearch: function () {
            var oDateRangeSelection = this.byId("idDateRangeSelection");
            var oStartDate = oDateRangeSelection.getDateValue(); // Start date
            var oEndDate = oDateRangeSelection.getSecondDateValue(); // End date
            var aFilters = [];
        
            if (oStartDate && oEndDate) {
                // Remove time components for date-only comparison
                var oStartDateOnly = new Date(oStartDate.setHours(0, 0, 0, 0));
                var oEndDateOnly = new Date(oEndDate.setHours(23, 59, 59, 999));
        
                // Create filter for InvoiceDate
                var oDateFilter = new sap.ui.model.Filter({
                    path: "InvoiceDate",
                    operator: sap.ui.model.FilterOperator.BT, // Between operator
                    value1: oStartDateOnly,
                    value2: oEndDateOnly
                });
        
                aFilters.push(oDateFilter);
            }
        
            // Get the table and apply the filters
            var oTable = this.byId("idMasterTable");
            var oBinding = oTable.getBinding("rows");
            oBinding.filter(aFilters, sap.ui.model.FilterType.Application);
        
            // Use setTimeout to update count after filter is applied
            setTimeout(function() {
                var count = oBinding.getLength();
                var PropertyModel = this.getView().getModel("PropertyModel");
                PropertyModel.setProperty("/Count", "Total Entries (" + count + ")");
            }.bind(this), 0);
        },

        onReset: function () {
           
            that.getView().byId("idDateRangeSelection").setValue()
            that.getView().byId("idSearch").setValue()
            that.readInvHeader(login_ID);
       
       
        },

        



        // SearchField code.
        onSearchLive: function (oEvent) {
            // Get the search query
            var sQuery = oEvent.getSource().getValue();
        
            // Initialize an array for filters
            var aFilters = [];
        
            // Check if the search query is not empty
            if (sQuery) {
                // Create filters for Trans and SalesorderNo
                var oTransFilter = new sap.ui.model.Filter("Trans", sap.ui.model.FilterOperator.Contains, sQuery);
                var oSalesOrderFilter = new sap.ui.model.Filter("SalesorderNo", sap.ui.model.FilterOperator.Contains, sQuery);
                var DeliveryNo = new sap.ui.model.Filter("DeliveryNo", sap.ui.model.FilterOperator.Contains, sQuery);
        
                // Combine both filters with an OR condition
                aFilters.push(new sap.ui.model.Filter({
                    filters: [oTransFilter, oSalesOrderFilter,DeliveryNo],
                    and: false // OR condition
                }));
            }
        
            // Get the binding of the table and apply the filters
            var oTable = this.byId("idMasterTable");
            var oBinding = oTable.getBinding("rows");
            oBinding.filter(aFilters);
            var iCount = oBinding.getLength(); // Get the count of filtered items

                    PropertyModel.setProperty("/Count", "Total Entries (" + iCount + ")");
        },

        onDownloadExcel: function () {
            

            var aCols, oRowBinding, oSettings, oSheet, oTable;

            var oModel = that.getView().getModel("InvHeader").getData();
            if (!this._oTable) {
                this._oTable = this.byId('idMasterTable');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oModel,  // Pass the updated model with formatted dates
                fileName: 'OrderHistory.xlsx',
                worker: false // Disable worker for MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                label: 'Sales Order No',
                property: ['SalesorderNo'],
                type: EdmType.String
            });

            aCols.push({
                label: 'Delivery No',
                type: EdmType.String,
                property: ['DeliveryNo'],
                scale: 0
            });

            aCols.push({
                property: 'InvoiceNo',
                type: EdmType.String,
                label: "Invoice No",
                delimiter: true
            });

            aCols.push({
                property: 'Lrno',
                type: EdmType.String,
                label: "LR No."
            });
            aCols.push({
                property: 'Lrdat',
                type: EdmType.String,
                label: "LR Date"
            });
            aCols.push({
                property: 'Trans',
                type: EdmType.String,
                label: "Transporter"
            });
            aCols.push({
                property: 'InvoiceAmount',
                type: EdmType.String,
                label: "Invoice Amount"
            });
            aCols.push({
                property: 'InvoiceAmountTax',
                type: EdmType.String,
                label: "Invoice Amount Tax"
            });
            aCols.push({
                property: 'Irn',
                type: EdmType.String,
                label: "IRN"
            });
            aCols.push({
                property: 'Ackno',
                type: EdmType.String,
                label: "Ack No"
            });
            aCols.push({
                property: 'Ackdate',
                type: EdmType.String,
                label: "Ack Date"
            });
            aCols.push({
                property: 'EwayBillNo',
                type: EdmType.String,
                label: "Eway Bill No"
            });


            

            return aCols;
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
        onNavigateLedger: function (oEvent) {
            // 

            var param = {};
            var oSemantic = "customer_ledger";
            var hash = {};
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: oSemantic,
                    action: "Display"
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


        onNavigateOrderStatus: function (oEvent) {
            // var param = {};
            var param = { "OrderStatus": "OST" };
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


        // onNavigateStocks: function (oEvent) {


        //     // var param = {};
        //     var param = {};
        //     var oSemantic = "StockDetails";
        //     var hash = {};
        //     var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
        //     var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
        //         target: {
        //             semanticObject: oSemantic,
        //             action: "display"
        //         }
        //         ,
        //         params: param
        //     })); // generate the Hash to display a Supplier

        //     //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
        //     oCrossAppNavigator.toExternal({
        //         target: {
        //             shellHash: hash
        //         }
        //     });
        // },
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



        onNavigateGRNReport0710: function (oEvent) {
            // var param = {};
            var param = {};
            var oSemantic = "grn_report";
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
        }


        
        
    });
});
