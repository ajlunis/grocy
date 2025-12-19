/*
 * Stock Overview Filters Logic
 * Encapsulates the complex filtering logic including dynamic userfield filters
 */

class StockOverviewFilters {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this.availableFilters = [];

        this.init();
    }

    init() {
        this.initBootstrapSelects();
        this.loadAvailableFilters();

        // Convert existing filters using a CSS class fix for input-group integration
        this.convertExistingFilter('#location-filter', 'hidden-location', 'multiselect', __t('Location'));
        this.convertExistingFilter('#product-group-filter', 'hidden-product-group', 'multiselect', __t('Product Group'), __t('No Group'));
        this.convertExistingFilter('#status-filter', 'hidden-status', 'multiselect', __t('Status'));

        this.handleUrlParams();

        this.initAddFilterButton();
        this.initClearFilterButton();

        this.setupDataTableSearch();

    }

    handleUrlParams() {
        if (typeof GetUriParam("product-group") !== "undefined") {
            $("#product-group-filter").selectpicker('val', GetUriParam("product-group"));
        }
        if (typeof GetUriParam("location") !== "undefined") {
            $("#location-filter").selectpicker('val', GetUriParam("location"));
        }
        if (typeof GetUriParam("status") !== "undefined") {
            $("#status-filter").selectpicker('val', GetUriParam("status"));
        }
    }

    initBootstrapSelects() {
        $.fn.selectpicker.Constructor.DEFAULTS.liveSearch = true;
        $.fn.selectpicker.Constructor.DEFAULTS.actionsBox = true;
        $.fn.selectpicker.Constructor.DEFAULTS.virtualScroll = 600;
        $.fn.selectpicker.Constructor.DEFAULTS.container = 'body';
        $.fn.selectpicker.Constructor.DEFAULTS.style = 'btn-light';
        $.fn.selectpicker.Constructor.DEFAULTS.showTick = true;
        $.fn.selectpicker.Constructor.DEFAULTS.width = 'auto'; // Important for flex
    }

    initClearFilterButton() {
        var self = this;
        $("#clear-filter-button").off('click').on("click", function()
        {
            $("#search").val("");

            // Reset all filters
            for (var i = self.filters.length - 1; i >= 0; i--) {
                var filter = self.filters[i];
                if (filter.isPermanent) {
                    if (filter.id === 'filter-hidden-status') {
                         filter.element.selectpicker('val', ['instockX']);
                    } else if (filter.id === 'filter-hidden-location') {
                         // Select all except "Out of Stock"
                         var allOptions = filter.element.find('option').map(function() { return $(this).val(); }).get();
                         var defaults = allOptions.filter(v => v && v !== 'IsOutOfStock');
                         filter.element.selectpicker('val', defaults);
                    } else {
                         filter.element.selectpicker('selectAll');
                    }
                    // Reset logic to OR
                    if (filter.container) {
                        filter.container.find('input[value="OR"]').prop('checked', true).trigger('change');
                    }
                } else {
                    self.removeFilter(filter.id);
                }
            }

            // Should be handled by removeFilter, but force update here to be sure
            if (self.addFilterSelect) self.updateAddFilterAvailability();

            self.table.search("").draw();
        });
    }

    setupDataTableSearch() {
        var self = this;
        $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
            for (var i = 0; i < self.filters.length; i++) {
                var filter = self.filters[i];
                if (!self.checkFilter(filter, settings, dataIndex)) {
                    return false;
                }
            }
            return true;
        });
    }

    checkFilter(filter, settings, dataIndex) {
        // Safe retrieval of cell data (HTML string) even if DOM nodes are not rendered (deferRender)
        var rowData = settings.aoData[dataIndex]._aData;
        var cellHtml = rowData[filter.columnIndex];

        if (typeof cellHtml === 'undefined') {
            return true;
        }

        // Parse the HTML string to get text content
        // We use a temporary DIV to let the browser handle parsing (stripping tags, decoding entities)
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = cellHtml;

        // Prioritize structured data if present
        var customSort = tempDiv.querySelector('.custom-sort');
        var userfieldRaw = tempDiv.querySelector('.userfield-raw-value');

        var rawValue = "";
        // Special extraction for Checkboxes: look for the check icon in the HTML
        if (filter.type === 'checkbox') {
             if (cellHtml.indexOf('fa-check') !== -1) {
                 rawValue = "1";
             } else {
                 rawValue = "0";
             }
        }
        else if (customSort) {
            rawValue = customSort.textContent;
        } else if (userfieldRaw) {
            rawValue = userfieldRaw.textContent;
        } else {
            rawValue = tempDiv.textContent;
        }

        rawValue = rawValue ? rawValue.trim() : "";

        if (filter.type === 'multiselect' || filter.type === 'userfield-multiselect' || filter.type === 'multiselect-dynamic') {
            return this.checkMultiselect(filter, rawValue);
        } else if (filter.type === 'number' || filter.type === 'number-currency') {
            return this.checkNumber(filter, rawValue);
        } else if (filter.type === 'date' || filter.type === 'datetime') {
            return this.checkDate(filter, rawValue);
        } else if (filter.type === 'checkbox') {
            return this.checkCheckbox(filter, rawValue);
        } else if (filter.type === 'set-not-set') {
             return this.checkSetNotSet(filter, rawValue);
        }

        return true;
    }

    checkMultiselect(filter, rawValue) {
        var selectedValues = filter.element.val();

        // Specific fix for Status filter: If nothing is selected, show ALL (ignore filter)
        if (filter.id === 'filter-hidden-status' && (!selectedValues || selectedValues.length === 0)) {
            return true;
        }

        if (!selectedValues || selectedValues.length === 0) {
             return false;
        }

        var logic = 'OR';
        if (filter.container) {
             logic = filter.container.find('input[name="logic-' + filter.id + '"]:checked').val();
             if (!logic) logic = 'OR';
        }

        // Logic for Dynamic Multiselect (comma separated values)
        if (filter.type === 'userfield-multiselect' || filter.isDynamic)
        {
            var rowValues = rawValue.split(',').map(function(item) { return item.trim(); }).filter(i => i);

            if (selectedValues.includes('all')) return true;

            var notSetSelected = selectedValues.includes('__grocy_not_set__');
            var isRowEmpty = (rowValues.length === 0);

            if (logic === 'OR') {
                 if (notSetSelected && isRowEmpty) return true;

                 for(var i=0; i<selectedValues.length; i++) {
                     if (rowValues.includes(selectedValues[i])) return true;
                 }
                 return false;
            } else if (logic === 'AND' || logic === 'AND_EXACT') {
                 // If filtering for "Not Set" in AND mode, the row must be empty
                 if (notSetSelected) {
                     if (!isRowEmpty) return false;
                     if (selectedValues.length === 1) return true;
                 }

                 for(var i=0; i<selectedValues.length; i++) {
                     if (selectedValues[i] === '__grocy_not_set__') continue;
                     if (!rowValues.includes(selectedValues[i])) return false;
                 }

                 if (logic === 'AND_EXACT') {
                     var selectedCount = selectedValues.filter(v => v !== '__grocy_not_set__').length;
                     if (rowValues.length !== selectedCount) return false;
                 }

                 return true;
            }
        }
        // Logic for Permanent Multiselect (Regex/Wrapper based: xxValuexx)
        else
        {
             // Permanent filters don't support "Not set" logic mixed with values in the same way for now
             // except for "Not set" being a specific value if provided.

             // Handle "Not Set" special case if implemented for permanent filters
             // Currently Product Group has "Not Set" mapped to empty string or special value

             if (logic === 'OR') {
                 for(var i=0; i<selectedValues.length; i++) {
                     var val = selectedValues[i];

                     if (val === '__grocy_not_set__') {
                         if (!rawValue || rawValue === "" || rawValue === "xxxx") return true;
                         continue;
                     }

                     var matchVal = "xx" + val + "xx";
                     // Check if rawValue contains the wrapped ID/Value
                     if (rawValue.indexOf(matchVal) !== -1) return true;
                     // Fallback for exact match
                     if (rawValue === val) return true;
                }
                return false;
             } else if (logic === 'AND' || logic === 'AND_EXACT') {
                 // For AND logic, all selected values must be present in the rawValue
                 for(var i=0; i<selectedValues.length; i++) {
                     var val = selectedValues[i];

                     if (val === '__grocy_not_set__') {
                          if (!(!rawValue || rawValue === "" || rawValue === "xxxx")) return false;
                          continue;
                     }

                     var matchVal = "xx" + val + "xx";
                     if (rawValue.indexOf(matchVal) === -1 && rawValue !== val) return false;
                 }

                 if (logic === 'AND_EXACT') {
                     // Robust parsing for Regex/Permanent filters (Location/Status)
                     // Data format is "xxVal1xx  xxVal2xx" with potential whitespace/newlines/duplicates
                     var cleanRaw = rawValue.replace(/\s+/g, '');
                     var parts = cleanRaw.split('xx').filter(p => p !== "");
                     var uniqueRowValues = new Set(parts);

                     // Adjust selected count to ignore '__grocy_not_set__' if present
                     var selectedCount = selectedValues.filter(v => v !== '__grocy_not_set__').length;

                     // Determine Ignorable Values for Status filter
                     var ignorableValues = ['__grocy_not_set__'];
                     if (filter.id === 'filter-hidden-status') {
                         ignorableValues.push('instockX');
                         ignorableValues.push('outofstock');
                     }

                     // Check each row value
                     var iterator = uniqueRowValues.values();
                     for (var val of iterator) {
                         if (selectedValues.includes(val)) continue;
                         if (ignorableValues.includes(val)) continue;
                         return false; // Found a non-selected, non-ignorable value -> Mismatch
                     }

                     return true;
                 }

                 return true;
             }
        }
        return true;
    }

    checkNumber(filter, rawValue) {
        var container = filter.container;
        var minInput = container.find('.filter-min-value').val();
        var maxInput = container.find('.filter-max-value').val();

        var minVal = parseFloat(minInput);
        var maxVal = parseFloat(maxInput);

        // Clean currency symbols and handle localized decimals if needed
        // Assuming rawValue from userfield-raw-value or custom-sort is already standard float format (dot decimal)
        // If it's coming from visible text, it might need cleanup
        var cleanRaw = rawValue.replace(/[^0-9.\-]/g, '');
        var cellValue = parseFloat(cleanRaw);

        // Treat empty/NaN as 0 for comparison if filtering, OR handle "not set" logic explicitly?
        // Usually, empty number fields are stored as NULL or 0.
        if (isNaN(cellValue)) cellValue = 0;

        // If filtering for Not Set (conceptually), usually that means value is 0 or empty
        // But here we are range filtering.

        // If the user entered a Min value
        if (!isNaN(minVal)) {
             if (cellValue < minVal) return false;
        }

        // If the user entered a Max value
        if (!isNaN(maxVal)) {
             if (cellValue > maxVal) return false;
        }

        return true;
    }

    checkDate(filter, rawValue) {
         var container = filter.container;
         var operator = container.find('.filter-operator').val();
         var valueStr = container.find('.filter-value').val(); // Localized string from input

         // Clean up rawValue if it contains whitespace
         rawValue = rawValue ? rawValue.trim() : "";

         if (operator === 'empty') return !rawValue || rawValue === "";

         if (!valueStr) return true;

         // rawValue is expected to be ISO string YYYY-MM-DD HH:mm:ss or YYYY-MM-DD from userfield-raw-value
         // If it's not (e.g. from table text), it might be localized.
         // We try to parse as ISO first.
         var cellDate = moment(rawValue, [moment.ISO_8601, "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"]);
         var filterDate = moment(valueStr, filter.dateFormat);

         if (!cellDate.isValid()) return false;
         if (!filterDate.isValid()) return true;

         if (operator === 'on') return cellDate.isSame(filterDate, 'day');
         if (operator === 'before') return cellDate.isBefore(filterDate);
         if (operator === 'after') return cellDate.isAfter(filterDate);

         return true;
    }

    checkCheckbox(filter, rawValue) {
        var val = filter.element.filter(':checked').val();
        if (val === 'all') return true;

        var boolVal = (rawValue == "1");

        if (val === 'checked') return boolVal;
        if (val === 'unchecked') return !boolVal;
        if (val === 'not-set') return !rawValue;

        return true;
    }

    checkSetNotSet(filter, rawValue) {
        var val = filter.element.filter(':checked').val();
        if (val === 'all') return true;

        if (val === 'set') return (rawValue && rawValue.length > 0);
        if (val === 'not-set') return (!rawValue || rawValue.length === 0);

        return true;
    }

    convertExistingFilter(selector, columnName, type, caption, nullOptionLabel) {
        var element = $(selector);
        var columnIndex = this.getColumnIndexByName(columnName);

        if (columnName !== 'hidden-location' && columnName !== 'hidden-status' && element.find('option[value="__grocy_not_set__"]').length === 0) {
             var label = nullOptionLabel || __t('Not set');
             if (nullOptionLabel) {
                 element.prepend('<option data-divider="true"></option>');
             }
             element.prepend('<option value="__grocy_not_set__">' + label + '</option>');
        }

        if (columnName === 'hidden-location' && element.find('option[value="IsOutOfStock"]').length === 0) {
            element.prepend('<option data-divider="true"></option>');
            element.prepend('<option value="IsOutOfStock">' + __t('Out of Stock') + '</option>');
        }

        element.off('change');

        // Remove custom-control classes that interfere with bootstrap-select in input-group
        element.removeClass('custom-control custom-select');

        // Add specific class for our CSS fix. Removed form-control to avoid double-boxing
        element.addClass('selectpicker');

        element.attr('multiple', 'multiple');
        // Ensure width is auto to allow flexbox resizing
        element.data('width', 'auto');
        element.data('style', 'btn-light rounded-right border-left-0');
        element.data('selected-text-format', 'count > 1');

        element.selectpicker('render');
        if (columnName === 'hidden-status') {
            element.selectpicker('deselectAll');
        } else {
            element.selectpicker('selectAll');
            if (columnName === 'hidden-location') {
                var currentVal = element.val();
                var newVal = currentVal.filter(v => v !== 'IsOutOfStock');
                element.selectpicker('val', newVal);
            }
        }
        element.on('loaded.bs.select', function (e) {
            // Force the dropdown wrapper to fill remaining space in the input group
            $(this).parent().addClass('flex-grow-1');
            // Remove border radius from the button to merge with label
            $(this).parent().find('.dropdown-toggle').addClass('rounded-0 rounded-right');
        });
        element.selectpicker('refresh');

        // Locate the container (the column div)
        var container = element.closest('.col-12');

        var filterObj = {
            id: 'filter-' + columnName,
            element: element,
            container: container,
            columnIndex: columnIndex,
            type: type,
            caption: caption,
            isPermanent: true,
            isDynamic: false
        };

        // Add Logic Controls for Status and Location
        if (columnName === 'hidden-location' || columnName === 'hidden-status') {
            this.addLogicControls(container, filterObj.id, true); // true = allow "Only" (exact match)
        }

        this.filters.push(filterObj);

        // Store initial value for tracking changes
        element.data('lastVal', element.val() || []);

        var self = this;
        element.on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
            var currentVal = element.val() || [];

            // Location: If IsOutOfStock is selected, disable AND/ONLY logic controls and force OR
            if (columnName === 'hidden-location') {
                var logicContainer = container.find('.small.d-flex.align-items-center');
                var logicRadios = logicContainer.find('input[value="AND"], input[value="AND_EXACT"]');
                var radioOr = logicContainer.find('input[value="OR"]');

                if (currentVal.includes('IsOutOfStock')) {
                    logicRadios.prop('disabled', true);
                    // Force OR logic if not already set
                    if (!radioOr.prop('checked')) {
                        radioOr.prop('checked', true).trigger('change');
                    }
                } else {
                    logicRadios.prop('disabled', false);
                }
            }

            // Status Mutual Exclusivity Logic
            if (columnName === 'hidden-status') {
                 var logic = container.find('input[name="logic-' + filterObj.id + '"]:checked').val();

                 if (logic === 'AND') {
                     var lastVal = element.data('lastVal') || [];

                     // Determine what was added
                     var added = currentVal.filter(x => !lastVal.includes(x));

                     if (added.includes('instockX')) {
                         if (currentVal.includes('outofstock')) {
                              var newVal = currentVal.filter(v => v !== 'outofstock');
                              setTimeout(function() { element.selectpicker('val', newVal); }, 0);
                         }
                     } else if (added.includes('outofstock')) {
                         if (currentVal.includes('instockX')) {
                              var newVal = currentVal.filter(v => v !== 'instockX');
                              setTimeout(function() { element.selectpicker('val', newVal); }, 0);
                         }
                     }
                 }
            }

            // Update lastVal for next event
            element.data('lastVal', element.val() || []);

            self.table.draw();
        });

        // Trigger initial check for Location logic visibility
        if (columnName === 'hidden-location') {
             element.trigger('changed.bs.select');
        }
    }

    addLogicControls(container, filterId, allowExactMatch) {
         // Do not show logic controls for single-value filters
         if (filterId === 'default-location' || filterId === 'default-store') {
             return;
         }

         var logicDiv = $('<div class="mt-2 small d-flex align-items-center justify-content-end"></div>');
         var name = 'logic-' + filterId;
         var idOr = 'logic-' + filterId + '-or';
         var idAnd = 'logic-' + filterId + '-and';
         var idExact = 'logic-' + filterId + '-exact';

         logicDiv.append('<div class="form-check form-check-inline mr-2"><input class="form-check-input" type="radio" name="' + name + '" id="' + idOr + '" value="OR" checked><label class="form-check-label font-weight-normal" for="' + idOr + '">' + __t('Any') + '</label></div>');
         logicDiv.append('<div class="form-check form-check-inline mr-2"><input class="form-check-input" type="radio" name="' + name + '" id="' + idAnd + '" value="AND"><label class="form-check-label font-weight-normal" for="' + idAnd + '">' + __t('All') + '</label></div>');

         if (allowExactMatch) {
             logicDiv.append('<div class="form-check form-check-inline mr-0"><input class="form-check-input" type="radio" name="' + name + '" id="' + idExact + '" value="AND_EXACT"><label class="form-check-label font-weight-normal" for="' + idExact + '">' + __t('Only') + '</label></div>');
         }

         container.append(logicDiv);

         var self = this;
         logicDiv.find('input[type="radio"]').on('change', function() {
             var val = $(this).val();

             // For Status filter: Enforce mutual exclusivity if switching to AND or AND_EXACT
             if (filterId === 'filter-hidden-status' && (val === 'AND' || val === 'AND_EXACT')) {
                 var el = container.find('select');
                 var currentVal = el.val() || [];
                 if (currentVal.includes('instockX') && currentVal.includes('outofstock')) {
                     // Default to In Stock, remove Out of Stock
                      var newVal = currentVal.filter(v => v !== 'outofstock');
                      el.selectpicker('val', newVal);
                 }
             }

             // Trigger filter update
             self.table.draw();
         });
    }


    getColumnIndexByName(name) {
        var index = -1;
        var self = this;
        this.table.columns().every(function(colIdx) {
            var header = this.header();
            if ($(header).data('filter-name') === name) {
                index = colIdx;
                return false;
            }
        });
        return index;
    }

    loadAvailableFilters() {
         var self = this;

         // Use DataTables API to iterate columns to ensure correct index mapping
         this.table.columns().every(function(index) {
             var header = $(this.header());
             var userfieldName = header.attr('data-userfield-name');
             var userfieldType = header.attr('data-userfield-type');
             var filterName = header.attr('data-filter-name');
             var caption = header.text().trim();

             if (userfieldName && userfieldType) {
                 self.availableFilters.push({
                     id: 'userfield-' + userfieldName,
                     caption: caption,
                     type: self.mapUserfieldTypeToFilterType(userfieldType),
                     columnIndex: index,
                     isUserfield: true,
                     origType: userfieldType
                 });
             } else if (filterName) {
                 // Ignore hidden columns that are used for permanent filters
                 if (filterName === 'hidden-location' || filterName === 'hidden-status' || filterName === 'hidden-product-group') {
                     return;
                 }

                 // Dynamic Built-in Filters
                 var type = 'number'; // Default
                 if (filterName === 'value' || filterName === 'last-price' || filterName === 'average-price') type = 'number-currency';
                 if (filterName === 'last-purchased') type = 'date';
                 if (filterName === 'default-location' || filterName === 'default-store') type = 'multiselect-dynamic';

                 self.addAvailableFilter(filterName, caption, type, index);
             }
         });
    }

    addAvailableFilter(id, caption, type, colIndex) {
        this.availableFilters.push({
            id: id,
            caption: caption,
            type: type,
            columnIndex: colIndex,
            isUserfield: false
        });
    }

    mapUserfieldTypeToFilterType(ufType) {
        if (ufType === 'checkbox') return 'checkbox';
        if (ufType === 'date') return 'date';
        if (ufType === 'datetime') return 'datetime';
        if (ufType === 'number-currency') return 'number-currency';
        if (ufType.startsWith('number')) return 'number';
        if (ufType === 'link' || ufType === 'file' || ufType === 'image') return 'set-not-set';
        if (ufType === 'preset-list' || ufType === 'preset-checklist') return 'userfield-multiselect';
        return 'set-not-set';
    }

    initAddFilterButton() {
        var select = $('<select class="selectpicker" data-live-search="true" data-style="btn-sm btn-outline-info" data-width="auto" data-dropdown-align-right="true" data-container="false" title=""></select>');

        var hasUserfields = false;
        this.availableFilters.forEach(function(f) {
            if (f.isUserfield) hasUserfields = true;
        });

        var self = this;
        this.availableFilters.forEach(function(f) {
            if (!f.isUserfield) {
                select.append($('<option></option>').val(f.id).text(f.caption));
            }
        });

        if (hasUserfields) {
            select.append('<option data-divider="true"></option>');
            this.availableFilters.forEach(function(f) {
                if (f.isUserfield) {
                    select.append($('<option></option>').val(f.id).text(f.caption));
                }
            });
        }

        $('#add-filter-button-wrapper').append(select);

        // Explicitly initialize
        select.selectpicker('render');
        select.val('');
        select.selectpicker('refresh');

        this.addFilterSelect = select;
        this.fixAddFilterButtonVisuals();

        var self = this;
        select.on('changed.bs.select', function() {
            var val = $(this).val();
            if (val) {
                 self.addFilter(val);
                 // Reset value and refresh
                 // Use setTimeout to ensure the UI update loop finishes before we reset
                 setTimeout(function() {
                     select.val('').selectpicker('refresh');
                     self.updateAddFilterAvailability();
                     self.fixAddFilterButtonVisuals();
                 }, 50);
            }
        });
    }

    fixAddFilterButtonVisuals() {
        if (!this.addFilterSelect) return;
        var btn = this.addFilterSelect.parent().find('.dropdown-toggle');

        // Ensure the visual icon element exists and is appended, NOT replacing content
        if (btn.find('.custom-add-filter-icon').length === 0) {
            var iconHtml = '<span class="custom-add-filter-icon">' +
                '<i class="fa-solid fa-filter"></i>' +
                '<i class="fa-solid fa-plus" style="position: absolute; font-size: 0.7em; bottom: 22%; right: 10%; line-height: 1;"></i>' +
                '</span>';
            btn.append(iconHtml).addClass('position-relative').css('overflow', 'visible');
        }
    }

    updateAddFilterAvailability() {
        var activeIds = this.filters.map(f => f.id);
        this.addFilterSelect.find('option').each(function() {
            var val = $(this).val();
            if (val === '') return;

            if (activeIds.includes(val)) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
        this.addFilterSelect.selectpicker('refresh');
        this.fixAddFilterButtonVisuals();
    }

    addFilter(filterId) {
        var filterDef = this.availableFilters.find(f => f.id === filterId);
        if (!filterDef) return;

        if (this.filters.find(f => f.id === filterId)) return;

        // Use Card Layout for Dynamic Filters
        var container = $('<div class="col-12 col-md-6 col-xl-3 filter-container stock-overview-filter mb-2" id="container-' + filterId + '"></div>');
        var card = $('<div class="card h-100"></div>');

        // Header
        var header = $('<div class="card-header py-1 px-2 d-flex justify-content-between align-items-center bg-gray-200"></div>');
        header.append('<span class="font-weight-bold small text-uppercase">' + filterDef.caption + '</span>');

        var removeBtn = $('<button class="btn btn-sm btn-link text-danger p-0" type="button"><i class="fa-solid fa-trash"></i></button>');
        removeBtn.on('click', () => this.removeFilter(filterId));
        header.append(removeBtn);

        card.append(header);

        // Body
        var body = $('<div class="card-body p-2 d-flex flex-column justify-content-center"></div>');

        var element;
        var extraProps = {};

        if (filterDef.type === 'number' || filterDef.type === 'number-currency') {
            element = this.createNumberFilterUI(body, filterDef);
        } else if (filterDef.type === 'date' || filterDef.type === 'datetime') {
            element = this.createDateFilterUI(body, filterDef);
            extraProps.dateFormat = (filterDef.type === 'datetime') ? 'L LT' : 'L';
        } else if (filterDef.type === 'checkbox') {
            element = this.createCheckboxFilterUI(body);
        } else if (filterDef.type === 'set-not-set') {
            element = this.createSetNotSetFilterUI(body);
        } else if (filterDef.type === 'multiselect-dynamic' || filterDef.type === 'userfield-multiselect') {
            element = this.createMultiselectDynamicUI(body, filterDef, container.attr('id'));
        }

        card.append(body);
        container.append(card);

        $('#table-filter-row').append(container);

        // Initialize any selectpickers in the new container
        container.find('.selectpicker').selectpicker();

        var filterObj = {
            id: filterId,
            element: element,
            container: container,
            columnIndex: filterDef.columnIndex,
            type: filterDef.type,
            caption: filterDef.caption,
            isPermanent: false,
            isDynamic: true,
            ...extraProps
        };

        this.filters.push(filterObj);

        var self = this;
        // Bind change events including click for +/- buttons
        // Use direct binding to the created element for robustness
        if (filterObj.element) {
            filterObj.element.on('change changed.bs.select keyup', function() {
                self.table.draw();
            });
        }
        // Also bind to any other inputs in the container (e.g. min/max inputs, logic radios)
        container.find('input').on('change keyup', function() {
            self.table.draw();
        });
    }

    removeFilter(filterId) {
        var index = this.filters.findIndex(f => f.id === filterId);
        if (index > -1) {
            $('#container-' + filterId).remove();

            this.filters.splice(index, 1);
            this.updateAddFilterAvailability();
            this.table.draw();
        }
    }

    createNumberFilterUI(container, filterDef) {
        var wrapper = $('<div class="d-flex align-items-center"></div>');

        // Min Value Input
        var minGroup = $('<div class="input-group input-group-sm"></div>');
        if (filterDef.type === 'number-currency') {
            minGroup.append('<div class="input-group-prepend"><span class="input-group-text">' + Grocy.Currency + '</span></div>');
        }
        var minInput = $('<input type="number" class="form-control filter-min-value" placeholder="' + __t('Min') + '" step="0.01">');
        minGroup.append(minInput);

        // Separator
        var separator = $('<span class="mx-2 small">' + __t('to') + '</span>');

        // Max Value Input
        var maxGroup = $('<div class="input-group input-group-sm"></div>');
        if (filterDef.type === 'number-currency') {
            maxGroup.append('<div class="input-group-prepend"><span class="input-group-text">' + Grocy.Currency + '</span></div>');
        }
        var maxInput = $('<input type="number" class="form-control filter-max-value" placeholder="' + __t('Max') + '" step="0.01">');
        maxGroup.append(maxInput);

        wrapper.append(minGroup);
        wrapper.append(separator);
        wrapper.append(maxGroup);
        container.append(wrapper);

        return wrapper;
    }

    createDateFilterUI(container, filterDef) {
        var group = $('<div class="input-group input-group-sm mb-1"></div>');

        var opSelect = $('<select class="custom-control custom-select filter-operator flex-grow-0" style="width: 80px;">' +
            '<option value="on">' + __t('On') + '</option>' +
            '<option value="before">' + __t('Before') + '</option>' +
            '<option value="after">' + __t('After') + '</option>' +
            '<option value="empty">' + __t('Not set') + '</option>' +
            '</select>');

        var input = $('<input type="text" class="form-control filter-value datetimepicker-input" data-toggle="datetimepicker">');

        group.append(opSelect);
        group.append(input);
        container.append(group);

        opSelect.on('change', function() {
            if ($(this).val() === 'empty') {
                input.prop('disabled', true);
            } else {
                input.prop('disabled', false);
            }
        });

        // Presets Dropdown
        var presetsGroup = $('<div class="btn-group btn-group-sm w-100"></div>');
        presetsGroup.append('<button type="button" class="btn btn-outline-secondary dropdown-toggle w-100" data-toggle="dropdown">' + __t('Presets') + '</button>');

        var menu = $('<div class="dropdown-menu w-100"></div>');
        menu.append('<a class="dropdown-item preset-link" href="#" data-range="week">' + __t('In the last week') + '</a>');
        menu.append('<a class="dropdown-item preset-link" href="#" data-range="month">' + __t('In the last month') + '</a>');
        menu.append('<a class="dropdown-item preset-link" href="#" data-range="year">' + __t('In the last year') + '</a>');
        menu.append('<div class="dropdown-divider"></div>');
        menu.append('<a class="dropdown-item preset-link" href="#" data-range="year-plus">' + __t('Over a year ago') + '</a>');

        presetsGroup.append(menu);
        container.append(presetsGroup);

        // Initialize TempusDominus
        var format = 'L';
        if (filterDef.type === 'datetime') format = 'L LT';

        input.datetimepicker({
            format: format,
            buttons: {
                showToday: true,
                showClose: true
            },
            calendarWeeks: Grocy.CalendarShowWeekNumbers,
            locale: moment.locale(),
            useCurrent: false,
            icons: {
                time: 'fa-solid fa-clock',
                date: 'fa-solid fa-calendar',
                up: 'fa-solid fa-arrow-up',
                down: 'fa-solid fa-arrow-down',
                previous: 'fa-solid fa-chevron-left',
                next: 'fa-solid fa-chevron-right',
                today: 'fa-solid fa-calendar-day',
                clear: 'fa-solid fa-trash-can',
                close: 'fa-solid fa-check'
            }
        });

        var self = this;
        input.on('change.datetimepicker', function(e) {
            self.table.draw();
        });

        // Preset Logic
        menu.find('.preset-link').on('click', function(e) {
            e.preventDefault();
            var range = $(this).data('range');
            var now = moment();

            if (range === 'week') {
                opSelect.val('after');
                input.val(now.subtract(1, 'week').format(format));
            } else if (range === 'month') {
                opSelect.val('after');
                input.val(now.subtract(1, 'month').format(format));
            } else if (range === 'year') {
                opSelect.val('after');
                input.val(now.subtract(1, 'year').format(format));
            } else if (range === 'year-plus') {
                opSelect.val('before');
                input.val(now.subtract(1, 'year').format(format));
            }

            self.table.draw();
        });

        return group;
    }

    createCheckboxFilterUI(container) {
        var wrapper = $('<div class="btn-group btn-group-toggle w-100" data-toggle="buttons"></div>');
        var name = 'checkbox-filter-' + Date.now(); // Unique name per instance

        wrapper.append('<label class="btn btn-outline-secondary active w-100"><input type="radio" name="' + name + '" value="all" checked>' + __t('All') + '</label>');
        wrapper.append('<label class="btn btn-outline-secondary w-100"><input type="radio" name="' + name + '" value="checked">' + __t('Checked') + '</label>');
        wrapper.append('<label class="btn btn-outline-secondary w-100"><input type="radio" name="' + name + '" value="unchecked">' + __t('Unchecked') + '</label>');

        container.append(wrapper);
        return wrapper.find('input');
    }

    createSetNotSetFilterUI(container) {
        var wrapper = $('<div class="btn-group btn-group-toggle w-100" data-toggle="buttons"></div>');
        var name = 'set-notset-filter-' + Date.now(); // Unique name per instance

        wrapper.append('<label class="btn btn-outline-secondary active w-100"><input type="radio" name="' + name + '" value="all" checked>' + __t('All') + '</label>');
        wrapper.append('<label class="btn btn-outline-secondary w-100"><input type="radio" name="' + name + '" value="set">' + __t('Set') + '</label>');
        wrapper.append('<label class="btn btn-outline-secondary w-100"><input type="radio" name="' + name + '" value="not-set">' + __t('Not Set') + '</label>');

        container.append(wrapper);
        return wrapper.find('input');
    }

    createMultiselectDynamicUI(container, filterDef, containerId) {
        var select = $('<select class="selectpicker w-100" multiple data-actions-box="true" data-width="100%"></select>');

        var uniqueValues = new Set();
        var hasEmptyValues = false;
        var colData = this.table.column(filterDef.columnIndex).data();

        colData.each(function(val, index) {
            var temp = document.createElement('div');
            temp.innerHTML = val;

            // Prefer extracting from raw value hidden span if available
            var userfieldRaw = temp.querySelector('.userfield-raw-value');
            var text = "";

            if (userfieldRaw) {
                text = userfieldRaw.textContent.trim();
            } else {
                text = temp.textContent.trim();
            }

            if (!text) hasEmptyValues = true;

            if (filterDef.type === 'userfield-multiselect') {
                 if (text) {
                     text.split(',').forEach(v => uniqueValues.add(v.trim()));
                 }
            } else {
                 if (text) uniqueValues.add(text);
            }
        });

        // Default Location is mandatory (NOT NULL in DB), so "Not set" is invalid.
        // Default Store is optional, so "Not set" is valid.
        if (filterDef.id !== 'default-location') {
             select.append($('<option></option>').val('__grocy_not_set__').text(__t('Not Set'))); // Capitalized Set
        }

        if (hasEmptyValues && filterDef.id !== 'default-location') {
             select.append($('<option data-divider="true"></option>'));
        }

        Array.from(uniqueValues).sort().forEach(v => {
            if(v) select.append($('<option></option>').val(v).text(v));
        });

        container.append(select);

        // Hide logic controls for Default Location and Default Store
        // For Product Group, it's already handled (permanent filter), but if it were dynamic:
        var hideLogic = (filterDef.id === 'default-location' || filterDef.id === 'default-store' || filterDef.origType === 'preset-list');
        if (!hideLogic) {
            this.addLogicControls(container, filterDef.id, true);
        }

        // Fix for dynamic selectpickers inside cards/containers
        select.selectpicker({
            container: false, // Rely on CSS overflow:visible
            liveSearch: true,
            actionsBox: true,
            showTick: true,
            width: '100%',
            style: 'btn-light',
            selectedTextFormat: 'count > 1'
        });
        select.selectpicker('render');
        select.selectpicker('selectAll');

        return select;
    }
}

var StockFilters;
$(document).ready(function() {
    if (typeof stockOverviewTable !== 'undefined') {
        StockFilters = new StockOverviewFilters(stockOverviewTable);
    }
});
