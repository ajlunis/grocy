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

        // Parse the HTML string to get text content
        // We use a temporary DIV to let the browser handle parsing (stripping tags, decoding entities)
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = cellHtml;

        // Prioritize structured data if present
        var customSort = tempDiv.querySelector('.custom-sort');
        var userfieldRaw = tempDiv.querySelector('.userfield-raw-value');

        var rawValue = "";
        if (customSort) {
            rawValue = customSort.textContent;
        } else if (userfieldRaw) {
            rawValue = userfieldRaw.textContent;
        } else {
            rawValue = tempDiv.textContent;
        }

        rawValue = rawValue ? rawValue.trim() : "";

        if (filter.type === 'multiselect' || filter.type === 'userfield-multiselect') {
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
            } else if (logic === 'AND') {
                 var exact = filter.container.find('.exact-match-checkbox').is(':checked');

                 // If filtering for "Not Set" in AND mode, the row must be empty
                 if (notSetSelected) {
                     if (!isRowEmpty) return false;
                     if (selectedValues.length === 1) return true;
                 }

                 for(var i=0; i<selectedValues.length; i++) {
                     if (selectedValues[i] === '__grocy_not_set__') continue;
                     if (!rowValues.includes(selectedValues[i])) return false;
                 }

                 if (exact) {
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
             } else if (logic === 'AND') {
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
                 return true;
             }
        }
        return true;
    }

    checkNumber(filter, rawValue) {
        var container = filter.container;
        var minVal = parseFloat(container.find('.filter-min-value').val());
        var maxVal = parseFloat(container.find('.filter-max-value').val());

        var cellValue = parseFloat(rawValue);
        if (isNaN(cellValue)) cellValue = 0;

        if (!isNaN(minVal) && cellValue < minVal) return false;
        if (!isNaN(maxVal) && cellValue > maxVal) return false;

        return true;
    }

    checkDate(filter, rawValue) {
         var container = filter.container;
         var operator = container.find('.filter-operator').val();
         var valueStr = container.find('.filter-value').val(); // Localized string from input

         if (operator === 'empty') return !rawValue || rawValue === "";

         if (!valueStr) return true;

         // rawValue is expected to be ISO string YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
         var cellDate = moment(rawValue);
         var filterDate = moment(valueStr, filter.dateFormat);

         if (!cellDate.isValid()) return false;
         if (!filterDate.isValid()) return true;

         if (operator === 'on') return cellDate.isSame(filterDate, 'day');
         if (operator === 'before') return cellDate.isBefore(filterDate);
         if (operator === 'after') return cellDate.isAfter(filterDate);

         return true;
    }

    checkCheckbox(filter, rawValue) {
        var val = filter.element.val();
        if (val === 'all') return true;

        var boolVal = (rawValue == "1");

        if (val === 'checked') return boolVal;
        if (val === 'unchecked') return !boolVal;
        if (val === 'not-set') return !rawValue;

        return true;
    }

    checkSetNotSet(filter, rawValue) {
        var val = filter.element.val();
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
            this.addLogicControls(container, filterObj.id, false); // false = no exact match for regex columns
        }

        this.filters.push(filterObj);

        // Store initial value for tracking changes
        element.data('lastVal', element.val() || []);

        var self = this;
        element.on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {

            // Status Mutual Exclusivity Logic
            if (columnName === 'hidden-status') {
                 var logic = container.find('input[name="logic-' + filterObj.id + '"]:checked').val();

                 if (logic === 'AND') {
                     var currentVal = element.val() || [];
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
    }

    addLogicControls(container, filterId, allowExactMatch) {
         var logicDiv = $('<div class="mt-2 small d-flex align-items-center justify-content-end"></div>');
         var name = 'logic-' + filterId;
         var idOr = 'logic-' + filterId + '-or';
         var idAnd = 'logic-' + filterId + '-and';

         logicDiv.append('<div class="form-check form-check-inline mr-2"><input class="form-check-input" type="radio" name="' + name + '" id="' + idOr + '" value="OR" checked><label class="form-check-label font-weight-normal" for="' + idOr + '">OR</label></div>');
         logicDiv.append('<div class="form-check form-check-inline mr-0"><input class="form-check-input" type="radio" name="' + name + '" id="' + idAnd + '" value="AND"><label class="form-check-label font-weight-normal" for="' + idAnd + '">AND</label></div>');

         if (allowExactMatch) {
             var idExact = 'logic-' + filterId + '-exact';
             var exactDiv = $('<div class="form-check form-check-inline exact-match-container ml-2" style="display:none;"><input class="form-check-input exact-match-checkbox" type="checkbox" id="' + idExact + '"><label class="form-check-label font-weight-normal" for="' + idExact + '">' + __t('Exact match') + '</label></div>');
             logicDiv.append(exactDiv);
         }

         container.append(logicDiv);

         var self = this;
         logicDiv.find('input[type="radio"]').on('change', function() {
             var val = $(this).val();
             if (allowExactMatch) {
                var exactDiv = logicDiv.find('.exact-match-container');
                 if (val === 'AND') exactDiv.show();
                 else exactDiv.hide();
             }

             // For Status filter: Enforce mutual exclusivity if switching to AND
             if (filterId === 'filter-hidden-status' && val === 'AND') {
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

         if (allowExactMatch) {
             logicDiv.find('.exact-match-checkbox').on('change', function() {
                 self.table.draw();
             });
         }
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
         this.addAvailableFilter('amount', __t('Amount'), 'number', 3);
         this.addAvailableFilter('value', __t('Value'), 'number-currency', 4);
         this.addAvailableFilter('calories', __t('Calories'), 'number', 10);
         this.addAvailableFilter('last-purchased', __t('Last purchased'), 'date', 11);
         this.addAvailableFilter('last-price', __t('Last price'), 'number-currency', 12);
         this.addAvailableFilter('min-stock', __t('Min. stock amount'), 'number', 13);
         this.addAvailableFilter('average-price', __t('Average price'), 'number-currency', 18);
         this.addAvailableFilter('default-location', __t('Default location'), 'multiselect-dynamic', 16);
         this.addAvailableFilter('default-store', __t('Default store'), 'multiselect-dynamic', 19);

         var self = this;
         $('#stock-overview-table thead th[data-userfield-name]').each(function(i, th) {
             var name = $(th).data('userfield-name');
             var type = $(th).data('userfield-type');
             var caption = $(th).text();

             self.availableFilters.push({
                 id: 'userfield-' + name,
                 caption: caption,
                 type: self.mapUserfieldTypeToFilterType(type),
                 columnIndex: self.table.column(th).index(),
                 isUserfield: true,
                 origType: type
             });
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
        var container = $('<div class="col-12 col-md-6 col-xl-3 mb-2" id="add-filter-container"></div>');
        var group = $('<div class="input-group"></div>');

        var prepend = $('<div class="input-group-prepend"><span class="input-group-text"><i class="fa-solid fa-plus"></i>&nbsp;' + __t('Add filter') + '</span></div>');

        var select = $('<select class="selectpicker" data-live-search="true" data-style="btn-light rounded-right border-left-0" data-width="auto"></select>');
        select.append('<option value="">' + __t('Select a filter to add') + '</option>');

        var stdGroup = $('<optgroup label="' + __t('Standard') + '"></optgroup>');
        var ufGroup = $('<optgroup label="' + __t('Userfields') + '"></optgroup>');

        this.availableFilters.forEach(function(f) {
            var opt = $('<option></option>').val(f.id).text(f.caption);
            if (f.isUserfield) ufGroup.append(opt);
            else stdGroup.append(opt);
        });

        select.append(stdGroup);
        if(ufGroup.children().length > 0) select.append(ufGroup);

        group.append(prepend);
        group.append(select);
        container.append(group);

        $('#table-filter-row').append(container);

        // Explicitly initialize
        select.selectpicker('render');

        // Match the style of other input group filters
        var wrapper = select.parent('.dropdown');
        wrapper.css('flex-grow', '1');
        wrapper.find('.btn.dropdown-toggle').addClass('rounded-0 rounded-right');

        var self = this;
        select.on('changed.bs.select', function() {
            var val = $(this).val();
            if (val) {
                 self.addFilter(val);
                 // Reset value and refresh
                 $(this).val('');
                 self.updateAddFilterAvailability();
                 $(this).selectpicker('refresh');
            }
        });

        this.addFilterSelect = select;
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

        $('#add-filter-container').before(container);

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
        var select = $('<select class="selectpicker w-100">' +
            '<option value="all">' + __t('All') + '</option>' +
            '<option value="checked">' + __t('Checked') + '</option>' +
            '<option value="unchecked">' + __t('Unchecked') + '</option>' +
            '</select>');
        container.append(select);
        select.selectpicker({
            style: 'btn-light'
        });
        return select;
    }

    createSetNotSetFilterUI(container) {
        var select = $('<select class="selectpicker w-100">' +
            '<option value="all">' + __t('All') + '</option>' +
            '<option value="set">' + __t('Set') + '</option>' +
            '<option value="not-set">' + __t('Not set') + '</option>' +
            '</select>');
        container.append(select);
        select.selectpicker({
            style: 'btn-light'
        });
        return select;
    }

    createMultiselectDynamicUI(container, filterDef, containerId) {
        var select = $('<select class="selectpicker w-100" multiple data-actions-box="true" data-width="100%"></select>');

        var uniqueValues = new Set();
        var hasEmptyValues = false;
        var colData = this.table.column(filterDef.columnIndex).data();

        colData.each(function(val, index) {
            var temp = document.createElement('div');
            temp.innerHTML = val;
            var text = temp.textContent.trim();

            if (!text) hasEmptyValues = true;

            if (filterDef.type === 'userfield-multiselect') {
                 if (text) {
                     text.split(',').forEach(v => uniqueValues.add(v.trim()));
                 }
            } else {
                 if (text) uniqueValues.add(text);
            }
        });

        select.append($('<option></option>').val('__grocy_not_set__').text(__t('Not set')));

        if (hasEmptyValues) {
             select.append($('<option data-divider="true"></option>'));
        }

        Array.from(uniqueValues).sort().forEach(v => {
            if(v) select.append($('<option></option>').val(v).text(v));
        });

        container.append(select);

        this.addLogicControls(container, filterDef.id, true);

        // Fix for dynamic selectpickers inside cards/containers
        select.selectpicker({
            liveSearch: true,
            actionsBox: true,
            showTick: true,
            width: '100%',
            style: 'btn-light'
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
