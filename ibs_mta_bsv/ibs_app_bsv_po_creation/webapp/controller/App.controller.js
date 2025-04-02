sap.ui.define(
  [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel"
  ],
  function(BaseController,JSONModel) {
    "use strict";

    return BaseController.extend("com.ibs.bsv.ibsappbsvpocreation.controller.App", {
      onInit() {
        var oViewModel,
        oViewModel = new JSONModel({
            busy : true,
            delay : 0,
            layout : "OneColumn",
            previousLayout : "",
            actionButtonsInfo : {
                midColumn : {
                    fullScreen : false
                }
            }
        });
        this.getView().setModel(oViewModel, "appView"); 
      }
    });
  }
);




// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvprcreation.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  


// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvprcreation.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  




// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvprcreation.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  


// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvpocreation.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  