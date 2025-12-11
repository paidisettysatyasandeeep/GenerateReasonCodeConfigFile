sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    HBox,
    VBox,
    Input,
    TextArea,
    Label,
    Button,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("downtimeconf.controller.UploadScreen", {
      /**
       * Columns exactly matching your uploaded template.
       */
      CSV_COLUMNS: [
        "SITE",
        "TIME_ELEMENT",
        "REASON_CODE1",
        "REASON_CODE2",
        "REASON_CODE3",
        "REASON_CODE4",
        "REASON_CODE5",
        "REASON_CODE6",
        "REASON_CODE7",
        "REASON_CODE8",
        "REASON_CODE9",
        "SEQUENCE",
        "MARK_FOR_DELETION",
        "DESCRIPTION_EN",
        "DESCRIPTION_FR",
        "DESCRIPTION_DE",
      ],

      onInit: function () {
        // initial model, no initial row created here (will be created on OK)
        var oModel = new JSONModel({
          sites: [
            { key: "6500", text: "6500" },
            { key: "6600", text: "6600" },
          ],
          selectedSite: "", 
          timeElement: "", 
          reasonCode1: "", 
          locked: false, // false until OK clicked
          rows: [], 
          rowCount: 0, 
        });

        oModel.setSizeLimit(10000);

        this.getView().setModel(oModel);
        this._oModel = oModel;

        this._oDynamicRows = this.byId("dynamicRows");
      },

      // Update row count in the model to add that in table.
      _updateRowCount: function () {
        var aRows = this._oModel.getProperty("/rows") || [];
        this._oModel.setProperty("/rowCount", aRows.length);
      },

      /**
       * Handler for OK button.
       * Validates Site, Time Element and REASON_CODE1 are present.
       * Adds the initial row to the table and locks the top fields (site, timeElement, reasonCode1).
       */
      onConfirmInitialRow: function () {
        var oModel = this._oModel;
        var sSite = oModel.getProperty("/selectedSite");
        var sTime = oModel.getProperty("/timeElement");
        var sReason1 = oModel.getProperty("/reasonCode1").toUpperCase();

        // Validate inputs
        if (!sSite || String(sSite).trim() === "") {
          MessageToast.show("Please select Site before confirming.");
          return;
        }
        if (!sTime || String(sTime).trim() === "") {
          MessageToast.show("Please select Time Element before confirming.");
          return;
        }
        if (!sReason1 || String(sReason1).trim() === "") {
          MessageToast.show("Please enter REASON_CODE1 before confirming.");
          return;
        }

        // Add initial confirmed row (Site, Time, REASON_CODE1, DESCRIPTION_EN populated from reason1)
        var aRows = oModel.getProperty("/rows") || [];
        // If table already contains rows, avoid creating duplicate initial confirmation
        var exists = aRows.some(function (r) {
          return (
            r.site === sSite &&
            r.time === sTime &&
            r.reason1 === sReason1.toUpperCase() &&
            !r.reason2 &&
            !r.reason3
          );
        });

        if (!exists) {
          var initialDescription = this.getDescriptionFromCodes(
            sReason1,
            "",
            ""
          );
          aRows.unshift({
            site: sSite,
            time: sTime,
            reason1: sReason1,
            reason2: "",
            reason3: "",
            description: initialDescription,
          });
          oModel.setProperty("/rows", aRows);
          this._updateRowCount();
        } else {
          MessageToast.show("Initial row already exists for these values.");
        }

        // Lock the top-level inputs and enable adding reason rows
        oModel.setProperty("/locked", true);
        this.getView().byId("clearButton").setEnabled(true);
        this.getView().byId("downloadButton").setEnabled(true);
        this.getView().byId("clearAllButton").setEnabled(true);

        MessageToast.show(
          "Confirmed. Site, Time Element and REASON_CODE1 are locked."
        );
      },

      /**
       * Create dynamic input block: REASON_CODE2 + REASON_CODE3
       * Add button is enabled only when /locked is true (OK clicked).
       */
      onAddReasonRow: function () {
        // Only allow adding dynamic blocks after initial confirm
        if (!this._oModel.getProperty("/locked")) {
          MessageToast.show(
            "Please confirm the initial values using OK before adding reason rows."
          );
          return;
        }

        var oReason2Input = new Input({
          width: "220px",
          placeholder: "Enter REASON_CODE2",
        });

        var oReason3Area = new TextArea({
          width: "480px",
          rows: 5,
          placeholder: "Enter REASON_CODE3 values, comma-separated",
        });

        var oAddButton = new Button({ text: "Save Row(s)" });
        oAddButton.attachPress(
          function () {
            if (!oAddButton.getEnabled()) {
              return;
            }
            oAddButton.setEnabled(false);
            try {
              this._onSaveRow(oReason2Input, oReason3Area);
            } finally {
              setTimeout(function () {
                oAddButton.setEnabled(true);
              }, 200);
            }
          }.bind(this)
        );

        var oRemoveTmp = new Button({
          icon: "sap-icon://decline",
          press: function () {
            if (!this._oDynamicRows) {
              this._oDynamicRows = this.byId("dynamicRows");
            }
            this._oDynamicRows.removeItem(hbox);
          }.bind(this),
        });

        var hbox = new HBox({
          items: [
            new VBox({
              items: [new Label({ text: "REASON_CODE2" }), oReason2Input],
            }),
            new VBox({
              items: [
                new Label({ text: "REASON_CODE3 (comma-separated)" }),
                oReason3Area,
              ],
            }),
            new VBox({ items: [new Label({ text: "Action" }), oAddButton] }),
            new VBox({ items: [new Label({ text: "" }), oRemoveTmp] }),
          ],
          justifyContent: "SpaceBetween",
          width: "100%",
        });

        if (!this._oDynamicRows) {
          this._oDynamicRows = this.byId("dynamicRows");
        }
        this._oDynamicRows.addItem(hbox);
      },

      // Clearing the time element, site, and reason code 1 inputs.
      onClearInitialRow: function () {
        this._oModel.setProperty("/locked", false);
        this._oModel.setProperty("/reasonCode1", "");
        this._oModel.setProperty("/selectedSite", "");
        this._oModel.setProperty("/timeElement", "");
        this.getView().byId("clearButton").setEnabled(false);
      },

      // When the save button inside is clicked then this func will create rows in the table
      _onSaveRow: function (oReason2Input, oReason3Area) {
        var oModel = this._oModel;
        if (!oModel.getProperty("/locked")) {
          MessageToast.show("Please confirm the initial row first.");
          return;
        }

        var sSite = oModel.getProperty("/selectedSite");
        var sTime = oModel.getProperty("/timeElement");
        var sReason1 = oModel.getProperty("/reasonCode1");

        var sReason2 =
          (oReason2Input.getValue && oReason2Input.getValue().trim()) || "";
        if (!sReason2) {
          MessageToast.show("Please enter REASON_CODE2 before saving.");
          return;
        }

        var sReason3Raw =
          (oReason3Area.getValue && oReason3Area.getValue()) || "";

        var aReason3 = sReason3Raw
          .split(/\s*,\s*/) // only split on commas
          .map(function (v) {
            return String(v).trim();
          })
          .filter(Boolean);

        var aRows = oModel.getProperty("/rows") || [];
        var existingSet = new Set(
          aRows.map(function (r) {
            return [r.site, r.time, r.reason1, r.reason2, r.reason3].join("|");
          })
        );

        var added = 0;

        // Header row (for reason2) with reason3_description
        var headerKey = [sSite, sTime, sReason1, sReason2, ""].join("|");
        if (!existingSet.has(headerKey)) {
          aRows.push({
            site: sSite,
            time: sTime,
            reason1: sReason1.toUpperCase(),
            reason2: sReason2,
            reason3: "",
            description: sReason1.toUpperCase() + "_" + sReason2,
          });
          existingSet.add(headerKey);
          added++;
        }

        // Add per reason3
        aReason3.forEach(
          function (singleReason3) {
            var key = [sSite, sTime, sReason1, sReason2, singleReason3].join(
              "|"
            );
            if (!existingSet.has(key)) {
              var sDescription = this.getDescriptionFromCodes(
                sReason1,
                sReason2,
                singleReason3
              );
              aRows.push({
                site: sSite,
                time: sTime,
                reason1: sReason1.toUpperCase(),
                reason2: sReason2,
                reason3: singleReason3,
                description: sDescription,
              });
              existingSet.add(key);
              added++;
            }
          }.bind(this)
        );

        if (added === 0) {
          MessageToast.show("No new rows added (all entries already exist).");
        } else {
          oModel.setProperty("/rows", aRows);
          this._updateRowCount();
          MessageToast.show(added + " row(s) added.");
        }

        // remove the dynamic block
        this._removeContainingHBox(oReason2Input);
      },

      /**
       * Remove dynamic HBox that contains given control.
       */
      _removeContainingHBox: function (oControl) {
        if (!this._oDynamicRows) {
          this._oDynamicRows = this.byId("dynamicRows");
        }
        var aItems = this._oDynamicRows.getItems();
        for (var i = 0; i < aItems.length; i++) {
          if (aItems[i].findAggregatedObjects(true).indexOf(oControl) !== -1) {
            this._oDynamicRows.removeItem(aItems[i]);
            break;
          }
        }
      },

      /**
       * Build description. When reason2+reason3 empty, uses reason1 as DESCRIPTION_EN.
       */
      getDescriptionFromCodes: function (reason1, reason2, reason3) {
        if (
          (!reason2 || String(reason2).trim() === "") &&
          (!reason3 || String(reason3).trim() === "")
        ) {
          return reason1;
        }
        if (!reason3) {
          return "";
        }
        return reason3;
      },

      // Deleting table row from the delete button
      onDeleteRow: function (oEvent) {
        var oSource = oEvent.getSource();

        var oParent = oSource.getParent();
        while (
          oParent &&
          !(oParent.isA && oParent.isA("sap.m.ColumnListItem"))
        ) {
          oParent = oParent.getParent();
        }

        if (!oParent) {
          jQuery.sap.log.warning(
            "Could not find ColumnListItem ancestor for delete button."
          );
          return;
        }

        var oListItem = oParent; 
        var oTable = this.byId("dataTable");
        if (!oTable) {
          jQuery.sap.log.warning("dataTable not found when deleting row.");
          return;
        }

        var iIndex = oTable.indexOfItem(oListItem);
        if (iIndex === -1) {
          jQuery.sap.log.warning(
            "Could not determine index of the list item to delete."
          );
          return;
        }

        var aRows = this._oModel.getProperty("/rows") || [];
        aRows.splice(iIndex, 1);
        this._oModel.setProperty("/rows", aRows);
        this._updateRowCount();

        // If table is now empty, reset button states and unlock
        if (aRows.length === 0) {
          this._oModel.setProperty("/locked", false);
          var oClearButton = this.getView().byId("clearButton");
          if (oClearButton) {
            oClearButton.setEnabled(false);
          }

          var oDownloadButton = this.getView().byId("downloadButton");
          if (oDownloadButton) {
            oDownloadButton.setEnabled(false);
          }

          var oClearAllButton = this.getView().byId("clearAllButton");
          if (oClearAllButton) {
            oClearAllButton.setEnabled(false);
          }
        }
      },

      //  Clear all: unlock top inputs, clear reasonCode1, remove rows and dynamic blocks.
      onClearAll: function () {
        // unlock controls
        this._oModel.setProperty("/locked", false);
        this.getView().byId("clearButton").setEnabled(false);

        // clear rows and dynamic blocks
        this._oModel.setProperty("/rows", []);
        this._updateRowCount();
        if (this._oDynamicRows) {
          this._oDynamicRows.removeAllItems();
        }
        MessageToast.show("Data Cleared");
        this.getView().byId("downloadButton").setEnabled(false);
        this.getView().byId("clearAllButton").setEnabled(false);
      },

      // Columns data of the table
      mapRowToCsv: function (row) {
        var cols = this.CSV_COLUMNS;
        var map = {
          SITE: row.site || "",
          TIME_ELEMENT: row.time || "",
          REASON_CODE1: row.reason1 ? String(row.reason1).toUpperCase() : "",
          REASON_CODE2: row.reason2 || "",
          REASON_CODE3: row.reason3 || "",
          REASON_CODE4: "",
          REASON_CODE5: "",
          REASON_CODE6: "",
          REASON_CODE7: "",
          REASON_CODE8: "",
          REASON_CODE9: "",
          SEQUENCE: "",
          MARK_FOR_DELETION: "",
          DESCRIPTION_EN: row.description || "",
          DESCRIPTION_FR: "",
          DESCRIPTION_DE: "",
        };
        return cols.map(function (c) {
          return map[c] !== undefined ? map[c] : "";
        });
      },

      //creating the file name
      getFileName(reasonCode) {
        const oView = this.getView();
        const oCombo = oView.byId("timeElement");

        // Get selected text or fallback to model property
        let sText =
          oCombo?.getSelectedItem()?.getText() ||
          this._oModel.getProperty("/timeElement") ||
          "";

        const sSentence = sText
          .toString()
          .trim()
          .split(/\s+/)
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        // Create the custom date in MMDDYYYY format
        const today = new Date();
        const finalDate = [
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
          today.getFullYear(),
        ].join("");

        //final file name
        const fileName = `${sSentence} (${reasonCode.toUpperCase()}) ${finalDate}`;

        return fileName;
      },

      //  Export CSV.
      onDownloadCSV: function () {
        var aRows = this._oModel.getProperty("/rows") || [];
        if (!aRows || aRows.length === 0) {
          MessageToast.show("No rows to export");
          return;
        }

        var sReason1 = this._oModel.getProperty("/reasonCode1");
        if (!sReason1 || String(sReason1).trim() === "") {
          MessageToast.show("Please provide REASON_CODE1 before exporting.");
          return;
        }

        var sFileName = this.getFileName(sReason1.trim());

        var aHeader = this.CSV_COLUMNS;
        function escapeCsvField(value) {
          if (value === undefined || value === null) return "";
          var s = String(value);
          if (
            s.indexOf(",") !== -1 ||
            s.indexOf('"') !== -1 ||
            s.indexOf("\n") !== -1
          ) {
            s = '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        }

        var sCSV = aHeader.join(",") + "\r\n";
        for (var i = 0; i < aRows.length; i++) {
          var row = aRows[i];
          var aValues = this.mapRowToCsv(row);
          var aEscaped = aValues.map(escapeCsvField);
          sCSV += aEscaped.join(",") + "\r\n";
        }

        var blob = new Blob(["\uFEFF", sCSV], {
          type: "text/csv;charset=utf-8;",
        });

        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, sFileName);
        } else {
          var link = document.createElement("a");
          if (link.download !== undefined) {
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", sFileName);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      },
    });
  }
);
