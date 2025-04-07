sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/ibs/bsv/ibsappbsvdashboard/model/formatter",
    "sap/ushell/appRuntime/ui5/services/CrossApplicationNavigation",
    "sap/ui/Device",
    "com/ibs/bsv/ibsappbsvdashboard/model/down"
],
    function (Controller, JSONModel, MessageBox, BusyIndicator, Sorter, Filter, FilterOperator, formatter, CrossApplicationNavigation, Device, down) {
        "use strict";
        var that;
        var oDataModel;
        var stockist;
        var url;
        var that;
        var oDataModel;
        var sapModel;
        var PropertyModel;
        var login_ID;
        var broadcastIds = [];
        var appId, appPath, appModulePath;
        return Controller.extend("com.ibs.bsv.ibsappbsvdashboard.controller.Master", {
            formatter: formatter,
            onInit: function () {
                that = this;
                PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
                oDataModel = that.getOwnerComponent().getModel();
                sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteMaster").attachPatternMatched(this._onRouteMatched, this);
                that.checkDevice();
                // var userInfo = sap.ushell.Container.getService("UserInfo");
                // var userName = userInfo.getId();
            },

            _onRouteMatched: function (oEvent) {
                PropertyModel.setProperty("/CircularButton", false)
                PropertyModel.setProperty("/MessageStrip", false)
                appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                that._userdetails();
                // sap.ushell.Container.getService("UserInfo").getUser()


                // var userInfo = sap.ushell.Container.getService("UserInfo");
                // var userName = userInfo.getId();

                that.readSchemeHeader();
            },

            // User Attributes function to fetch login user's code/
            _userdetails: function () {
                var url;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                // url = appModulePath + "/user-api/currentUser";
                url = appModulePath + "/user-api/attributes";
                
                // login_ID = "100555"
                // that.readLatestData(login_ID);
                // that.readCredit(login_ID);
                // that.readOutstanding(login_ID);  // locally
        
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, response) {
                            login_ID = data.name // fetching login_name value to name property
                            // login_ID = data.login_name[0]; // commented on 26-11-2024 
                            that.readLatestData(login_ID);
                            that.readCredit(login_ID);
                            that.readOutstanding(login_ID); 
                          
                        },
                        error: function (oError) {

                            MessageBox.error(oError.responseText);
                        }
                    });
                }); // after deploy
                
            },

        
          

            // Added by Aniket Sable
            readLatestData: function (login_ID) {
                BusyIndicator.show(0);
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrHeader?$filter=STOCKIST_ID eq '" + login_ID + "'&$expand=TO_STATUS&$orderby=PURCHASE_REQUEST_NO desc&$top=5";
                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, response) {
                       
                        var model = new JSONModel(data.d.results);
                        that.getView().setModel(model, "prlastest");
                        BusyIndicator.hide();
                    },
                    error: function (e) {
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },

            // To Navigate New Sales Order App
            onNavigateOrderCreation: function (oEvent) {
                var param = {};
                var oSemantic = "procreation";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })) || "";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            //To Navigate Stockist Ledger Report App
            onNavigateLedger: function (oEvent) {
                var param = {};
                var oSemantic = "customer_ledger";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "Display"
                    }
                    ,
                    params: param
                })) || "";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            //TO Navigate Order History App
            onNavigateOrderHistory: function (oEvent) {
                var param = {};
                var oSemantic = "orderhistory";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })) || "";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
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
            // To Navigate Order Status App
            onNavigateOrderStatus: function (oEvent) {
                var param = { "OrderStatus": "OST" };
                var oSemantic = "orderstatustracking";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            // To Navigate GRN App
            onNavigateGRN: function (oEvent) {
                var param = {};
                var oSemantic = "grn";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            // To Navigate GRN Report
            onNavigateGRNReport: async function (oEvent) {
                var param = {};
                var oSemantic = "grn_report";
                try {
                    const oCrossAppNavigator = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
                    if (oCrossAppNavigator) {
                        var hash = oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: oSemantic,
                                action: "display"
                            },
                            params: param
                        });
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

            //To Navigate Scheme
            onNavigateScheme: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Scheme");
            },

            // Read STOCKISTCREDITDETAILSSet function
            readCredit: function (login_ID) {
                BusyIndicator.show(0);
                var stockist = login_ID
                var aFilters = new Filter("StockistId", "EQ", stockist);
                sapModel.read("/STOCKISTCREDITDETAILSSet", {
                    filters: [aFilters],
                    success: function (Data, response) {
                        BusyIndicator.hide();
                        var model = new JSONModel(Data);
                        that.getView().setModel(model, "creditdetails");
                    },
                    error: function (Error) {
                        BusyIndicator.hide();
                        MessageBox.error(Error.responseText);
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
            },

            // Read CUSTOMER_OUTSTANDINGSet function
            readOutstanding: function (login_ID) {
                var stockist = login_ID
                var filter = new Filter("StockistId", "EQ", stockist);
                sapModel.read("/CUSTOMER_OUTSTANDINGSet", {
                    filters: [filter],
                    success: function (Data, response) {
                        var model = new JSONModel(Data);
                        that.getView().setModel(model, "outStdning");
                    },
                    error: function (Error) {
                        MessageBox.error(Error.responseText)
                    }
                });
            },
            
            // New code added 18-11-2024 setHours
            readSchemeHeader: function () {
                BusyIndicator.show(0);
                // 
            
                // Get the current date without time (set hours, minutes, seconds, and milliseconds to 0)
                var currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
            
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeHeader?$expand=TO_ATTACHMENT";
            
                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, response) {
                        // 
                        BusyIndicator.hide();
            
                        var comment = "";
                        var count = 0;
            
                        // Loop through results and apply filter
                        for (var i = 0; i < data.d.results.length; i++) {
                            var result = data.d.results[i];
            
                            // Convert VALID_FROM and VALID_TO to JavaScript dates
                            var validFrom = new Date(parseInt(result.VALID_FROM.match(/\d+/)[0]));
                            var validTo = new Date(parseInt(result.VALID_TO.match(/\d+/)[0]));
            
                            // Normalize validFrom and validTo by removing time component
                            validFrom.setHours(0, 0, 0, 0);
                            validTo.setHours(0, 0, 0, 0);
            
                            // Check if currentDate is within validFrom and validTo range
                            if (currentDate >= validFrom && currentDate <= validTo) {
                                // Process the valid record
                                if (result.TO_ATTACHMENT) {
                                    PropertyModel.setProperty("/CircularButton", true);
                                }
                                if(!result.TO_ATTACHMENT){
                                    PropertyModel.setProperty("/CircularButton", false);
                                }
                                if (result.TYPE === "Broadcast") {
                                    PropertyModel.setProperty("/MessageStrip", true);
                                    var object = {
                                        referenceId: result.REFERENCE_ID
                                    };
                                    broadcastIds.push(object);
                                    if (count === 0) {
                                        count++;
                                        comment = "🔔" + result.COMMENTS;
                                    } else {
                                        comment = comment + ".🔔 " + result.COMMENTS;
                                    }
                                }
                            }
                        }
            
                        // If no valid records, reset properties
                        if (count === 0) {
                            PropertyModel.setProperty("/CircularButton", false);
                            PropertyModel.setProperty("/MessageStrip", false);
                        }
                        PropertyModel.setProperty("/comment", comment);
                    },
                    error: function (e) {
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            

            readSchemeHeader1811: function () {
                BusyIndicator.show(0);
            
                var currentdate = new Date();
                var currentTimestamp = currentdate.getTime(); // Current timestamp in milliseconds
            
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeHeader?$expand=TO_ATTACHMENT";
            
                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, response) {
                        // 
                        BusyIndicator.hide();
            
                        var comment = "";
                        var count = 0;
            
                        // Loop through results and apply filter
                        for (var i = 0; i < data.d.results.length; i++) {
                            var result = data.d.results[i];
            
                            // Convert VALID_FROM and VALID_TO to JavaScript dates
                            var validFrom = new Date(parseInt(result.VALID_FROM.match(/\d+/)[0]));
                            var validTo = new Date(parseInt(result.VALID_TO.match(/\d+/)[0]));
            
                            // Check if current date is between VALID_FROM and VALID_TO
                            if (currentTimestamp >= validFrom.getTime() && currentTimestamp <= validTo.getTime()) {
                                // Process the valid record
                                if (result.TO_ATTACHMENT) {
                                    PropertyModel.setProperty("/CircularButton", true);
                                }
                                if (result.TYPE === "Broadcast") {
                                    PropertyModel.setProperty("/MessageStrip", true);
                                    var object = {
                                        referenceId: result.REFERENCE_ID
                                    };
                                    broadcastIds.push(object);
                                    if (count === 0) {
                                        count++;
                                        comment = "🔔" + result.COMMENTS;
                                    } else {
                                        comment = comment + ".🔔 " + result.COMMENTS;
                                    }
                                }
                            }
                        }
            
                        // If no valid records, reset properties
                        if (count === 0) {
                            PropertyModel.setProperty("/CircularButton", false);
                            PropertyModel.setProperty("/MessageStrip", false);
                        }
                        PropertyModel.setProperty("/comment", comment);
                    },
                    error: function (e) {
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            

            // // Read SchemeHeader function
            // readSchemeHeader: function () {
            //     BusyIndicator.show(0);
            //     var currentdate = new Date()
            //     var isoDate = currentdate.toISOString();
            //     var currentdate = new Date();
            //     var lastDateOfMonth = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 0);
            //     var isoLastDate = lastDateOfMonth.toISOString();
            //     var year = lastDateOfMonth.getFullYear();
            //     var month = String(lastDateOfMonth.getMonth() + 1).padStart(2, '0');
            //     var day = String(lastDateOfMonth.getDate()).padStart(2, '0');
            //     var formattedDate = `${year}-${month}-${day}`;
            //     var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            //     var appPath = appId.replaceAll(".", "/");
            //     var appModulePath = jQuery.sap.getModulePath(appPath);
            //     var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeHeader?$expand=TO_ATTACHMENT";
            //     var checkBroadcast = false;
            //     $.ajax({
            //         url: url,
            //         type: 'GET',
            //         data: null,
            //         contentType: 'application/json',
            //         success: function (data, response) {
            //             BusyIndicator.hide();
            //             
            //             var comment = "";
            //             var count = 0;
            //             for (var i = 0; i < data.d.results.length; i++) {
            //                 if (data.d.results[i].TO_ATTACHMENT) {
            //                     PropertyModel.setProperty("/CircularButton", true);
            //                 }
            //                 if (data.d.results[i].TYPE === "Broadcast") {
            //                     PropertyModel.setProperty("/MessageStrip", true);
            //                     var object = {
            //                         referenceId: data.d.results[i].REFERENCE_ID
            //                     };
            //                     broadcastIds.push(object);
            //                     if (count === 0) {
            //                         count++;
            //                         comment = "🔔" + data.d.results[i].COMMENTS;
            //                     }
            //                     else {
            //                         comment = comment + ".🔔 " + data.d.results[i].COMMENTS
            //                     }
            //                 }
            //             }
            //             if (count === 0) {
            //                 PropertyModel.setProperty("/CircularButton", false)
            //                 PropertyModel.setProperty("/MessageStrip", false)
            //             }
            //             PropertyModel.setProperty("/comment", comment);
            //         },
            //         error: function (e) {
            //             BusyIndicator.hide();
            //             MessageBox.error(e.responseText);
            //         }
            //     });
            // },

            // Old

            // // To download circular
            // onDownload: async function (oEvent) {
            //     BusyIndicator.show();
            //     for (var i = 0; i < broadcastIds.length; i++) {
            //         var vReferenceId = broadcastIds[i].referenceId;
            //         var vFile_Id = 1;
            //         var path = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment(REFERENCE_ID=" + vReferenceId + ",FILE_ID=" + vFile_Id + ")/$value";
            //         return new Promise(function (resolve, reject) {
            //             $.ajax({
            //                 url: path,
            //                 type: 'GET',
            //                 contentType: 'application/json',
            //                 success: async function (data, responce) {
            //                     if (!data) {
            //                     }
            //                     else {
            //                         await that.fileType(vReferenceId, data);
            //                     }
            //                 },
            //                 error: function (error) {
            //                     BusyIndicator.hide();
            //                     var oXMLMsg, oXML;
            //                     if (that.isValidJsonString(error.responseText)) {
            //                         oXML = JSON.parse(error.responseText);
            //                         oXMLMsg = oXML.error["message"];
            //                     } else {
            //                         oXMLMsg = error.responseText;
            //                     }
            //                     MessageBox.error(oXMLMsg);
            //                 }
            //             });
            //         });
            //     }
            // },

            // fileType: async function (vReferenceId, data) {
            //     var vReferenceId = "(REFERENCE_ID eq " + vReferenceId + ")";
            //     var path = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment?$filter=" + vReferenceId;
            //     var FILE_CONTENT = data;
            //     $.ajax({
            //         url: path,
            //         type: 'GET',
            //         contentType: 'application/json',
            //         success: function (data, responce) {
            //             if (data.d.results.length > 0) {
            //                 that.downloadFileContent(data.d.results[0].FILE_TYPE || null, data.d.results[0].FILE_NAME, data.d.results[0].FILE_MIMETYPE, FILE_CONTENT);
            //             } else {
            //                 MessageBox.error("Attachments are empty.");
            //             }
            //         },
            //         error: function (error) {
            //             BusyIndicator.hide();
            //             var oXMLMsg, oXML;
            //             if (that.isValidJsonString(error.responseText)) {
            //                 oXML = JSON.parse(error.responseText);
            //                 oXMLMsg = oXML.error["message"];
            //             } else {
            //                 oXMLMsg = error.responseText;
            //             }
            //             MessageBox.error(oXMLMsg);
            //         }
            //     });
            // },

            // downloadFileContent: function (iFILE_TYPE, sFILE_NAME, sFILE_MIMETYPE, sFILE_CONTENT) {
            //     this.downloadAttachment(sFILE_CONTENT, sFILE_NAME, sFILE_MIMETYPE);
            // },

            // downloadAttachment: function (content, fileName, mimeType) {
            //     download("data:application/octet-stream;base64," + content, fileName, mimeType);
            //     var HttpRequest = new XMLHttpRequest();
            //     HttpRequest.responseType = 'blob';
            //     HttpRequest.onload = function (e) {
            //         download(HttpRequest.response, fileName, mimeType);
            //     }
            //     BusyIndicator.hide();
            //     HttpRequest.send();
            // }


            // New to check / download multiple file.  15-11-2024
            onDownload: async function () {
                BusyIndicator.show();
                const downloadErrors = [];
            
                try {
                    const downloadPromises = broadcastIds.map((broadcastId) => {
                        return new Promise((resolve, reject) => {
                            const vReferenceId = broadcastId.referenceId;
                            const vFile_Id = 1;
                            const path = `${appModulePath}/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment(REFERENCE_ID=${vReferenceId},FILE_ID=${vFile_Id})/$value`;
            
                            $.ajax({
                                url: path,
                                type: 'GET',
                                contentType: 'application/json',
                                success: async (data) => {
                                    if (data) {
                                        await this.fileType(vReferenceId, data);
                                        resolve(); // Resolve when download is complete
                                    } else {
                                        reject("No data found for download.");
                                    }
                                },
                                error: (error) => {
                                    const errorMsg = this.parseErrorMessage(error);
                                    downloadErrors.push({ referenceId: vReferenceId, message: errorMsg });
                                    resolve(); // Resolve so that Promise.all continues for other files
                                }
                            });
                        });
                    });
            
                    // Wait until all download requests complete
                    await Promise.all(downloadPromises);
                } catch (error) {
                    console.error("Unexpected error during download process: ", error);
                } finally {
                    BusyIndicator.hide();
                    this.displayDownloadErrors(downloadErrors);
                }
            },
            
            fileType: async function (vReferenceId, data) {
                const vReferenceIdFilter = `(REFERENCE_ID eq ${vReferenceId})`;
                const path = `${appModulePath}/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment?$filter=${vReferenceIdFilter}`;
                const FILE_CONTENT = data;
            
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: path,
                        type: 'GET',
                        contentType: 'application/json',
                        success: (data) => {
                            if (data.d.results.length > 0) {
                                const file = data.d.results[0];
                                this.downloadFileContent(file.FILE_TYPE, file.FILE_NAME, file.FILE_MIMETYPE, FILE_CONTENT);
                                resolve();
                            } else {
                                reject("Attachments are empty.");
                            }
                        },
                        error: (error) => {
                            const errorMsg = this.parseErrorMessage(error);
                            reject(errorMsg);
                        }
                    });
                });
            },
            
            // Utility function to parse error messages
            parseErrorMessage: function (error) {
                let errorMsg;
                try {
                    const response = JSON.parse(error.responseText);
                    errorMsg = response.error.message.value || "Unknown error";
                } catch (e) {
                    errorMsg = "Error parsing error response";
                }
                return errorMsg;
            },
            
            displayDownloadErrors: function (errors) {
                // Filter out "Not Found" errors to only show other types of errors
                const filteredErrors = errors.filter(err => err.message !== "Not Found");
            
                // If there are any remaining errors after filtering, display them
                if (filteredErrors.length > 0) {
                    const errorMessages = filteredErrors.map(err => `Reference ID ${err.referenceId}: ${err.message}`).join("\n");
                    MessageBox.error(`Some files could not be downloaded:\n${errorMessages}`);
                }
            },
            
            
            downloadFileContent: function (iFILE_TYPE, sFILE_NAME, sFILE_MIMETYPE, sFILE_CONTENT) {
                this.downloadAttachment(sFILE_CONTENT, sFILE_NAME, sFILE_MIMETYPE);
            },
            
            downloadAttachment: function (content, fileName, mimeType) {
                download("data:application/octet-stream;base64," + content, fileName, mimeType);
            }
            

            
        });
    });
